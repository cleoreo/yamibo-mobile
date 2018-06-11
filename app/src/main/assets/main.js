/*
    localStorage Setting List:
    1. theme                    // set theme                || value: "day", "night"        || default: "day"
    2. ftsize                   // set font size            || value: "S", "M", "L"         || default: "M"
    3. language                 // set language             || value: "tc", "sc", "none"    || default: "none" 
    4. displayPostCreateTime    // show post time           || value: "true", "false"       || default: "true"
    5. loadBigImageAtFirst      // show big image first     || value: "true", "false"       || default: "false"
    6. copyUrl                  // set url version          || value: "mobile1", "desktop"  || default: "mobile1"
*/


var imgArr = [];

runAfterLoad();

function runAfterLoad () {
  jQuery('html').find('script').filter(function () {
    return jQuery(this).attr('src') == 'https://bbs.yamibo.com/source/plugin/oyeeh_geo/template/js/geo.js';
  }).remove();
  jQuery('head').append('<link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/photoswipe/4.1.2/photoswipe.min.css"/>');
  jQuery('head').append('<link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/photoswipe/4.1.2/default-skin/default-skin.min.css"/>');
  jQuery('head').append('<link href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css" rel="stylesheet" integrity="sha384-wvfXpqpZZVQGK6TAh5PVlGOfQNHSoD2xbE+QkPxCAFlNEevoEH3Sl0sibVcOQVnN" crossorigin="anonymous">');

  /* if it is in mobile standard mode (mobile=1) */
  if (/\bmobile=1\b/.test(window.location.search)) {
    /* Add CSS on page load */
    jQuery('body').css('min-width', '100vw');
    jQuery('head').append('<meta name=\"viewport\" content=\"initial-scale=1,maximum-scale=1,width=device-width,user-scalable=0\">');

    themeCheck();

    jQuery('head').append(customCSS());

    /* check logo exist and change it */
    new MutationObserver(function (mutations) {
      jQuery('.hd img').css('opacity', '0');
      jQuery('.hd img').attr('src', '/template/oyeeh_com_baihe/img/config/img/logo.png');
      jQuery('.hd img').css('opacity', '1');
    }).observe(document, {childList: true, subtree: true});

    /* when document ready add html elements */
    jQuery(document).ready(function () {

      /* add back to top button and go to bottom button */
      jQuery('body').append('<div id=\'scroll-button\'><a title=\'回最頂\' class=\'go-to-top\' onclick=\'window.scrollTo(0,0);\'><i class="fa fa-angle-up" aria-hidden="true"></i></a><a title=\'去最底\' class=\'go-to-bottom\' onclick=\'window.scrollTo(0,document.body.scrollHeight);\'><i class="fa fa-angle-down" aria-hidden="true"></i></a></div>');
      jQuery('body').append('<div id=\'history-button\'><a title=\'回上頁\' class=\'prev-page\' onclick=\'window.history.back();\'><</a><a title=\'下一頁\' class=\'next-page\' onclick=\'window.history.forward();\'>></a></div>');

      /* add menu button */
      if (jQuery('#menu-btn').length == 0) {
        jQuery('.hd').append('<button id="menu-btn" type="button"><div></div><div></div><div></div></button>');
      }
      jQuery('#menu-btn').click(function () {
        jQuery('body').toggleClass('menu-opened');
        jQuery('#side-menu >div').scrollTop(0);
        window.scrollTo(0, 0);
      });

      /* move prev page link before next link */
      jQuery('.wp .pg .prev').each(function () {
        jQuery(this).parent().find('label').after(jQuery(this));
      });

      /* add side menu */
      if (jQuery('#side-menu').length == 0) {
        jQuery('body').append(sideMenuHtml());
      }

      /* move logout link to side menu */
      jQuery('#logout').html(jQuery('.wp >.pd2 a').last()[0].outerHTML);
      if (jQuery('.wp >.pd2 a').length > 1) {
        jQuery('.wp >.pd2 a:last').remove();
      }
      /* Add search link on top */
      if (jQuery('#search-link').length == 0) {
        jQuery('.wp >.pd2').append('<a href="https://bbs.yamibo.com/search.php?mod=forum&mobile=2" id="search-link">搜索</a>');
      }

      /* add side menu listener */
      /* theme listener*/
      jQuery('#theme').change(function () {
        if (jQuery(this).is(":checked")) {
          window.localStorage.setItem("theme", "night");
        } else {
          window.localStorage.setItem("theme", "day");
        }
        checkAndUpdateSetting();
      });
      /* font-size listener */
      jQuery('input[name=ftsize]').change(function () {
        window.localStorage.setItem("ftsize", jQuery(this).val());
        checkAndUpdateSetting();
      });
      /* language listener */
      jQuery('input[name=language]').change(function () {
        window.localStorage.setItem("language", jQuery(this).val());
        if (jQuery(this).val() == "none") {
          window.location.reload();
        }
        checkAndUpdateSetting();
      });
      /* display post create time listener */
      jQuery('#display-post-time').change(function () {
        if (jQuery(this).is(":checked")) {
          window.localStorage.setItem("displayPostCreateTime", "true");
        } else {
          window.localStorage.setItem("displayPostCreateTime", "false");
        }
        checkAndUpdateSetting();
      });

      /* load big image setting listener */
      jQuery('#load-big-image').change(function () {
        if (jQuery(this).is(":checked")) {
          window.localStorage.setItem("loadBigImageAtFirst", "true");
          window.alert('直接上大圖了，小心流量哦！');
          if ((/\b&tid=\b/.test(window.location.search) || /\bthread\b/.test(window.location.href)) && !/\baction=\b/.test(window.location.search)) {
            window.location.reload();
          }
        } else {
          window.localStorage.setItem("loadBigImageAtFirst", "false");
        }
      });

      /* copy link setting listener */
      jQuery('input[name=copy-link]').change(function () {
        window.localStorage.setItem("copyUrl", jQuery(this).val());
        checkAndUpdateSetting();
      });

      checkAndUpdateSetting();

      jQuery('#side-menu').click(function (e) {
        if (e.target == this) {
          jQuery('body').removeClass('menu-opened');
        }
      });

      /* when inside a forum page */
      if (/\b&fid=\b/.test(window.location.search) && !/\b&action=\b/.test(window.location.search)) {
        /* format post date and time */
        jQuery('.tl .bm_c .xg1').each(function () {
          var dateText = jQuery.trim(jQuery(this).clone().children().remove().end().text());
          var linkElement = jQuery(this).html().split('</a>')[0] + '</a>';
          var newHtml = linkElement + '<div class="post-info"><span class="time">' + dateText.split('回')[0] + ' </span>';
          if (dateText.split('回').length > 1) {
            newHtml += '<span class="no-of-reply">' + dateText.split('回')[1] + '</span>';
          } else {
            newHtml += '<span class="no-of-reply">0</span>';
          }
          newHtml += '</div>';
          jQuery(this).html(newHtml);
        });

        /* check display post time setting */
        displayPostTimeCheck();

        /* add mobile=1 into go to page field redirect link  */
        var redirectStr = jQuery('input[name=custompage]').attr('onkeydown').split('&page=');
        redirectStr = redirectStr[0] + '&mobile=1' + '&page=' + redirectStr[1];
        jQuery('input[name=custompage]').attr('onkeydown', redirectStr);

      }

      /* when inside a post */
      if ((/\b&tid=\b/.test(window.location.search) || /\bthread\b/.test(window.location.href)) && !/\baction=\b/.test(window.location.search)) {
        /* handle keyboard cover comment box */
        jQuery('body').addClass('is-post');


        /* add image previewer */
        jQuery('body').append(photoSwipeHtml());
        var allImageEl = jQuery('.postmessage img:not([smilieid]), .box.box_ex2 img');
        allImageEl.each(function (i) {
          var imgSrc = jQuery(this).attr('src');
          /* force image load from https */
          if (!/\bhttps:\b/.test(imgSrc)) {
            imgSrc = imgSrc.replace('http://', 'https://');
          }
          jQuery(this).attr('src', imgSrc);

          if (jQuery(this).parent().is('a')) {
            var largeImage = jQuery(this).parent().attr('href');
            jQuery(this).unwrap();
            imgSrc = largeImage;

            /* force large image load from https */
            if (!/\bhttps\b/.test(imgSrc)) {
              imgSrc = imgSrc.replace('http://', 'https://');
            }
          }
          /* image load big one first setting check */
          if (window.localStorage.getItem("loadBigImageAtFirst") == "true") {
            jQuery(this).attr('src', imgSrc);
            jQuery(this).addClass('big-image');
          }

          jQuery(this).addClass('gallery-image');
          jQuery(this).attr('gallery-index', i);

          var imgObj = {src: imgSrc, w: 0, h: 0};
          imgArr.push(imgObj);
        });

        /* if image Array is ready */
        var imgArrReady = setInterval(function () {
          if (imgArr.length == allImageEl.length) {

            /* add listener to image for opening gallery */
            jQuery('.gallery-image').click(function () {
              var index = parseInt(jQuery(this).attr('gallery-index'));
              openGallery(index, imgArr);
            });

            clearInterval(imgArrReady);
          }
        }, 100);

        /* Force all link to redirect instead of open in new tab */
        jQuery('.postmessage a').removeAttr('target');

        /* Change all yamibo link to mobile=1 */
        jQuery('.postmessage a').each(function () {
          var href = jQuery(this).attr('href');
          if (/\bbbs.yamibo.com\b/.test(href)) {
            if (/\bmobile=yes\b/.test(href) || /\bmobile=2\b/.test(href)) {
              href = href.replace('mobile=yes', 'mobile=1');
              href = href.replace('mobile=2', 'mobile=1');
            } else {
              if (href.split('?').length > 1) {
                href = href + '&mobile=1';
              } else {
                if (href.slice(-1) == "/") {
                  href = href + "forum.php?mobile=1";
                } else if (href.slice(-4) == ".com") {
                  href = href + "/forum.php?mobile=1";
                } else {
                  href = href + '?mobile=1';
                }
              }
            }
            jQuery(this).attr('href', href);
          }
        });

        /* change poll form submit link to mobile =1 */
        if (jQuery('#poll').length > 0) {
          var pollFormUrl = jQuery('#poll').attr('action');
          pollFormUrl = pollFormUrl.replace(/mobile=yes/g, 'mobile=1');
          jQuery('#poll').attr('action', pollFormUrl);
        }

        /* change post link of reply form at bottom to mobile=1 */
        var posturl = jQuery('#fastpostform').attr('action');
        posturl = posturl.replace(/mobile=yes/g, 'mobile=1');
        jQuery('#fastpostform').attr('action', posturl);

        /* Make reply box height auto grow */
        textAreaAutoGrow();
      }

      /* when inside the reply page || edit reply page */
      if (/\baction=reply\b/.test(window.location.search) || /\baction=edit\b/.test(window.location.search)) {

        /* change post form url to mobile=1 */
        var replyurl = jQuery('#postform').attr('action');
        replyurl = replyurl.replace('mobile=yes', 'mobile=1');
        jQuery('#postform').attr('action', replyurl);

        /* Make reply box height auto grow */
        textAreaAutoGrow();
      }

      /* when inside pm page */
      if (/\bmod=space\b/.test(window.location.search)) {
        jQuery('.pg a').each(function () {
          var pmUrl = jQuery(this).attr("href");
          if (pmUrl.includes("#last")) {
            pmUrl = pmUrl.replace('#last', '');
            jQuery(this).attr("href", pmUrl);
          }

          if (!jQuery(this).hasClass('nxt')) {
            jQuery(this).addClass('prev');
          }
        });

        if (/\bdo=pm\b/.test(window.location.search) || /\bac=pm\b/.test(window.location.search)) {
          var pmFormUrl = jQuery('[id^=pmform]').attr('action');
          pmFormUrl = pmFormUrl.replace('mobile=yes', 'mobile=1');
          jQuery('[id^=pmform]').attr('action', pmFormUrl);

          /* Make reply box height auto grow */
          textAreaAutoGrow();
        }
      }


    });
  }

  /* if it is in mobile search page */
  if (/\bmobile=2\b/.test(window.location.search) && /\bsearch.php\b/.test(window.location.href)) {

    /* replace search result links to open in mobile 1 view */
    jQuery('.threadlist a').each(function () {
      var newhref = jQuery(this).attr('href').replace('mobile=2', 'mobile=1');
      jQuery(this).attr('href', newhref);
    });
  }

  /* for debuging */
  setTimeout(function () {
    if (jQuery('.debug-tool').length == 0) {
      jQuery('body').append('<div class="debug-tool"><button class="copy-link">複製本頁鏈接</button></div>');
    }
    jQuery('.copy-link').click(function () {
      var toBeCopy = window.location.href;
      if (window.localStorage.getItem("copyUrl") == "desktop") {
        toBeCopy = jQuery('.ft .xw0').last().attr("href");
      }
      window.prompt('你已複製鏈接', toBeCopy);
    });
  }, 800);
}

function customCSS () {
  var standardCustomCss = '<style>' +
      '@charset "UTF-8";body a,body button,body div,body input,body select,body textarea{font-size:1rem}body img{max-width:100%}body .bm .bm_h{font-size:1rem!important}body .bm .bm_c.add a:first-of-type,body .bm .bm_c.even a:first-of-type{display:inline-block;width:70%;padding:.6rem}body .bm .bm_c>a:first-of-type{display:inline-block;padding:.5rem 0;width:100%}body.day-theme{background-color:#fff5d7}body.day-theme #menu-btn div{background-color:#551200}body.day-theme .hd{border-color:#551200}body.day-theme #search-link,body.day-theme .lkcss,body.day-theme a{color:#551200}body.day-theme .box{background-color:#ffe}body.day-theme .bm .bm_h{background-color:#551200!important}body.day-theme .bm .bm_c{border-color:#dbc38c}body.day-theme .bm .bm_c:nth-child(even){background-color:#ffedbb}body.day-theme .even{background-color:#fff5d7}body.day-theme #history-button a,body.day-theme #scroll-button a{background-color:rgba(255,255,255,.8)!important;border:1px solid #dbc38c}body.day-theme input[type=submit]{border:1px solid #551200;background-color:#ffe}body.night-theme{background-color:#0b0704!important;color:#a3948f;--link-color:#A18C11;--link-color-hover:rgb(179, 163, 20);--link-color-active:rgb(147, 134, 16);--visited-color:rgb(161, 125, 18);--visited-color-hover:rgb(179, 139, 20);--visited-color-active:rgb(147, 114, 16)}body.night-theme .hd{border-color:#7e5f54}body.night-theme #menu-btn div{background-color:#7e5f54}body.night-theme .lkcss,body.night-theme a{color:#a16c12}body.night-theme .box{background-color:#1c0e09}body.night-theme .bm .bm_h{background-color:#1c0e09!important;color:#a3948f}body.night-theme .bm .bm_h a{color:#a16c12}body.night-theme .bm .bm_inf{border-color:#7e5f54;background-color:#1c0e09}body.night-theme .bm .bm_c{border-color:#7e5f54;border-bottom:1px solid #7e5f54}body.night-theme .bm .bm_c .bm_user{border-color:#7e5f54;background-color:#1c0e09}body.night-theme .bm .bm_c:nth-child(even){background-color:#291a0a}body.night-theme .bm .bm_c.bt{border-top:2px solid #7e5f54!important}body.night-theme .bm .even{background-color:transparent}body.night-theme div[id^=post]{background-color:#0b0704!important}body.night-theme input,body.night-theme textarea{background:#2b201d;color:#a3948f}body.night-theme select{color:#a3948f}body.night-theme #history-button a,body.night-theme #scroll-button a{background-color:rgba(43,32,29,.8)!important;border:1px solid #7e5f54;color:#a3948f}body.menu-opened{height:100%;position:fixed;top:0}body.menu-opened #menu-btn div{opacity:0}body.menu-opened #menu-btn div:first-of-type{transform:rotate(-45deg);opacity:1}body.menu-opened #menu-btn div:last-of-type{transform:rotate(45deg);opacity:1}body.menu-opened #side-menu{left:0}body.menu-opened #side-menu #logout{position:fixed}.hd{height:2.5rem;min-height:40px;display:inline-block;width:calc(100% - 6px);max-width:100vw}.hd img{height:2.5rem;min-height:35px;opacity:0;transition:all 1s}.hd a{float:left;display:inline-block}.hd a:nth-of-type(2){vertical-align:middle;padding:0 .5rem;line-height:40px}.pipe{margin:0 2px}#menu-btn{background:0 0;border:none;padding:0 5px;float:right;outline:0}#menu-btn div{width:25px;height:3px;margin:6px 0;transition:all .4s}#menu-btn div:first-of-type{transform-origin:100% 100%}#menu-btn div:last-of-type{transform-origin:100% 0}#side-menu{display:block;width:100%;height:100%;position:absolute;left:-100%;top:0;background-color:rgba(0,0,0,.6)}#side-menu>div{display:block;width:70vw;height:100%;position:absolute;left:0;top:0;transition:all 1s;background-color:#16110f;border-right:1px solid #856559;color:#a16c12;overflow:auto;max-height:100%;padding-bottom:3rem}#side-menu .menu-item{padding:10px}#side-menu .menu-item.last{margin-bottom:3rem}#side-menu .menu-item label{display:block;margin:10px 20px}#side-menu .menu-item span{padding-right:5px}#side-menu .ftsize-div,#side-menu .language-div{padding:0}#side-menu .switcher-div label{display:inline-block;margin:0}#side-menu #logout{bottom:0;left:0;width:calc(70vw - 20px);height:auto;padding:10px;border-top:3px solid #a16c12;background-color:#16110f}#search-link{float:right}.tl .bm_c .xg1{display:inline-block;width:100%;text-align:right;font-size:.8rem}.tl .bm_c .xg1 a{float:left}.tl .bm_c .xg1 .post-info{display:inline-block}.tl .bm_c .xg1 .time{min-width:110px;text-align:right;display:inline-block;margin-right:5px}.tl .bm_c .xg1 .no-of-reply{display:inline-block;float:right;min-width:4rem}.tl .bm_c .xg1 .no-of-reply:before{content:"回";position:absolute;right:3rem}.big-image{width:100vw;height:auto}#scroll-button{position:fixed;right:2px;bottom:30px}#history-button{position:fixed;left:15px;bottom:25px;display:inline-block}#history-button a{display:inline-block;float:left}#history-button a,#scroll-button a{display:block;border-radius:3px;line-height:100%;padding:.8rem .9rem}.ft{margin-bottom:100px}.is-post .ft{margin-bottom:40vh}.copy-link{width:100%;border:1px solid #551200;background-color:#551200;color:#fff;padding:10px;font-size:1rem}.wp .pg{display:inline-block;width:100%}.wp .pg>label>span{display:none}.wp .pg a{display:inline-block}.wp .pg .nxt,.wp .pg .prev{margin:5px 0;padding:5px 15px;border:1px solid}.wp .pg .nxt{float:right}.ttp a{line-height:130%;vertical-align:middle}.ttp a.xw1{text-decoration:underline}input[type=submit],input[type=text],textarea{padding:5px!important;width:calc(100% - 12px)!important}input[type=file],input[type=submit]{width:100%!important;max-width:100%!important}div.checkbox.switcher label,div.radio.switcher label{padding:0}div.checkbox.switcher label *,div.radio.switcher label *{vertical-align:middle}div.checkbox.switcher label input,div.radio.switcher label input{display:none}div.checkbox.switcher label input+span,div.radio.switcher label input+span{position:relative;display:inline-block;margin-right:10px;width:2rem;height:1rem;background:#bbb;border:1px solid #eee;border-radius:50px;transition:all .3s ease-in-out}div.checkbox.switcher label input+span small,div.radio.switcher label input+span small{position:absolute;display:block;width:50%;height:100%;background:#fff;border-radius:50%;transition:all .3s ease-in-out;left:0}div.checkbox.switcher label input:checked+span,div.radio.switcher label input:checked+span{background:#269bff;border-color:#269bff}div.checkbox.switcher label input:checked+span small,div.radio.switcher label input:checked+span small{left:50%}'
      + '</style>';
  return standardCustomCss.replace(' ', '').replace('\n', '');
}

function photoSwipeHtml () {
  return '<div id="pswp" class="pswp" tabindex="-1" role="dialog" aria-hidden="true"><div class="pswp__bg"></div><div class="pswp__scroll-wrap"><div class="pswp__container"><div class="pswp__item"></div><div class="pswp__item"></div><div class="pswp__item"></div></div><div class="pswp__ui pswp__ui--hidden"><div class="pswp__top-bar"><div class="pswp__counter"></div><button class="pswp__button pswp__button--close" title="Close (Esc)"></button> <button class="pswp__button pswp__button--share" title="Share"></button> <button class="pswp__button pswp__button--fs" title="Toggle fullscreen"></button> <button class="pswp__button pswp__button--zoom" title="Zoom in/out"></button><div class="pswp__preloader"><div class="pswp__preloader__icn"><div class="pswp__preloader__cut"><div class="pswp__preloader__donut"></div></div></div></div></div><div class="pswp__share-modal pswp__share-modal--hidden pswp__single-tap"><div class="pswp__share-tooltip"></div></div><button class="pswp__button pswp__button--arrow--left" title="Previous (arrow left)"></button> <button class="pswp__button pswp__button--arrow--right" title="Next (arrow right)"></button><div class="pswp__caption"><div class="pswp__caption__center"></div></div></div></div></div>';
}

function sideMenuHtml () {
  return '<div id="side-menu"><div><div class="menu-item"><span><b>閱讀設定：</b></span></div><div class="menu-item switcher-div"><div class="checkbox switcher"><label for="theme"><span>夜間模式： </span><input type="checkbox" id="theme" name="theme"> <span><small></small></span></label></div></div><div class="menu-item"><span>字體大小：</span></div><div class="menu-item ftsize-div"><label><span>小 </span><input type="radio" name="ftsize" value="S" id="ftsize-S"></label> <label><span>中 </span><input type="radio" name="ftsize" value="M" id="ftsize-M" checked="checked"></label> <label><span>大 </span><input type="radio" name="ftsize" value="L" id="ftsize-L"></label></div><hr><div class="menu-item"><span><b>語言設定：</b></span></div><div class="menu-item language-div"><label><span>繁 </span><input type="radio" name="language" value="tc" id="language-tc"></label> <label><span>簡 </span><input type="radio" name="language" value="sc" id="language-sc"></label> <label><span>無 </span><input type="radio" name="language" value="none" id="language-none" checked="checked"></label></div><hr><div class="menu-item"><span><b>流量設定：</b></span></div><div class="menu-item switcher-div"><div class="checkbox switcher"><label for="load-big-image"><span>直接顯示大圖： </span><input type="checkbox" id="load-big-image" name="load-big-image"> <span><small></small></span></label></div></div><hr><div class="menu-item"><span><b>其他設定：</b></span></div><div class="menu-item switcher-div"><div class="checkbox switcher"><label for="display-post-time"><span>顯示發帖時間： </span><input type="checkbox" id="display-post-time" name="post-time"> <span><small></small></span></label></div></div><div class="menu-item"><span>複製鏈接設定：</span></div><div class="menu-item copy-link-div"><label><span>標準版</span> <input type="radio" name="copy-link" value="mobile1" id="copy-link-m1" checked="checked"></label> <label><span>電腦版 </span><input type="radio" name="copy-link" value="desktop" id="copy-link-pc"></label></div><div class="menu-item last"></div><div id="logout"></div></div></div>';
}

function checkAndUpdateSetting () {
  /* checking for theme */
  themeCheck();
  /* checking for font size */
  if (window.localStorage.getItem("ftsize") === "S") {
    jQuery('body').css('font-size', '8pt');
    jQuery('html').css('font-size', '8pt');
  } else if (window.localStorage.getItem("ftsize") === "L") {
    jQuery('body').css('font-size', '12pt');
    jQuery('html').css('font-size', '12pt');
  } else {
    window.localStorage.setItem("ftsize", "M");
    jQuery('body').css('font-size', '10pt');
    jQuery('html').css('font-size', '10pt');
  }

  if (window.localStorage.getItem("ftsize")) {
    jQuery('#ftsize-' + window.localStorage.getItem("ftsize")).prop('checked', true);
  }

  /* checking for language */
  if (window.localStorage.getItem("language")) {
    jQuery('#language-' + window.localStorage.getItem("language")).prop('checked', true);
  }

  if (window.localStorage.getItem("language") === "sc") {
    jQuery('body').t2s();
  } else if (window.localStorage.getItem("language") === "tc") {
    jQuery('body').s2t();
  } else {
    window.localStorage.setItem("language", "none");
  }

  /* checking for display post create time */
  displayPostTimeCheck();

  /* checking for image show big one first */
  if (window.localStorage.getItem("loadBigImageAtFirst") === "true") {
    jQuery('#load-big-image').prop('checked', true);
  } else {
    window.localStorage.setItem("loadBigImageAtFirst", "false");
  }

  /* checking for copy link */
  if (window.localStorage.getItem("copyUrl") !== "mobile1" && window.localStorage.getItem("copyUrl") !== "desktop") {
    window.localStorage.setItem("copyUrl", "mobile1");
  } else {
    if (window.localStorage.getItem("copyUrl") === "mobile1") {
      jQuery('#copy-link-m1').prop('checked', true);
    } else {
      jQuery('#copy-link-pc').prop('checked', true);
    }
  }
}

function themeCheck () {
  if (window.localStorage.getItem("theme") === "night") {
    jQuery('body').addClass('night-theme');
    jQuery('body').removeClass('day-theme');
    jQuery('#theme').prop('checked', true);
  } else {
    window.localStorage.setItem("theme", "day");
    jQuery('body').addClass('day-theme');
    jQuery('body').removeClass('night-theme');
  }
}

function displayPostTimeCheck () {
  if (window.localStorage.getItem("displayPostCreateTime") === "false") {
    jQuery('.post-info .time').hide();
  } else {
    window.localStorage.setItem("displayPostCreateTime", "true");
    jQuery('.post-info .time').show();
    jQuery('#display-post-time').prop('checked', true);
  }
}

function openGallery (index, items) {
  var pswpElement = jQuery('#pswp')[0];

  var options = {
    history: false,
    focus: false,
    showAnimationDuration: 0,
    hideAnimationDuration: 0,
    getDoubleTapZoom: function () {
    },
    fullscreenEl: false,
    index: index,
    loadingIndicatorDelay: 500,
    errorMsg: '<div class="pswp__error-msg">此圖片無法載入</div>',
    shareButtons: [{id: 'download', label: '下載', url: '{{raw_image_url}}', download: true}],
  };

  var gallery = new PhotoSwipe(pswpElement, PhotoSwipeUI_Default, items, options);

  gallery.listen('gettingData', function (index, item) {
    if (item.w < 1 || item.h < 1) {
      var img = new Image();
      img.onload = function () {
        item.w = this.width;
        item.h = this.height;
        gallery.invalidateCurrItems();
        gallery.updateSize(true);
      };
      img.src = item.src;
    }
  });

  gallery.listen('close', function () {
    jQuery('#pswp').remove();
    jQuery('body').append(photoSwipeHtml());
  });

  gallery.init();
}

function textAreaAutoGrow () {
  function vhTOpx (value) {
    var w = window,
        d = document,
        e = d.documentElement,
        g = d.getElementsByTagName('body')[0],
        x = w.innerWidth || e.clientWidth || g.clientWidth,
        y = w.innerHeight || e.clientHeight || g.clientHeight;

    var result = (y * value) / 100;
    return result;
  }

  var textarea = jQuery('textarea')[0];
  var heightLimit = vhTOpx(50);

  textarea.style.height = "";
  textarea.style.height = Math.min(textarea.scrollHeight, heightLimit) + "px";

  textarea.oninput = function () {
    textarea.style.height = "";
    textarea.style.height = Math.min(textarea.scrollHeight, heightLimit) + "px";
  };
}

