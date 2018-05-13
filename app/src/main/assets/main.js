var imgArr = [];
var lastHash = window.location.hash;

runAfterLoad();

function runAfterLoad () {
    jQuery('html').find('script').filter(function () {
        return jQuery(this).attr('src') == 'https://bbs.yamibo.com/source/plugin/oyeeh_geo/template/js/geo.js';
    }).remove();
    jQuery('head').append('<link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/photoswipe/4.1.2/photoswipe.min.css"/>');
    jQuery('head').append('<link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/photoswipe/4.1.2/default-skin/default-skin.min.css"/>');
    jQuery('head').append('<link href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css" rel="stylesheet" integrity="sha384-wvfXpqpZZVQGK6TAh5PVlGOfQNHSoD2xbE+QkPxCAFlNEevoEH3Sl0sibVcOQVnN" crossorigin="anonymous">');

    /* for debuging */
    jQuery('body').prepend('<div class="debug-tool"><button class="copy-link" data-clipboard-text="">複製本頁鏈接</button></div>');
    jQuery('.debug-tool button').attr('data-clipboard-text', window.location.href);
    var clipboard = new ClipboardJS('.copy-link');
    clipboard.on('success', function(e) {
        window.alert('你已複製鏈接');
    });

    /* if it is in mobile standard mode (mobile=1) */
    if (/\bmobile=1\b/.test(window.location.search)) {
        /* Add CSS on page load */
        jQuery('body').css('min-width', '100vw');
        jQuery('head').append(customCSS());

        /* check logo exist and change it */
        new MutationObserver(function (mutations) {
            jQuery('.hd img').css('opacity', '0');
            jQuery('.hd img').attr('src', '/template/oyeeh_com_baihe/img/config/img/logo.png');
            jQuery('.hd img').css('opacity', '1');
        }).observe(document, {childList: true, subtree: true});

        /* when document ready add html elements */
        jQuery(document).ready(function () {
            /* Add search link on top */
            if (jQuery('#search-link').length == 0) {
                jQuery('.hd').append('<a href="https://bbs.yamibo.com/search.php?mod=forum&mobile=2" id="search-link">搜索</a>');
            }

            /* add back to top button and go to bottom button */
            jQuery('body').append('<div id=\'scroll-button\'><a title=\'回最頂\' class=\'go-to-top\' onclick=\'window.scrollTo(0,0);\'><i class="fa fa-angle-up" aria-hidden="true"></i></a><a title=\'去最底\' class=\'go-to-bottom\' onclick=\'window.scrollTo(0,document.body.scrollHeight);\'><i class="fa fa-angle-down" aria-hidden="true"></i></a></div>');
            jQuery('body').append('<div id=\'history-button\'><a title=\'回上頁\' class=\'prev-page\' onclick=\'window.history.back();\'><</a><a title=\'下一頁\' class=\'next-page\' onclick=\'window.history.forward();\'>></a></div>');

            if (/\b&fid=\b/.test(window.location.search)) {
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
            }

            /* when inside a post */
            if ( (/\b&tid=\b/.test(window.location.search) || /\bthread\b/.test(window.location.href)) && ! /\baction=reply\b/.test(window.location.search) ) {
                /* handle keyboard cover comment box */
                jQuery('body').addClass('is-post');


                /* add image previewer */
                jQuery('body').append(photoSwipeHtml());
                var allImageEl = jQuery('.postmessage img:not([smilieid]), .box.box_ex2 img');
                allImageEl.each(function (i) {
                    var imgSrc = jQuery(this).attr('src');
                    if (jQuery(this).parent().is('a')) {
                        var largeImage = jQuery(this).parent().attr('href');
                        jQuery(this).unwrap();
                        imgSrc = largeImage;
                    }

                    jQuery(this).addClass('gallery-image');
                    jQuery(this).attr('gallery-index', i);

                    var imgObj = {src: imgSrc, w: 0, h: 0};
                    imgArr.push(imgObj);
                });

                var imgArrReady = setInterval(function () {
                    if (imgArr.length == allImageEl.length) {

                        jQuery('.gallery-image').click(function () {
                            var index = parseInt(jQuery(this).attr('gallery-index'));
                            openGallery(index, imgArr);
                        });

                        clearInterval(imgArrReady);
                    }
                }, 100);

                /* For Android back button close image previewer*/
                jQuery(window).bind('hashchange', function () {
                    var newHash = window.location.hash;
                    if (lastHash == '#previeweropened') {
                        jQuery('.pswp__button--close').click();
                    }
                    lastHash = newHash;
                });

                /* Force all link to redirect instead of open in new tab */
                jQuery('.postmessage a').removeAttr('target');

                /* Change all yamibo link to mobile=1 */
                jQuery('.postmessage a').each(function(){
                    var href = jQuery(this).attr('href');
                    if (/\bbbs.yamibo.com\b/.test(href)) {
                        if (/\bmobile=yes\b/.test(href) || /\bmobile=2\b/.test(href)) {
                            href = href.replace('mobile=yes', 'mobile=1');
                            href = href.replace('mobile=2', 'mobile=1');
                        } else {
                            if (href.split('?').length > 1) {
                                href = href + '&mobile=1';
                            }else {
                                href = href + '?mobile=1';
                            }
                        }
                        $(this).attr('href', href);
                    }
                });

                /* change post link of reply form at bottom to mobile=1 */
                var posturl = jQuery('#fastpostform').attr('action');
                posturl = posturl.replace('mobile=yes', 'mobile=1');
                jQuery('#fastpostform').attr('action', posturl);

                /* Make reply box height auto grow */
                textAreaAutoGrow();

            }

            /* when inside the reply page*/
            if (/\baction=reply\b/.test(window.location.search)) {

                /* change post form url to mobile=1 */
                var posturl = jQuery('#postform').attr('action');
                posturl = posturl.replace('mobile=yes', 'mobile=1');
                jQuery('#postform').attr('action', posturl);

                /* Make reply box height auto grow */
                textAreaAutoGrow();
            }
        });
    }
}

function customCSS () {
	var standardCustomCss = '<style>' +
			'body {
        background-color: #FFF5D7;
    }

    .copy-link {
            width: 100%;
        border: 1px solid #551200;
        background-color: #551200;
        color: #ffffff;
        padding: 10px;
    }

    .hd {
        border-color: #551200;
    }

    .hd img {
        height: 30px;
        opacity: 0;
        transition: all 1s;
    }
    #search-link {
        float: right;
        color: #551200;
        padding: 10px;
    }
    a, .lkcss {
        color: #551200;
    }

    .box {
        background-color: #FFE;
    }

    .bm .bm_h {
        background-color: #551200 !important;
    }

    .even {
        background-color: #fff6d7;
    }
    .bm .bm_c {
        border-color: #DBC38C
    }

    .bm_c:nth-child(even) {
        background-color: rgb(255, 237, 187);
    }

    .tl .bm_c .xg1 {
        display: inline-block;
        width: 100%;
        text-align: right;
    }
    .tl .bm_c .xg1 a{
        float: left;
    }
    .tl .bm_c .xg1 .post-info {
        display: inline-block;
    }
    .tl .bm_c .xg1 .time {
        min-width: 110px;
        text-align: right;
        display: inline-block;
        padding-right: 5px;
    }
    .no-of-reply {
        min-width: 55px;
        display: inline-block;
    }
    .no-of-reply:before {
        content: "回";
        position: absolute;
        right: 45px;
    }

    .postmessage img, .box_ex2 img{
        max-width: 100%;
    }

    #scroll-button {
        position: fixed;
        right: 2px;
        bottom: 30px;
    }

    #history-button{
        position: fixed;
        left: 15px;
        bottom: 25px;
        display: inline-block;
    }

    #history-button a {
        display: inline-block;
        float: left;
    }

    #scroll-button a, #history-button a {
        display: block;
        background: rgba(255, 255, 255, 0.8);
        border: 1px solid #DBC38C;
        border-radius: 3px;
        line-height: 100%;
        padding: 7px 10px;
    }
    .is-post .ft {
        margin-bottom: 300px;
        margin-bottom: 40vh;
    }
    </style>';
	return standardCustomCss.replace(' ', '').replace('\n', '');
}

function photoSwipeHtml () {
	return '<div id="pswp" class="pswp" tabindex="-1" role="dialog" aria-hidden="true">
    <div class="pswp__bg"></div>
    <div class="pswp__scroll-wrap">
    <div class="pswp__container">
    <div class="pswp__item"></div>
    <div class="pswp__item"></div>
    <div class="pswp__item"></div>
    </div>
    <div class="pswp__ui pswp__ui--hidden">
    <div class="pswp__top-bar">
    <div class="pswp__counter"></div>
    <button class="pswp__button pswp__button--close" title="Close (Esc)"></button>
    <button class="pswp__button pswp__button--share" title="Share"></button>
    <button class="pswp__button pswp__button--fs" title="Toggle fullscreen"></button>
    <button class="pswp__button pswp__button--zoom" title="Zoom in/out"></button>
    <div class="pswp__preloader">
    <div class="pswp__preloader__icn">
    <div class="pswp__preloader__cut">
    <div class="pswp__preloader__donut"></div>
    </div>
    </div>
    </div>
    </div>
    <div class="pswp__share-modal pswp__share-modal--hidden pswp__single-tap">
    <div class="pswp__share-tooltip"></div>
    </div>
    <button class="pswp__button pswp__button--arrow--left" title="Previous (arrow left)">
    </button>
    <button class="pswp__button pswp__button--arrow--right" title="Next (arrow right)">
    </button>
    <div class="pswp__caption">
    <div class="pswp__caption__center"></div>
    </div>
    </div>
    </div>
    </div>';
}

function openGallery (index, items) {
	var pswpElement = jQuery('#pswp')[0];

	var options = {
		history: false,
		focus: false,
		showAnimationDuration: 0,
		hideAnimationDuration: 0,
		getDoubleTapZoom: 1,
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
	window.location.hash = 'previeweropened';

	gallery.listen('close', function () {
		if (window.location.hash == '#previeweropened') {
			window.history.back();
		}
		jQuery('#pswp').remove();
		jQuery('body').append(photoSwipeHtml());
	});

	gallery.init();
}

function textAreaAutoGrow () {
    var textarea = jQuery('textarea')[0];
    var heightLimit = 800;

    textarea.oninput = function() {
        textarea.style.height = "";
        textarea.style.height = Math.min(textarea.scrollHeight, heightLimit) + "px";
    };
}