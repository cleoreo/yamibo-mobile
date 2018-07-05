package com.yamibo.android.yamibo_webview;

import android.Manifest;
import android.app.Activity;
import android.app.DownloadManager;
import android.app.ProgressDialog;
import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.os.Handler;
import android.support.v4.app.ActivityCompat;
import android.support.v4.widget.SwipeRefreshLayout;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.webkit.DownloadListener;
import android.webkit.JsPromptResult;
import android.webkit.JsResult;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;

public class MainActivity extends AppCompatActivity {

    private WebView mWebView;
    private SwipeRefreshLayout mSwipeRefreshLayout;
    boolean doubleBackToExitPressedOnce = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        mSwipeRefreshLayout = (SwipeRefreshLayout) this.findViewById(R.id.swipeContainer);
        // init web view
        mWebView = (WebView) findViewById(R.id.activity_main_webview);

        // Enable Javascript
        WebSettings webSettings = mWebView.getSettings();
        webSettings.setJavaScriptEnabled(true);

        // Enable use of localStorage
        webSettings.setDomStorageEnabled(true);

        // Allow access to url
        webSettings.setAllowUniversalAccessFromFileURLs(true);

        // Allow mixed content if API level >=21
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            webSettings.setMixedContentMode(WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE);
        }

        // enable zoom
        webSettings.setBuiltInZoomControls(true);
//        webSettings.setBuiltInZoomControls(false);
//        webSettings.setDisplayZoomControls(false);

        // set up a progress dialog
        final ProgressDialog progressDialog = new ProgressDialog(this, ProgressDialog.THEME_DEVICE_DEFAULT_DARK);
        progressDialog.setMessage("加載中");
        progressDialog.setCancelable(true);
        progressDialog.setIndeterminate(true);

        // if external link is detected, ask to open by external browser
        mWebView.setWebViewClient(new WebViewClient() {

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                if (Uri.parse(url).getHost().endsWith("bbs.yamibo.com")) {
                    return false;
                }

                // handle external image url download
                if (url.endsWith(".jpg") || url.endsWith(".png")) {
                    downloadImage(url);
                    return true;
                }

                Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                view.getContext().startActivity(intent);
                return true;
            }

            @Override
            public void onPageStarted(WebView view, String url, Bitmap favicon) {
                super.onPageStarted(view, url, favicon);

                // disable Image Auto load for every page
                view.getSettings().setLoadsImagesAutomatically(false);

                progressDialog.show();
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);

                // inject javascript;
                view.evaluateJavascript(readFromFile("jquery-3.3.1.min.js"), new ValueCallback<String>() {
                    @Override
                    public void onReceiveValue(String value) {
                        Log.d("", "value = " + value);
                    }
                });

                view.evaluateJavascript(readFromFile("photoswipe.min.js"), new ValueCallback<String>() {
                    @Override
                    public void onReceiveValue(String value) {
                        Log.d("", "value = " + value);
                    }
                });

                view.evaluateJavascript(readFromFile("photoswipe-ui-default.min.js"), new ValueCallback<String>() {
                    @Override
                    public void onReceiveValue(String value) {
                        Log.d("", "value = " + value);
                    }
                });

                view.evaluateJavascript(readFromFile("fontawesome-all.min.js"), new ValueCallback<String>() {
                    @Override
                    public void onReceiveValue(String value) {
                        Log.d("", "value = " + value);
                    }
                });

                view.evaluateJavascript(readFromFile("jquery.s2t.min.js"), new ValueCallback<String>() {
                    @Override
                    public void onReceiveValue(String value) {
                        Log.d("", "value = " + value);
                    }
                });

                view.evaluateJavascript(readFromFile("desktop.js"), new ValueCallback<String>() {
                    @Override
                    public void onReceiveValue(String value) {
                        Log.d("", "value = " + value);
                    }
                });

                view.evaluateJavascript(readFromFile("main.js"), new ValueCallback<String>() {
                    @Override
                    public void onReceiveValue(String value) {
                        Log.d("", "value = " + value);
                    }
                });

                mSwipeRefreshLayout.setRefreshing(false);
                progressDialog.dismiss();

                // load image after javascript is injected
                view.getSettings().setLoadsImagesAutomatically(true);
            }
        });

        // purpose: Show alert in web view
        mWebView.setWebChromeClient(new WebChromeClient() {
            @Override
            // override js window.alert and show message in a android toast
            public boolean onJsAlert(WebView view, String url, String message, JsResult result) {
                result.confirm();
                Toast.makeText(getApplicationContext(), message, Toast.LENGTH_SHORT).show();
                return true;
            }

            @Override
            // override js window.prompt and copy text in prompt text box to clipboard
            public boolean onJsPrompt(WebView view, String url, String message, String defaultValue, final JsPromptResult result) {
                ClipboardManager clipboard = (ClipboardManager) getSystemService(Context.CLIPBOARD_SERVICE);
                ClipData clip = ClipData.newPlainText("Batch Reply Markdown Code", defaultValue);
                clipboard.setPrimaryClip(clip);
                result.confirm();

                Toast.makeText(getApplicationContext(), "已複製", Toast.LENGTH_SHORT).show();

                return true;
            }
        });

        // download file handler
        mWebView.setDownloadListener(
                new DownloadListener() {
                    @Override
                    public void onDownloadStart(String url, String userAgent, String contentDisposition, String mimetype, long contentLength) {
                        downloadImage(url);
                    }
                }
        );


        // check that link is not null
        // or that you opened app from deep link
        if (getIntent() != null && getIntent().getData() != null) {
            Uri intentUri = getIntent().getData(); //get link
            String verifiedUrl = intentUri.toString().replace("mobile=yes", "mobile=1");
            verifiedUrl = verifiedUrl.replace("mobile=2", "mobile=1");

            if (verifiedUrl.equals("https://bbs.yamibo.com/") || verifiedUrl.equals("http://bbs.yamibo.com/")) {
                verifiedUrl = verifiedUrl + "forum.php?mobile=1";
            }
            if (verifiedUrl.equals("https://bbs.yamibo.com") || verifiedUrl.equals("http://bbs.yamibo.com")) {
                verifiedUrl = verifiedUrl + "/forum.php?mobile=1";
            }
            if (!verifiedUrl.toLowerCase().contains("?")) {
                verifiedUrl = verifiedUrl + "?mobile=1";
            } else if (!verifiedUrl.toLowerCase().contains("&mobile=")) {
                verifiedUrl = verifiedUrl + "&mobile=1";
            }
            mWebView.loadUrl(verifiedUrl); //open it in webView
        } else {
            mWebView.loadUrl("https://bbs.yamibo.com/forum.php?mobile=1");
        }


        mSwipeRefreshLayout.setOnRefreshListener(
                new SwipeRefreshLayout.OnRefreshListener() {
                    @Override
                    public void onRefresh() {
                        mWebView.reload();
                    }
                }
        );
    }

    public void onBackPressed() {
        if (mWebView.canGoBack()) {
            mWebView.goBack();
        }

        if (doubleBackToExitPressedOnce) {
            super.onBackPressed();
            return;
        }

        this.doubleBackToExitPressedOnce = true;

        new Handler().postDelayed(new Runnable() {

            @Override
            public void run() {
                doubleBackToExitPressedOnce = false;
            }
        }, 600);
    }

    private String readFromFile(String filename) {

        String ret = "";

        try {
            InputStream inputStream = getAssets().open(filename);

            if (inputStream != null) {
                InputStreamReader inputStreamReader = new InputStreamReader(inputStream);
                BufferedReader bufferedReader = new BufferedReader(inputStreamReader);
                String receiveString = "";
                StringBuilder stringBuilder = new StringBuilder();

                while ((receiveString = bufferedReader.readLine()) != null) {
                    stringBuilder.append(receiveString);
                }

                inputStream.close();
                ret = stringBuilder.toString();
            }
        } catch (FileNotFoundException e) {
            Log.e("login activity", "File not found: " + e.toString());
        } catch (IOException e) {
            Log.e("login activity", "Can not read file: " + e.toString());
        }

        return ret;
    }

    private static boolean checkReadAndWriteExternalStoragePermission(Context context) {
        if (ActivityCompat.checkSelfPermission(context, Manifest.permission.WRITE_EXTERNAL_STORAGE) != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions((Activity) context, new String[]{Manifest.permission.WRITE_EXTERNAL_STORAGE}, 1);
            return false;
        } else {
            return true;
        }
    }

    private void downloadImage(String url) {
        if (checkReadAndWriteExternalStoragePermission((Context) MainActivity.this)) {
            DownloadManager.Request request = new DownloadManager.Request(Uri.parse(url));

            request.allowScanningByMediaScanner();
            request.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED); //Notify client once download is completed!
            request.setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, url.substring(url.lastIndexOf('/') + 1, url.length()));
            request.setAllowedNetworkTypes(DownloadManager.Request.NETWORK_WIFI | DownloadManager.Request.NETWORK_MOBILE);
            DownloadManager dm = (DownloadManager) getSystemService(DOWNLOAD_SERVICE);
            dm.enqueue(request);
            Toast.makeText(getApplicationContext(), "下載中", //To notify the Client that the file is being downloaded
                    Toast.LENGTH_LONG).show();
        }
    }
}
