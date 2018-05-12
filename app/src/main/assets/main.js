var imgArr = [];
var lastHash = window.location.hash;
function runAfterLoad (){
    jQuery('html').find('script').filter(function(){
        return jQuery(this).attr('src') == 'https://bbs.yamibo.com/source/plugin/oyeeh_geo/template/js/geo.js';
    }).remove();
    jQuery('head').append('<link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/photoswipe/4.1.2/photoswipe.min.css"/>');
    jQuery('head').append('<link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/photoswipe/4.1.2/default-skin/default-skin.min.css"/>');


    if (/\bmobile=1\b/.test (window.location.search) ) {
        /* Add CSS on page load */
        jQuery('body').css('min-width', '100vw');
        jQuery('head').append(customCSS());

        /* check logo exist and change it */
        new MutationObserver(function(mutations) {
            jQuery('.hd img').css('opacity', '0');
            jQuery('.hd img').attr('src', '/template/oyeeh_com_baihe/img/config/img/logo.png');
            jQuery('.hd img').css('opacity', '1');
        }).observe(document, {childList: true, subtree: true});

        /* when document ready add html elements */
        jQuery(document).ready(function(){
            /* add back to top button and go to bottom button */
            jQuery('body').append("<div id='scroll-button'><a title='回最頂' class='go-to-top' onclick='window.scrollTo(0,0);'>></a><a title='去最底' class='go-to-bottom' onclick='window.scrollTo(0,document.body.scrollHeight);'>></a></div>");
            jQuery('body').append("<div id='history-button'><a title='回上頁' class='prev-page' onclick='window.history.back();'><</a><a title='下一頁' class='next-page' onclick='window.history.forward();'>></a></div>");

            if (/\b&fid=\b/.test (location.search) ) {
                /* format post date and time */
                jQuery('.tl .bm_c .xg1').each(function(){
                    var dateText = jQuery.trim(jQuery(this).clone().children().remove().end().text());
                    var linkElement = jQuery(this).html().split('</a>')[0] + '</a>';
                    var newHtml = linkElement + '<div class="post-info"><span class="time">'+ dateText.split('回')[0] +' </span>';
                    if(dateText.split('回').length > 1){
                        newHtml += '<span class="no-of-reply">' + dateText.split('回')[1]+'</span>';
                    }else{
                        newHtml += '<span class="no-of-reply">0</span>';
                    }
                    newHtml += '</div>';
                    jQuery(this).html(newHtml);
                });
            }
            if (/\b&tid=\b/.test (location.search) ) {
                jQuery('body').append(photoSwipeHtml());

                var allImageEl = jQuery('.postmessage img:not([smilieid]), .box.box_ex2 img');
                allImageEl.each(function(i){
                    if (jQuery(this).parent().is('a')) {
                        var largeImage = jQuery(this).parent().attr('href');
                        jQuery(this).unwrap();
                        jQuery(this).attr('src', largeImage);
                    }

                    jQuery(this).addClass('gallery-image');
                    jQuery(this).attr('gallery-index', i);

                    var imgSrc = jQuery(this).attr('src');
                    var imgObj = {src: imgSrc, w: 0, h: 0};
                    imgArr.push(imgObj);
                });

                var imgArrReady = setInterval(function(){
                    if(imgArr.length == allImageEl.length){
                        console.log(imgArr);

                        jQuery('.gallery-image').click(function(){
                            var index = parseInt(jQuery(this).attr('gallery-index'));
                            openGallery (index, imgArr);
                        });

                        clearInterval(imgArrReady);
                    }
                }, 100);

                /* For Android back button close image previewer*/
                jQuery(window).bind('hashchange', function() {
                    var newHash = window.location.hash;
                    if (lastHash == '#previeweropened') {
                        jQuery('.pswp__button--close').click();
                    }
                    lastHash = newHash;
                });

            }
        });
    }
}

runAfterLoad ();

function customCSS (){
    var standardCustomCss = `<style>`+
    `body {
        background-color: #FFF5D7;
    }

    .hd {
        border-color: #551200;
    }

    .hd img {
        height: 30px;
        opacity: 0;
        transition: all 1s;
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
        content: '回';
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

    .go-to-top {
        transform: rotate(-90deg);
    }

    .go-to-bottom {
        transform: rotate(90deg);
    }
    </style>`;
    return standardCustomCss.replace(" ", '').replace('\n', '');
}

function photoSwipeHtml(){
    return `<div id="pswp" class="pswp" tabindex="-1" role="dialog" aria-hidden="true">

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
    </div>`;
}

function openGallery (index, items){
    var pswpElement = jQuery('#pswp')[0];

    var options = {
        history: false,
        focus: false,
        showAnimationDuration: 0,
        hideAnimationDuration: 0,
        getDoubleTapZoom: 1,
        fullscreenEl: false,
        index: index,
        shareButtons: [{id:'download', label:'Download image', url:'{{raw_image_url}}', download:true}],
    };

    var gallery = new PhotoSwipe( pswpElement, PhotoSwipeUI_Default, items, options);

    gallery.listen('gettingData', function(index, item) {
        if (item.w < 1 || item.h < 1) {
            var img = new Image();
            img.onload = function() {
                item.w = this.width;
                item.h = this.height;
                gallery.invalidateCurrItems();
                gallery.updateSize(true);
            };
            img.src = item.src;
        }
    });
    window.location.hash = 'previeweropened';

    gallery.listen('close', function(){
        if (window.location.hash=='previeweropened') {
            window.history.back();
        }
        jQuery('#pswp').remove();
        jQuery('body').append(photoSwipeHtml());
    });

    gallery.init();
}
