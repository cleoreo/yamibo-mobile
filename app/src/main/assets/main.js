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
            jQuery('#menu-btn').click(function(){
                jQuery('body').toggleClass('menu-opened');
                jQuery('#side-menu >div').scrollTop(0);
                window.scrollTo(0,0);
            });

            /* move prev page link before next link */
            jQuery('.wp .pg .prev').each(function() {
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
            jQuery('#theme').change(function() {
                if (jQuery(this).is(":checked")) {
                    window.localStorage.setItem("theme", "night");
                } else {
                    window.localStorage.setItem("theme", "day");
                }
                checkAndUpdateSetting();
            });
            /* font-size listener */
            jQuery('input[name=ftsize]').change(function() {
                window.localStorage.setItem("ftsize", jQuery(this).val());
                checkAndUpdateSetting();
            });
            /* language listener */
            jQuery('input[name=language]').change(function() {
                window.localStorage.setItem("language", jQuery(this).val());
                if (jQuery(this).val() == "none") {
                    window.location.reload();
                }
                checkAndUpdateSetting();
            });
            /* display post create time listener */
            jQuery('#display-post-time').change(function() {
                if (jQuery(this).is(":checked")) {
                    window.localStorage.setItem("displayPostCreateTime", "true");
                } else {
                    window.localStorage.setItem("displayPostCreateTime", "false");
                }
                checkAndUpdateSetting();
            });

            /* load big image setting listener */
            jQuery('#load-big-image').change(function() {
                if (jQuery(this).is(":checked")) {
                    window.localStorage.setItem("loadBigImageAtFirst", "true");
                    window.alert('直接上大圖了，小心流量哦！');
                    if ( (/\b&tid=\b/.test(window.location.search) || /\bthread\b/.test(window.location.href)) && ! /\baction=\b/.test(window.location.search) ) {
                        window.location.reload();
                    }
                } else {
                    window.localStorage.setItem("loadBigImageAtFirst", "false");
                }
            });

            /* copy link setting listener */
            jQuery('input[name=copy-link]').change(function() {
                window.localStorage.setItem("copyUrl", jQuery(this).val());
                checkAndUpdateSetting();
            });

            checkAndUpdateSetting();

            jQuery('#side-menu').click(function(e){
                if (e.target == this){
                    jQuery('body').removeClass('menu-opened');
                }
            });

            /* when inside a forum page */
            if (/\b&fid=\b/.test(window.location.search) && ! /\b&action=\b/.test(window.location.search)) {
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
            if ( (/\b&tid=\b/.test(window.location.search) || /\bthread\b/.test(window.location.href)) && ! /\baction=\b/.test(window.location.search) ) {
                /* handle keyboard cover comment box */
                jQuery('body').addClass('is-post');


                /* add image previewer */
                jQuery('body').append(photoSwipeHtml());
                var allImageEl = jQuery('.postmessage img:not([smilieid]), .box.box_ex2 img');
                allImageEl.each(function (i) {
                    var imgSrc = jQuery(this).attr('src');
                    /* force image load from https */
                    if (! /\bhttps:\b/.test(imgSrc)) {
                        imgSrc = imgSrc.replace('http://', 'https://');
                    }
                    jQuery(this).attr('src', imgSrc);

                    if (jQuery(this).parent().is('a')) {
                        var largeImage = jQuery(this).parent().attr('href');
                        jQuery(this).unwrap();
                        imgSrc = largeImage;

                        /* force large image load from https */
                        if (! /\bhttps\b/.test(imgSrc)) {
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
                                if (href.slice(-1) == "/") {
                                    href = href + "forum.php?mobile=1";
                                }else if(href.slice(-4) == ".com"){
                                    href = href + "/forum.php?mobile=1";
                                }else{
                                    href = href + '?mobile=1';
                                }
                            }
                        }
                        jQuery(this).attr('href', href);
                    }
                });

                /* change poll form submit link to mobile =1 */
                if (jQuery('#poll').length >0) {
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
            if (/\baction=reply\b/.test(window.location.search) || /\baction=edit\b/.test(window.location.search) ) {

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

                if (/\bdo=pm\b/.test(window.location.search) || /\bac=pm\b/.test(window.location.search) ) {
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
        jQuery('.copy-link').click(function() {
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
    `body.day-theme {
        background-color: #FFF5D7;
    }
    .day-theme #menu-btn div {
        background-color: #551200;
    }
    .day-theme .hd {
      border-color: #551200;
    }
    .day-theme a, .day-theme .lkcss {
      color: #551200;
    }
    .day-theme #search-link {
      color: #551200;
    }
    .day-theme .box {
      background-color: #FFE;
    }
    .day-theme .bm .bm_h {
      background-color: #551200 !important;
    }
    .day-theme .even {
      background-color: #fff6d7;
    }
    .day-theme .bm .bm_c {
      border-color: #DBC38C;
    }
    .day-theme .bm_c:nth-child(even) {
      background-color: #ffedbb;
    }
    .day-theme #scroll-button a, .day-theme #history-button a {
        background-color: rgba(255, 255, 255, 0.8) !important;
        border: 1px solid #DBC38C;
    }
    .day-theme input[type="submit"] {
        border: 1px solid #551200;
        background-color: #FFE;
    }

    body.night-theme {
      background-color: #0b0704 !important;
      color: #a3948f;
      --link-color: rgb(161, 146, 18);
      --link-color-hover: rgb(179, 163, 20);
      --link-color-active: rgb(147, 134, 16);
      --visited-color: rgb(161, 125, 18);
      --visited-color-hover: rgb(179, 139, 20);
      --visited-color-active: rgb(147, 114, 16);
    }
    .night-theme .hd {
        border-color: #7e5f54;
    }
    .night-theme #menu-btn div {
        background-color: #94837d;
    }
    .night-theme a, .night-theme .lkcss {
        color: #a16c12;
    }
    .night-theme .box {
        background-color: #1c0e09;
    }
    .night-theme .bm .bm_h {
        background-color: #1c0e09 !important;
        color: #a3948f;
    }
    .night-theme .bm .bm_h a {
        color: #A18C11;
    }
    .night-theme .bm .bm_inf {
        border-color: #87665a;
        background-color: #2b201d;
    }
    .night-theme .bm_c .bm_user {
        border-color: #87665a;
        background-color: #2b201d;
    }
    .night-theme .even {
        background-color: transparent;
    }
    .night-theme .bm .bm_c {
        border-color: #7e5f54 !important;
    }
    .night-theme div[id^=post] {
        background-color: #0b0704 !important;
    }
    .night-theme .bm_c:nth-child(even) {
        background-color: #291a0a;
    }
    .night-theme input, .night-theme textarea {
        background: #2b201d;
        color: #a3948f;
    }
    .night-theme {
        background-color: rgba(43, 32, 29, 0.8) !important;
    }
    .night-theme #scroll-button a, .night-theme #history-button a {
        background-color: rgba(43, 32, 29, 0.8) !important;
        border: 1px solid #806155;
        color: #a19212;
    }
    .night-theme select {
        color: #a16c12;
    }

    .hd img {
        height: 30px;
        opacity: 0;
        transition: all 1s;
    }
    .pipe {
        margin: 0 2px;
    }
    #menu-btn {
        background: transparent;
        border: none;
        padding: 0 5px;
        float: right;
        outline: none;
    }
    #menu-btn div {
        width: 25px;
        height: 3px;
        margin: 6px 0;
        transition: all 0.4s;
    }
    #menu-btn div:first-of-type {
       transform-origin: 100% 100%;
    }
    #menu-btn div:last-of-type {
       transform-origin: 100% 0;
    }
    .menu-opened #menu-btn div {
        opacity: 0;
    }
    .menu-opened #menu-btn div:first-of-type {
        transform: rotate(-45deg);
        opacity: 1;
    }
    .menu-opened #menu-btn div:last-of-type {
        transform: rotate(45deg);
        opacity: 1;
    }
    .menu-opened {
        height: 100%;
        position: fixed;
        top: 0;
    }
    .menu-opened #side-menu {
        left: 0;
    }
    .menu-opened #side-menu #logout{
        position: fixed;
    }
    #side-menu {
        display: block;
        width: 100%;
        height: 100%;
        position: absolute;
        left: -100%;
        top: 0;
        background-color: rgba(0,0,0,0.6);
    }
    #side-menu >div{
        display: block;
        width: 70%;
        width: 70vw;
        height: 100%;
        position: absolute;
        left: 0;
        top: 0;
        transition: all 1s;
        background-color: #16110f;
        border-right: 1px solid #856559;
        color: #a16c12;
        overflow: auto;
        max-height: 100%;
        padding-bottom: 3rem;
    }
    #side-menu .menu-item {
        padding: 10px;
    }
    #side-menu .menu-item.last {
        margin-bottom: 3rem;
    }
    #side-menu .language-div, #side-menu .ftsize-div {
        padding: 0;
    }
    #side-menu .menu-item label{
        display: block;
        margin: 10px 20px;
    }
    #side-menu .menu-item span {
        padding-right: 5px;
    }
    #side-menu .switcher-div label{
        display: inline-block;
        margin: 0;
    }
    #side-menu #logout {
        bottom: 0;
        left: 0;
        width: calc(70vw - 20px);
        height: auto;
        padding: 10px;
        border-top: 3px solid #a16c12;
        background-color: #16110f;
    }
    #search-link {
        float: right;
    }
    .tl .bm_c .xg1 {
        display: inline-block;
        width: 100%;
        text-align: right;
        font-size: 0.8rem;
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
        margin-right: 5px;
    }
    .no-of-reply {
        display: inline-block;
        float: right;
        min-width: 4rem;
    }
    .no-of-reply:before {
        content: "回";
        position: absolute;
        right: 3rem;
    }

    .postmessage img, .box_ex2 img{
        max-width: 100%;
    }
    .big-image {
        width: 100%;
        width: 100vw;
        height: auto;
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
        border-radius: 3px;
        line-height: 100%;
        padding: 7px 10px;
    }
    .ft {
        margin-bottom: 100px;
    }
    .is-post .ft {
        margin-bottom: 300px;
        margin-bottom: 40vh;
    }

    .copy-link {
        width: 100%;
        border: 1px solid #551200;
        background-color: #551200;
        color: #ffffff;
        padding: 10px;
    }

    .wp .pg {
        display: inline-block;
        width: 100%;
    }
    .wp .pg >label >span {
        display: none;
    }
    .wp .pg a {
        display: inline-block;
    }
    .wp .pg .prev, .wp .pg .nxt {
        margin: 5px 0;
        padding: 5px 15px;
        border: 1px solid;
    }
    .wp .pg .nxt {
        float: right;
    }

    input[type="text"], input[type="submit"], textarea {
        padding: 5px !important;
        width: calc(100% - 12px) !important;
    }

    input[type="submit"], input[type="file"] {
        width: 100% !important;
        max-width: 100% !important;
    }

    div.checkbox.switcher label, div.radio.switcher label {
      padding: 0;
    }
    div.checkbox.switcher label *, div.radio.switcher label * {
      vertical-align: middle;
    }
    div.checkbox.switcher label input, div.radio.switcher label input {
      display: none;
    }
    div.checkbox.switcher label input + span, div.radio.switcher label input + span {
      position: relative;
      display: inline-block;
      margin-right: 10px;
      width: 2rem;
      height: 1rem;
      background: #BBB;
      border: 1px solid #eee;
      border-radius: 50px;
      transition: all 0.3s ease-in-out;
    }
    div.checkbox.switcher label input + span small, div.radio.switcher label input + span small {
      position: absolute;
      display: block;
      width: 50%;
      height: 100%;
      background: #fff;
      border-radius: 50%;
      transition: all 0.3s ease-in-out;
      left: 0;
    }
    div.checkbox.switcher label input:checked + span, div.radio.switcher label input:checked + span {
      background: #269bff;
      border-color: #269bff;
    }
    div.checkbox.switcher label input:checked + span small, div.radio.switcher label input:checked + span small {
      left: 50%;
    }
    </style>`;
    return standardCustomCss.replace(' ', '').replace('\n', '');
}

function photoSwipeHtml () {
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

function sideMenuHtml () {
    return `<div id="side-menu">
    <div>
        <div class="menu-item">
            <span><b>閱讀設定：</b></span>
        </div>
        <div class="menu-item switcher-div">
            <div class="checkbox switcher">
                <label for="theme">
                    <span>夜間模式： </span>
                    <input type="checkbox" id="theme" name="theme">
                    <span><small></small></span>
                </label>
            </div>
        </div>
        <div class="menu-item">
            <span>字體大小：</span>
        </div>
        <div class="menu-item ftsize-div">
            <label><span>小 </span>
                <input type="radio" name="ftsize" value="S" id="ftsize-S">
            </label>
            <label><span>中 </span>
                <input type="radio" name="ftsize" value="M" id="ftsize-M" checked>
            </label>
            <label><span>大 </span>
                <input type="radio" name="ftsize" value="L" id="ftsize-L">
            </label>
        </div>
        <hr>
        <div class="menu-item">
            <span><b>語言設定：</b></span>
        </div>
        <div class="menu-item language-div">
            <label><span>繁 </span>
                <input type="radio" name="language" value="tc" id="language-tc">
            </label>
            <label><span>簡 </span>
                <input type="radio" name="language" value="sc" id="language-sc">
            </label>
            <label><span>無 </span>
                <input type="radio" name="language" value="none" id="language-none" checked>
            </label>
        </div>
        <hr>
        <div class="menu-item">
            <span><b>流量設定：</b></span>
        </div>
        <div class="menu-item switcher-div">
            <div class="checkbox switcher">
                <label for="load-big-image">
                    <span>直接顯示大圖： </span>
                    <input type="checkbox" id="load-big-image" name="load-big-image">
                    <span><small></small></span>
                </label>
            </div>
        </div>
        <hr>
        <div class="menu-item">
            <span><b>其他設定：</b></span>
        </div>
        <div class="menu-item switcher-div">
            <div class="checkbox switcher">
                <label for="display-post-time">
                    <span>顯示發帖時間： </span>
                    <input type="checkbox" id="display-post-time" name="post-time">
                    <span><small></small></span>
                </label>
            </div>
        </div>
        <div class="menu-item">
            <span><b>複製鏈接設定：</b></span>
        </div>
        <div class="menu-item copy-link-div">
            <label><span>標準版</span>
                <input type="radio" name="copy-link" value="mobile1" id="copy-link-m1" checked>
            </label>
            <label><span>電腦版 </span>
                <input type="radio" name="copy-link" value="desktop" id="copy-link-pc">
            </label>
        </div>
        <div class="menu-item last">
        </div>
        <div id="logout">
        </div>
    </div>
</div>`;
}

function checkAndUpdateSetting() {
    /* checking for theme */
    themeCheck();
    /* checking for font size */
    if (window.localStorage.getItem("ftsize") == "S") {
        jQuery('body').css('font-size', '8pt');
        jQuery('html').css('font-size', '8pt');
    }else if (window.localStorage.getItem("ftsize") == "L") {
        jQuery('body').css('font-size', '12pt');
        jQuery('html').css('font-size', '12pt');
    }else{
        window.localStorage.setItem("ftsize", "M");
        jQuery('body').css('font-size', '10pt');
        jQuery('html').css('font-size', '10pt');
    }

    if (window.localStorage.getItem("ftsize")) {
        jQuery('#ftsize-'+ window.localStorage.getItem("ftsize")).prop('checked', true);
    }

    /* checking for language */
    if (window.localStorage.getItem("language")) {
        jQuery('#language-'+ window.localStorage.getItem("language")).prop('checked', true);
    }

    if (window.localStorage.getItem("language") == "sc") {
        jQuery('body').t2s();
    }else if (window.localStorage.getItem("language") == "tc") {
        jQuery('body').s2t();
    }else{
        window.localStorage.setItem("language", "none");
    }

    /* checking for display post create time */
    displayPostTimeCheck();

    /* checking for image show big one first */
    if (window.localStorage.getItem("loadBigImageAtFirst") == "true") {
        jQuery('#load-big-image').prop('checked', true);
    }else {
        window.localStorage.setItem("loadBigImageAtFirst", "false");
    }

    /* checking for copy link */
    if (window.localStorage.getItem("copyUrl") !== "mobile1" && window.localStorage.getItem("copyUrl") !== "desktop") {
        window.localStorage.setItem("copyUrl", "mobile1");
    }else {
        if (window.localStorage.getItem("copyUrl") == "mobile1") {
            jQuery('#copy-link-m1').prop('checked', true);
        }else{
            jQuery('#copy-link-pc').prop('checked', true);
        }
    }
}

function themeCheck () {
    if (window.localStorage.getItem("theme") == "night") {
        jQuery('body').addClass('night-theme');
        jQuery('body').removeClass('day-theme');
        jQuery('#theme').prop('checked', true);
    }else {
        window.localStorage.setItem("theme", "day");
        jQuery('body').addClass('day-theme');
        jQuery('body').removeClass('night-theme');
    }
}

function displayPostTimeCheck () {
    if (window.localStorage.getItem("displayPostCreateTime") == "false") {
        jQuery('.post-info .time').hide();
    }else {
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
        getDoubleTapZoom: function() {},
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
    var textarea = jQuery('textarea')[0];
    var heightLimit = 500;

    textarea.style.height = "";
    textarea.style.height = Math.min(textarea.scrollHeight, heightLimit) + "px";

    textarea.oninput = function() {
        textarea.style.height = "";
        textarea.style.height = Math.min(textarea.scrollHeight, heightLimit) + "px";
    };
}

/* Chinese translation plugin from https://github.com/hustlzp/jquery-s2t, this is a compressed version */
!function(t){var e=new String("万与丑专业丛东丝丢两严丧个丬丰临为丽举么义乌乐乔习乡书买乱争于亏云亘亚产亩亲亵亸亿仅从仑仓仪们价众优伙会伛伞伟传伤伥伦伧伪伫体余佣佥侠侣侥侦侧侨侩侪侬俣俦俨俩俪俭债倾偬偻偾偿傥傧储傩儿兑兖党兰关兴兹养兽冁内冈册写军农冢冯冲决况冻净凄凉凌减凑凛几凤凫凭凯击凼凿刍划刘则刚创删别刬刭刽刿剀剂剐剑剥剧劝办务劢动励劲劳势勋勐勚匀匦匮区医华协单卖卢卤卧卫却卺厂厅历厉压厌厍厕厢厣厦厨厩厮县参叆叇双发变叙叠叶号叹叽吁后吓吕吗吣吨听启吴呒呓呕呖呗员呙呛呜咏咔咙咛咝咤咴咸哌响哑哒哓哔哕哗哙哜哝哟唛唝唠唡唢唣唤唿啧啬啭啮啰啴啸喷喽喾嗫呵嗳嘘嘤嘱噜噼嚣嚯团园囱围囵国图圆圣圹场坂坏块坚坛坜坝坞坟坠垄垅垆垒垦垧垩垫垭垯垱垲垴埘埙埚埝埯堑堕塆墙壮声壳壶壸处备复够头夸夹夺奁奂奋奖奥妆妇妈妩妪妫姗姜娄娅娆娇娈娱娲娴婳婴婵婶媪嫒嫔嫱嬷孙学孪宁宝实宠审宪宫宽宾寝对寻导寿将尔尘尧尴尸尽层屃屉届属屡屦屿岁岂岖岗岘岙岚岛岭岳岽岿峃峄峡峣峤峥峦崂崃崄崭嵘嵚嵛嵝嵴巅巩巯币帅师帏帐帘帜带帧帮帱帻帼幂幞干并广庄庆庐庑库应庙庞废庼廪开异弃张弥弪弯弹强归当录彟彦彻径徕御忆忏忧忾怀态怂怃怄怅怆怜总怼怿恋恳恶恸恹恺恻恼恽悦悫悬悭悯惊惧惨惩惫惬惭惮惯愍愠愤愦愿慑慭憷懑懒懔戆戋戏戗战戬户扎扑扦执扩扪扫扬扰抚抛抟抠抡抢护报担拟拢拣拥拦拧拨择挂挚挛挜挝挞挟挠挡挢挣挤挥挦捞损捡换捣据捻掳掴掷掸掺掼揸揽揿搀搁搂搅携摄摅摆摇摈摊撄撑撵撷撸撺擞攒敌敛数斋斓斗斩断无旧时旷旸昙昼昽显晋晒晓晔晕晖暂暧札术朴机杀杂权条来杨杩杰极构枞枢枣枥枧枨枪枫枭柜柠柽栀栅标栈栉栊栋栌栎栏树栖样栾桊桠桡桢档桤桥桦桧桨桩梦梼梾检棂椁椟椠椤椭楼榄榇榈榉槚槛槟槠横樯樱橥橱橹橼檐檩欢欤欧歼殁殇残殒殓殚殡殴毁毂毕毙毡毵氇气氢氩氲汇汉污汤汹沓沟没沣沤沥沦沧沨沩沪沵泞泪泶泷泸泺泻泼泽泾洁洒洼浃浅浆浇浈浉浊测浍济浏浐浑浒浓浔浕涂涌涛涝涞涟涠涡涢涣涤润涧涨涩淀渊渌渍渎渐渑渔渖渗温游湾湿溃溅溆溇滗滚滞滟滠满滢滤滥滦滨滩滪漤潆潇潋潍潜潴澜濑濒灏灭灯灵灾灿炀炉炖炜炝点炼炽烁烂烃烛烟烦烧烨烩烫烬热焕焖焘煅煳熘爱爷牍牦牵牺犊犟状犷犸犹狈狍狝狞独狭狮狯狰狱狲猃猎猕猡猪猫猬献獭玑玙玚玛玮环现玱玺珉珏珐珑珰珲琎琏琐琼瑶瑷璇璎瓒瓮瓯电画畅畲畴疖疗疟疠疡疬疮疯疱疴痈痉痒痖痨痪痫痴瘅瘆瘗瘘瘪瘫瘾瘿癞癣癫癯皑皱皲盏盐监盖盗盘眍眦眬着睁睐睑瞒瞩矫矶矾矿砀码砖砗砚砜砺砻砾础硁硅硕硖硗硙硚确硷碍碛碜碱碹磙礼祎祢祯祷祸禀禄禅离秃秆种积称秽秾稆税稣稳穑穷窃窍窑窜窝窥窦窭竖竞笃笋笔笕笺笼笾筑筚筛筜筝筹签简箓箦箧箨箩箪箫篑篓篮篱簖籁籴类籼粜粝粤粪粮糁糇紧絷纟纠纡红纣纤纥约级纨纩纪纫纬纭纮纯纰纱纲纳纴纵纶纷纸纹纺纻纼纽纾线绀绁绂练组绅细织终绉绊绋绌绍绎经绐绑绒结绔绕绖绗绘给绚绛络绝绞统绠绡绢绣绤绥绦继绨绩绪绫绬续绮绯绰绱绲绳维绵绶绷绸绹绺绻综绽绾绿缀缁缂缃缄缅缆缇缈缉缊缋缌缍缎缏缐缑缒缓缔缕编缗缘缙缚缛缜缝缞缟缠缡缢缣缤缥缦缧缨缩缪缫缬缭缮缯缰缱缲缳缴缵罂网罗罚罢罴羁羟羡翘翙翚耢耧耸耻聂聋职聍联聩聪肃肠肤肷肾肿胀胁胆胜胧胨胪胫胶脉脍脏脐脑脓脔脚脱脶脸腊腌腘腭腻腼腽腾膑臜舆舣舰舱舻艰艳艹艺节芈芗芜芦苁苇苈苋苌苍苎苏苘苹茎茏茑茔茕茧荆荐荙荚荛荜荞荟荠荡荣荤荥荦荧荨荩荪荫荬荭荮药莅莜莱莲莳莴莶获莸莹莺莼萚萝萤营萦萧萨葱蒇蒉蒋蒌蓝蓟蓠蓣蓥蓦蔷蔹蔺蔼蕲蕴薮藁藓虏虑虚虫虬虮虽虾虿蚀蚁蚂蚕蚝蚬蛊蛎蛏蛮蛰蛱蛲蛳蛴蜕蜗蜡蝇蝈蝉蝎蝼蝾螀螨蟏衅衔补衬衮袄袅袆袜袭袯装裆裈裢裣裤裥褛褴襁襕见观觃规觅视觇览觉觊觋觌觍觎觏觐觑觞触觯詟誉誊讠计订讣认讥讦讧讨让讪讫训议讯记讱讲讳讴讵讶讷许讹论讻讼讽设访诀证诂诃评诅识诇诈诉诊诋诌词诎诏诐译诒诓诔试诖诗诘诙诚诛诜话诞诟诠诡询诣诤该详诧诨诩诪诫诬语诮误诰诱诲诳说诵诶请诸诹诺读诼诽课诿谀谁谂调谄谅谆谇谈谊谋谌谍谎谏谐谑谒谓谔谕谖谗谘谙谚谛谜谝谞谟谠谡谢谣谤谥谦谧谨谩谪谫谬谭谮谯谰谱谲谳谴谵谶谷豮贝贞负贠贡财责贤败账货质贩贪贫贬购贮贯贰贱贲贳贴贵贶贷贸费贺贻贼贽贾贿赀赁赂赃资赅赆赇赈赉赊赋赌赍赎赏赐赑赒赓赔赕赖赗赘赙赚赛赜赝赞赟赠赡赢赣赪赵赶趋趱趸跃跄跖跞践跶跷跸跹跻踊踌踪踬踯蹑蹒蹰蹿躏躜躯车轧轨轩轪轫转轭轮软轰轱轲轳轴轵轶轷轸轹轺轻轼载轾轿辀辁辂较辄辅辆辇辈辉辊辋辌辍辎辏辐辑辒输辔辕辖辗辘辙辚辞辩辫边辽达迁过迈运还这进远违连迟迩迳迹适选逊递逦逻遗遥邓邝邬邮邹邺邻郁郄郏郐郑郓郦郧郸酝酦酱酽酾酿释里鉅鉴銮錾钆钇针钉钊钋钌钍钎钏钐钑钒钓钔钕钖钗钘钙钚钛钝钞钟钠钡钢钣钤钥钦钧钨钩钪钫钬钭钮钯钰钱钲钳钴钵钶钷钸钹钺钻钼钽钾钿铀铁铂铃铄铅铆铈铉铊铋铍铎铏铐铑铒铕铗铘铙铚铛铜铝铞铟铠铡铢铣铤铥铦铧铨铪铫铬铭铮铯铰铱铲铳铴铵银铷铸铹铺铻铼铽链铿销锁锂锃锄锅锆锇锈锉锊锋锌锍锎锏锐锑锒锓锔锕锖锗错锚锜锞锟锠锡锢锣锤锥锦锨锩锫锬锭键锯锰锱锲锳锴锵锶锷锸锹锺锻锼锽锾锿镀镁镂镃镆镇镈镉镊镌镍镎镏镐镑镒镕镖镗镙镚镛镜镝镞镟镠镡镢镣镤镥镦镧镨镩镪镫镬镭镮镯镰镱镲镳镴镶长门闩闪闫闬闭问闯闰闱闲闳间闵闶闷闸闹闺闻闼闽闾闿阀阁阂阃阄阅阆阇阈阉阊阋阌阍阎阏阐阑阒阓阔阕阖阗阘阙阚阛队阳阴阵阶际陆陇陈陉陕陧陨险随隐隶隽难雏雠雳雾霁霉霭靓静靥鞑鞒鞯鞴韦韧韨韩韪韫韬韵页顶顷顸项顺须顼顽顾顿颀颁颂颃预颅领颇颈颉颊颋颌颍颎颏颐频颒颓颔颕颖颗题颙颚颛颜额颞颟颠颡颢颣颤颥颦颧风飏飐飑飒飓飔飕飖飗飘飙飚飞飨餍饤饥饦饧饨饩饪饫饬饭饮饯饰饱饲饳饴饵饶饷饸饹饺饻饼饽饾饿馀馁馂馃馄馅馆馇馈馉馊馋馌馍馎馏馐馑馒馓馔馕马驭驮驯驰驱驲驳驴驵驶驷驸驹驺驻驼驽驾驿骀骁骂骃骄骅骆骇骈骉骊骋验骍骎骏骐骑骒骓骔骕骖骗骘骙骚骛骜骝骞骟骠骡骢骣骤骥骦骧髅髋髌鬓魇魉鱼鱽鱾鱿鲀鲁鲂鲄鲅鲆鲇鲈鲉鲊鲋鲌鲍鲎鲏鲐鲑鲒鲓鲔鲕鲖鲗鲘鲙鲚鲛鲜鲝鲞鲟鲠鲡鲢鲣鲤鲥鲦鲧鲨鲩鲪鲫鲬鲭鲮鲯鲰鲱鲲鲳鲴鲵鲶鲷鲸鲹鲺鲻鲼鲽鲾鲿鳀鳁鳂鳃鳄鳅鳆鳇鳈鳉鳊鳋鳌鳍鳎鳏鳐鳑鳒鳓鳔鳕鳖鳗鳘鳙鳛鳜鳝鳞鳟鳠鳡鳢鳣鸟鸠鸡鸢鸣鸤鸥鸦鸧鸨鸩鸪鸫鸬鸭鸮鸯鸰鸱鸲鸳鸴鸵鸶鸷鸸鸹鸺鸻鸼鸽鸾鸿鹀鹁鹂鹃鹄鹅鹆鹇鹈鹉鹊鹋鹌鹍鹎鹏鹐鹑鹒鹓鹔鹕鹖鹗鹘鹚鹛鹜鹝鹞鹟鹠鹡鹢鹣鹤鹥鹦鹧鹨鹩鹪鹫鹬鹭鹯鹰鹱鹲鹳鹴鹾麦麸黄黉黡黩黪黾鼋鼌鼍鼗鼹齄齐齑齿龀龁龂龃龄龅龆龇龈龉龊龋龌龙龚龛龟志制咨只里系范松没尝尝闹面准钟别闲干尽脏拼"),n=new String("萬與醜專業叢東絲丟兩嚴喪個爿豐臨為麗舉麼義烏樂喬習鄉書買亂爭於虧雲亙亞產畝親褻嚲億僅從侖倉儀們價眾優夥會傴傘偉傳傷倀倫傖偽佇體餘傭僉俠侶僥偵側僑儈儕儂俁儔儼倆儷儉債傾傯僂僨償儻儐儲儺兒兌兗黨蘭關興茲養獸囅內岡冊寫軍農塚馮衝決況凍淨淒涼淩減湊凜幾鳳鳧憑凱擊氹鑿芻劃劉則剛創刪別剗剄劊劌剴劑剮劍剝劇勸辦務勱動勵勁勞勢勳猛勩勻匭匱區醫華協單賣盧鹵臥衛卻巹廠廳曆厲壓厭厙廁廂厴廈廚廄廝縣參靉靆雙發變敘疊葉號歎嘰籲後嚇呂嗎唚噸聽啟吳嘸囈嘔嚦唄員咼嗆嗚詠哢嚨嚀噝吒噅鹹呱響啞噠嘵嗶噦嘩噲嚌噥喲嘜嗊嘮啢嗩唕喚呼嘖嗇囀齧囉嘽嘯噴嘍嚳囁嗬噯噓嚶囑嚕劈囂謔團園囪圍圇國圖圓聖壙場阪壞塊堅壇壢壩塢墳墜壟壟壚壘墾坰堊墊埡墶壋塏堖塒塤堝墊垵塹墮壪牆壯聲殼壺壼處備複夠頭誇夾奪奩奐奮獎奧妝婦媽嫵嫗媯姍薑婁婭嬈嬌孌娛媧嫻嫿嬰嬋嬸媼嬡嬪嬙嬤孫學孿寧寶實寵審憲宮寬賓寢對尋導壽將爾塵堯尷屍盡層屭屜屆屬屢屨嶼歲豈嶇崗峴嶴嵐島嶺嶽崠巋嶨嶧峽嶢嶠崢巒嶗崍嶮嶄嶸嶔崳嶁脊巔鞏巰幣帥師幃帳簾幟帶幀幫幬幘幗冪襆幹並廣莊慶廬廡庫應廟龐廢廎廩開異棄張彌弳彎彈強歸當錄彠彥徹徑徠禦憶懺憂愾懷態慫憮慪悵愴憐總懟懌戀懇惡慟懨愷惻惱惲悅愨懸慳憫驚懼慘懲憊愜慚憚慣湣慍憤憒願懾憖怵懣懶懍戇戔戲戧戰戩戶紮撲扡執擴捫掃揚擾撫拋摶摳掄搶護報擔擬攏揀擁攔擰撥擇掛摯攣掗撾撻挾撓擋撟掙擠揮撏撈損撿換搗據撚擄摑擲撣摻摜摣攬撳攙擱摟攪攜攝攄擺搖擯攤攖撐攆擷擼攛擻攢敵斂數齋斕鬥斬斷無舊時曠暘曇晝曨顯晉曬曉曄暈暉暫曖劄術樸機殺雜權條來楊榪傑極構樅樞棗櫪梘棖槍楓梟櫃檸檉梔柵標棧櫛櫳棟櫨櫟欄樹棲樣欒棬椏橈楨檔榿橋樺檜槳樁夢檮棶檢欞槨櫝槧欏橢樓欖櫬櫚櫸檟檻檳櫧橫檣櫻櫫櫥櫓櫞簷檁歡歟歐殲歿殤殘殞殮殫殯毆毀轂畢斃氈毿氌氣氫氬氳彙漢汙湯洶遝溝沒灃漚瀝淪滄渢溈滬濔濘淚澩瀧瀘濼瀉潑澤涇潔灑窪浹淺漿澆湞溮濁測澮濟瀏滻渾滸濃潯濜塗湧濤澇淶漣潿渦溳渙滌潤澗漲澀澱淵淥漬瀆漸澠漁瀋滲溫遊灣濕潰濺漵漊潷滾滯灩灄滿瀅濾濫灤濱灘澦濫瀠瀟瀲濰潛瀦瀾瀨瀕灝滅燈靈災燦煬爐燉煒熗點煉熾爍爛烴燭煙煩燒燁燴燙燼熱煥燜燾煆糊溜愛爺牘犛牽犧犢強狀獷獁猶狽麅獮獰獨狹獅獪猙獄猻獫獵獼玀豬貓蝟獻獺璣璵瑒瑪瑋環現瑲璽瑉玨琺瓏璫琿璡璉瑣瓊瑤璦璿瓔瓚甕甌電畫暢佘疇癤療瘧癘瘍鬁瘡瘋皰屙癰痙癢瘂癆瘓癇癡癉瘮瘞瘺癟癱癮癭癩癬癲臒皚皺皸盞鹽監蓋盜盤瞘眥矓著睜睞瞼瞞矚矯磯礬礦碭碼磚硨硯碸礪礱礫礎硜矽碩硤磽磑礄確鹼礙磧磣堿镟滾禮禕禰禎禱禍稟祿禪離禿稈種積稱穢穠穭稅穌穩穡窮竊竅窯竄窩窺竇窶豎競篤筍筆筧箋籠籩築篳篩簹箏籌簽簡籙簀篋籜籮簞簫簣簍籃籬籪籟糴類秈糶糲粵糞糧糝餱緊縶糸糾紆紅紂纖紇約級紈纊紀紉緯紜紘純紕紗綱納紝縱綸紛紙紋紡紵紖紐紓線紺絏紱練組紳細織終縐絆紼絀紹繹經紿綁絨結絝繞絰絎繪給絢絳絡絕絞統綆綃絹繡綌綏絛繼綈績緒綾緓續綺緋綽緔緄繩維綿綬繃綢綯綹綣綜綻綰綠綴緇緙緗緘緬纜緹緲緝縕繢緦綞緞緶線緱縋緩締縷編緡緣縉縛縟縝縫縗縞纏縭縊縑繽縹縵縲纓縮繆繅纈繚繕繒韁繾繰繯繳纘罌網羅罰罷羆羈羥羨翹翽翬耮耬聳恥聶聾職聹聯聵聰肅腸膚膁腎腫脹脅膽勝朧腖臚脛膠脈膾髒臍腦膿臠腳脫腡臉臘醃膕齶膩靦膃騰臏臢輿艤艦艙艫艱豔艸藝節羋薌蕪蘆蓯葦藶莧萇蒼苧蘇檾蘋莖蘢蔦塋煢繭荊薦薘莢蕘蓽蕎薈薺蕩榮葷滎犖熒蕁藎蓀蔭蕒葒葤藥蒞蓧萊蓮蒔萵薟獲蕕瑩鶯蓴蘀蘿螢營縈蕭薩蔥蕆蕢蔣蔞藍薊蘺蕷鎣驀薔蘞藺藹蘄蘊藪槁蘚虜慮虛蟲虯蟣雖蝦蠆蝕蟻螞蠶蠔蜆蠱蠣蟶蠻蟄蛺蟯螄蠐蛻蝸蠟蠅蟈蟬蠍螻蠑螿蟎蠨釁銜補襯袞襖嫋褘襪襲襏裝襠褌褳襝褲襇褸襤繈襴見觀覎規覓視覘覽覺覬覡覿覥覦覯覲覷觴觸觶讋譽謄訁計訂訃認譏訐訌討讓訕訖訓議訊記訒講諱謳詎訝訥許訛論訩訟諷設訪訣證詁訶評詛識詗詐訴診詆謅詞詘詔詖譯詒誆誄試詿詩詰詼誠誅詵話誕詬詮詭詢詣諍該詳詫諢詡譸誡誣語誚誤誥誘誨誑說誦誒請諸諏諾讀諑誹課諉諛誰諗調諂諒諄誶談誼謀諶諜謊諫諧謔謁謂諤諭諼讒諮諳諺諦謎諞諝謨讜謖謝謠謗諡謙謐謹謾謫譾謬譚譖譙讕譜譎讞譴譫讖穀豶貝貞負貟貢財責賢敗賬貨質販貪貧貶購貯貫貳賤賁貰貼貴貺貸貿費賀貽賊贄賈賄貲賃賂贓資賅贐賕賑賚賒賦賭齎贖賞賜贔賙賡賠賧賴賵贅賻賺賽賾贗讚贇贈贍贏贛赬趙趕趨趲躉躍蹌蹠躒踐躂蹺蹕躚躋踴躊蹤躓躑躡蹣躕躥躪躦軀車軋軌軒軑軔轉軛輪軟轟軲軻轤軸軹軼軤軫轢軺輕軾載輊轎輈輇輅較輒輔輛輦輩輝輥輞輬輟輜輳輻輯轀輸轡轅轄輾轆轍轔辭辯辮邊遼達遷過邁運還這進遠違連遲邇逕跡適選遜遞邐邏遺遙鄧鄺鄔郵鄒鄴鄰鬱郤郟鄶鄭鄆酈鄖鄲醞醱醬釅釃釀釋裏钜鑒鑾鏨釓釔針釘釗釙釕釷釺釧釤鈒釩釣鍆釹鍚釵鈃鈣鈈鈦鈍鈔鍾鈉鋇鋼鈑鈐鑰欽鈞鎢鉤鈧鈁鈥鈄鈕鈀鈺錢鉦鉗鈷缽鈳鉕鈽鈸鉞鑽鉬鉭鉀鈿鈾鐵鉑鈴鑠鉛鉚鈰鉉鉈鉍鈹鐸鉶銬銠鉺銪鋏鋣鐃銍鐺銅鋁銱銦鎧鍘銖銑鋌銩銛鏵銓鉿銚鉻銘錚銫鉸銥鏟銃鐋銨銀銣鑄鐒鋪鋙錸鋱鏈鏗銷鎖鋰鋥鋤鍋鋯鋨鏽銼鋝鋒鋅鋶鐦鐧銳銻鋃鋟鋦錒錆鍺錯錨錡錁錕錩錫錮鑼錘錐錦鍁錈錇錟錠鍵鋸錳錙鍥鍈鍇鏘鍶鍔鍤鍬鍾鍛鎪鍠鍰鎄鍍鎂鏤鎡鏌鎮鎛鎘鑷鐫鎳鎿鎦鎬鎊鎰鎔鏢鏜鏍鏰鏞鏡鏑鏃鏇鏐鐔钁鐐鏷鑥鐓鑭鐠鑹鏹鐙鑊鐳鐶鐲鐮鐿鑔鑣鑞鑲長門閂閃閆閈閉問闖閏闈閑閎間閔閌悶閘鬧閨聞闥閩閭闓閥閣閡閫鬮閱閬闍閾閹閶鬩閿閽閻閼闡闌闃闠闊闋闔闐闒闕闞闤隊陽陰陣階際陸隴陳陘陝隉隕險隨隱隸雋難雛讎靂霧霽黴靄靚靜靨韃鞽韉韝韋韌韍韓韙韞韜韻頁頂頃頇項順須頊頑顧頓頎頒頌頏預顱領頗頸頡頰頲頜潁熲頦頤頻頮頹頷頴穎顆題顒顎顓顏額顳顢顛顙顥纇顫顬顰顴風颺颭颮颯颶颸颼颻飀飄飆飆飛饗饜飣饑飥餳飩餼飪飫飭飯飲餞飾飽飼飿飴餌饒餉餄餎餃餏餅餑餖餓餘餒餕餜餛餡館餷饋餶餿饞饁饃餺餾饈饉饅饊饌饢馬馭馱馴馳驅馹駁驢駔駛駟駙駒騶駐駝駑駕驛駘驍罵駰驕驊駱駭駢驫驪騁驗騂駸駿騏騎騍騅騌驌驂騙騭騤騷騖驁騮騫騸驃騾驄驏驟驥驦驤髏髖髕鬢魘魎魚魛魢魷魨魯魴魺鮁鮃鯰鱸鮋鮓鮒鮊鮑鱟鮍鮐鮭鮚鮳鮪鮞鮦鰂鮜鱠鱭鮫鮮鮺鯗鱘鯁鱺鰱鰹鯉鰣鰷鯀鯊鯇鮶鯽鯒鯖鯪鯕鯫鯡鯤鯧鯝鯢鯰鯛鯨鯵鯴鯔鱝鰈鰏鱨鯷鰮鰃鰓鱷鰍鰒鰉鰁鱂鯿鰠鼇鰭鰨鰥鰩鰟鰜鰳鰾鱈鱉鰻鰵鱅鰼鱖鱔鱗鱒鱯鱤鱧鱣鳥鳩雞鳶鳴鳲鷗鴉鶬鴇鴆鴣鶇鸕鴨鴞鴦鴒鴟鴝鴛鴬鴕鷥鷙鴯鴰鵂鴴鵃鴿鸞鴻鵐鵓鸝鵑鵠鵝鵒鷳鵜鵡鵲鶓鵪鶤鵯鵬鵮鶉鶊鵷鷫鶘鶡鶚鶻鶿鶥鶩鷊鷂鶲鶹鶺鷁鶼鶴鷖鸚鷓鷚鷯鷦鷲鷸鷺鸇鷹鸌鸏鸛鸘鹺麥麩黃黌黶黷黲黽黿鼂鼉鞀鼴齇齊齏齒齔齕齗齟齡齙齠齜齦齬齪齲齷龍龔龕龜誌製谘隻裡係範鬆冇嚐嘗鬨麵準鐘彆閒乾儘臟拚");function i(t,i){var r,a,u,f,o,c,l="";if(i?(o=e,c=n):(o=n,c=e),"string"!=typeof t)return t;for(r=0;r<t.length;r++)a=t.charAt(r),(u=t.charCodeAt(r))>13312&&u<40899||u>63744&&u<64106?l+=-1!==(f=o.indexOf(a))?c.charAt(f):a:l+=a;return l}function r(t,e,n){var a,u;if(e instanceof Array)for(a=0;a<e.length;a++)r(t,e[a],n);else""!==(u=t.getAttribute(e))&&null!==u&&t.setAttribute(e,i(u,n))}function a(t,e){var n,u;if(1===t.nodeType)for(u=t.childNodes,n=0;n<u.length;n++){var f=u.item(n);if(1===f.nodeType){if(-1!=="|BR|HR|TEXTAREA|SCRIPT|OBJECT|EMBED|".indexOf("|"+f.tagName+"|"))continue;r(f,["title","data-original-title","alt","placeholder"],e),"INPUT"===f.tagName&&""!==f.value&&"text"!==f.type&&"hidden"!==f.type&&(f.value=i(f.value,e)),a(f,e)}else 3===f.nodeType&&(f.data=i(f.data,e))}}t.extend({s2t:function(t){return i(t,!0)},t2s:function(t){return i(t,!1)}}),t.fn.extend({s2t:function(){return this.each(function(){a(this,!0)})},t2s:function(){return this.each(function(){a(this,!1)})}})}(jQuery);
