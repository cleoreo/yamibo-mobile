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

                /* easter egg 1 */
                if ((/\b&fid=30\b/.test(window.location.search) && /\b&typeid=227\b/.test(window.location.search)) ||
                    (/\b&fid=49\b/.test(window.location.search) && /\b&typeid=125\b/.test(window.location.search))) {
                    jQuery('head').append(easterEggCSS());
                    jQuery('<div class="nf-bg"><span>魔炮<br>永恆！</span></div>').insertBefore(jQuery('.wp .pg').first());
                }

                /* easter egg 2 */
                jQuery('.bm .bm_c a').each(function(){
                    var postName = jQuery(this).html();
                    postName = postName.replace('[H]', '【<i class="fa fa-venus-double fa-fw" aria-hidden="true" style="font-weight: bold;"></i>】');
                    postName = postName.replace('(H)', '【<i class="fa fa-venus-double fa-fw" aria-hidden="true" style="font-weight: bold;"></i>】');
                    postName = postName.replace('（H）', '【<i class="fa fa-venus-double fa-fw" aria-hidden="true" style="font-weight: bold;"></i>】');
                    postName = postName.replace('【H】', '【<i class="fa fa-venus-double fa-fw" aria-hidden="true" style="font-weight: bold;"></i>】');
                    postName = postName.replace('(18X)', '【<i class="fa fa-venus-double fa-fw" aria-hidden="true" style="font-weight: bold;"></i>】');
                    postName = postName.replace('（18X）', '【<i class="fa fa-venus-double fa-fw" aria-hidden="true" style="font-weight: bold;"></i>】');
                    postName = postName.replace('（車）', '【<i class="fa fa-venus-double fa-fw" aria-hidden="true" style="font-weight: bold;"></i>】');
                    postName = postName.replace('(車)', '【<i class="fa fa-venus-double fa-fw" aria-hidden="true" style="font-weight: bold;"></i>】');
                    postName = postName.replace('[車]', '【<i class="fa fa-venus-double fa-fw" aria-hidden="true" style="font-weight: bold;"></i>】');
                    postName = postName.replace('【車】', '【<i class="fa fa-venus-double fa-fw" aria-hidden="true" style="font-weight: bold;"></i>】');
                    jQuery(this).html(postName);
                });

                /* easter egg 3 */
                jQuery('.tl .bm_c .xg1 a').each(function () {
                    if(/\bfaith\b/.test(jQuery(this).text())){
                        jQuery(this).parent().parent().addClass('faith');
                    }
                });
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

function easterEggCSS (){
    return '<style>'+ '
        .nf-bg {
            width: calc(100%);
            min-height: calc((100vw - 4px) / 3);
            display: inline-block;
            background-repeat: no-repeat;
            background-size: 100% auto;
            background-image: url(data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAASABIAAD/4QB4RXhpZgAATU0AKgAAAAgAAwESAAMAAAABAAEAAAExAAIAAAAHAAAAModpAAQAAAABAAAAOgAAAABHb29nbGUAAAAEkAAABwAAAAQwMjIwoAEAAwAAAAEAAQAAoAIABAAAAAEAAALUoAMABAAAAAEAAADiAAAAAP/tADhQaG90b3Nob3AgMy4wADhCSU0EBAAAAAAAADhCSU0EJQAAAAAAENQdjNmPALIE6YAJmOz4Qn7/wAARCADiAtQDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9sAQwADAgIKCgoKCgoKCgoKCgoKCggKCgoICgoKCggICAgICAgICAgICAgICAgICAgKCAgICAkJCQgIDAwKCAwICAkI/9sAQwEDBAQGBQYKBgYKDQ4MDg0NDQ0NDQ0MDQ0NDQ0MDAwMDA0MDAwMDAwNDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwM/90ABAAu/9oADAMBAAIRAxEAPwDrL3xc7ZC4Qe33uff/AAFY0kpPU59zyfxJzVRtRT++mfTen6/Nn86lWUEZHI9QRj+Zr1Lo/omEacdItD80pqPf/n/P+TQ0lM6Bxp+yog1TBqAN3wrjeK+2/hjzbQ4bHy8gfU9T69a+FtGvNrA/57f4V9OfBr4rRonlSnCk5V+eD3BA5weue341jUVz4jiPCzqQUoq9me/NIADzx3J46epP+fpXz58U/iWHcoGwi52jP3iDje3HOe3bHvgje+IvxbVoykROTuDMOm3oMZwTnv8Alznj5g8UaqWYn/P5VjThbVnhZJlPNPnqr0R01xrRJ4Yfgc/rUtrrhHevMw3+f8Knj1Jx/Ef5/wAxXXZH6C8GrWPWz4rJ5J6Yxj2xj8eBiqHiPXTNI0hABY5IAwBwB7kk459T9a89j8QSDuD+A/pin/8ACTN3A/WpaM4YFQlzJHT4qvM1Yy+Kj/dH5/8A1qZJ4kz1X9f/AK1Kx2+zkahkqpK3+f8AP+f6UDrQ9P8AP5VEdYHoauwezfU7rw14p6RyH/dY/oG/kCT6Cutrx2O/B/z/AJzXXeGfFOMJIeP4W9M9m6kr6E9O+eolo8jFYP7UfmjtaAaYJKY01RY8XXqSyGqUj0st2Krk0yki/bXmP8/5/wA/SvQPC3xdeLCsBIAMLn7wHpuwSR7H26YrzE1WLkU1BSdmcuJw8KsbSR7m/wC0jb7flVi3PBIAz9Rz+leeeMf2g5ZAVVginOQh7ehbqe/cA+h7fMesag6SyAZwJG/Ldx+VXodRJxzx/n+fHevXjgIpJnz1PD0oy0j95u+LtX+0K6PyrqyuOeQ6lSO/UE+uBnpwK9O+BWtaZpeiPdCKOFrKFYdSMar58jwuRGZD8plM/mh4SxH+swD8vHixmAznj3/z/kV5n8aLWS4tpIraVkdjGXUHCTiFi8aSZ43I2SjY4yQcg8eBnuVfWqS9no1+KOyVF1Votjpv2v8A9q601ezt7a1S4QJP585mWNOEiZYwuyR8kMxY5xjb1JyRu6L4TvrXSbK+ugHjmjV3diFeFZX22ouQcbvNjKYlBHzMFfnDNofsOeGNPm0p01KxglmN5cCR54Ud0CiNEjJI3IowWADbTknnNW/+Cj2vOY9MtYWzbSeaxhjGd8kJhjhG1eWCLIVjiAPzNxk4x+eYTGVctrKFPvqntY5lGdNpuOh7R+yz4hTzjvIy6FF9ASQce2QPQ598ivqXWteigieaVxHGi5ZjxgcYAGMsxJCqq5LEhcZIB+G/gX+zbqlpZRTSTIbg4f7FJ8rRR7cpF9qG4LcAcsjo0akhQy4zW54s+Nl0db0SyuozFAzyM8cwQyNKyNDaTybWeMrHOD5BBOXy5/5Z4+kxucUpw5qb97t5+uxyYujGvLni/Uq+AP2h5/EWuNAqGPSrGGaZbVuGupUYQwyXg7qJGLpb/cQopcOw4ufszavb65YPZ6rAl1c6fOwzNlpPLeV2hlSQHzFdGVoHKuAfKXPbHpnw8/Z1gsNTvNRgkcC8Rle2KrsjZ5Emd4nBBAMgZipBAL8EYxXR6B8E7O2vpNQt0aCadGW6SNv3M29hJ5jREEJKJFD749gJLZVtxNfn1fE+0k23r+pmlGOkUd5GuOPTj8BwP5Y9ePpUN9AWG3OB3P4dKs5ozXmp3d2JXXU8W+M+mqikIAMwSk/UKcEnufr2HbFec+BvEggKblEkLoiTxnkPGVB45GHQncjDBDDjrXaftN62Y48JjzZI3iiDfdBZHLO/+xGgZm9eBxmvHrC//dRkc5jjPT/YHJ/Xr+Vfq3C1O9Kd+tv1PXqLnpRT8z1bxl8JHtWF/YTSIrqGE8PJ2tjC3UR+SdMYHmELIO7Dv0nh/wCO2oQIGvrUtEel1EG8lh0Ul1B8on/pqAgOf3naov2d/iicNZy/MoDNDnn5T/rY8HgjncB6F/QY9OsNNEJLWuGhckzWjdAT1e23HCE9TETsfnBU4r6as7Plmr+Z4NVSi+Wav5m14Y+J1tcAFZACRkK3B9sHlW9cqx4NdXv/AB/+v/n/ADxnxXxf8CUbM1i32d2BYxBQIyT1Iib92j5zlcLn1WvPV1DVLdkjE0ituw7t5PlIg5LNbNGsjsw+VRHKybiCzADnhlFP4TmWHjU+B/Jn1JeSN/AAT6k9Py55/CuZuvDssh+d+OfoPoB+HOPxHNY+geMrjYHlWMRgfNM+YwQM8quWLE9cKCPTtnyr4wftTFW+y2CebO2cYIBVccyPniCMdnk+Y8bVz1qNOTdkFOjNS5Y/eegfEP4h2OkxNJO6lwucFuhP3cjnGSQAMF3JAVTmvlXxH4lutak868Dw2I/1Focq8/cPcIDmKE4yISS8nV+OuB4c0R5pZLi+fz7uOZ1CnJhhzhleBD95pIyrG4fMhLMOMED0TTYgWBblcjdj72M/Ntz1bHQnuPTNelSw6iuZns06PJq9X/WxreFtBDGOKMKi8JGOERcfdUYGFHbAHB+ua9AfwGYSBKc98Lx355Zenr8v061r3PwiSRBJavuR14RmwTkD7rjBDA/3sEEdcgYoTa9LEBFeBtq8R3DLynYLcdNyEcCYcZ+9g8nKpVTehn7RSfuk9uqLyqIPc/Nj8W4z9AK37a9J6sSOMDt+A44rB8rHpzjBzkH3B6HjHqPpzgdUUFzhFH3n3FAMdyeFGPeuec0ldvQpxcjtba5/z/nj8qtw3WSAOvb9P8/5NeVR/FW2zthaa6OcH7NFLOB9ZVURD3zLxXTeGPHEhbP2G7J/hDG0Tjnkhrrg+gOK8mpmWHi7c8b+pjKhJJuxta/p/nXkEB+6iiWf2VGyintl3IOPRD616PfWQYEH8COq45BB7EduMdffPk/hzxk8LzzXVldxyzuCWWOOaNI4xshRWgldiAvzMQnLM3A4rtNG+IFvNxFMrv3Q5WUDvuhcLKB7lMZpQxlKbspK/Y86rGc7abHjzaYc3T/xfbLjzh0xhwkcg/2GRUyeiknnkVlaP4hmsZWnt1Lo7ZurUEBZem6aDPCXYA55Cz42v8wVx6df6Y8j3n2dlWaN45oQw+V/Ot13wyeqStGQe4znjGT4b4Itlu3iaCTF6UnOq2ju2YpIzgKitxGI5f3cS4XMZY/MOa9OnJOCjI7oSU42kfV3hHxdBdQpPA4eNxwR1BzhkZThkdWyrI2GUjGOK2Q1fKXhnxA+m3LSsrrHIcX8WCMADH2tFH/LWIY8wj/WxZyCyA19UWt4rKrKQysAyspBDAjIII6gjGDkgis5xcXqeVWpcj02JJH/AM/5/pXhelaiJtd3A5EcEirznGSE/I+WSPWvVfHt26W7shweAT3Ckjdj04zz269cV4V8CtIdNTvHfbt2K0bA9VJdjvHRGUttwMggA9zVwWlzWhD3JSPc/FN3yFHuT+n/ANeshJKh1O63OT26D6CohNVRjZHRCn7h4z8e/CvmSTJjAuIAyn0kxgNn2kVGz2wa9E/Zn8b+faojE7gisAeqhsiRT7xzB1/EdODVX4pWG9IJB/DuXP45APrXnvwq1E2l5LHyF3+fGPWG6P75QeciK4DHjoXTsRXVP3oHTKHtKNup03xv+HKtM2VJjnw/HDLIpHzo38MiNh1YYwT+fLfCZVadrW6UMSNkh6ZJBaC6iIwUMmGRtuNsm9TkAA/TOtaOtxGueT1U/p+o/p1xXi3ivwIYp4pwDujbaT6xllbaeeqOqup6jBxjJpQqvl5TOjW5o8jOYk8IRSSMltITyQqTYR2wSMI+djc/wnYxwOKxtW8ESefZRMjo5v7UpkEH905lkYNjBAiSTJXIxkcjr0d/bjzJDxjzG29upJGMdAOvGK67wL4z+03cavkiyV41c4xJdyqA3PfyLc+XnHMkzjkqaVapJRtc6pupGN466HX658NSQWib6K2cfQN256ZGPeuG1y5a0R5p90KQo0kkhJAVEUszFxgHgevPTJzive1/X9P5f5zX5wf8FSf2kSCmh2zYBCTamR1Kkhre1JwOG2+dIOpHlDua8mviHCPmc+ExNScvZuzR8w/tHftQXGtTgs7raRE/ZISeingSyDvM4GST91TtGB18cSbP4+/+f8/hWOJf8/5/wr6G/ZS/ZlfWJvNn3R6bC2LiUHa1w4wWtbZvp/rZhxGpwPnYbfFpU3UlofSxlGlHRHQ/sn/spTa3J50haDTon2zXAHzzMOtvZ54Z88SS4ZIunzOQo/Wf4ceA7Wwt47WzhWCCMcIo6knLPIxO55GPLOxLMe/Arl/DkcUUUcFvEkUECJHFFGuEjQDAVQO3vySepyee0ttZVFJdggQFnZiFCqo3MzE8KAAWJJwAOvGK9vkjSjc+YxkqlV3f3G3LNwcnHHPPTjk8nAwD7d/evx+/bf8Aie+o6/MLXbPDbRxW1vIHBiAQeZcOGXIKmd2TK53FABnANeoftXftjS6gzWlkxSxyVUruVrzGd0sjDDJZj7wiGDMCC/DCMfOen2QUcck43E8bjjrgcYA4VRwuMDjk/FZlnPK7QXp6n12R5BK6rVXa/TyOl8J+I7yK1Wz+1SrBueSSOA+QkjyEFnmaPbLLwqqPMk2hFACjBFWLS1QdFX1Pyjt3JI/U8n8gMX7UFGScAc/X2AGck9hznP4VqJ4fuGWJ5IZUSfBtgyNtkQsB5zY+aRAOTgbMDjcSDXxDhisdLq9T9HpQw2E2SX3Xf6ku9D9yJZD6gIFHr+8Ixnpwm49OPTrfDnxS1G0x9nu2gAI/diad0J7jY+YmJ/ubcnHTpm9Y+ElWVvuzwBCsYnR4nLMB+9MVvPhdhz5aNN0ILDI2jatrHbCtsWd4UYusbEbPMY5MjIMKz5PDvuYAAA8c/WZfw3irqUpcvzbf+RhiJwxC5VTTX97/AC3PaPhz+2dqEbyw6lbQyGFFJMRMV0xc4CJARJDPJt+ZgssAUdcH5a9k+Gv7aOkahOLWOWSGZiVjW5jMQkdSVaKNyzI0ikEbN2W527q+CfiH4o+zx+XHhXkB5GMqvAZhjAyfujp39BjyyPTt1uHBT93sjKqCrqPMlaN5WxhpCRlHUltnl5YsuR+mYfLnTjGMpXvfVnx2K4Zo1HeL5W+iWifoft+r04ivhf8AYu/a3keSPS9RkLtINunXLn5nZVLfZJ2J+dygJilPzPtZW3NsLfcokrOpTdOXLLc/Nsbg6mEqulUWq/HzH0Um6jdWZwC0CkzRmgBaTFN8yjzaCrM//9D5etIUUhvLjYg/ddeD7NyOPx9K6bxB4shRFEEUMMhw5uLZbiB1IzuidPMMbjnkkMp4461Xuvg/eIOPNb3WSCQc9PvBCeO3BpsHwvvepMQy4jjSYbS7FHcfNGzBBldgZlIJb0FejL3dz9Lll2Lp+8tfRnTeEfjcy7VuP3i/890C7l68yxqArj1aMKw9DXslhcB1VlIZWGUZTkEHoQR1H8vzx8Sav4oSGYx3UMttNGfmyM4Pblcb0bgg7WUjBGQc16d8Ffil9mkAeRZbGRvmdPvW7HP71o1BIjYnMoQDH38Dms41LnXgc5lCXsq7+b6H1LaaMzdKfcaO47fpX098GPhXbz2yXDYkWT5oyrZRkPRlKkbg3UEHntW14n+A6sCYsZyflPH02t3/AM8mr9qjpfEVJVHB/efHqxEV0OgyPkAZ/WvTtW+DMikgxsPTg8/lkHt3/Kr/AIZ+G7IQTGx9trH+Q4/Km5aHZVzWhOnoyPw94VLGIuu5Cy7gc4ILBSDznj8O1cD478OeXJIB91WYL9AxAye/ABr678H+HQIhvTBzkAgjHT1APYde9eVfF3weq7iMHOWwAeAxJOT0GDn8MelZxnqfPYHNebEW+R8vOuKj31o6vBtYis0iug/Q4u6THioyakUUxhUs1Q003NPC0m2gYU0mnEUymhDQ1WI7sjvUBpKqwabNHZ+G/GhXCOfl6Kx7exOPu9MccfTp1yzs349P8ev0ryW3XJr3P4M+EDcER5woXJPXaOmAM8kn1PGKhpJHz2Ywp0YuqzH8k0I9e46r8FCFzGwJxyGwOfQEf4V53q3g50OGUqe+Rj8j3rLmR85Sx1KrpFo5yNc1fh0Ut/n/ADjvVqy0E57f5/n+Fel+AdBR22kcY56euQQM7sggc46Z9ablZXIxOJjTje586fFL4fKnlyrnEsZeQMQdrq7I20gD5Tt3D0B68CvGX1MoSqqW/l/Ovvv4rfD1XRcAbVUjngLli2TzgDnHHI9+leL+Ev2dBcSOAQoABJx6k4HXqefyPNevQxto+8ePRqQlH2kj5gvJ5G+9u9hxgfQD+vPvWa7GvsnxT+yoVBMfzgD0wfwXJzjnoT+NeGa98HJVJ+U8dsGuiGKpz1PYw+LpyXutHmmjXsiPvhd4nPBK4+bHQOpBR1B7MpxxjHOfT9G0e6ubi1u5YoZ5bQSC2JZ4tjzFCZcBZEMsYT5CFAXOQMgES+EfhE5YbgQOOo+vWvq/4W/DtNmMHbwc4wCRnIA7g9DzwR7V4WPwuGre84q/loZ4rEwhG7seD+H9M8SR6pcXL+TJavZhLeAXQPlBMSiRi8QUyO2/zHIBIKgHCgV6l8S/gnHqkNjcbvJvrYwT2twBu5BjmaGYAgvA7DthkbDIPvK3vP8AwjyCLZgf6spnvhlK/wCHFcN4CuS1rAOhWMRv6hoSYXB5PIaPvz/X8xznDww7i6aPmVifbN26HRjnk8d8fzx3xnv3p5FJu/z/AJ/z/Oo57gAEkgADLEnCgAZJLHAAA5JOMDrjmvkZv7TEPZv8/wCR/Oori8VQSSAACSSQMYzk9fyP8u/kfj74g/alS1tVlMd1KsD3Y+RPL+aSf7MciSbdHGyebGojXdkOeK5jxN+z5YyE4hEbDjKcggdNyMSCPU8Z5615dXGxpu9rnoUcK5/E7f5HCfEXx1FdX04LGVYlECRxLJMzGUb5iFhVyBjy493A+8MjnHM6B4Tv9ixJZS7YhsjluJIYN8a/cLq7PKHVflOVJbAPBJA6xP2fzb5NuNozkm3eWBs8clY5EBJ/H+Va2mW9/GRtmuGwfuzxrMD/ALO9lWX/AMin617MON6uGgqdGCVurV7ntrDRfUzfC3w81GKaObdZxsjBgu+4lyMEMrbY4lwVJBwT+len3N9qB+7NZp9Ledj7fM1wBkdjgfhWBp+tX4P7yzjkyfvRymI/jFOr4OPSQ5rsVjbA3DaSASuQ23PbIGD9QK4a3FWPqvmc/uQSoQbV0UdP1/VkP/H/AAEZ5VrLj6ZF0Wz7/Srd1411Q4y2nTYOR5lvcr+RE8mD7hacUppSuJcSY5O/tGYvA0XrY8o+JMuvXTDP2by+Q4tp2jk28YWAXETJCx6GQ7nx0I61xWmq1ou19Pu4F6s6oLpSQeZZZoGkldj3dwSfbpX0S6cYqJx+fr/n/P1r2sNxtjaTXNyv1RssLTStFWPn/TfFFs8m5JoyeElQny5AMkpIYpAkmUJKE7R8r+gyO9tbP/H8evB9PT/69dJ4m8FW10u24t4ph/toCw/3ZOHUj1VhXGD4Xz22DY3JaMD/AI9bxmliwP4Yrn/j4gxwBkyoMcrjJr7bAceUar5a8eXzWplPB22Z7H8KPErITATw2Wj9m5yOf7wBI6cj3wfU5NXVgUlQMOhzg+mdwPGMDJ/wBx8u6X46RNxn/wBDmhG945iMgA48yCQfLcxliFUxfNuIUorMAd/xF4rkvFDXW62tCPltclZrn1a82kskROStomCQf3pP3B7GZZ7hsPS9rGSd9knqzyJ4CVSei9WSa5qa+djSSJIQSs5ly1hGRx/ozDEksoOd0cBMGCcuhzTLXwWrMHuXa7k65lC+UnJx5Vqv7iMehKu+AMtnrzs/xUiBEcCbmUAKqAtgAYUJDCrMqjnA4H0og1PUJT8kE6j1KJCPzmdW/HH1z1r8uxWZZlmLfs4y5elk7Ht06NOktXr3Z6rZvgAdB0AAwMegAwAPwrYsbjBzyPp149DXmUPw31VlLCMOQMhftceW9hjcg79WXp9Kl0rwVes2wG3SX/njLcSxzfgjW/zD/aQup9a8+GW5le/snf1OWpiKD0lJHrV9rDMMZOO2ev4+tc7rVhHLjzFD46E8Mo9UkXa6H3Rgf1rFPwp1Ifwwn0C3Mmfr80Aznt0rOvdC1SDJNtM4/wBhopgR/urJvz24XP8AS54bMoy55U5L0d/yMqc8N8Kkja0jWprKSSRme4gYJuJAa4hEQYBiVA+1xANgkgTqo/5a/NV3xZ4UjuSL+yIE7KC/lsFFwn8DgjAkdOxJ3DkAg5U+fQfFmJX8m4/0eXIG2UPG2WGU+SUI3zfw7S3t7aq6h9lJmU/6NId1yg5ETv8A8vcY6BGYgXCAbcHzAAVfP2uR57OnNUMUmtdG9PkzKvhE/fg/+CP13xa00fl3SFZk4imZdrcZzHOCMFG6BgODgkfeatH9n74keUx0+VvlCtLYEn/lkD++tc9zbEhoxz/o7AD/AFXPVNchxtf5h6Nhhz6dRg+o6/lXjvxQ+H/l7ZoCYmjcOjp1hkX7kig9VI3I8bfK6MVPXI/WEoVFY8r2cZrlZ9ZNKsqMp6MpB9sjH0J5/wA9vM/AukFHnJXB4jbjrzz37ALj2PvXHfDL43iYiKXEVyq5aL+CQL96a2bOJIj1K/fizhwOGPosnilSTggZPPucAZP6D8K53TcLo5o0pQvFonn61Xlkqq+pA96a8tCTN7WNa10xZ43iPUEMn16EdvpnPevP9d8BliCCUliJMUmPuk9UcZ+eKQDDoeoCkEMqsOw0bVNjqe2efp0P6frW/rGA5PX/AA4PPrUtvYiMnCVhPhtrLNFtkUrJGdrqTkZxwyNj5o2GNrcHHUAgirXj5lERJ9M03QtpOVIyB8w4z329+nbP61wXxv8AjLp9tGUmu4Ek6eUHDy8dR5SFnz9QP8eV1oU3eTS9TCNOUqvuJ/I821rUHBjjhyZ7iUQwcbtrMrPJKw7rDGjyEHrtUdCQfUvBvwtKRomCvlklSxwWL/M0jMMkyNJl3YjksSOK+UdH/ays4byK4EF1cLBHN5QVI4wZ5tsZfMzqdiweYucdXPHFdhqv/BSBv+WOmZH/AE1uVH5eXE3b3/OvLr5thoyd5o+glgsa1y06bt3PrfxH4qFpa3FzcECO3ilmcnA+SJGcnvywU9+pxivwI+IHjea/uri9nOZbqZ5n6/LvPyIP9mJNsYGeAtfaX7RH7aGp6rYXGnpZ21tHchVkkWeSSTy1dXZADGi/vAuxjz8pbjmviy48BXQ/hH5Ejj0Ab/PvmvIrZhRqyTU0a4LKcRTblODTN74GfCaTVr6Kzj+VT+8upR/yxgTHmP8A77fcjBHLkehr9dvBngqK1toYLWMJBGpjhjXnaEwWJzyXbJdnJJZixNfml+zp8fW0OKZP7OjnknfdNOZZIpGULiOEDynVUj5YKD8zMSe2PqnwB/wUo05doubG8gCuWJjaG4ByoByN0LgcdNrHBxmvUwuKoRVlJGmIoVo68rPtWx8PMIj2IRwPcEq6fXoRnsc18e/8FLPi89rp32KMssuoybJSCRi0gRHuBxz+9kaOInuhceufof4f/tpaDfbVh1GGORuBFch7Z+ucYnVUY/7rn9a+LP8AgrpCWu9KZeY3tLhUcH5WZp4M7SCQWCEHGeQRXRiKqlC0WfP0Jz9racWu10fN/gzURNEs2RllCAZ+4E4I7fMxG4j029a6SKFj91WYAqrEKxVS7bVLsFIUE46nJAOAeleXfCvSrhpXWCN5YU8s3GNuI1kfy0bkgb2bIQDJYg5GFJH1jp1pHbK8au6RPJ5oikl3kMF8sMxVUV5dgwXCgA5CgDk/IUchnia7b+C9/wDgH6zgsVKrTUYLVbvoU7D4fwp5yMEuUcKsU0kLxum0nzHt4jI4iMhICzSgyCNRhE3GukgtAoAA6Kqrk5OFGFBYkkhRnA6e3aue1bxxFFHLLhmSBDJLsGdiA4DOeAoLEKoYgsSNoYnB8q1/9qSNJB5EQuYjCSwYy2+ydgdqsSpklSLCswTyg54DYGT9rTp4fBR5YL/MurXo4fWcry+9/wDAPeXnA6kdenOeTgcdsnAHYk4HpWb4r8Sx2k8dvdulm8kZmBuN42xrwGeOJZpkaQ5ESvGhkKnGOtfHGo/Fi9lt2tZbmR7cy+a8WIwGkBJBd1QSuqZOyN5GROCFBrFW7dsvlmxjcxLEjjC7mOSABgAEngY6cVx18zkvgR5cs0qTdqaSXfc9a8Q+P0uTNIwlWUtstVVU8oRgkLJM7MZFOMP5ITJZsbhzXonwu8Ps9vMXjZEnjjaBmfd5mxpY2ljBClIvPRwgI7PgsADXzVFcsAGIIB6Hsceh7/h619U/A6IfZVYSPKrpHw+QImwzSQRg5/dRu2QRwzMxGM1eX4ytiKyU3ojsw1ac6keZv+kcH4ispImhkR3ieKdHEsYG6Iwhn85VbjMZXdg54B4Nfp1+zH+0gmqW+yYql9Aqi7QcLIuNq3duO8EpHK/8spCUP8DP+cnx/wBMiEG53ZASzLtUsXljicxRbR2lbCscgKMtzjFcZ8GPi1NBNDNA+y4gJMDEnDjgPbzLn5o3X5HU9VwR8yKayzTHTpYlT+zZJ/5nDnGBp42TX20tH38j9vmvMf5+n+PtSm7Fea/A74pw6vZx3kOVz+7uIW5e3uIwBNA+OTtOGVujxtGwwGrv57Q8fj+v+I5/xr1oSjNKS2ep+VTpqEnCWjT1J5r/AAM5qm2sDBOenWkv7A7fxB/z9aq3ehEKxHdcYx6ke/OMVtohwVPqQN4rX1/UUn/CWr6/qKjtfBYdQx4OMHgc47/jUv8Awr1fX9BT0Ov90f/R8v0B9TSNPJMVzEAAm8qSVz0EoZGBXkYZcqRg4xgdda3LzMiSssTK6SmEo6zM0Z3KVZnZGXP3mhMmRkcZOF0i2DPNJbuokeaaSaFiQsg81grFP+Wcm0fLMikNn5g+RjUurqKVWWRMMgLtHIMOu0bi6ENkgYOJIm545FelValqz+gaM/aQU32+Ry3xq+FEeoQHKKZ4wWt2Pyk45Nuzjny5ACvU7GIYY+avlC2+HpAEtrK8T5OUc8blOHjfjgqwKkMDkjtmvtnwvDJs3OxbeQ8asQ7RoQCiNJgGRz1JOcEgZOCT4D8StEFvqEqgYjulF3GOyuT5dwo9cttfHbcfw5ZLVPoz5XPcDBxVdLyfz2Pav2D/ANpi502eCxvgyWV637nccxwzNMYfPtzkhIXuBsuYM4jdkkUKGbd+rCevT154P04/nX40NZiTw9eEgb7SeS4tmxyrL5JlAPGPNRnRgOCcHqoNffX7N37UP2zS7KdwHZoVWRsnd5kX7qTeRwX3KSxxzmufVto+LxWXTUlyq7aufUOP88f/AK6GX/P+RXmz/GmMDO3/AMe/+xri/FfxzZgVUhRz0zn6bv8AAA/00jBsyo5XXm7JNHZ+O/iOqMERsbTl2HfH8I55HqfXp0rxv4g/Eoy5G7gf5x71574h8Xs5POev/wBauUu9QLGuqMLH6Bl+SxpJOW4up3AZs1RIp7Gm1ufYRjZWAmm4pwNLUmgm2kC07NNxQMYxqJjTnqMCqQhaULSqlSbKpjH2w5r6H/Z+8SrHIAxwHG3Pvnj8zgV89Kn1+ldn4NEoIOCB2J46+gxnj1x361lJXR4uaUY1qMotn3razAjPt9P8/T880s1krcMAR6EAj+VeMeC/i4VASYF8YwwI3AYPBXAz9cg/Wu/s/iXC/CrKT6BM+nXBwPzrjcGnofjNbBVaLej9TdXw9COkSf8AfK/4Z/XmqPiDWIrWMthVOPlUAZJ9MDsM8noPyrE1j4oKhKrE5YZ++AuOnJHJ/THvXzr8YvHc8iuxPIHAGQB7D2P685JzxdOm5SszsweAq137zst9Wej+JvjJG0YVirPknjBA6Y4IYH6f5Ox8H/Eqs7gkDfjHvtzkDGOSCcdB+lfGHh1J5XHDdf519X/D7wNKI1KZDqQSe44yDjPrx3rvr0YwietXw9OnScD6DTn/AD2qhqPhmGT78at7kc/mMH9ax7PxkFZklUrtZFL8bcsON3dcnI7jPcZrp4pwRmvJ+HY+ScZ0tehlQeEIFGFiT8QDn65zn8a0rOwVBtUBV9AAB+gHfmpi1KDS5mzOVSUt2xuMV85a54vNnfXkaYMIkjlOf4JLlPMmTPTbnEoOAcyMOgFfRkh/z/n9a+FviN8YrKDVdUt7qdIJIriHHnHAljuLWEx7ODu2bSrA/dyp6Hj5vOIc1NK3U9nJ4RlVantY9uu/jIqJvK7RgZPUckAAAcszEhVUDLMQB7Rx6PNeYlvMpFkGKz/hODkNeY/1rjqLfJijIG4SNnGL8Mvhn928lRlDEGzgbcRGOQLloiSEmlByigDy4yOjsxHqF6ABx0UHP1xk/r39B065/Kswm4qWlrI9ybpKSVNdTxXwldPc62QzHZaQymFB90GSWOAEjgZ2LJj0yQMCvXL21+Zvqf515T+zzDuv9QmPQJAv4s0spH5Opr269s8yMB6/zrxsPR9phISWrb/MdapyVnHyOde07/8A6z/SsjVtVjjBLMBgZbuQB1P4e5ro9dXaj+oGPxP+TXnmoeH900ELAnefMmDdAkSiTDDPRm8tcH+8c9xXh4yU6dRUYR1e77f1Y66M4yXM2dHocZl2nG1W5A77cZBYdBkc4/PHZ9ymST2ycf0/Qfyq34PkLpNNjhmdYx0+RG8oMPZijOOOh7VJFaZI9P4u2Onc+3Ye9er7B+zgl11JVa8mY5jo8n/P+fao9GmMm6T+FmIi/wBxDtDfV2DN9Ctagh/z/T8f6VzOnpexuqhltDUEsH8s1bt7gO8mOFQ7Mn+JsAuBjoEG1cn+In0q2dOJBbGEUEsx4AAyT9eMnj9Kz9jKSbijRVV1Zyl9eBXjTqzk4HoFGWY+w6e5NWNv4/1/pjoa53w7N59zNLnhE2pn+ENnBP8AvAbq6Lwbqgu7aOcABsESKO21iue3ORz7Fa5aMHO7R0yny2uc74s8PvMYSkMLSRSF4pbksVhYrjzIo0Us8nXG7YB1zwK42P4YXxdpJpra6Y/dSVJliX2CJcRmQH0kZhx0r2mOyGf84/z/AI+9Paz7d/8APTkf59K9ClVqU7NPbvrb7zOU0eLyeINatlKxRWKRjosFr5Yx7jzipPuWH61jN8fdRQgOtrnsksMsTMfRJEuJEYnP8JbA7CveLu8WPG87QSBvP3QTwA7chSegLYUnjIqr4j8BxToQyIS3UMoKt/vD1xyGGGHB9K9ynn+Op6xn+RzunTe6Mv4PfFd7tZsxi3mgZA6xyF0dJFJjkQlEYAsrIUcFgR1YHNeo3uqxTqEu4VlUH5WA+ZT/AHlYYZH/ANqMq3H1r5/8CaCNNuJpWZ2tJI0SXcC0loY3dhIeC89sPMKsctLCAG+dQ2PoaPwizKGRkdWAaNgeGUjcGBGQQQQRg4Ir9jyLNKWYYZTUk5LSXdPzR85jKUYTta3Z/wDBKN1aXcC77S5M8XOYp180r7CQbZwPYmTGCdvWsgftHeTxd25iHQyKxaE88nzFU+X3OJRGK6EaZNEcgMD6jnPqO/H1rl/GGoQRo8926QRoMyzMREADwAxHDk9AACzHoCa+kahFNyscUKcZuzSfpuaOgWdrqov3KxyRSSxRr5ipIh8u1iLDqyMu5zkg8deq4HiHxKtotGVitxHGCrE6dcSPJHOp4ZLPHm3MBcfKBtlhyQCqAEr47qf7ZLW0dzbaYDHHLczSm4KrvZZCoTyYiqpB8qDLssjlsnapwa+etS+IzSSOzhpJXOXeR2klc98kh3bPp+XFfF5jXp1lyU6fNbra33H1eXZXUi3KrLlg+j3Pq3wt+2BZxRiLybuQoMxqREJEiPEcM5mkU+bBzFuG5ZI1jYMSzAbNx+2RZOCr2l4ARyc2zDn1AlHp6/nmvkKPw/qMzJJDpt0zDKhhbXAVlb+EsyBSAdrLzwRnsap+M7bULNd11a/Zwf4ZnjRyO2IjKZSPcJ2rKOYZhTirR0XfyPaWX4GT+PXyZ7vqPxesnbAMyLu3xtJG6NGwxtdJYy/luvHzqw445BIrtfD3xzkAJdxdQgZFxBhpFHpcwx5zxz5sIOerRpya+Hrb4vjOPLY/7oY/j0JzWrbeOYdwfE0TjkSBJEYfR4wGH4n9OK9ilxDXVliKV/NbinldB/BP7/8AM/Q/Qfi8kih0dXRsbWVgynrnBGR/hXX2PxCVu/61+dXhXxkI/wDVSBuMExmNZjk5BkjbEVzjk4mVJfSYV1s3x2uBmKJUeQAEz/vEiTdn5ZLdwJBPgZ8tZGjxgl8AZ+hhm2EnSc3K1t09GeRUyqanypb9VsfeWp/EOCGMyTSpEg/jdgo+gzjJ9AMnPGO9eWfEX9uaHCJY27zuq7Wmn3Qw5HAKR4M83HtED618c3mqySMHmkeaQZ2vIc7faNABHEvsir3ySeaiac18DmHEbk+XDqy7ntYbh2Gk6ru+x6F4w+Omo3ZYTXcoQ5HkwE28WG7FYjvcY4/eSPmuEyB0Az3Pc/7x6k+5P51U3/5/yKetfG1sbVqu8pM+qo4KlT+CKXyJCcn6/wD1h/8AX9jzitTTNH80bU/1uTtXPEoz91M4xKOSE/5aD7vIwc6GL/P161oW8PT1HOe+R3yOR2A9P5+XOq0egqWmhQe1IJBHQ4PGCCOoNBt/88/4130+mm6jaYD9/FzcKOssfQXAAx864xKAOcq3HzVzH2PNc/tzSML6M56aNjx8uPQ5/wDr1mX2ihusMZz6Nj9dv9c+9de9sPSq/k9cf5/PmuynipR2/Uxnh09DzHWfBy4OEkUdwQJU/NSXAP8Aun9K5bxI1w8ccJmkMcLM8EZdniR2AVmSJyfLZlAB2hcgDIOBXuZg/wA//W7VRvdGR+HVWHv1/A8EfgRXvYXOJQdpbfeeLicpp1FdWuef/DTxKYYif3ccnzLJKhYu4ZgV8wsSqbAfLj2herZyWJrbn8TSyHMecH7zlsEgnHyEhvmPZmBxxwflqbX5II4IYRGvmx5R1bbmRHctHIGPEgC53nIKEAMQSK5pdNZWYiJQrqQQOWXkEMgLKI3IGCyk8E8HGa/ccuq06lCMqVmmtbbnNRSoQ9jDXv3EvvCHmszM2CzhmAMhRlUDbGyFhu2nJ38OWJPB6SQeCIgZOFO/7obzCIzknMR80c+7l+mPWtO2kUeTlCoViDueZGnwBkS5chOPuyQhd5z1K4Nm0v5VYlRFgliruhlCAA4TywN2/dx5vzKO6dWrr9jQ6w/HUz9hQ1cqbffW/wCpd8OfDCFxFlEUR43M4fE5BPMmZchm6HytoIx8vGa9S0f4UQCKRAqfvHLq6iQeWD1iC+aySx56ecrN7ivG7bxFM37zO8HOzcCCNrAbWIITC5OdgwDgYGa9S0H4sCOOJJImLDiRkPyr83B+YZfg5IUEjGOtcNfAYeVnGH4HTGhh7XUX+JznivSlWXy1ijZVHlpDiQgyH5VlXMjMJCxBCKRGWP3ccH1fwDYvHbRCRVWQ5aRVGAGLEbRyewB6nkmvLtf8UWT3b+d5zxmIkeTwpm+Xy3Ey8tEoBkwqh2YBT5Y3sOms/jlbkhSpVQMBn3DjHBztx9eec0U8LTg70o2stzanCCnzRWlij+0ZrQjtwpj8wy741JJxCSYiJ+P4xgxpuIXLnqcKfmrQ3CTIzZClh5mOCOytweMH73Tg+uMeyftA+MzNEpt5S1uSsV0ED7WfInhWSQL5eFdAyoWDM4DAELkeZeDNCaXeSPkZGUn0YYZce+4DPHrXxeaTSnJy22PEq3qYlqPdfgj6e/Zq/aBbQ9UR5G/4l9/sgvxniN1O2G9GAeYt2JMctEW6lFr9boiCAQQQQCCMYIIyDxkdDng45FfghYzefaPG3MkHDAjkhc4P4qCp91xzmv04/wCCcPx8N9pRtJ3LXGmlICzH5pLZwTaSE8k7VVoSecmMEn5qnJ8RLldGW8dF+n4HyHEOCXOsRBaPf1Pr3ZS7f/1VRk12MfxD8Dn+QrH1PxTuBWIEnBwx6D3xjk/55r6lRZ8dGlKTsXLzxTDGdrNg9wMnr9B+PaoP+E5g/vfof8KwrXwluG5hlicknPJPX/J/TgCb/hC1/uj9avlR6CoQ/mP/0uvsvhtdy2kLmxFwkaiLzLWYebDJATFNG6sFlhmhkVw67sEjoQQDxeveHisgt7gLOjpIwaRdsqeXsG2ULgMTvAEibGJHK9DXuHx2+HGtaPCup6Peq166RR6rZtGrW+oyogjW+hhkb9zfGNR5pV184LySQA35veMf2s9UN2ZZYoYp0DRPG0coHLM0gkikkPztIVdmzldgwQCQe1VuaHvI+0y7NJUal5t8vkfYWzj2A9emO59gMe2OeK+UPjJ8U4rnU4Y4mDRWkc6ySKQQ7OpaTYe6JtUBudx3Yzla8k8a/HzUbsMks5EZ4aOILGh+oTDMD33Fh1/Hsfg18No7YDUdTbyLcDNvC4xLcsORti++0QIGOAHOOdud3NOpzNdLHsY3Nvr1qFKNo3Tk30SPX/iHqf2Dw+Y3O2W8yAh65uHErjHXEcIUH0JHqMdT+wt4lf8As2VD9xLp/Lz23xxMwHTjdz9Sa+RPjJ8WZdUud5UiJfktouu1SepA4MkhwWI9gMhRn7T/AGfPBb2OnwwyDbK26WUdw0mMKR2KIFUj1BopJyk2a4GSxWM9xe5GNrntc/iVsdaxrrWWPU1nPIabmvQsfbQoRjsiSWUmm4ptO3VVjotYcKKaWpwqWVsIBTsULGaeIjmpC6EWE0ogPpXUeF/D5lOAOuK9Ui+CMgUkxnjrx/TOT+GanmPOxOYUsO7TaPAXtD6GoTEfSvpofs8yFc/KCQCAc55zxkZAP19evWuE174SujbWUhvfp9Qc8iqUkcNPOaE20mjzLTdFLngfSuzs/hk7R+YMY37D1yDjIJGOhGcEZ5BFeheB/h+FZQcHPBA568dM5OM+leo3nw8dIwqjOZFY/gGH5cj+dEp2PIx2cqEkos8O0n4aKEkfgtGFbBBO4E7SR1+6SvB6g57VVnjIPfj/APVx7cV9EX/w82xSFR8zqQQfdlcj3xg9PavGdb0FlPp1/wA4/n7/AI1Clc4KGYPESd3cxdOmORX0D8GsFH4+bIz9Mcf1/KvDtL0w5/z25/pXtvw10hhhgeMYcA9QQCMnkAg545PPalN6HBmrTpnoOpaFHKCHUEfr9cjkH6V534h+BEcuQHwD2YA4+hBBP416pmlNcam09D42liatH4ZHjGlfs8pGcrIoP+6f/ih+p/nXoWhaIlqhy+c4yxGD6Yxyf8nrXSEf5/yawNX8Mea6s0jBVOQgC7c45Zic5Oehx8vYd6t1ZS+I1liqlX3aktDI8facDE7qo+YKCw6nDj9MEkE1xel+JJo4spJkB9hRgDt+XcpB9DyMZ6ivUpNZiLNDkFhgMvYZGcenHcdeT61zWueBDtwmCDIrOoGMBQcgZ9fYdaamup10K0Yw5Ki63Q7wd4rnkkCyL8uOGCsOSAV5OcAjnOB+Nd3G1RQwj0xxgY9P/rf1qYCsnqzzK04zl7qt5CSH/P8An+VfIHxN/ZktL3xMmpOwkjt7eFruBlG1rmPizDMc7/3WJJEIOFjj5IkxX1T4u8SJbQSzyfciQu3qdo4UDuzH5VA5LEda8t8E6bIkQafBuJmae5x0EspDGNf9mFdsSn0jHvXxHEmPdCCpwauzswMG25Hby35Yk4wFA/Pt7dT79O9c74l1ELbTv/skD6gbf1NaNy+1PzY/QZx/PJ/zjjPHd3i0b/aC/wDjxB/TmvyvMsY1Rlzavld/me5h6Sclbuc5+z7ZkJfSf37tYwfaK3hz+TMa9t1Ahcnu2Bn0GK8h+CmBZu3/AD0vbg/98lYx+iCvStQmzt/3RXRgq3scKkt1GP4onERc6rbfVr7il4p1lVXcEUkMOucZHQ4GOmM4JIPfNcnaaqFubu4c5+z2q9e7Mhmf6Z2oMf41b8aXACAepOfoBXCeI77dDeAHmS5WL6gQW8ePod3Tj+VfLVcdOWLlJ/Z5bK3Vpr9Tup4ZKmrdep6d4LttlvHGxx+7UN9dgZj69Sfw9K4/xv4wVZHVBlLe3eTGTlprhlt4SfZd78ev0rr76bCgA9j+IJx/SvBdc1Yh7huDl7FCD3DXTk5PtuB/CvYr5i6cqdOK+dtf+Gux0sLzJyZ9A2V3HGiIsa4RFQZ9EAA7d8E57nNUvEPixIYpJWjUhFLY6ZwCcfjiqzvz1715x8adU/cNGD94KDz/AM9JEi6ewZqyxOYVUltq0tl1NqeFjf8A4LPRPBQjSCIPH8zL5knJb55SZX64yNzY+gFWfEeph1UMAqO6ptPTYMvJkZx8wUKfY4qo74/Dgfhxgfl+lcl8RdSwIFHHLsefXCj9M1NfMHCi1by2tfbR28mKOGTmrGT8LIRIl6+QgMsxUnoojXYATxwApPtk1nfs1ahtt9pORsRxnoVkGH/ln/8AVWd4NuQLC5Ofveaf++nlyf0B/AelY37LPiVnRUlTZNEgimjIx91VlhcdRtlhKuCCRy2K4sNdRU4raST+d7fkd9Sm7O59GT2mDt/GP/aB5/EgfyPpUq2hZCQMso5HqPY8cj/OeKXWJvMiBUbXjIKEdj1X8OAD9ffAs+Gr7zFLjAO0hh3V0PzDt3Ar3o06c6vIuqve3T/gM8Zzko37f1+JjwRo6ngMpBDKwz7Mrg557EMMfnmsOeF7HDHdJZMctn5ntfderSWoONynLw9csg+Xa8beJZIjFLEqsuCJotv39vJQZOFfBLRnPJypyCcdPpOuQzwhlAKOAeOmGOM47d1dSMggg1NPD0akpUoz99d1a/8AwCZVppKTjoclrGh7x5sY3DGSV5GOzcfeBzyecge9RfC7xN9jmW2c/wCizsRa5IxbzYLG2z2hnwXhH8DhoxkNGBWinOmziJWP2Sc7bfPP2aZjgQMT1t5T/qmP3CdnClMR+NdGinhkiZdokIywJ3QSKQVZPXZIBKh7EEetc2AxjyrFxrRnbW1SPRruh1IfWIezktOj6o9F+LXxls9LtXu7mTCKdsaLzJLIc7YYl43MxHPZRkkgDNfEOueBdd8UzC4uAthYA5tEuCwRVJ+/Ha4WW4mYfeuJBEpyQhCgCuz0K2FxIt3e4nvbdpIERx+4tDC2yT7PAcp50uFma4cF2Eihdi4rsLvxdITncTyOpOeoxnrk9T+df0dRwqxkFUb916q3VW6nFRpvDP3Pi7vp6eZzXwo/Yt0VY2kvJpbthNNGA0hiiIglaIN5EJDc7Dw8rA/iK9btZdK01GMMdpbxoCzOkcabQo5d3Kk8YySXJ4rwzw/r5FupZ9oUzFyxwFxcSl3YnAAHOScYHr1rxvxdqp1Mklmi06JvmZgc3LgZVmTIZo+8VvwXP7x9q7a58wrYbLKPNO12tF1Z6eEwWJx1Szm2urex33xh/bGvdQJtdFVoYCCHvpFzLIAMM1tE4xFEOf3z/Mckgx8V8w6l8PIFbdI7Xc7HMssrF1LHGQpbJkOc5Y8dhuB3V3mta+NpigXy4e443yY/imcYz7RDEadgTknjdSvFQZY4Hv0+n19hX5HiM2xGLlo2l0S3P0bCZVQwsdtfMrxWyrwoVR2wAPyxikaT/wCv0/n+feuTm8c+Y/l2yeY/8RPCKD1LnkY4+p7A1ftvC7NzcOZT/cHyxr6AKME49WyD6c0SoSglKvK3lvL7unzsdKqRlpTX4aF8xxP2Rj6AKSPxGSPz/lU0dtjPJOexOf58++MmnQ2Sr91QvptAX+Xr61WJMmduRH0LDhn9dh7ICMb+S3bHWseZyvZu3ma8vVrXyJ0nBJA7cH268E+vt2/HJmB9f8+lJbxAAAYA7AdOOvH88knOc1JeWuUYDrjK/wC8ORiueTTlbobJPcciVLJanacfe6j/AA/HpVCwvQdjH7snB9Ffpg+mcfgR3zXSQj/9fb6ZOKyqp02dEFci00hlDDuPyx1B9wc1r21t+n6f/W6D64rS8F/Cu6lchIisTfMsj/Kmf4gueWySD8oIAr1bwj8Jp7e4RnEckbK6yYJK/PGwUSKyglS2AcA49q8jE1oxk7M29vTgmr6nlmjX7wuJIzhl5HcEdCrDoQwJVvUH6Gu0m+H63cf2myI+b/W25OGjfGWWMnGR1KqTnGMHsNG60638tnRB5bPuDMCzW8y9ba4A5a3lwQjgZGep4NcPofiYW8xJLJDOcPtJzGwbKSRt2aM8jnnDA53GuSEnUT5d/wAy21Vi5w0a+5kMPhN5N6qp82PPmQkEOVHG5QeWweGUAFcg8g8c7LpgyNwYHODjIYevXuMdGBHbBzx7FJ41XzQt2uJYyDHdxDllI+VpEH+sidCAdvY8DNUviDrdxCyNHcGSCUboHAjbpjKMxTJZD1Lc4xnJ3VcK007HNzzk+WSR5n4l8PPAiTNlraTG2cKVCE8bbhOTEcggOMxvgEEc4w7i4A4X52PQDng9yc7VU5HJP0Brup/iDO0geVhKCnlyRsBsli53RsoAHOSd3UNyDxXB+KdDFnie3BaxmOdp5aBs/OjH/pnuGVPBUqw4bI9ihaquV/F07Py9fz8usNyg/fWn5FbUvhfKyre+aqSbisKc7iANrOoAIMfVGeQAMSVAPSszTdOiWNldJxNHMizFPLaAx3Wfs8iAsrRsrq0bx/6srsIaNsg9hYan5igqxZSB3OMDop9NpJO3t1xnNangXwv9oh1VyR5YiiXB77HDoVzx/C5HruHrge/l2e4nBNu7tG2nzX6HJWwsVacHq3uv1NHR/DzopjbZPFkh43XDIyn5htcZV1PBU45z35Kaj8PYJJJJXWeTzExtSXy3R1XbHNGGUpMyABTDP8si8eYDg153o/i0adJJ5nmvHNtaIq6soMf+uEqOQeUZWSSNgVMeCrK52+3WF8siB1OQwyO2M4GGXqGUdQTnPsQT+x4HMo46mqkdG0cMlGbdOStJdVp9x87ax4LcRxyyRMiO7pFLlQGkix5iFQ5ZJFUqWilCttOeR8w72P4dm82SwG2tTIkaNGxdLUSxqyyH7rvAbjajAlmhWRmyVDArvePdG3bXMbyRq6vKIWCSlRlWxuDxu4QkJIVyhGGyhONDwJPHiRYmZ4w7eWWG12jDEI0ifwswKhwPl3ggHGK9qVSTik3aS2a6+plKk2+Vu0ujWia7Hh0UhadbdCs05DM0VvvlZCmRJG6qu4SxlTuVQ2FBIJHNdNoHhWaTkRsRnBJGBkcEHdjBHII6/iDXoHjzwC0saG1k+y3MMpnhniGyUOyGOVVmiKSqJEOMbtu7BAGWJ8Oi+J13pTSaefInSO5WYy7XE5WTZJNHBcuQ8cc4LFlmjl2S7jgAknjnmdWj7tWN13OGWPrYV2rRTXdHpfiP4Wb7aZWGPk3bUzljGd65ClUfaQSA2cEcdTnzjSbRLbMasrxh8CddwViQCDIjhXibGMBgAOh5r6A8DeP7bUrq4t9O86WOK3Fxm4WG3mdN6rMkcRfbKbcOpYho9+WKIQBnx+41AgvaIsLxvdKVYqPNV3xAMSlhiN12bkcMuVUgqQSeHF4OjmdNp6Py6f5nRTxFGs/aU99muvqcHfSCC7B6RTY8z02vwT/wFsHPufWvcv2EfHZ0/Xo4XYLDe77KUdi7EyWjdeP3yCP6TH158U8b+EpBlMHMZZWjP3hjhgmeoBGQmeOQMdKg0vWmBhuUJEsZjk46+daOrDnrk7FPb73NfJzwlXL6sHPba/ddH9xyY3De3pzp903E/dw6CKztY1COADKvI7fciiTfI/0HRV/25GRR/eq/4P8AEq3Ntb3CY2zwxzKOuBKiyAE+27H1FaZbBJ9evYn6kf1zX13M5JWZ+Ouc02meYTazrjktDZ6fBH/DHdXEzzezP9liaFdwwdiPJt7sezPtfiH/AJ5aP/39vv8A41XqTSj/ADn+hFJ5g9v/AB7/AOKpezl3Jv5H/9P6v/aN8cqpfvHbJkAfxyNjAGByzNsjUj+In0zXydqnw7iVU+1QxXCzv/pwmRX2XFw3+uiZstGN7CB1UgEBH42tu9S8Ya5vnjjwWhjkXzpONouNhe2ibPBVADI56B2gHzZrlfiZI32aVlUs2YjtyF3ETwnG48LnByxxtHJ6GvoKNNJa6n1FOHJFRPDPGX7PQgCvp8kduC4Vy9tbTNFvIEciStH5wQOQrMSzJkNkgHHl+pfshXlxJ5lxfo5OcuwmkbGewfGAOoAYD6YwPrjSpneSa0udp3hgrICoOY1eaJRkk+Wsm6NzhmVGJ5UGue02dlBjfl4mMUh/vGPgPjtvQq31J9q5K1CDfMkfSZbhqGIvTqp6a6Pc86+GX7OVnYsJQGnnH3ZZQAEPrFECVU9wzF2GeMV6ytR+ZUoaoUFFaH3OHw1KhHlpRsLmlWkpSKs6wp6ITTY488dzXd+C/BTSkAKWPQADqT+P+RSbOevXhRi5SOXt9GY9q07Dwi7EcE+n+cj+VfUfg/4CRqoMx567VxxnsW5/T8zXXR/Ca1HADD0+b+uO3p049qw9qr2PjK/EtOMmop+p8z6d8J3Zche2T1/Ljqc8Y6+xrm/EPhUxEg4/DB/UHH5Z619o6L4ZjjVlX5hnByRnuMEj0z/nPPg/xb0c72AUDk7QAANp5BB6EdOefrwcHPczwGdSrVeV7eZx3wmmVZYy2MBgTn0Br7Ft51YAjkdR+PoRXxbo+jFOSfwH+P8A9avevhj4+CosUpxjhX7Y9G+nr39qiavscPEGHdZqrHdHr6rUF/piOMOoYehA/qDj8MUlvqqHGGU/iP5ZoudXjXq6j6sB/WufU+CSmnon+Jj2vgSBG3KpBzn7zY656E4/+tmuiSPjH+f84rGuPGMAGTIv0Bz/ACBpNE8VpMWCA4UgZPBOe+DzjjrTtLqaTjWmuaV9Optun+e3vx/n8a4zWfhhFIxbcyk5z/F/6F0A+tdolOK1KbRFOvOm7wZ53b/B6MH/AFjc+yj8uuK6/RNBWBSq5IznJxnP4AfyrUJ/zj/OKz728WPkk5YhQPr/ACAHJ9v1fM2aTxFWqrSdyG911I2Ac7QTtBPTPJIJ7cYxnrmtSN8jNcT8R4Mxjg8uOPfBxn/Z55Oe3fNY3hjxyYcQzg4XgHqV6/Kw744wRz9a05Lq50LC88OeO/Y9RU0YqvpuorIoZDlT0P8A9bqD7HBqyBWJ5zTi7MzU0CMHcEAb17k+p9T7mr+2n7aMUA5NiLQ1FIx/z/n2zQ3y6k9PmeXfF6882W2tOqlvtVyP+mdsymFCMciS58s44z5TehqQNn6k8/14965uwv8Azri7ueoeTyIT/wBMrMtHlfZ7gzv05BHWug0+b5ue2Sfw5/nivwzN8V9Zxkuydl8j63DUuSlt0IvFdzhJMdkKj8Rj+dcP8Ybrbbovq4H/AHyGOP0rpNdmyhz/ABMg/wC+nUYrzv42XvEC56s7fhhR/U18bmVTmhJnqYenZo2vhXNiwgPrd3H63Mo/T+lehzXHC+wx/n868l+HV7jSY267Li6Y+22+fP5CvRBc8D/P4j611upyvk/ux/JC9kpXl5v8zF8eXWFT/eP8q8w1XVv9Hkz21AA/jPaEce4Yfh+vf+P5vkX/AHv6H/PpXiXim4P2a9APzLPFKPoUtXB/OI889Py+Xb/2qX/bv5o9OnC9NH0jeXGSfbj8q+ePFV1j7T7SWT49lnx+pU/55r3cXoYBh/EAR/wIZ/qO1fOXjm4wZ1HWS2mK/wC9auJAMcn+Mn8K9Gs3KvD+uqf5IqjC0Wj6Qnn5P1P65P8AX/Oa8d+Mt/8Ae9Fktfy+0wE/gea9NsdT8xI3zxIiSL9JEDjnv96vFPjdN8l3z92Lf7/uwHHH1TrTqtupBf3kVRhv6Hvdxccn6/1rzr4i3h8yP6f+z11q3+8K46OqsMc5DgNuPtz2zXBfE1jvi9wf0YH+tYYr3lbzLpRszD8F3f8AxLpB6hR/300h6fUVX8ES+UdOuxwGhgt7r0KSRqkEjj/pjIQm7skrZ6VleCL3/QwvqYz/AOPSD+dbHgi3WSyhRuQYjGw/3XaP8CCuQex219PklFVlXpPyt8rnfCnzXR9F6fcZ3DuQw/FeQf0P+cVz+h635F60ZOI7qNiPQTRru/8AH4w3A/uCsbwD4mZo1Ln97E/lT+7J0ftxLGUk6fxEc4rJ+Kt2YxFOOsEquf8AdUgsP+BRmRfx9+OCtUlRnHvF2+TPEeGTcoP+rHo+o/OhU8Z6HpgjGORyMH6HHeuH8I+JPIm8psiOdiBkYCT88Y7LOATgcCVTjG/jpTdjqOh6fTkgj6jvXnHjq2/eOucbgGRv7rcFXHXlHAbP8u/j4mo4VY1l6P0NIUk04tHr/jDT1uIGR13AgggHlhjqD2YcEEHIKj2rzrw94jd0aORszQlYpz/fAAaC49f3seGPo4cdOK6DwF4sNxbxyMMOQUnX0kjOyQY7fMpK+xrzbXrrybiOUHAdvs047YdmNvIx7GOXKZ/uy4zwKWYfvJprdr8Uv1Wn3EUaXKmmU9fk8q+ccBbqFZh2/fWxWCfjoS0bQOc91NbNroblBLIfKhJwrsMtIf7sEeAZGx/F8qLkZaoNf1yOGayuZYhKI52jCH7u66geNC3X5RKsZPyt04GcV538Y/HtxeSpbLJie5B8x+AtraJ/rXQYxHuGUQ5B/wBY2WIr+iOE84UckVWr/wAu7xfy2RwSw86uIVOHXqYnh+NdQluUclNNtriaSTnLXbNKzrHuXg26EMWVP9bJkD5QtcN4w1/zWIVRHChPkRLwqLnrgHlm6sxySTjJAArZk8XCBkW2AWKBGjg467l2NOR/z0Yfd67EwOOc+KeN/HAUFUz6ZHVif4Ux+RbPH61+a4rFV82xLm72vouiR+p4LBRwULvsP8XeNkiBC4JHr0BPYnnJ/wBkc8e5z5UY5r2XaWZR1c/3E6ZOMAM3IWMc9zgA1JqFs5ZcgtI5AijHOC3TjuehZiOgPYV6h4b8OCGMKOWPMjd2c9Tz2A4X/Z/GvdiqWApcyV5vZ/r8jkqKWJm4vReQzRvDqQoEjUKB19WOPvM3diO/btjGK0Ui7d+49j/k07ULgRRtIw4UcAdWPAVR7seAP8MVY8P6DIdiKAbi4dUUHtJIcAH0jhGWY+iseM14cnKpepN7vr1fX5I9CMVTVo7IzprQvlcfJnEh/vHr5an0ORvOOAQOpxTr1MDA6n5V7c9B68AdR2A6jivQtL8HGedbeH7qfIHPQKpO+V+clpGLSHByzOAO1TaH8H5biaRv9TDAdpaXgkuM52Dac+WB1IUb+veuVYmN7X0Wv9fMUnGPxPU8m1hvKEZAJCkhvU/Lkn64y3bOa6bR9IeUgRI0hx/Apbrgg8Z/X8+a0vE+p6fao7rEb51nYb5GKwKqt5YISMgy5GTgMFwepxWR4a+JlxLEYDJsWAmMxxARqyAfu2IQKX3Jjlic812ThKpS9pFbPV/8Dy/UxjV9/l7kH/CBtDI8N1LBbxTN+73yBpEfgj9zDvkUN0BYKN4xxuzXZeEPGNnbHywjXVzH/wAtJgI4h6MkIMjNgY5Y5yegya8h+INn91/X5WPfPVTnjn39vbnNsdaMqqQdtzFyp5xKg/mcZDL6Z9BXW8L9YpKTfrbo117+v3k3cJWk9D6M17423rKTG0cbDldsYJGO2X3dc4wOOe2ay9O+MNzcJk3EgYcOoIQAj0CgfK3UHn9a4Dw74oSZcjhhw68EqfUdMq3O1u47ccY+sTNbyrIn3T94diOrLnkdeVPQH1FeRHAxd6U4pPdM9CKpK0opHrmh+ITExJG5HG2ZCeHVuoJA+8OqtxtOPpWT4igVg6qcrz5bHg8crkdmHAPuKyNL11JFDocq3r2x1Ujsyngqf/r1ZFxyO/19/wCY9/fPtXn+ydKeq1R6MakXrE09C1r7RakMcz2eEf1a3dvkb38mQ7fYOORipYPEpETwkbkchlB/gcZAkTr1GVYdGGO4BHApr32S8SY/6qT5Jx2aKX5JeOnyZ8wehUVuX5Ksyk52kjPY46EfUfN9CK7a+G2ktnr6PqjiVRNuL6aolklrR0XUEIaGU/uZeHJ5EbchJceik4cfxRlh6Guca4qJp6iNMc5KSscRfzyWNy1o+VjJI3Z4VO+0/wARCnCP3Ug88V634C1gra3m04imVDjsR5qLCQevESnp2Y+lef8AxfsvtNoko4mtysbkdTE2RC+e5jYGFv8AZKVmfDTxlvgMOeBtIHfauQFP+4Scf5x9DiKP1jCqpFa3975dfmeHSquFV0pbdC98W7xHmtgECoZW+TJYBWXBAJ5wTk59/aux8EeMZVu2t3kDwpbIw8woJFWEpGgQ/KZzEjKpBzJ5KkksIuPHfHWqb7yBAfuuo9eQOf5ioviIpaaRR97ChDz1wMYxyDzjI55r38rnPCujbblu/vOXEz5pSnDeL/TVH2QP/wBf6fgf/wBWfetp+n7ZI03BYHlJYEhBDLKvlCcPtYiJiUWaMjyyNrnYY945P4X+P4buJjEsiCEiPZMQz4VF6yL8smzOwuMEgKWALYPaSRhgQRkHgg9CDwQfUYz6f4fqjarU00/+HNnbE0rx0fTyZQ8K6u08KzGJow0s0PJVl821laGaMOpK71Zd2wkNsIYbl+c858Ufh5FdwSbljSX5f37R72REcOSpXEnyqDkA5ZSU5yMcn8ZrySGSxkitpfJtD5mpvbs8aXUSzxLA90kZ2JcRw+Zbm8KAuWjLsTxXR2vxUt7q3vJLcTiKNvKjadVVt00ZeOOQxM8fnBA4ypCyBGYBcMq8VOarXo1N9jx6OJ9rfD4le9tfvY+cbn4XnI8qdJVLOpcbghCuVEiA5Jjk25AIBAIyAc1c0zxfJElva3cKG2hlMZuFjb7SkLuSVSXdskjhLb1jdGyvyjGFx1uj6qG/dbVUwgJlQB5gLPJvkxwZEEgjLc5VY85IzV27sFddrgMvp79RX59PNa2X4qVN6pOxt/ZUZR5oOzDwmbe4V4IpjLPFJM0RZXQSwCQMpjD/AD42knY5LowccqUasvUvCxByi8lsunTcehcc4DYHPZgD3UExpPNZXCy2+yJZFSGQsFKFWljYq+4EoNyK3mKVK7TzgkH3vVvCqsxZQp5O4KQy5BwdjL8rKSCQVJU9RxivvMvxlPNMO4VdfzR2Yfms6NXdbM+1f2G/F32jQbLnJg822Y5B/wCPeV1TBHX93tx7D8/b7i7/AM/5/wA9PWvzv+BPi19KuBKqO9s+/wC1RJgMd6gCZQxCYR1DuDk8My4JYN9s6b4tSeJJk4RwSM44wzBhlCytgqcFSVYYIJyM9Uafs/d7H5Zj8tlQru60bumdE+qU3+1a42bW+T/j/n+tM/t0V02M1hYn/9TtJ/BcgsY7pd/2S+229wXBG+e5XEeoRq+HKGdhE7gASJ5bBT5YY42g2c7W65kW43BlkSUCJlIzHJGrpvA2OGUCRWPT5hxjQ8TeILnUrlI7ZpZ2t2SUEQSzxSSgbY4+GiiiggVt7yh1AfYFHysarWeqSQyuksPMkkwkEUiOsdzbt5VykbOU81ZNglTB3HEowSOfoKUuXRn1UZN7lCeJ02TzgRbLm0G95I/mUJJbySvtPlosiSgcnLYLELkCoPFkAW7k28iWKKYEdD96JiD3BCI2euD7ca/iTXrW5gkjWSEvG8b+XL8nzwyJIUYSKqbmQEDlhzjJrjILsC8tLYhgktlJ5LMMYR2We2A5OCkiTxhc/cKjisKsuVpeZ6+XVfZ1oyLgap4rmi6syrFSMEZ/H0P0PX/PEISqtc/RFPqX1cU/dWM0pFSR6r60nBmntUdx4S0newz7f5/H/PWvs/4X/D9beNXYfvGGeRyoI+79fU/hx3+Vvg3KjSx5IwWXOe3P+T+Ffbts+eBn69j249ec8/zxXDWbWh+ccSYqbapp6PcsMf8A6/4fy/z+PlXxA+KIXMULeodx/JP1+bv29a6X4n+IDDAQpwz5UY6gD7xH4cfj7V806pqBJ/r/AJ/z9M1lTgeJlmBVR+0krroelaL4/KDG44PByenuPx598n1rOvvE6yK6yc4BMZA5WQ9R/uPySOgPIwc152l2fWphcE966eVI+njhIKV0aGc/5/z/AJ9KWO6KnrVIXBqGWYmlY7nFNHY6drpyBnr69K9D8P8AhSSZA+QqnIHXPHt6ZGK8UsJsHOe4/wAc+5Hpx9a+kPhbravbqMglPlOOuTkr0zwR/nipleKPnMyvSjzQscL4k8LzR5yp28/MM4/EjoT74/Q0eCNTMcyEnqdpz6N/XODntge+fcWjBzxkH/Pcc1jXPgi3Y5Ma59RkfntKg1j7S61PDWYqUOSovuN2KT/P+fz/ABqSoYLcAYGfxJPT6mpqwPDYyT/P+f8AH8jXPS+Fd0wlaQnb9xMABRnoM5J9z1P5Y6MiqWsWTOjKrFCwxuAyR7gZHOMjrxmmjSE3F6FS5lSVHQYbHByMjI449e3Q1wF74IkmllYYVQ2Oc9lXO31GeOe/riu88OeHhAu0MWyc5IAP6Vsqn61alY6qeIdFv2bMbwfpJhhVD1Gc/Ukknp9K3KaE/wA/5NOqGcc5c0nJhRRSE/5/yKRAjmvM/ih8XBbxXC26tNPEgDhcCOF59qwCaVvlEjs6FYV3SMCPlUENXZ+KvFUdvH5khOMhY0UFnlcj5IokALPI54AHuc4BI+dr2eUXJt7iLy2u7v8AtXYpLqsUMKRGCWTOxpkuI7d3CnZl/l3Bc189m+OWHoyafQ7sLR55pHZaHp4hijizny1Vc/3iAAznryzZY+7fibNhc/60+gVc+7ckfhgVn3V4FBYnhRk9v85Pf8frDobnyAx6yOXb8eg+gGK/AlXbqNvs39+h9u6fupegeIJuEHrNEPw3gn/0GvMfjZc5mhHohP8A3038vT/61ehatL80IzyZlI99kcjY+ny5ryn4u3GblfaNf5t/jXk4uV4W80ddKPvHQ/DQ7tKdB2mvfzNw7AV2/hvUA8ETZz8gB+q8f0rgfgY+60mQ9Ptl0CPZip/Tcav/AAz1DHnQE8xvuA9A3UfQEGt6tS1VeiX3DjDRrzuafxI1ELCMhj8wwFUsTgHgADr/AJyK+Z/EXiudpb+CO3IMtrHKnnSpGR5KOC4VfN37gR8mQRt5Ir6b8bjMD+xUn/vrB6f56V88+IoR5ss2P9V9mSXjP7m8S5t5CfYO0T54A2545p4OnGeJkuVN8t9b9Gn+h20l7p2Xw78Uaxc2qNCdMXZmIrL9saRWiCgrIUCruAKjgc8c9a8k+KVzq8UkZl+w/wDHwYT5Ym2/6VG0TCTeciHBzn7wIB7V7b4DsWtpo2/5YahDBlhwq3kcA2tknA+1wowyCAZYMdWrG+PWk5MTMG2ST2wcjggPKIHYfQS5zn354Ne7UTo4qMPZxs2tWu/mzOm48zRzPwf8Va41nEiQWciQD7OCzYfFuNo3fv48kqV2sAMjGetcp8UvGOr4m+0WMah4HVigkxsMbKXDLLMDtGTz+OBk16X8A78xtPbsSHLy7gegntZNk4X/AHopYZBjqF6mtD45zFU3CORwYpUYxhTgFGPILqeAT0BHT3FY4mp7PEa046tP/hjWK5ZHnnw0/asVLS3Se1cGKJIndZoQWMKLHvEc3lEsQAdocnn6V2mo/FS0vliMEmXBIaF1Mcy5x1jY/MOPvRl1z3rjvgJ45ijSeyvI2RcxyL58DGIEosNx5pKukcZkRH3ybFzLgsM4rovil8DNPZFmjgEEu8fvLctGeRlWRVPlHgZyFAIwQSMELG0sPztVIuOt01qtfLyBWTOZ+H+p5gA7rJLG3sYriTHH0wfoa9R+Diho/LbkLPcRsPTMryL+SuK8F+FUkiG4gkfzNk8ojcjaxMbBX8wdN5DRybh94N7ce2/CebbNOP8AppDN+DL5Tn8TED9a9LKLUMdUgtmrrzXT8zrvaL9Dsbi0NrdKT/q7gLCT28xNzW7n3Yb4T/tGMZqb4hqHgfP+yD+J2nP1Gf8A69d3478HC4geMHDFd0bjgo4IeNx/usqt+FeYX2qmayZ2G19pWZMfcmhfZKpHbDqSvX5Cp7jPPxFhPZT9pHZ/mjipVVU167M2Ph7qxktIGJyQnlt67oGaJs+5KZ/Gsn4jy4MTeoK/lg1Q+EV1+7nT+5cFgPaaNH4Ppv3/AI59an+Jv3Iz/tkfmtfJYjWJpGKUit8I9a23FzDniQJOg92+SQD23IGPux9ar/ESAyfaYx1YNs9Q4G+Ij3Dqh/GuT8JahsvrZv74mhbtnIV1+mCpP/666fxbdEXL/VT/AOOg/iKmtrGEvn+n6CcNTlviB4pVtNFyxwqC1uXxyQI54nk2gD7yjeMAZJ+teQT+ImCyTP8ALPffvHXqYbQEi1tR1wSmHc55B/2jXXeJpgul3sZ5WJ548H0+0rIq/QhwPp9MV89/EHx0wZzuG+Qkuem0dBj0AXgegA49PuMr9rUwssJC/K6jf4Kx6WXwhTk6suiJfGnjsKCitx0YjqSeirjqT046nPYZrkYoNifaJsbiP3SHBCjuSO4HGT/EeOlP+Hfhv7TIskp2whhtJ7KOXkPTooP8u5qD4l+KlurqR40EcCEbIx08uPCxqR/ecDe+P4ifx+qw+HjSfsYdF70v0XqexUxTqJN7dF+p1Hwi8PlxdXsgJ27ILcnn95OC8r54+dIVwcYI8wDjFd1ZaOSjv/Cu1ScdS5IVRz6Bj9Aa3vBfg5/sen2sYzLOZbmXPHMjBAzegRUbJyDjpnIrp/ivpaW9qI4SNluhllY8GSV5fs6n0yMPtHQIrdep+Wx2L9riOWPflXotPxdzow9oJJ7t6nhN4xnu4oRykR8yTHQlRlR+B7epr3P4GacGvXkYZEKNFB/12miZ5WH+5CAv1lPXPHmP7O1mhmuppVVtlrJIAwyN7A7AR32rsP1weK9S+Dt35Umnqes3n3Emeu673pFnP/TGOLA6AN708xk6cZU4/Zio/N3bf3aGk3zRkrbu/wB2yNdNRWxltoOPMw11enPU7ZPs8G4ZAHc9cnB+vmeofEGe5Ds7YSWZ5fKXhBubC7v75CKAC2cACqfiPxKZbu8lY5wTj2CByB+AUD8qwLWXbAntEp/8c3f1rlpYblgm1q+XX1TZpGlHSUrN21uYOqNvsyR3Un8N7f8A6q4jSNe8popT0b/R7n2ZMCJzx3Qrk/Wuv8Lyb7VV/wBmRfx3uP8AP1rzBroDfG5+STCuf7rrkJJ7AE7W/wBk57V9tgqaftKMtrtfL+tfkjx8XVso1F2PaNVg8yNl/vDj64yp/P8ArXjt0WB6lXQnB9GHHT0J6jv17Zrr/h94jLK0Eh/eRcdeWXsR64Hv0ql4+0Qg+avQ4D/73Y9xzyPr9ajCxeGqujP5ef8Aw4VqntqaqR+fl/wTAt/EL7hImElX7wHRs9eP4o3/AEI4wRXpWma2tzEA67GbIA6jcv3vLboxX7xQ4YA5xg5rxi7iJ5BwwyQeR0/hPI4PHfOcfj1fhbxl9jdWlSOWCdFeWFm+SaPJGY3X54LiFgwSRNskLrg5U4b16+BjWSlHdbPt5eh5lLGuk/e2/M3NO1VrSZlcExtjzMdAe0qjv/teo9xXoqXYOCDkEZBByCD3H1rlPG1xZTbfsMs94jIXQC2na4tuNxgumWPy5QvP7xGyMZIHU8D4Z+IZtztZJTAeRleUJ6FN2AyH0OMfpXk4jLJ1lzWtJfK//BPQpZjCL30f4Ho/j2HdDn+6QfwPyt/Sl8J635sKknLp+7c9yUwFJ+se3n2qtc615sZAilKuvythMYwec7/X05/KuS+HWqYmZDkeYu4D/aj6/wDjh/SuSGFk8PKMlrHVbfP9TrniEqsWno9D0ozU1pKrPNzjHXJH4Y4p+6vG5Dv5rlXVZ8q6f89UdD+WQAMY6gHvyBXj3h3WzDMT6c49Q2VYfnz9a9P8V3OyMP8A3ZEP4ZIP5g15R4sQRzEgZ+dgB6hxuUfnjH1r63KqalBwez/Tf9D53MJOMlNdC94bnMt6hPOCWY+ncn9f0rW1XUxLclh90NnPtGOvTocZ+lcpoV75YkI+8VEefTcd0pB/Je3APrWnYjCSP6gRr9W5b8lH45HSvVq0kp+isv6+Zw0arcderuzt/hJ8SZ4J4oEZPJnnDMkmxVEjr5bSCRgDHujCqctsJSMnlQa+r4JwVBBznkH2/XPofcc9K+FLFsPGeMK6E5x0zg/oeR6fhX1Z8INXTyVt9zGVAxdWxwPNbBjYffi2kEA4ZCGBGNpP1+WTfstejsd2BnaTj0udf4ksWkhlQO8fmRSQymP7zQTACeLacBw6rwpIywXBU4I+aviB4Sk0u8mthO7WDyWn2prd28u4h/dXMTFGyyzJHLvVT88TsyhmByfo/WPEqRHBIz1x39v/ANf/AOqvGvGd3DcrIn2faUaaaSZSQsyuiNDGUOVE0LrLmRcb43RWBK1lm8Xh3GutNbPz9CMfgVUftI7/AJdmVfEVxsW3lXY0CK0MM0a7TcW3mOyXMqdROxbMmQGITOBnnRt4v/rf5xWrqPgOJdOijglaaIF2jmK7S4mUEuqnlE8wEIuThQp6nFZXh6QNGpBBx8u4DAO35c46g8YIycEGvjOKcMoxp4lfaWvr0PVwEWoRT7XK3iPTg0L5z8o3D049c44/GvRfgZrUTWyxIjx+QiecX27Glbc0jwMOFiK+WxQ8xFmzwQTxWuriKT/dP68V5zJdyiJ41llVCrExq7CMklCxKZx84Rd397aM5rzcgx7w929VcrF0+Wamt1v6H2r8J2k1CW5W0SORLXy97tL5ZczbjmHMbAouzGWI3dQCCM+8fDbwTcQN5J2rG24qqytIqFiGYFCAqAEMwKddxB7Y8i/YJs8QajJjrJbp/wB8xu/p/tY+n4V9ifD6yBMjnk5CDI6AfMcfUkZ+gr9RwtR1aaqS66n5tmmNlzST2T0NfSNFjRAoj3f3mYDJPcnOf0wB6et37En/ADyX/vlf8K1xGaXyzW/OfDuvJu/6n//V9m1jxjKqMN/lwqGdo4sxptVSxLbTuf5Rwzsx9xzjy57A/wBmo7ffTy7vLBSBI03ntvVvlZdsrhgexPI612Hxf8Pm2S6s+c/u4rQnq9vdyLFAR/eaMF4HxzmLJ+9V7WfC4kglgGCGieNQRkEbNqgjPIyBlfTP0r6CnVjVjzLsfTUndXNeOwXptG0cAbVxjuwAG3kZIOP8a8z8d6eJbuWVQMadbwsxGM+c9wJFRe/7u2Ls2AQDKo9cdp4PtpgkTQhGgZFIieRt8ZwAY4ZdhBRSCvlylim3argAAcx498GOIL+4SMI8ayzRnaqvMJQpuYZWVmMkaQptQ5wG2kAFCa5MTK6uump2UtJJ3L/iPQxICR94Z2+/cqT2x26/4cJJxx+ftXpdtLkL6FQfrlQRnnj1wK5rxRpiswKldxOCOmT656Z9c4z9eDtA+3wtZ25Zbdzi5apsxzj/AOvXYL4N/vN+C/4kf0q5b6SqHKgZ9Tkn8yePwxXXEdfGRWxY+G5eNlY8YwffqO3T0619veB/iFFNECXUSKPnUkDoDkrnqp5+n4V8RQnH+f8AP65rYt9eYfpj8Kwq0VM+Vx1FYrc9q+MPxDR5PkO5FGAe2TyxHHI56968mHiFWPJxWHe6mW6/1/rVA040ElY3w8fYx5Ynbx3SnowP4irC3AHcfmP8a4RBVqIVPsEdqqs66bVEH8X5c/qOKyLzxCf4V/E/4VnH8ahkFONJIUqjZHLqjk8scenQV6V8LviU9u4wcg/eB6Ec8H09jz+FeXOtPgkwQRxWkoqStY5KsFUjaR99+GvFEc8YZD9R3U/3SM/l6itsNXxT4P8AiZJAco2DxnuD14IOQfb0r3Xwl8cC+PMUbTjO0HIPrycH9D9a8iph3HU+UxOWyjeUNj2NTTqrW1yGGRyCARnjg+xAP5gH2qxXGeG09haKTdSBqBCkUtN3Ubv8/wCRQA6ikFLQAhNUtV1VIkaWRgkcalpGY4CqoySfp2xk5471cZv8/wCf8818/fHPxHtuUScTmKMwvp9rCkjLqF4WYoJ5UGwQ2zqn+jyOgZiZDuUIK48VW9lBs0hHndjrdNuc7tRvP3Qxi1jfObW3bhcqBn7Vd8M4UFwDHCv3Tu4D+2Xuby5nkj8oRJFbQIxBcKR9pmMoBISRt8QaNSdoVVJJBA9LstLc4ub0xhohvWJTmG32rl5C54kmAzmVuIxkJ1LN5Z4Vut8ZmPBuHluTnHAnkLJk+ixCMZ7D86/JOI8TL2aV9X+R9RltJSqX7IzPGerFpYbVSfn/AHsmO0aEKoOT0kck9ekbdgK7DfgBegHQenT/AArzL4f3P2iee6PCtlYf+uS5SLjsWUNJx/z0r0Jm44/z/n1r82jLVv5H1Eo9DO1RszW3sZmP/fnYPyL/AK15b8V5P9Kb2RB+h/8A116VqN6qzoWIVUt5pGYnCqu+FSST0AAOT/OvPPFXgzUbqUz22nyyQOq+W8kkEDsFXBdYJXEoU9V3hCwGcAEGtPqdbEr91Fu2v9Mn2kKbvJpepqfAWb9xde19L+sULfzNVNcvfs+oK3RJlOT9MMQR3O1pCPpR8FHdIr8PHJFIl42+KVdrqfstueRkjBwSCpIYHIOMZs/GexzBHcqMmIh+O4A/TKFgf94VGIpuM+V7pL8v8zam09jqvHE5FtKVMYARmLyNtjRUXeXcjkqACcAjI6kCvze+J37T6q9ykTSXYmjSN2VntLU+WJB/qoszzxjd8pkmjDHOVI2gfcPiqA32kXlujfO1s6Iw74AeMZ44kACH1z6cV+VnjDQDHFI5GCrKuDwcuSMfUYbOf64r7vhLC0Ks5VJ6y0VvL8zgx1SpSg+TRCax8dr+VI4zLhIgFTaDnhiykszO28HowII6dzmofjjf4A+1OcEEZ2nBGCD93sQD6ZHtX254b/Zg8PP4Re5i/wBM1h7NrnMMrPcRzoSXT7Mr4jt4PuytJHyoLbssmfzsltj6f5/z/Sv1z6tQk7OEXbyX+R8o6lZe8mz3bRP229Yjl80zQyMZPNffbw/O/leSSxRUOGjAVgCN21SeRur0wf8ABRKa4j8q8somB48y3Z43GVKn93IZEbIPqv1GePjXy66r4WeCPtt7bWZkEX2mURLIwLBXYHyywHJUvhWxyAc84xXJicmwWI1qU1f7np6WNIY2vCW7+Z+i3hf4lWsgstVtJRJCBDbamn3Xgd4FgkWeI8hJVRJkYqUdoGAZi+K9s8WeHPLhYRcRhgzQ5OxPmPz255Ea85aL/VkYKeWQQfzq034Najpdy8EiFS6GOQKS0NzA5wcMBh487Sp4eOQKRsdRn9CPhfqclxp6xThlnjh8t945dVUrDOAeu8KFYj+NWPevynijL1R9+k9O3Y+uwdeVRJztqeOvalTNMqnMN1tmAzys8YkhbtjzA89vn/nokAPHI9J+HN4vnqQciaJlU+u3Eqdh/CH5OD2x0rJ8CXSLfSQygNFeQpE6npuxIqEnry6rHuySGkTBBxlLHwzNplwiSK0lukvnWM/99AxaW0l/u3McZcjtNGxYdCBxYenf2WKh0SUrfc/8z0pTUdGfW+i3gMKscnC4IXliV7AHHPt7j8Pm/wCK1/fQTzrDaIsN2pkQTTqG8yAIsrIkW5Vd42jby2ck7CfUD2y38Vx25CEvIJgHtlhjeV5V2hsoFGAChBLO0ag9+1cH8cdQuJ7N2TTbxTAy3CSO1muFi/1waMXLSYeAyKVVdx+XivrcwoLEUHom+nb8DwaNX2VbyZ478OviY1tNOt5bPDGywM9xGfNgi5kjV7gqA0MbkhfMIKqRzgcj0r4mTAxx4IOW3KRggjaSCCCQQwPBBwRyMg8+Y/CfXRJqkoAJhk0/YVdMBnEgnKMjcH9y5PUqQcZINdT4q0FbZUhjJ8kM7wxnJ8lH2/uUJ58pH3FFP3FbaOFFfmeYU4Rila0rJ6bbeet/60PfW5yUMuLiA91uV/8AH4WB/wAa7Dxxcf6RKc9MY9gqD+WK4GOf/SUH/TzFj6rbMx/PI/H610Xjq9w103oJf/HUP9Bn/HmuCdNvkXl+bNGtTy/4manssNUOessJUdcmYWjHA755P+c18liJru4EWTgtmU+wJYr6AAAD/gQr6V8c6VLc2y2kePNvL21iz2RIbOCaaVh/djUZ68njuBXlWnaai31z5QxFF+6i9Socxox45LJBvY9WZycnmv1zJcK6ODlW6/Z/8BijCnJzqKl03YnjjVRDBsTjPCgccDAP58D8awNM0HasCty88qsx/wBlfmY47BsYHI+X8K27vSBcvMzEFIXt4V558yd2djt64WOKTk8ElfSr3hqDztUt4wOF+UDsNzJHjHtuPPPQ1vUhKhC3VqU392n4ntxnzyb7e6v1PryR1sbZp2A3/Z4reD1GE3HHfmQtIfUKK+dfjV4zPlpaA/eW18w9yfLaQr+Hmu2fXHpz6L8aPGYlmMKn93BleDwX/jYeygbB9D618v8AijxCZrnc3+035BY0/JRgV8jlODdSr7SfS7+7Y9CP7uClLdnfeF9SKwXZU4Lbo+O6+UoC+wyRwB2Fei3Wv+Xcq69IDGqf7tuiRqOncJXiWg6ti2uT/dkBP0xGf1ANdpqOqnY7H0ZvqcE/qa68bh2527v9InXTqp/d+rOYXXSzzEH/AFhuc/8AAbfePxGa0zd5t1PbyFI/795/xrzrw5qWXAPeZ0/7+2hH8xXV+GrnfZp3/dMp+qBlx/47ivaxWGVOMdOsfyf+RwU8T7STS8/wsVfhje5ide6SN+UgDj6c7v8AIrk/HWlbZWOPlkGR+PDD8P1yOlSfD7Vwlw0Z481Bt93jzx9Suf0rtfGGi+dGcfeXLL6nH3lH+9xx6iumUvq2Ku9pJf195xxSr0WlurnjdjqLo6sDiSM/Kf7yr/AffHufXua9Mh8fpPGFiiaZ2XDp0VM8YdvryMc4xznivKNUjy+wZwRuf1yoPyr7leO3v3rv73wjPp00DoN8F1GkkDjOy5ikGVcHosqk7HjJBRxjnqfexOHp1IqbSckrr/g/oeFQxEqUnH7OzOb1/wAIzRkeYdqnkbORkdV3ZGSPfOfxrtPgZDp6ztBfwo9vdgRGc8S2khb91cRS4wiZO2TgjGCRhWz1k0MdxGePlPBB4ZHXIIIxlXU8EEe1eYeINGaFtrfdPKt2Zff0PqOCK4MNjpVL05aSXTY7MRhIQtUWq7n0/oWjX/ha5MwDXekyttuGi+X5eAkjgfLb3UYOUk/1M4yCcEbfXfid+zHY6zbpfWEiRtON8cyL+4mLYDJdQgZhmB+Vyu1lOSQ/WvNv2b/2uLVbI2GoNCs0Ee23nuZFjt5rbgfZ7o7JWMsPCoEikM8eBtBjYtyx/ars9Kmkl0q8Xy7h1F1p0FncS2JG795cWs19JCY7hedgWBYWHHAwK7XSqTls/U+ZrY2NN3i/VGHZ/CO7sZ/sN0ptZ3P+hySNmxveOIorrG2K5PAjZjtk4R1jblvJb7TpLS7CTRvBLFKPMjlGHCO20n0KFTkOuVbHFfXk37c2k3UZt57yZrZz+9hvNEhmj57j7PeZUr1BTDK2CGBANXL+xsNRtGhSe312GNW8iW0ZodU08bSYTJbXTC4ltkcKrSLKzAACUOBvqJYflvJxautTow+bJtRk+uh866pJh4z6uV/76U4/xq0D/n865zxBq4aKFwc4kTOeCCMhsg85H1rpK+LrU3GMX5tfcz9BpVOZ6dkznfHn+oP+8v8AM15l44myFcdSsTD6gbTn8sV6L8RnxCB6uP0BNeYa037pPpgfTz2FfS5VG0Iy83/X4Hh5lK7a8iGCLA9T3+p6n6kmui1qPYEhH8AzJ/vvgsM/7IwvtyKg0V1WQM/KrlsepUZQY92xVaaUsSx6kkk+pJyce1ehOTcrnDBKMbIaTwfxP6f4+9e0+DNaaOWJ1IUyeWrbtmCv3ypd8CMn5lyGXcSFO7dXjQi4P+eKLfxHK8QjJGzAU4XDEAgAFiT6Z4A5r3cuxlOjTqKfXb1OiNdU1JPrt8j03xd48NzcSpCxw3mnzB/AEQuFXjOcLg9hzwTmrfwgud4WLy2nZCZGibcVkiT95LGzKQ6oyB95yNqknPFc/wDCnw4XnwFJ/c3J6HAxaygDIHrj8a9c+F/gsxfMJVSQbA65PmSxyiRZUjAGPKSNW81ied6KAd4NeDi8c8diYUpPqrLtvr+BvGVWpepLbbr1PSY9JXyVjACgKNoHRe+1QBjCk4HsB+HkejW2xp4u0crBQccbgH4x/Ad2VzzyeuK9uH9fz6fgef8APBry3xVGEu2GwDzIwd/94jkqe2YwCRgA4Y5zxXqcU0r4FeTR7lJ8koL5fgYXip8QyfQf+hCvMbqfCP8A7h/PpXonjmfELe5H8815NqVzhG79vzYCvz7K6bcV/iDHzST8kfpd+wbpP/Epll7y3cnPqIYokH153Cvp/wAJ6ykYcOcc7l/LkfUYFeS/sf8Ahow6BpwIwZYnuDxg/wCkytKuffYV5969KvNMyc/5+v8An0r9kwsOSlGPkj8drzjXnNN7tnoVjqRZQ20qD0B647EjHGeuPTHToLH2o15mLmYcCRgB7/8A1s/nS/bZv+ejfmP8K6OQ836kf//W+uf2ifAKTRwXe0s9hKJyF/jgIKzKy9H8klblVPG6IkYzXG2tqOCOQRwRyMHkEeoIweO3p1H0zc2oZTkAjoQecg9QR0IIyCO4NeQ+Avh4Fu5bNz+6iAltj3e2lZhHGDnObaUGBiOiiLoWzUYHEeyvBvzR6OGr8qtI5n4QPbx3dxaTqpQhZYC3G1bgsX2rwRGJ1ZfMH3S204HXov2hPh7Bb6ZfziR0CWs20HDZZ0KRqCedzuyqo5JyKg8UfCQtc3TwsBJCLYQM3JAZZWZMjG6KQuySI3JwCDuRDXDfGXx+0tn9nnDRvBHdl45M8zrbkWqknAkUhppIHGQ/ljgOhA3q1HKN0z0Yp1KkZQfVXPE4dSldEBJHyKMKcfwjgkZYn6t3PvWvpHhFmGcfzz+Y/wDr/wBRseHPBjfKCOw+nQA+mf8AP4+//DnwCrjZxnAOeOMHoep5BPbt+Nd3tND9CxmMp4eleNtjxvWvDbQ7Vcht0ayIwz8yuO4PIYEYIPX+fNSw19EfFXwKRtAGQsahSB12lj+Yz09Pxrwu7hyT2I6/449K6KdS54tKft4c6MF1pharssFEWmk/5/8Ar967bhy2M8tSqta02kMADtOD3wf0yMHH41nvBimmC1BFqzHVZTU0bUmWidjTDQWphkpWAhlFVy1TStVdhTSEySJ+a9i+DFoJJo1boTz9Bk/rivGFr1X4OeJBFNG56A89+CMH8utZ1l7uhyV7uDt2Z9h2iED19D0z25H0x/8AWrlPiN4glgVGjOASwbgHsCvXp/F/kV1ltKCAQQQRlSPQ81i+OtDM0DIPvcMufUds9sjI/Ht1r59fFqfE0WlUXOjxLVvj1Ovy7lHuFGf681Tsf2gZh/Hn/eAP68GvOfF/h51Y8EcnjHp1z6Y/xrljpLj1/wA/5/HivZhRptXPrVh6TXwo+iof2hJD/c9+D/j/AJ/CvWPCHj6O5AwQHxkp39yOxH6+tfChd0POeP8AP8+PzrqvCPjh4mU7iCORjgj6e3XqOf5RVwiavE5q+Apzj7qsz7qV6U14/wCE/j3CyDzQQ3cjBH5cEf56V18PxVtmHDn/AL5b+n+PFeXKlKJ87PCVYu1mdRe3qohdiFVQSzNwFVRliScYAAJJOMV51b6oJib6bMVvGrfZUk3JhDw15IhwfMmX5YUYb0iPQNKQvHfHHxrbu0KXU8kGm+U9zM0YcG5lgkQR2JdAWQDPnPEMNMNijAWTOl4C1aW+8qe7iNuCXewtJOHZEIKXc0eWbzEUrtRwBGTvI3Mm35TMMTJy9mtiqdJxV2ZfxdMs9lM8oMUMgWG2tmBEkslw6wxS3fcKhcSLaj0zJuICL578U9Y8qBbeM4ef9whHBWJFHnS/hH8oPHzOvJrvvij42jlnit0O5Lcvc3Mg5jDxDyoYFcnDyCSQuwUtsKKDg8Dwi0vWvboynhC3k269hDGx82Qf9dZAef7qL1GK/G8/rqVflXRfifZZVSfJzPvc9N8B6b5dugxjd82Pbog+gUAAVranq6wxtI5wiLlj16EYAHck4AGeTUoGOB0A4HpjivNvjxfkW6IDjfJk+4RSce/JB/CvlW9LHs2u7k/wgun1TUZZJRss7S3jby+P3kjTO8KyseoQoZmQfKWWLOQOfRL347fZZkjuMSwSErHOo2yKVGWaZANvldB542qjFQ2AwNeWfs2aoFstSK8M93FCfXatrG+Pw3uO3JPtWrbWO6eaQjICRwKDyNpDTTDB4PmMyhhgAhADX6vgKao4enFLdJvzvrqcVLCRxMpurtdJeWh2d1qSS3d8yEFZGtj7/NaqnI65+X3471maZaia2eFxnG5D9YyQM/UYOPYVzPw6sDFcXkAbcgW1khBOWjR1lUQlurKhQiNjyEwpJ25ro9IuPLupU/vqsyj1xhJR9c4z9fevznMdMVO52xpeyjyLpt6HlngLUDEZIHP3Q8DD0xl4GP8AwEgcehr4s/bS8OrGY2RQondZH44LKHRiPQksCVxySDX3B8TtB8m9VwMR3S4B/wCmiZkj/wC+l8xOvJ2ivIPjl8IzqYhtU4mljuhak8AzwwrcwxluMGQxNHn/AGie1ejw/iHh8yp3ekt/n/wTLFxVSg/T8j4W03WrqxJNvLJCLiFoZWiYqZInCl4mZT80bqVJXoRjgYrlTbkkD1wAPr0H454r1nwlbxSoLa7/AHTIxjyeGjZCQQwxlShJAPpkHgDHYn9lmd1329zbTpwQ2cH2BCM2T+Vfs7zCnTbjU0d99bPtqcbwPNFSg001e3VM8k1H4OXkV/Fps1uYbyV4Y1jmZEw1zs8rexJVVZXVsk8A8gEEV9m/CX/gmhq9hq+k3M6289ql2jXTW8pLRKquwZldI2KhgF3IGwSM4HNeCaj8HbiCT7RfTBnXBRi7MNwGBI8jku5jGCijksFBwFxX0z+wJ8XdS1LX47Z7u5lsLG0muDHLI7KW2JbQNISclg8pdVYkAjjpXZh8Yq0rQ1VtXsv+CePmOBdCl7SbV3sur8z7gh+DieY63CLIqMrW7sAchgwcEcjDKdkiEYYYPYGk+IXgoLEk0KfPahv3aDmSBsGWEDuy4E0Y670x0dq9XuDk8/h/n+tR7B/n/Ppn9a8DMKMMQpQa0eh5VLEThaz2Pzx+LWlmK5jmiPBR2hkUZXY3lzqWxwFyu9WJ2rIq5IBOPojwBeQatYr5gwlymeD80VzCSpaM/wAMkUg3JnGVK5BDYrB+PfhkadLbXYH+i/a13DGVhF0WiuLds5XyZBK0sWRtVg6HA8uta28AJp0puLYeXp9y3+nRLuIsbocLewryEtZuEuY8bY/klChQ2PlcswUqEJUp7JtJeWr/AFPqK2NVWlF9+vZo8A8eftgLocLae0X2y9s5mjgljkAtvJOJE82QbpAyFtht1BK4Cl8KM/OWt/8ABTrXHZsGyRDkeULUMu08FCzu0hGCQcsDz27dr+0t+zldz6klrZxiW6vmkkghDKMwx4aa+eRjsjtfmVY3d90rk4VFCivhrxj4Zltbie3nQpNBI8UyHGUkjYq6kjIJDDGc4PXJr7rL8NCVNcy37/ceJiqjTvF3sfY37NH7S0bSwLP8ki3AMw2kgwtaG0VoWB4SH5XlidNwTDq52uK+rPiZNmYL6IPzJPv9OR1HrXwT8LPhy+m61paTfN5gtJJFK4GzUIAHhcHIyolZD7enSvuDxxcBZ5P7sQC5JPCxRgZJ9MLknrjr1xX5fxbhadPEQ9kt1+tj6fLas6kPfPPdAvg17tz0eeU89kaG0Un2ysvP+yT2rZ8Y3P7qZiT8+V/7+uEGPQkvj/PHkHwI1hp7u8nP3fJjRATyBJPLJ6dWwzH2YV6pqdyDJFGehnQt6FYUa5bv/DsTP+8M9K8bE4R08TCn2jG/5/hf8D0oz5k5eo3wJIGubllxtgklT/gb+WmM9eIrdR/wMV8x+FLrBupW6blP4IhLHP8AvFv8mvq34a6Nstl4+e4eW4k6Z33DswyeSdqFFySRgZHXn5n0vw6WWG3HDXTwxk+z3M6SEem1I5M9fXtX9BQypUcHQoLtr6uzPKw+ItVlL+up0174FFvp1lOcrNNK81wP7yzwySQo/fMCBdn90u3rzxHwR1EDUfNY8Ihk/wC+XLj8yoAx/Wvfv2koQtgCowI5osD0V1eID8Mrx6A18xfDpSs0vb90n/ow15PEOGVNzttyJfkerllV1Ek/5m2d3r2qERyOTk4Y/i3v7kmvEorjMjn0wo/AZP6sK9O8dT4hI9WA/XP9K8ktH4J9Xb9Gx/IV8xlVFKlKXd2PYx1Z88Yrax1nhe4zFfJ6w7vyVl/oOa7O+v8Adalx3hB/NR/jXn/gq4HnFD0likj/AB27h/I1vaDd79PYd0Vkb/gDgfyroxdJXUrbSj+Kt/7aZ4eq3eLfR/hr+pwemaqUaT1SWGUH2QEOPyNel+AJ8rNEP4JWK/7so3D8PvV5hDMod8kDO4ZPoApOfwPT2roPhr4iAnC7gd6mM4P8SZ2H3yBgY65H0r0cbRc6LaXRP7rfon955uErpVLN9Wvvuc/qMpSRWXh1Y7f95SHUZ98Y9817jpWoLLGki9HUEe3qD7g5Bx/jjA8K/DOO81NbOQmMTrOYHGfklFu8kLsB1USLhlPBUnpgYq+FY5LWeWxuAY5EdgFPRZBy6DsUkGJIyMBgeM8E+fjaar4eM47pX+XU6sLV9liJQls/zMD4geHzG29RhWO4ezDkr+IzgfWvrr9kjwtbazo0+n3KGUWUpGF/10cN3ukguLc9VaKQSpxxgKGyCRXh+s6QsqMh/i6exHIP1/occVD+yp8ULjSdTMKOI3u42sNzkLGj3LKLO5kLcbYJ8Pk9QWH8VXl+Jdak4/aX9XOHN6cqHvw2f9M9V8W/C7yjcCSeGOW0WRI7998VprK2gBlSV2BS31ayjxHIQzGd1YES7WYfHPxC+LjT5jiUJF6nBkb3J/gGey8+pPQfdP8AwUg1RLK0sNAtWYxqoubzOCzsuVidycsJLiUz3MmCMsVPeviib4DTjSptVYFYo54oY1xzIHZllmPpFE2yPOOXY4OFNe3gsNSnP2s1eXQ+QrZliFR9mn7rPJg5P/6/X/8AX/X6TJEf8/y/z7VZTTS3Qf5/z/KtK10cdz+X+J/w/OvqI03LY8CzerZ6n+zJ+ylfeIJLiOyaJPsyK8rzOUXLkiNQEVmLOQ2MKAMEnHfjNS8HX2nXtxC6yQXdhIRM0bENEQ4QSLKhBCMWUBwcEOufvgH2z9lH48xaENRnT7Qt5NbCOyeMq0IkDEkXVu/ySpnaVbBK4O3BYkcl4D8eS32vwXGoSFzqdx9jvn2qA8d+PsrfJwoWMujqoxtKLjBAIdeiox2FG6d+hiDxU0tqFf8A1kbHJ4+YEFtx/wBrOQeMdK9Y06fciN/eVT/30BXl3i7wa1qZon+9FJLC59WhZ42I/FfavRvCxzbwn/pmn6Cvy/NIRdNSj/M/xR+vZTOTtGf8pzPxNuP9Wn1Y+3QDj8DXB6vD+7gXuVQ/99yNJ09ga3/Ht7vmcLzgBF+vf/x413fwZ+FcWpX720rFIorZlDg4YShUhgZB/EwmJcrghkVvw9PBRVOlFeV/6+8zxV6kn9x5X5XP+eamjj/+v/X/APVWprmhyQSyQSjbLBI0Uo/20YgkZ52twyk9QR1qpBBk4Hfgf59up9s10S7mEVqiZotseT1Y/kqcsffLYH/AT1qj4ZssqvHVR+vP9an1u4yGx0VNqfntU/8AAmyfqe9aehQ7do9AB+QrnqScaT7spxU5ryPdvgbY4WQ4HENyc9/9Vt9+mc+2K1tJ1ZIHZ5EbAU7XRdxIcruRhvGNmwbSq/NvbJbFbP7OmqJDDcyOM4gfbxkEs6ptx33kgYyO/NcJ441MsI02gbVOCoxuyScvjG489TzjFfDYTHVKGOlUhbTTU+vp01KnytbJP1PSNA8cwXDFY2bcBuKsjIduQCVDfewcBsHjcM9a474pqyzW8glUrveLydwyjGNHacLnO1kCoXxgFQucmvOlimjZZYwytGdytgkA4wdw7owyrL3Un6jI8feMluZvNCNG3lqjg8jKAcIc5KBt+CfvDHHBr9Fr5mswwjpytzXs7HFXTg4+tx3i/wAR+YpI+6ZMJ9EHJ6fxFv0rjbXSWuZYbZAS1zPDboByd00qICMc8bs49qn1yfAjT0XJ+rnOf++dv6dK9t/YF+H32zxBZs4JjshJfSY6boU8uAZ/67yIw9lNceW4aKlGKXU8DNsU40pvy/M/XnSNASCGKCMYSCKOJP8AdiRY147cL09c0+SwrRSXP+ePTj8h3Pan7BX6GtND8oUmtTDOlUf2TW55Ao8gVpzGntmf/9f9JEk7/h/n/Pr61x/juJ08u7hBaa0JkCLjM1uwAurYZwCXjHmRg9JYk9eepjkz+PT69f5GoJX4zzkdOn9fSvBuCauebyfE2GW7MlufMinsYZZDyHHlzOscnlkZICysr4xtIUHHNReKdKhuY3inQSwyoAR3xkSI8b4yrIwDow/iHIIJDeP+PNL/ALL1Hzoi8YnBksJAjyQxYLyXtjNHHl/s87v5+FVio+ZSpjFeq+FviBa6jbmW22JNAdt5boysY9xJ8xdpG6InLK4HQ8gEED36DU6aPaptJJrY6P4a+ELeeNg+TLA5imIOA+AGim2/w+dEySEdAzMB9013YsYLNGkC4AGOWJLeigHufYDjr0ryb4f+LY7e8vQ5PzwWUm0DJLA3cZx2yUVM5I4APrW/Z64bu5jLj92GyqdVGQcZ4wWYjBPfpjGc1G/U0dOrNtyb5Vrr18i54s8WpJEFAYZBOB07d/w9q+ZfGNsyyFlGOT64Oeo56+9fbV14bicbWQFecDHrycY5H1B59q888V/AxJMmNv8AgL546Yww/qM+5raE7HqZZmVGg+WSsj5es7JpBlee2DwR659fyFdt4O8EtIwBXrkD3ODgficD8a7+z+A8qEkBB/wLr+P/ANau58L/AA9kjZS5XA5wCTyPwHPpzwfWuh1tLHXisdRabpv5HmnirwkyWyoQciVmUY4AeNSQOncZx6kmvD9YiKk5BGOO/OMe1fbPjCGN42zg7emCAc9Md+eK+ZfGEqKxBZQOeM/p74rSjVfYxwNX2i10PKhdr61NHMPX/P8An1rYudRtz/CCfZf64H86zpPJP3VcfiB+mG/pXoxlfoeo15oVB71E6EnirC6eMVf0/Rie1EmkZczL+keC5JI3dcHYoZhxu25wWAzlgv8AFgcAiub1LTmXORX0T8NvDHCuOo4I6ghgQykHghlJByKx/GvwwILnHyjODjsOnTvgqPrXOq1panN7b3rXPnp5cH/PtWpoer7GBzS65oRQng1jJGR2rt0kjoPsb4M/ExXQQyNyB+7JPGP7h9+Rt9enYZ9gU/5/xHp/kV+fOg688ZHX2r2rwt8e5lUKx3gYxuBJHtnOfzJrx6+G1ujwMVlzk+aH3Hq3xB+H4dvNRck/6xcdfRxx9NwHJHPrnmLz4XYQuUAOMAcd++fboB3OPTFbmhfF5pCBsTqMnJ4B9u54456+ldR4v11REdpG4jI5GcdyCeMg45HIAz2rBOS0MoTr0moNHzH458HJDGS5xISNkY6hOdzyDqueNq5DHPSvJ5ZAD6e3+f616N47nZ3JG4k9+c/n69/y61wk2hv6fp/9avYpPTU+hgml7xFba0R0/mf/ANX6V6R8PL1nYZzjPbk/X1P07159Z+GXJHH+fxxXsvwy8LSKRtUlj0AB/M+g9zxWdeUUhzkoq56Pe/DeWa32hgCksVxECA8bPCwYJIhI8yGQH5gCp3KhzkVT0L4eTkXF1e3NxM21t0cSJCXiQFvs6FMypCxHEaSIZGJLsx6ep6fIYLfMn8AyQDk9umMAnngKAOw6VxXxN+LaQWNzKhCyCMLCGwB5sxMcZz6I53N2CqT0zXyGOjSjCVaS2T1/4B8xzzrNqK0vufJHi/x81xvERRRcsIbYRDEUFtAnz+UBjckTPMxc482aQEYG1a9B+HPhkRgPjAChIgQMhAAM8dMgYHHI5788L8HvBfmn7Q4PlhVjgU8ExJ8wJHBDXEmZpB1xsHavbwP8/wCfyr+ZcfU9rVlJ663fr/wFp9597TiqdNQSJAa8y+PVvmCNv7smD/wJSB6Y6V6Uxrifi7eotnKWGehUdDlfnyPoFNeenqaxWp5v+zPqXy30THBknW7QE/whXtX49tiH/gYODmvXLJMSyKfut5bj1OQUfjrkFQeOvH0r5r8Kam1o0E4G7ywDMg6vDIo85Qe7gESJ6sijjJr6P1bVEVYrlXUx/KN/QPFPt2sv0YqwHH8Q4Jr9Vy/EqrSS7aFQtHYw/heF8+TOftMq3Ausk8ta3jJCo7BEtpYwqqR8uDySSdrx5IYfJugMmGTEg7mKTCyfUL94cdR7DLbTRkTUIJwf9fDPDIP4XZBFJHKO28xqY8jlkCA42iur1LSVkR0PIYEY/Dj9e3pXxWcU+WvzIi9pGR8Q/DJuLRtnMsOJoSOSQpVxj8cHr0JrzC6ugsmnXI4Vb63yecKtyHt2Bx/daUL9c1698IL8+X5L8vbN5T57xkZiJz2aM7eR/Cfw4D4ueAniS8t1PIX7dZehEMizPAfULKmcDkCQEcgVxUbxqUcQtlJJ/P8A4Byqp7zpPrsZXiD9gLQrlnkYXcUjMzForjqxOWbEkbjOeccDFchqH/BMSwOTb6pfwnsHWCUe+doiY8+4r6Ni18GES7JDIwRygZCEVwGJBP31wQ3BGeDkcinaT4tLcEbSDtYYOUbGVBBwQsi4KN0PTOSM/tsazSSevyv+Z5ssLN3cWfIGvf8ABMbUSP3GrW8w7CeKWI+3zKZ1B/D8a9S/Yo/Zt1vQbuVZYrJra6I+13CurzERhvLWFgySKm5ifLaPblievT6d03VM4547f4/5NdPpt5nv6Vr7VxVo/geTiIVNpO/rqdFH/n8v5f59zJtqGKTNT1gzxmraGF418GQ3ltNaTrvhnRkkHf5uQykDh1IDqezLnnBrzb4WahNButLo7prUrBO5A/fwkEWd73H7+JfLlBJ2zRyg9hXsjiuf1vwskkkcw+WRAUJ7SQuQXgk9VyA6HkxyAEdWBxnHqjelUsnF7H5bfFz9oS5svF89xZKTFbyRaTDAgB3wqEkubeAMCsZluGYoQpCSFDggYqz8Nv2F21uZtTkmSFG1mQXtjK5e5it4rgvcpcXDEE3PykFGQZXLZGAK5Dxl8LRe6hq6pcKs8OqXUyOGG5kdzhkyVyFUAHGCrY6c49j/AGD9Njs/7X1OXdJHbqmm2igl2uLiU+ddCMHh5nJt4Qec7mJwC1ejSxsI/wDbsdfw29T6CrhOXDpq2tku78vkN8c+ABLqa3/GJtQg+wqQciwtrmOCOfBxtFw/ywgjmOOV+4NQ/H/xcIoLgk4a4laFPrIzFj0/hiUgY746jFb3j/4kxm/s7Yskt1Jdwy6iUIMVqsbB0tVkX5SbeOMIFGQMyO20uAPmj46+OxezSeX/AKm2LeU3/PSQMHkl9AoKiJT0wG5+avzmdGpjsZCpUXupuXyukvvf4anr05KjS5Vvsd/+zfYAQ3MvQPOqH/dt4hx9AZGrYuPEas90+5f9GtmLY6LNfttUEn+JYEiH/Aq5y38RDTtItQwzNcqXCdy1wTK5POeEZI/x7dK4KOSQWM8TH9/qF0ruR12QxK2V4+75rxKvbAOPSt6GHVTFTrz25lGPmotJv/wFM1VTlgors3959hWVqEVFHRFRRjsFAX06ZH614poPhNl1Gy4+WJtTzx3hnkkh+vF7kH0HsK9d8L3rvChkUpMoCXKEYKTRqFlU/wDAvmHYhlI61AulEXQcYIZZ2GP4WZbRWH/AvL3duvev6QjyVYwnHVWVmfPptNnE/tISk6fLGASXZGJwW2JARNJI2OQowsZY8AuMkAk18w+C48Tyf7UIP/fMnT9RX3t4V0RJ5blnG6IIbIggENvAe76+xijyOhUjsa+Irnw01pfNA+d0RntznvsIaM/R41DD2YV+f5zWWIqVIroj6bL6fs+Up/EJvkUerZ/IdP1ry2xX5FPtn8zn+tepfENfkT23n/x2uL8O6ZuifjJEGR9cqf6Gvm8IvZ0Ne56eJ96tbyMEaiYyko/5Zur/AFAIDD6FSQa6i21hIftsbEYI8yLH8W8DAUd85B9hXIyR5Uj1GPz6cf8A16r/ANogtbuRnylCzZHUK21G9/kK8f7Jr1PZKpGz/q2q/wAvmeZOpKlK6/ro/wDP5FW00/c2+TkeYqkEYADjgkA9enHsa9M1f4blNNh1GFSu27nt7kr/AAPH5c1rIP7odS8Z7ZC+vPJRW2WmX+8FIPuAQD9cgV9Xfs/G2n0G+try9s7G3uLqWOSW6+coxt7eWEwRCRCXWeMEPh9oBIVq6Kk27JHBJqmnLTq7nOfBPUtusaLcuNubyO3uAcH5bpDFz1yrCXKnoQQehFfSv7ZX7I7XDfabUYuY8CHkATpGSRC7ZAE8eT5MrH5h8hPTHxv4N8UobO2n+2WzXNnPHbvAPklMdnKs1leo7N+/U7fs5YIpWNYtwOCR+0AWO4iUkBo5kSQA/wB2RA4x/F0PBHQ+nby/ZypRcOzdvR6nLisfapCtHZrX1R+Oug6kZAyurJNGdk8bDayspxkqcEdOR25+pkb4XpfyrECI55AUt5GOAZlBeGJz/dmw0Qb+BjGe3P3j8dv2RorpvtEZ8q4UfLcKuS4HSK8jGPNQdPNXDr1B4xXyF4g8L3FpN5cimG4iZZIznKlkbdHNC3yiSIsoIYYI5DBWBFfN1IvC11Uhs391/wBD62jiqeOoODabt95u6R8I5/EDJLPLINUiuLfT9XglXDxBR5UN3EBx5H2WJnZ2JL3G/Hylc/ZX/DMENzYX2nMoS2FtJaW4+6N4T9zMOMHY+yUnu7HrzmP4QG1vnh1mzwlx5Ztr9V+8oOGls7uMcvHFKBJbT43oACNyOyn6T0647dj+Iz19+/T3x7mvtcHVgn66n5djZSi+VdD8i7X/AIJoX8WjzahdzxWs8MDzC0dCzt5SlijurYSSULlFAc5KggZ4+Xvhy1qLm3e8jkltN4a4jiYLK8ZHKxvxtY8c8Y9Rnj7f/br8SanY660LXM82nXcS3NrbvI/lKSfLuYoiPutFMomQDOzep5GRXjNtpGiP+9uDJbkktIqqVUtnJO1A0aknkmPaCckBc4r7nCqMo817HLSi2rnhj+GPOuZEtUfymlcwIx3FIix2eY44JRMBnwPXjNdU/hLbqelWkGWkF7Zpnv5r3ERA9QVA3N1wSc9OO68X/H3TraM2+k2zb2+VrhwNx5/gBLMTycEnjsoOK6/9kD4B6tPqlhqUtnLHb286zb5AsIbKt84M43ynnPCFvQg4auTH4ilCDSd2dMIOSOF/bB0Bra+vYGcOwup3dgMDdOEmZRznCmXaCeuPwFTSbgJaxt0CxKfyX/P51H+1L4m+36revD+8D3l35ZUdUtyV3/7oSItn0GaxvFd15dpEmeWVR/wFVBb+Yr8wr0+aEId5N/I/Ssvm4x5n/Il87HHafMGlQnvJub6D52/T+dfTX7H+kjybzUeS4vIrfI7wMALgc8Eb5o5AeOYsZwSD8li9w24dVVlX/eb5f03D8q+//wBlnwuY9Atlxg3c5kPHOJboKrDrkCKAvyOnP19SrHkpt+i/r8DnVa8vmzw/9r/w2ItVZgAPtFvFKwH99d0LH/gWxTnv1rxsLtXceC+VX2HG5vbqFB9zXuv7a9+G1UIOsVnEp9jI8kmPwVlP4+1fP2vagXIHQlQo9lUfM3sT+PJNRFSnbT1LlNJN/cYt5dE7QOjOCf8AdUhYx/wIgt9B7102lz1xf2ncQw6M+B/uxghfz5P410WnzdB+H58f5/H1rXFw93lObDVXKR9R/D5ttlOfWOFT/wADnDf+yVWuJB/+unaE+2ym/wCulsn5JKx/pxWPJdcV+Uzg3Uk11f8Akfo1CaUbeSLFzcgA5PA5Ptjr+mc5zxXhuq3AklO0ABmwAOwJAz+XPtXb/EHXtke0Hl+PoBjPHv0/OvNLCbG9/wC6pI+rfKv8yf8A9VfW5VhnGDm+p4+OxCk+VdCDWr/dIxHTOF79OFHbnAH5ivvz/gk5p0Jj1ecEG4E1vbFe6wBXkBHP/LWXdk8D92or867y92gk9sn8e39K9s/Yg+O39iakkspb7JdDyNR77Vc7o7kjn/j2kO5scmIy46ivvMBFU3zP0Pz7N6jmuRerP2wik/z/AJ7VYSWsaC8B5BBBAKsCCGUjKsCOCGBBBHBBH42o56+osfI+zuaYlpfNqiJqXzqViPZo/9D9Dkl/z+J/z0qac9+3f61geF/EaXEKTIwIYDIBzhhwyg+x9exHJrcgbse+P5f/AF6+cTJZw3xb8F/a7VkU7ZoyJbWQdUmi+ZCD1CuMowzhlYjvXyzqPitkhe+tdtrexZUuEQMk6usckM64xPExbHlybgyMpGCQa+07tOfp+GOR+P5fke3xx+1P4Ta0la5Qf6NctG14gHeBw4kXsGVlAcEEGJs9YwR6GBxPs58j2l+DPVwE1zqE9m7MXSfFksk8s03l+dMyeYsIYQosKbEjiVyWCDLvyeWkbsFx9e/BllNuCOWLEt7EAbfYYHPFfm/F8T23AogA9Tyf8Of/AK/evp79nP43Kp8uVvkfrjjB7H6Y4OOo9cV9VUwk4wuj7XNqVOdFQodPxPslRSstUdMv1dQyEMp6EEEH8c9cdePX0p99qSRqXkdUQfeZ2CqPqzEAfia8WT5dz86cXfZk5H+f8/4VU1HUkjALEKCQMn1I47dcZNchffHjTE3f6fanb12yo34AqSDzxxk18/8AxG/aNjkfMbqyITs2lWA784JBY8Ak9M4rTDtVXZNfed2Fwkq0rPQ9X+KetxoCysoB5ODkt36Zxgnvx26V8k+MfExZyfr3/wAP/r1l+KfjG8rZJ4PB6jHQcfl/+uubbUfMOeuf84PvX1GFw3Irs+pjQdGJvWExboK6nTtPY46/l/8ArrT+EPgf7RIiHADdyM4xntnrx0z/ADr6ZtfhTAgA2nI+8fX3Gfxqa9dQ0IlWUHZnjngX4dC43gyLGQAVD5+ckngHgDHfqeRwecbrfDqSE7WXH93uG91PRh9K9AufDcUYOAT+XYj2OKsaRrnHlS/NH/4/Fk4Dr/eiBIBYZKHgjpXmSm5MTqSj7y1XYp+EI2iHPHGOvp7fjU2veJ1KMvJx/PH4/r9Ki1TQpY3wfuMRsk5KkH7pJHC+h/wrFg0FncKwP+sCSDHTOcn6cHn6GslZkrkk+e55j4oj3MSep56ev+fw/U8u9mPpXoN7oLGQr6E5yMYC5yx9gBn/AAyK5G/t8H27fT/9XauyEj06c1YxhB7/AKVLHx60SmovMrRt9TtUUzotJ1xkPBrqJfGsjjDEEYA57Y4GD29Pp1zXniz1atLzBrFpCdBPU9t+Hfw5FyC8h+UNgjoxPXOScYFdy3wRtz/e/DH4dRXDfCPx4sZMbkBXIO49iMjJ9jnk9uOle8W14G5GMYGDnqPUAdvTmuKpOSZ8dj6lelN2ehxNh8GLZTnDH2JA/kAf1rtdN0lIwFRQo9gKsFxXNeKPiFDACM736BVOecfxHkD+fH4VyOUpnl81as7as5341+LRDCq5ALnJ/wB1ef8A0Ij9a+ONe1KXVrtLVf8Aj0tT5l43Z5JFxHb5yOFjJL47SberV3/xk8XT3DIiL5lxcsY7ZMkBcDLyvjlbeBPnkboTtXOXFdD4E+HkdjAsKfMeWlkI+aWVuZJWJzksT0HGOOg5+A4uzeOHofVafxS3fZf5n22AwnsKaT33NOyswiqqjAUYH65/z29+KmJpzLUbtX4LJnsrXcDJjmvD/jT4l81TGhyGZIYz2ZpXCsQPTbv9eFJGa9C+IHiQRoUBwzAljkDag6sc9MjpnHy5NeNaBphur62JJEce+VE7bVAQTOp7yFv3YIyqrngucXh4887vZa/Na2NrWRqeP/DawtGF/iiViuOVYDBPXGDycHHOfUUnw48eRQlbG7Aa2uWYW+8ApFJkSNDLnIWCVjvjZjhJAV+UFNt/4o3G+5buF2qPw5P/AI8f89K86urMNMoPzbY5NwOCP3uE2kcA7lV+O4z+Pv5ZXdOfN01uvyIaPp3xWPLNo+MeXdRr9FnjkhwcdBudR06gV3Dw4bI6Hn8+f0/CvlSL4ozQ288MqmeGA2zRybgZosSRyASBhtmhi2jD7vOVeu8DNfXKLujVgQdpwcejAFPr6dOgr0sySq2mlurnDWlytM4m9X7PdRzjiOUCOf0AJ+SU+0Uhyf8AZkc11HxP0QzwCRAHntcvGB/y1hK7LmHPfzISxA6lwp7ZqDxFpXmRkegJA9RjDL75HFZPw78Ylf3DsfMj/wBWx/5aR8hMn+JlHyN7j8/mcNXVKUqFT4ZapnNVpudpx3Qz4cW4ks7dlIZRGEB9fJJjGefRR/8AW7dFHovsOgHTsO3bI9Acgdqm+HeipbyzWqjEUzyXdmOwEjL9rgXn/lhMfMCj+CYf3Wx340YV+xYWSnSi79EefLHtXRx1np5zXQ6bCRWoulircNpiuxM4KuJUkS24q2tRxx1KKLnkSdxHaqk82M/5+n9Ov/67Un+f/wBfb6/WvM/h5rz3EEs7Enfd3aoc/KY4Lh4IvLwANmyMY9SWJ61HN0NKUOZnjvxs/Yc0nUHknQy2VzIWd5rdiyu7ElmkhckHJOTsZCfU5xXnvh/4Bto+m3Yv5vtVrp6XFzp6xM8CtJMrmWS7WMq8szMyou+R1VCQvB4+m/EurugJCs3BJA6kLywGSBu27ioPDEY4zmvnX9r/AMZodDuVDgG4littmSrKGmRmZs4ypVeQOQHX61NT3o8vTS59NRoysnc+B9B1gomIhl50f94f+We/IkkIx97qqAYIIBPQ1HPFGoijdtkbuqO3UiNfmlKqPvOy/KoA+Z3XqckbNpp4VxggpJkxkYIDrgsnHHzD5gB3DcV6p8MfglDeq8pvUhuIsh4Ws7mbZGWby5BNESNsw5LKoIb5SMjnzFNOpptq/V9PuO9xstTzqJp9TvvmQo52R2MGciOEnapOOPMyCZD/AAsa9r+GXws8zWJEk+aCwbpgbT5IVVHHXzJwXOc5Cc9sek/B79my6ik+1QPazSRMViZ/tkClGXEqbJbfOG4w68I6jBb5s+ifDX4SX9jHL5tmJ5ZZGlmlt7mFy+SSqiOXyXO0EjbuGSSeprx8YsQ03Shpy8qS6en9dRKtSjvJGD4/0gxXKzj/AFd2Vjl5+7coh8qQ9gLiEeWT/wA9Ik/vjGdqMxUDYu6R2Eduv96SThAf9lcb3I+6iE9q9DvViu457VxJFIFAljkQxzQsxLQTBGwMh0DxyIzKxTAbBIo+AHgCSeWSe6C+bbO1uI15CMAPMn7fNdrh0xkJAwUHLvX2fDnETjg3g6vxx0V97f8AAMa9OK/efZOj8A/DcQwxqeVReM9ZXYl5ZXPB+eRmbnrn0xXyR+3B8PPIvLfUEXEczJHPjos0XyKzf9drckZ7mE+tfonfWvbpgcfyGPyryj41/DBNRsri0bC+ah8p8f6uZDuhl9flfGcdVLeuKJz1cn13+ZOHxjlPmZ+XXj+H5cf7Ln9Ov+JrC+HsHYjrAuf611/jTTJFBSVNkqLJFMvo8YKSD0ILBiMcEbT3ri/hpPkAH70abG91OGjYeoZT/wCOmpxEP9jbj0/zPq4SviIt9V+hyeuaaY5HQ/wtj6jgr+Y5rKslyzI3CyAD/gXOw/7Ib5l9iVr0j4jaNkCUdvlk9f8AZP4fd/L0584ukG4dcH5WPpnG0/gwHNXgq6qwT/rQ58ZR5JfO/wB42y1Eo4B+8MRnPfDDY3XqVbOfrXDz3skrvgE43vjsqrlmPsoHJPXj656/WbFmZW/jXh8fxNH8ysB6umT9VYVsfAeeKHWbXzgGtpZWgnDdGgvY2gbPTA2zDkHIOD2r6Shy7nw+Ze00XS/9M82gjIwQM4IyB1+v8/8AJ4/aX/gm/r81xpIke6eeEN5cSSMWNuY+GiDkMwQjGEL4XgbACGP5h/FT4FvpWpNaXAcxApPbuAMzWbudrjkDcoVom7CVDmv0C+B9zpvh/XLK10+5kbTPEVnHLHFOW3QX0efszksq/Lep5kOCMiRVGSoSnisM50+ddDxlVsuXf9D7qK9sf5PX1weo/GvJvjB8Dre8j2yKdoJKOmBJAxHLxMc5Vv442BVu4PGPXv8AP09vw6U4JXyNWkpq0jow+JlRlzQZ85fs2/DaTT7i4tZ1V+lzYXiAoJo3+WaFtpzujcLI0EjOEMrFSynI+jXbHp+Q9/0zz+fXNUzoyccdG3rgkbW6ErjpuGQwHDAsDwSKi1G6xnt/n/I+la0o8it9wTm69RyfU+Pv2/fCt/qslpYWlgsxi/0iK+3FZIGPySx7yUiiilAG7zSxfaCFyqkeJeCf+Ca7uRJq1+euTBa/OwAx8rTyARr7+XE3fnvX3rr+sbRk85IUe5YhR7fjwcZ5ri9cnkYZj67vwYBgoXPYE5bOeiDscV1rFVIpq57eHwScVc5b4Y/s8aTpzKLOxiE3aaQefcMRzlZJi2z1JjCAZ6DIFQ/tOfHP+yrCVt2LqdWgs043CQrh5iD0SBGLk/3yi967VrUxZdVkkZUCRqhG8k5ZyWYhV3kZZ2YBQpPtXifjz4QmU3ep3pF3dQwP9iiAY2tqSCttBboebq4eZ03TyAAykEKMAjlqVnLe52+xhF+R8efBbwWv9nahfyAlgosrYnrm5kT7U+eu4owj3Y6PJ3PHl/xJ1YGUqOkYCKPfjP6nbj0FfZH7QPhMaPoljajAZZFEp6+ddJG011IT/EouJAM9NqqOxx8E31wXcknOD19WPX8vbvUUoe0rOb2Wi+Z7Xt4qgow3Yy0sWZ1RRksQij+9JIwVfzZv5dK/WvwX4cSBLeDIEOmWyrK/RPOSACTn+7BH5jt6PIB/Ca/O79kz4fG/1i3jyVW3D3MjqFYoYF3RvtYFWYTGLAbjdweK+m/2r/jJHb240ezkLORt1CUNuZUyGaF3Bybi5cl5iMEKSDguQNcXzSlGmjghI+Y/ih42+3X13eHhZpWMYJzthQBIQT2/dqCRjqfy801KTI9Gm6eqxjr9C3T6kVuTfM2zooAaQ+wztTHH3j1HXGfUVk6lYussolGHR9jL/dCYwv5HJHr9K9SMFTjbyInJy0Rh2cXEfblv/Zv8a6/wvabpY17Fhn6Dn+QNcrYx/wCrHs5/KvSfhxYfOzH+FcD6t/LAzXnY+pyU3LyZ1ZfT5qiS7ntYuMWf+/dD8o4Dn9Xrnnm/z+v9K3tcG20tB/fa4lP4usYP5Icf/Xrzrxpq5jiIBwz/ACj6H7x/Igfj7V+fUKPtppLq/wBT7j2nLBs4PxbrpklYg5UfKv0H+PJrMuW2xgd3JY/QcL+u4/lUAjJIA6kgfmf8/wCRS6vdAs2Og4HsF4H8s/nX3tOmopRXQ+ZqVG7zZzHiabICj0JPtjkfqVrR0abjGeRwx7HI4b3Vh2we4+uDLKS7ejZUZ9eCefz59q3INGkWKKYYKsCqt/CWQ4eGT+44PKnuMEdxX0MY8sEj4qpUcqspfI/R39gX9q8FI9Hv5cFMJpU78BlP3bCVycCRMf6MzZ8xD5eQUjDffaWr+hx/nt7/AOfb8AdKvlYd8/xKf4T1Ge4IwCCOhAINfoT+yl/wUMaBY7PWS0sAwsN+MtLEMYCXqgFpoxx/pMYMg/5aK+d49CjW0szhxFNx96CufeLzkcEY+uf8KT7X/nn/AArpNC1qG4jSeCSOaKQBo5Y2V0dT0KuuVI+hODkHBBAv+QPQfkK6PaHl/WH2P//R9t/Zy+IrQySWNyfnhZY3J4yGH+jXOMcCVRskI6Sq2ff6cD18SfGXU2ntbPxLYLkgCPVbcYAKlgtxCx/hMM43o54Undnaxr6I+B/xZivrdCr7zsBRuhdOnI6iSM/u5F6hh9TXykW1oypI9Ul5HuP5f/W/rXH+PPCa3UEkLAHI+XOCN4B25yPutkq3qDXVI+DUVyg6jv0/w/z2zVy2JV1sflj4s8MtZzvbsCAuWiJ7x7iCp9XibKNz90KedwzLoniZozkNj/63r9a+rP2sPhL56C4jA35+U9MTAcZP9y4T923YMAewr4vjmyOQVIJDK3BVlJ3K3cEN7dvfj9IybGrE0vZzesV96PtsvxSqw5Xuj6Q+G3xmvJJI7e2LNNJkKNzBFC5LyykdI4xyxxk8AZLCvqrw58NUkKyXjveyjGGuDujQ/wDTG2/1MY9CVeQ93JzXzd+xd4aG2W4IG+Ziqt3WCFwgCnsJZt7H1ESntivtjSocCvgM2xvtq8ow0jF206ixzjFaJXFtdJjUYCKB6BVA+mAOntXn/wARP2ddOvwxlt1jlIO24t8QzKT3JQBZe3EquO3Tp6eBQyV48JyTvF2Z4Eask73Z+Z3xg+DNzpc4ilbzIZMm1uQu1ZQOTE6ZIjnVcFowcOPmTjOOZ0a6MbccjjcP5EH/AD6fT9HvjV8OUvrGa2bG5lL27cZjnQFoXBPTDfKeOVZh3r80backc4BHDD0ZeHU+4YEV+j5NmU8RF0qj1XXuj7LLa31iDjM+jfhN4uEciSKc4II6dR2Pv2Ir600zxMk6BkOcj5h0K/UdeTn1r84/D+vNGwIPHGRnr+OOD74r3Twb8QTgMrEZ9CQR7HHQ/wCec16WIouTuZYrB+9c+oZtrcHj36jI9fb1xz+taujaC24E7SOSrgI2Bg5UgjcAwJGVOR34OK8d0fxg0mATn+n+ff8AWvTND1UR7Au4uSBsHPXpv52rnrnlgO6815k4tHk16UlC0Wehw6OgTywo2Y+6eRz259D6cAYxjGajudNGDjGeSCex6DOMEquenXrzzkWrO9DjIII5GR0ypwR7kHrVDXNeWIAHkt91e7EYJC543Y6AkZ6ZGRXIr3PmoOblZPW55b4i8MbQyqynPyzyZGQBzsAJ/wBZIeSB32L0Bz4hqsWCfxx+Hfv/AJzXt3jfVvOTaAuTlk6/vBnnyz8oEgxho2G7ORk4IrxjUIiT79/8/wCfr2HfT0R9hheZR97c5K4Tmquee9dJ/wAI+WNa1j4SH93P1/zj9K6XNI9dVDjIYyegJ+g/yK1bfw9Kf4ce5OK9DsPD+OOn0/8Ar4qzcNFHy7AD1Y/yHesHPsWqzeyOT0rw5IO/5Z/n2/Ku90LU54gNsrD2ySPy6fz/AJ1x+pfEdBxEu7/abhfwGNx/NR06545HU/Fksn3mwPRflHP0wT+JNTyc24fVZ1/jSseueIfiOcESTsf9hTj8wuMfj+VeZ+J/iXhSUQ4yAMAvI7MQESNejSSNhVA6k57EjlZbgAEk8AEkngADkk8dAOTntXf/AAi8Blyt7MD0zZRt1VWBH2pwf+Wkin90p/1cfON0hx8/nOZU8uoOb+J7L9TX6rSw8b2Vza+HfgZ4d1xc4N3OoEnORBGDuS0jYdQp+aVhxJKSeVVRXT3FaVwayblq/mzH4meIqOpUd22YRbk7sozH/P5f5/zkc54s8UrAhLEZwSATgAAZ3uf4VAPJP4etR+OPG8VrGWc/N/AvJLE/dAABZiT0RQS3oRkjxK9uJLmQyz8KcFYTjt91psZUn+5ECUj7l2yR41rpuTsv60Xn+R6MIiXV290xkfPlE7lBGGnIPDuCMrCp5SM4LkAsMbVPbfCSIM91cHkLiCM9sQgtKw+sjEHsdo6Vxetal5cbvjJA+Qf3nYhET8XKivTItL+x6esZ++ECyHIyZZSGkPuSxbv0x9B1U/ejtpflS/M0lZaHm2rXu92b+8xP5k/5/EVj6VAGLOBnccD3CZUY/wCBb+/T17bnh/wxc3jvDZoHkA2ySMSIbcsBtaaQDmQA7lgQNIcDIUfNX0D4E/ZetoVTz2e5dFVccxwggDpErEt/20Zs9SDmvvcHlbcU3orHmVsXCnp1PmPwvcxuLjcylZpZUIznKRoLfoOoO1jgDnrX0v8ACX4gw/Zoo55UjcRiCYSHZ88OI1fL7ch8K4YZHzdeuPVdL8DRQrshijiUdBHGijrn+ED/ACTU17oIZSrKrA8YZVIPsQwII68V6tbLVU5Una3430seXPFxqKzObuTjjIIxwRyCPVSMgj6frXkXxE0xkdXQgMCXi9Dx+8iYg/dbg+2FI5Feh658L/Ly1o32WXr5eC1pKR0Wa36Ju7zW/luvXDYIPLyO11A6unlTxO0c0ZOTFMg5UN0dHUh0ccPG6twRx8DnGVTw75910/yPQwtZSVh3grx79pRdrbLiNvMty2RtmjBVkkx0DqWinToUbcBwCPffDHiNbiJZVG3PyuhPzRyIdskT99yPkZwARggkMtfC+sTPbu0ygjZ/x8oPvYj4E8f/AE1iA+Zc/vI1x1UE+z/Cv4yBXWRmBjlCCdlIKlcbYrxPVkGEmGcmLDf8siB62RZm4Wp1H7r2fZ9mcWZYDmXtIb9j6ZAqQL/n8z/Solbv2PT/ABzzkHOR7VFqBbadv3sHaeoBxwT04z2z/Kv0Xpc+Stcu0V5r4Z8daguEvNOfOcefaSxTxMMnDmJ2iuIwR/CyORyMnFdje+K0T7yT9M/LBM5/JEY9f8imndXJlGzsXNZsDJG6Biu9Su4YyMjGRnjIHTPeqWmaAkMSQxjakahEHso6nplm+8xPJYk96l8N+JFuELqkyAMVHnRPCzbcZZUkAfYegYgbuSMjBOi4/wA/5/8ArU7dSoza0OW1PSs9P8//AF6+XP2gNBjuL3TLERo/mSS3Mi7QcmCIQwM690V5MnjBCY7cfVnivxBFBFJLKyokaszsTwqqMsx9sDp1PTHp87fs5aK9/f32szoUBItNORuCkCqrs5XqryBkznBBLDHFc9R3kor1Po8LXlCnKpLa1l6ni37XXwYt4DZSQQpD5rvbTCJVRSVhM1vNtXC+bG0TAPjcysQxOK8y+GKzi4RopJLe4iOHkiPO3qTtYbJIZQoPlyBlJBBGUBr6k/bN1BMWVvkb3uDIq98Qwvu2jOc7nQe+T9K5b4EfBWK9mbzlbyrfHnlWZPPaUBls5CpBMEa4llXOWZ0GVG4N8zi5Tq4j2FLR7p9v8/8Ahj2YVFGj7Sa6Ho2jfGO6TaqrBqLkZVLfzUuD/wBdI1W4iQ5HOZI0BGeBXrGheJNQlTP9nrbMRn/SbmM4wAcFLZJW69i6muj0+wt7WLCLDbwRjJCrHHGijuQAqgc9zk+5rJk8X3E4P2KAbcfJPds8UT+hihVWuJUPHzsIlIxhjxXv0KcqUbSm5P0R8piK6qvSKR4vJqssuo3JngWGSG2hRtsnmLJ5k0zq6MVRti7GXDqGV2PHc72meITaSi4H+pYLHer6RA/u7kDu1qSd45LQOx6ouObtdRlOoX6XQiS6VLYBYvM2PCFldZY/M+fHmPIh6hSvfINdDt9cEcjnvn1HvmvzbFYyeGxzqR6M+sjRVahyPqj3G4wQCCCCBgg8EHkEHuCO/esDUrSuZ+Feu7P9Dc/KFZrNif4F5a2JPVoRgpycw4H/ACyY13l5Bkf5+v4HP8u9fp2HrxxNJVIdfw8j5i0qM+R9D85f2wPA4hvy4GEu084cHG8fu5wD652vjr8+a+WdGs9rW8yc5H2eUDuQSIwB/fDAqoIGSyjPNfp3+1t8OTdWBkjXMtmTOgA5aMLi4QepKYkA7mMDmvje9+EAutKtrqAjzI5ZbS7G7asifaGNrNuGPKmhMkSCU4Gxk34CBh7FCUJUJUZ9Xb0TX+Z9bh63tFGS3R55d2iyIVPRgf1Ax16EHt1z9OfF9X00gvG3UEg/zB+ucEf/AF69m8Ua+sGz7QGjufNaG9idSpWRVyt6FwcR3C8zRj/VzrIy5WRa5/xz4c8xRKgBYAdP4165BHBI6gjqp74r5/DqWDq8k/hb919D6StbE0+aO63Rxlhb+fCXUYng2+Yuf9YqHOexzx6HPTvzS1fwid4ZRwF3Dgg4J3EcdCmdw9v901HpszRSh0IVm+XnoT/zzYHqHAxg4OcYINek6drUc428RTAYaN/uuBjIB43KT2GHXjI65+ijXdN9eV9un/APn6mGjWjyy3/M+/v2fvihb3+hfa5bGHUNU0e0lt54ZAolntXw7GJmV1P2iFM4KtuljdRguDXxPfaQ08MDwtdGS2hN1YSyOJIohBcm4torVgN8SRRlVaJznepYcNgfQX7CGoIl8sQc2t5GreUcZiv7TrLaToSP9Jth+8imT5nRQzKxjkzyv7S9nNoeoXNjZbJ7fU8zWMEeHnt2unJmttgy8SmYs0OMho3wMbGx9DhcVBxcavY+Hr4V0azgtj9IPhj44W/sbS9XpdW8UxAxwzoPMTqfuSb1/D611kVeD/sc/Dm707Sobe+k3TElxDncLZHxtt1bOPlO5mC8K7MPm+Zj7pDOMkAgkEBgOcE8gH0znPPOK+Wq253bucE4crsSyCsXU4M1u/5/zwKgmt6zKpVOR3PO7/RtxGR0OR9R0P1Haorbw72A6dP8PTt+Vd+2ninx2AHp+VPQ9RY5paHExeEmbhjhfRereu5uOOOgHP8APTvvCKsiIABtdXUcAbkOVLD+LYxDgd2Vfc11Ii/zxUGozFUYry2Pl+vOP1/z1rOVjnniZT0uflV/wUn8ctNfQ2kIb7LYAwPKPutdyhZ7hFbo8kUfkq+N2x2+Yg7Qfk640IRQmaQYyMQoerertzwq9u7Ejtivsr9rSxhl1IQrho7FDGVH3TdTt593ITyXfLRKxOcsG+g+TfHk73V0kEQ34ZY0UD70jttUD1y59xgDrWeGxPtJqlFbayf6H2NPD+ywyqS1b+FevU0Pgr8VbnTorz7KqpNdKkTXWSZIYwS8iW69BI7FVMrZKbBtAPIyGnxuZiT95mJJ3E/eLMTklmPds5PWvQPip8FH0q5ltWDNDGISkxGFZ5oRLIm7OMrJ5oX+8idyDXKWXhqW4Iit4zLK7lVRfvN5YMjqo7ttjbA6txjJIB+hhGDXOuvU443S1O0/Z08Bi5vI/MGUixczjHBYMohiOMcF8cH+GM+9cT8S03X18T1N5OT+Mrf4V9Mfsp6cv2We4HWafZkgghbdANrA4IIeSQMOMEH8Pn34q2O3Ub5f+nqRvwchx+HzZ/8A11viYJRiTSblP5HmNmuCnt5w/I/4V654FtMQhj1ky34DgfyNeU3SYJ/66N+ToD/MGvZPAMJeGFRyWIQe2XwP518rnUnGmrdz6PKV77Z6F4+G0WkY/wCWdpGSP9qQtKR7cNz9K8E8fanul254QY/Hqf14r2v4paiBc3DfwxHyx6YgQRjB9yv61833c24knkkkn6k5zXi5RSv77/q562MqWgorqW9L43uf4FOP95hhf5msDU58Kfp+tdBM+IlH99ix+i/Ko/Ek1y2sckL07n2C9D/n0r62guaR83i5ckLIzHt+AO4wQffk5z6Z616p8D9dRjLayKGSUeYqN0LL8sq4znJXDDB42seOo8viPY9cc++e6+o9uMGpbPUXhkSZD8yMrD6qf1DLlW9jntXswlrZnzElb3j6hb9j+e7ikudLbzpIj+8tGIE4jblWhZiEuY8ggxsVlVgNpbIz5DOskEhguI5LedSQ0Uqsj5Bx0cAjPoevbOK+pfgB8XhBLDdRkmGQYmXPOxuJYz1+aI8jPO5R64P2344+Gen6pAn2y2hu4nUGKR1/eBXHymGZCJUOPR8A9RXo+xT1Q9tnuflFpPi65hXZDc3UCZLFIZ5ok3Hq2yORV3HAycAnHNXf+FlX3/P/AH//AIGXP/x6vsfVf+CcFgzkwX97BGekZEM+32Esiq5XGAA2SPU5qp/w7Ztv+gpef9+bao9lIdo/yH//0uf/AGSPi4Lae4s7oh7DUCoaNuQkslrGXGORidCf+Boe7CtG5ml8NaoITITY3DiWzn6oEk4inyP4UJ+zXaY6+VLgbmz4Z4dgysijKnEO1l+8rpGArqeMMjKGUjr+dfR2hanHrmmtp12VS6hJNpOekF2UO3PQizvlyrKchWZhwYwa+QU7u/8AVjuq0/es9j7P8EeMo7uISIQDwJEGDtYgHqOqMMFGA5XHvjpUk7dv5H/CvzY/Zz+M9xpl09lcBo/IlFuiy5BVtgZrGfd0XcWFvLkgfKucMhP6F+G/E8dzGJYjlTwwOAyMByjjsw6ccHggnNdMotbrTocs4OG5L4h0VJUeJx8rqVJ7gnkMPUqcMPxr8/P2gfhq9vI84GCp23fXGekV0Bz8rD5XI9UJ71+ixwR7/wCePqPT3ry/40eBxNEZQu4ohWZcZ3xHOfxUE/gW6dtsPiZ4eXPA6MNXdGakjmv2OPDEi6fFJJGYtyqIVYfMUUyMZWX+ESyyyMoPJTae4r6WiWvGvgD8QvMUWczZmhTMDn/lvAuB34M0A2rLgncpR+Mtj2ZT/n/P+enrXiy+JyfVs9GvXdZ3JloY0gams9SjjRn6tcdP8/5/z1r8rL/Hmz44H2m5x9PtMuP0P+cV+lfxB10QxSyE4EaPIT7RoWP8vxr8wdPkJAJ6tlj9XJc/q3WvruGk5V5y7K33n2mUUuVNm1ayc13HgqVgwI6d/T/9fvXI6Bppc+1eq+FtJIwMV9zXmlsfSSpqUfePXfBtxtw3f09P8a9C8Paq7OFRcsSQPXJ459h95vX6cV5/4c0BmHGRX0D8LPBJhQu/336A9VHp7E9xXiVZnymPqwoRb6vY67w5pHkxqnXA5PqTksfxJNc/8VLDMBbujKQfTJwfzyPyrtFFc74/XNtL/u5/Jga4k9T4yjN+1Uu7PA769Yjb1G7d9D3OT0z3PfA985kelE8n+v8A9f8AP/61aUt2q8nr6VzOs+J2H3QB156nt68D8j+Fehfoj9ApUZT2OhitFUZJAHqSB/WqGoeOokHy5cj04H5nr+Ga89u9TdySxJPqST+h4FUZR+dUoHqQwaW7Ol1Hx/M33SEHtyfzPT8BXOXN2WOWJY+pJJ/Wo3eo3NaqNjuhSjHYkWSonf8Az/n/ADnHrTGeo4rJ5XSGL/WyHCk8qirzJK3qsa5bB+8dq/xYrnxVeOHpSqzdklqauyTbOr+F3gr7bOd4/wBGgIM24fLLIAHWHrykfyvLxgkoh6sK+gNRmGSANoHA6duAeuM49K5vw1paW8KwxDCKOP7zEnc7ue7u5Lk55J7YAFy/1IYyxAAH5Aev9K/nLOs6+vScnt08kfN1ZSq1OZ9NEJczf1ry34i/FRIMxx/vJz91VI492PKqoPVjkAjoxwK574mfGNiGitOu7Y0p5Xd18uMdXcAFmPCxqMuwOFPmelaZtB3MXkc5kkblnY+p4+UdEVcKqheBk10cOcOyzWXtat40lv3l5I9LDYe+rEtZXlumllYvIkI9diNMxOI1PRticyHLMHP3RgDoG/z+n05/w/LC8NNlXk/56yMwz12x4jj/ADCEj2atK+vRGrO33VGT68YwB6sxwAPUjrXxudOE8bOnRXup8sUvLQ7JJRbsb3grw4Li5XdzFbBZ5PQysStqh9ed8xHpGvXOD3PiTQZLy4hsojtG0z3UvBEMRJRCB/FNK24RJnHDMcqhqx4N0j7HaZn+WRs3V4e6lkysI9fIgCJjPL7sAbufTvg94aZIfOkGJ7phNN6opGIIM9QIIdqYGPnMh6sa9jKcF7XEJP4YLXzkzxMViHCDfV7HU+AvAsNpCkECCONOQByWYnLSSN1eWQ8s7ZY59ABXZRWwFNtYcDFXFWv05HxFarzMi8uo2th19OatYoIq1pqYcxg+JIN3OO3TGffH514n40sTDfQyAHZeQPDNjp9oscvE55+9JbO6e4iHXFe/X8GR+H+f8/WvEf2ivMj0+W5iA82xmhvYgecrE+ydSOMh4JJFZScYPJ4BHm5lh1iKE4vtp6ns4Ks4tW7/AJnnfj/wsHBlUZwCJR/eTGCcdSQMg46j6GvNvDmkukHmxZbyGMd9EBk/KMx3kKfxedCUaaIff+d1G4OD7doHiGK6iW4gPyN95D96Mtn5T0JUnofYqRkE1z+lWaWl8jH5YLwCB27RTqS1q+emxiXiPtIvIAGPy/A0oxrSoVNpaJ9n0f6H2cqiUG2vkekfs8/EgSILR3BKLutXJz5kQ58sHncYRjaQSWiK8fI5r21a+DfEEMmmahNsO2NZYrmAAfLC8yk/Lj/l2kmWVHXgJ5h42lsfa/gvxOt1bw3Ef3ZUVtvdWI+dD7o4Kn3HuK/RcsruUXRm7yg7X8j4vMcL7OSqR+F6/M3x7f5/zxjOcUE1HvqKe5AGTXu+Z4qg27IsO/r+H9cmuU8YeOYbeNpJHVEX7zMcAewHUsegVcsTgAZNcd8UvjNHahYwGlnlz9mt4/8AWSkAZPPEUKdXmkwqAdc8V5GkU08iz3bI0q5MUSZMFuT/AM8g2TLNjhrhxuxwgQVxzqt/B959HgsrlU96exJ438RSXmJJUYQKy/ZrI8SXMxYC3N0OiqXIZLY5VeXlLFdo918C6EbO0jic7pMF5mHRppSZJW+hkY7e+1V9AK86+F2g+feFzgx2YG3Pe5mXr/2xhIGefnm9q9N+I2omOF2AJIViqjqSq5C8dyeAMdT+FOC5YuZ14zkdWOHhst/U+MP2iNQe51DcYZJIl22lrInzH7WzCWSJQMPHKSY1WX7gKMpIw2Pd/hjqbaXZmG4VZJoYPtN40Ry0l1dzssNuoIUNJIMKHyAMLgBSCPPPC3gFUSG5ilDXJLzi5kXzxuukkEgiRmRYxGZGCBSMEZdWJIFqLwm6taia4kuWa/gdshY1eQEyNLMqf61gsWxFZvLjUKFRcA159OlySdRbvTXp6Hp4mg5w5E7RX4nv/h/wo8zJPfsJZRh47ccW1sewCc+fMve5l3fNny0jGK6nWvFkcJVW3PI+THDGpeZ8d0jHRB3kcqi9Cw6VRvtbWGKSZzhY0Z2zxkIpfHtyMA9cn2FJ4D0YxxCSXBuZgsl0/fcyhhED1EUAxGiD5QFzgliW9ZW0S+Z8ZWhZ/kfOf7Q/gy9WSTV1hjjMUMYCGUm4VIndpi4jDQNG6yZaMuzKUDBs/LU/gvxwJwFdfLl4yjYU5Izz6Ng59GB3LlWr13xl4lhuTJaq6vuVo5gmCFEgMZV2XKBjn7pOePujivANK8KefZWskTD7RFCsQYt8snkEx+VMwzsdWj+WTG6N+uVJFfnmf4WCkpw3b3PsMBJ+ytPc9A1lXEbMjbZY8Swv12Sx/MhI7j+Er0ZCR0JFeufDzxst9bJOoCufknQnmOZMCVP93OHRv4o2Vu9fPPhPx5uzFNlHGY23jDI+OY5l7N6MMqwIIJBGdj4H+Ijb3gjJ/dXZ8ps9FmQMbeQf9dAGhJ4yTEOgFc2QZi6Ff6vN2jLa/R/8EwzHDqUPax3X5HvWo2Oc5HHIIPcdCCORgjqOeCfevlbwV8PBaXOp6VIN1tOBfWGf4recG3uoc92tpBGDySFaNv4s19gXVvx/n/P/AOuvLPirYxIiXLvHG9qzSRvIyoChTbPAWJGFniGDjOHWM4+Wv0ycuVXPLwVdwdj4K/aq8ILLBbgopv7ed4HmPEkkEcG+IyYP7wTxPCwJ5Vt4BXkH5u0TxK9rhXG6PJyndMAsxTONq9TsJ64xjmvpj4wfEe31G+aa3RkhtoREs8ishm3EyNJsYArHGuURmALDJ4BArzbxX8GZZUS6mUwrPKsdpGRhpIkjM0lzIP4I2AQID87BgTgD5vP+s80nTq6xS3/L+uh+j0af7uNSOkm9u55n4k8OxzKZIG3Agl0H3077tnB6845GenFcMdSd9ySAPsxnPDjA6h+p4HBfntnjjr7vw+Qxkww5KxMpK/KhKllYY4LZ5HGMVxupwyB2IOcJ8xYdmyMEjgnuCRnjqea9rByjbl5r9vL5njZhCUfes13t/kfTn7KMFnd5t7mW/guYSs1rew5KxgsPJMxKObeVJBhJsrFIMAsp+VvvnQNFXzorq6EE99FF5Md4ECO8TZO8xZKxStzu2ll+9sKBsD8y/wBnn4iHT762uhlEGILsY620+1ZCecMIjtmXngofWv05g0wPMzAKI22+WqkkBSjhzuPUSNIZAR/e44xW1f3XddTylT5/en2PVdA1DP8AM+nfntn8jnH55+t+ZBqVvchSYLqEWVztz+7lSQy2k7DJBRw0sBY4KsYxnDcWvDNngD2x+gx/Lj6evWu4RBjnp3/w7+3pXLJHy2KSjLQsj/P+H0+vvS/5/wA/5/qQ2If5/Dpz3/xFYvijxrb2qhp5ApbhIwC8sh4wsUKBpZHJ4CopOfQUrnmG1j/P+f8APX0pcf5/yf8A61ch4M1G9mkkmnjFtbFQtpbtta4PJLXNyykrCzDCpbKzFF5dt/yr1wprUBGNcZ8W/iAmn2Vxdvz5UZ8tf+ekrkJDEB33yFVOOmSe2a6+aXHJOAMkk4AAAOSSegAyf8K+fvi94Dm1x4ESc2+nQO0kjhN0t3KAUQwK+EWCIbys0gO52yqMFDVhVbceWO504eMXNc+3U/Or4i+I2jSSWRszzO5JJGXllYvI2T/tsTwMD8KtfsWeBIWvxeXLBUtg0se4MfMuHzHAECqxfygGlO0cYTON1fpD4T/Zb0i2ZXWyjmlVcCW6zcPzyTibdGjH1RFwMgAZr1DTdCjQAIiIBwAiqgAHQAKBgD2//WsPR9jTaT1e7PpsVmqqSSirRSskfNPjrStP1GF4J8urmNtwhuAwaJtyEMYQMAlhjlSkjjjdkeKaJ+zxHY3VndW08TtBf7plY+W7W0jFYpSspXNxAjvE+CfNQIwyykH9EDZfX/P+e36VTvvDcbghlVgeoZQw/JgRWkIzgrRlucSzGLesT488V+FRa3EjxqBbXsrTIVACpcso8+I4OMzhfPT1bzR2r41/aI0YrqMzY4lWOQfigUn35XFfqJ4w/ZzsrhWHlvDuwWNvJJFypDK3lhjCWVgGBMZbI69a+Xv2g/2Lr+Z0ntpYrkxxmMxuogmcBi4O4EwO/JHJiz7dvUoV37JQn0f4HZRxFOU7p2Pz08SQbWB/vFcf8BLA/mG//XXsPwFkG6InpE7SMPaJTL/7KK4n4leD5oQ8U0UkM8OHaKVGRwoI3EA5DKQeHQsp9a6L4Gz83I/u28jD/gQEefxD/rXlZzHmoXR9Tl0lGoyP4jaofKYk/NK2T/wI7m/z715O/oPUY/QV3fxOn+aNM9i35nA/ka5HT4vnHooLH6KM/wCfrWGXw5KKfe7OvFyvO3Yj1d/mwOiAKPfA5+nPNcvI2WY++B9B1/M/y9627qXgk+5P8z/OslI+B+Z/HrXuUVyq583jJNuxBJDnHUd8jqD7fX05z703JHDfgegP+B9j16jqK7XwR4ZS4EqnhwFMbenJByO4ORz24ORWfrnhWSIkOvHQN1UgehAx/X8qpYqHP7NvVf1oc0sFNw9olp3NL4UePDZSbJMm2lb5j18luB5mP7h4D+mAeoAP6lfsk/FcSx/2dI6HcN9hIxOCGy0kG73/ANZHjvvXnC1+RSQsv+0PTv8AT/aHseTjqeMeo/Bv4wvZOis7eQHDKy7vMtXBBEkY+9sVvm2jlcEjPQ+vQxNtGebOjJxt93r/AJH7SXHhqZTjafw5H54qP+wJf7rfl/8AWrlfhN+19ZTWkT3MqpNjDMgLpLgDE8ZUEbZO654YMOmK7D/hqXS/+fn/AMcf/wCJr0/ao8v6ziFpZn//0/EPAsG5Hb1Zfwwg/wDiv5jvW7Zai1tKk6jdzsnX+/DhmYY7yR7d8Z/vZU8Oad8KdN/0Zj2M8oHHGEIU8+xBHr61b8YWWFj77p4l/Aklj9NgbPtmvg4yaVz2K0U5uPmdL8Y9CjvY4L0O3Cqt5LHGJWmtCuIrgxFkMk9pwrAOsjQggHdCuet+HvxabSruKze+tr3fFG0NzAZRDMkmTFaXRl/1d6EwytvY4wGKvkPU0WwitbWwKM0jTW7T6jGoaRLN5ZXeKeWTlYY7hHVGg+8pAkACtITQsfB9tb3SvLbJPazAxvCcADzfvpE2Qsc7YBt5ifmA8oujGOSu6WJcV7OWqW3zKdNpcla6VvdaX5n3N4S8YRXMfmRnkY8xCRvjb0YfntYcNz05A3s5HPfII7EY/kc/5yDXwHpXxTk0a8SNrgy2c2Tpt+wI3IrBZNP1NCMxXVszLHIXAYhkfA3hq+zvAXxGivFypCyAZaPIOP8AbQ/xo3YjJAxntTTujyJR5XY8l+InhV7S4SSEmPDiW0kH/LORc7kPquGKsh4eJsHPWvffhh8RVvoPM2iOZDtuod2TFJgfdPBaGT78UmPmU4PzKwGf4t8MpcwtE3XqjDqrj7rKOD7YPUe+K+d4Lu5sbnehCTxZR0bOyeI8mGQgf6t/vxzAZibawzlg2Eo9TppTvoz7Nx8pP+e9clrPxGgjcR7i0jHCouCx5wcDPQHqeg744rx+6/aWSZNlujtcEEG3I+eFwBkXTY2xIuT+8PEigFA+QKk+HOjfvlaQ75T880mMF2xkAZ5WJTwidABnGcmsL80rI+ow+XWg6lTbpYb+1VrTJp1ztODII4vf99IisB6HbuH4+9fGFjpWe3+f85r7J/aV0wzWTgc4lgY/RZBn8eR+ArxTw14AJI4/+vX3uQxVKnNvds9zCVFCBn+EvC/A4r1fwx4WPHH510HhjwASQqoSe2Bn8/T6mvcPBvwpVAGl5P8AcHT/AIEf4voOPrXp1a5njM0hTi0yh8MvBXSRh8o+4P7x55+i9vU/Q16wqf5/lTYbcDgDgcAdsf56VJivMnJtn59icRKvJyfyFrH8XoDBLnp5bf8AoJNa9cf8UtXEduw7v8g98/e/QGiOrJw8earFLuj541S4/wA/5/zxXK3klbWrXAzx/n/PX8a5e6uK9RRP1PDq2hFOM1m3EZHvVwzVG0grVHoqJkyXhFMbUTVya3BrLuLbHStVqVytDn1A+3p+degfCDTcK1y3WX5YsjpChOT1/wCWsmW91VOvFeWzQGQpEv3pnESn0zzI+f8ApnEHY/QV7/FtjUKPlRECr2wqAAfUAAfXFfj3H+a+zhHBwe/vS/RGFVu1jZutUVFLMcAck+me/v7Y6nHFfPvxJ+Jsl3ItvbuY4TkyygkN5SEB2XgDcx/drJyAdxX7jMKHj74m/ap2toywihXdOw4HOdsef778liPuxjaMFiRy0rHYAo+a5I+6fuQRrwBxwPLIHAHzykj1r89wOTTnSp1Z/FUklCP5yfkuhnTofiaViyth0G2MLst0wcCMHJcZ53Sn5izZJAXOcklmtXe2Ntp+YjZH/vyEIn4Atk/SrfkNs3YAJOFA7BQMDHp6Y/U1kLCWnjXPEYMz/UfJD0/2yz+nyA1+4Y6VLJsqkodI29W9PzPYVLkgzoNPtAiKi9EUKP8AgIC+/XGa3/AnhsXV0C4zb2RWa49Hn621vnvg5mccjAXPWufu53GxI13zSusVvGP45X+6D6Kmd7knCqpJxxXunhvwutpAlshDFSXuJO808nMsmeeM/IgPRVHYDP8AM9F8t8RPfW3m31+R4tWf2Vu9/QXW4zNNbW/U3E2+b/rhb/vptw/uuwjiP+/j6fQGkQ8Zx9f8Pw+nTFeGeAbffqUrdoLKKNfZ7md5G57Fkhj/AAr6A0wcfliv0bIaChhlJ7y1v+R8tmc2nZbGiiVLUSU/zK+oPl3qOprNUNzeKoJY4A9a8+8S/Edi/wBntU8ydhuUE4VF6edO2D5UPoSC8mMIpPIaTvZas2p0ZT9DrfFHiyC2TfPIEBO1ByXdj0jijXLySHsiKzYzx1ryvxbDdX0UkeBZW0qMjiRUlupI3Uqy+VzBbB1P8fmyjJyqHgbWheEBG/nyv9oumBVp2UYjB6x2sZJEEXqctJJ1d2zitlh/n/H8a+kw2WJq9X7unzOqnam/dPj6fS5tGl+0Rym4sRtS6WRVEsanEazv5eElj+6sjBEdcK+GKs1emeM7FLu0ZomyrqHiYHJVh8y7SONyEAhh1IHWl+JeiLulhkGY5UYEZPKPkHB9VJyOmDj2ryr4VeKms2NvKf3PmeTIecRTHAjmA7W12rI56+VK56KePz7i7I44XkxGHVlfXyZ9hhavtFeW5m6b47kv5JpJ4tjxhLSRQ25XaESGRk3DKo/mAhG3bfXpX0H+yh4rCWQhLh/LnuEyGBKhbiTaHXOVO3+9jNfPPj+ZdPuLlpOImjNynu0QCOg4+84MeB1yD6Gvmrwfp7mXzGaSG4ImaWSCWSNjJ9oZmJZGw+EkTqCCMfh4uSxlOrUxD2drettfxNMZCE4cjP2Z/txcZyDXzL+0j+1almws7bbNfy52IT+7gBXPm3DLkg7cskQw78Z2givm3S/izq0aGNNSlKkYBlit5ZF6jKSPGGzju279BXExaKftEbEs7bJ5ZXdtzySO0SPLIxySzDPsAMAAACvp6k3J2PJw+CjTlfc9h/Z3s5Jpr2/uJHnlZ1tVlk6/ux5tx5a/djjMjpGI0wAsQH19wN0qKzv91FZ2+iDcf0H/AOuuE+CGieVp1sO8qtcOfVriRpfU/wADKPoB6c9jq9rujEf/AD3lig/CaVA4/wC+A1N6K3yPqE1CF0j2v4I6CYrSMuMSzZnm9d87eYRnr8gKxjPQKPQV0WvaZvBH8v5/XOK0tNjAAxwMDAq9srtUVy28j85qV5e1dTrc+c08O+TcTw9EYC5iXsC7bLhR7Fwkv1kb1rG8SWiGfT1chUF750jFtqqLS2uJ8MTxhioGCRnng9vTfH1h/pcbAf8ALGYH2+eEgfofeuN8SeGheE2YRHyA0zugdIVPCsB0NwwLGNQQFHztkYD+ZK/w+Z9ZCvz0uaT6A+sG4t7SxRwZrkC4nLknyrMTee7yjcH2mMpbqCy7mkHICtjovHHxBaa1EEH7u4vEfy8EnybYuU+2PjBVWiwY+VLSSAL3IbD+z7brHtjeaFmjaKZ4pP3k8b7dyXErh3fJVTuyCACBtBYVnWPhL7MZVG5ixDFnO+T5V2KrSHl41HEa4AjBIA9dGpJWfU8uFOFWej2/En8MQLEqLsSFI/mcL/q1EY3uwbCk5VSxZvm/vZ614F4E1swxJcxZe2m3SXUWMPEZZXdZ0XnqrDdt4dR3Yc+o/Em83ILNSQ10rCdl4aKzJ2TsGB+WS4/1EeectIf4Dj5W8I/EK6tCVbF1FHJLDnCiYRwyvF0GEuUZEB2kLJ6E4Br5nOKE6lJcltHs3a/ofQUY8t5vbRfcfU2veE1vEWaFlFxtHlSZ/dzx9RBOcHI/55y/ejbPVcg8lbWjMrKA0c0Z5VuHimi2vGH9CGCkMPldMMpKnNUfBHjqOILPC/mWMzHzBzm2kbAPBGVQn7yMFKHngb9vs2t+FTdBZYdpuo1XaTwtzEMnyJW7OuS0Mx5RuD8jOD8X9X9s1y6VIv3fO3T1OerN07p6xe/lc9e8N60Li3inAwJY0fHoWUFl+qtlfw9qwPG7RJE0ksYlCZMabFkd3IwkcKMDmWQ4VQOpPUDNZvwB1DfYhcFfJuLmIqwIZNtw7BHU8qyBwCOQOxx07u9tQcEgZGceoOByD2OMjI7E81+w0pOpSi3o2lfyPjYy5Kllqrnxl4S/ZynuJ5b/AFZFDzyNMbENvUbsLEly4O0pBEqKsCZUlcsx+7XlX7RF4Ue3tGYh4FkhUt3S5mhjtJs+vkZBOfvRP07ffurWXH+f89f6dec/B/7YEY/ti1j7LZrK3vsln2Z9cMc8nr+Nebi6ap03b1fnbU/QcnxUq9aKk+mnkeX/ABe8GrZq9uvzRoEELnHzqQMOCMgksDuK55+hrxbRbJS0yNgrJC4wf9j5we+COvX15r1Lx34gPkpCzZjL5XPJjJxuZDkEA/xIDhsDo2GF/wAP/CMf2Xf3+d+2ULayAFQ9vAWWeRVI3KJGkIIOOIiO2TwZZzqk227u7/E+vxijFxUt/wAzynU/CohXeGzFjB3ckbsLg9iMnrjPrkV9vfsX/GlLqJNPmcG5t0/0ck/NcWyZC4J+9LbqAjDq0YV+cNj5J+IFmhtj5blw0cTElcfMwQsmMnO1sgNnkYOOa534WQMZIBGWSR7uGON0LB0JkjGUYHcpG9j19OvNfSZdWlXpP2j1T3Pl8ywyjO0Nmv1P2l0dgB/+r/69dDDMDXzZpHxNntmIuUa4twcC6iXM0a5/5e7dP9YFHJnt1JI5aJfvV694e8YRzIskUiSRtyrowYHjPOOQQOqkbh3A7VzdD4nFYGcW2zb8W+AYLsJ5wkzGSUMU88B+bAZSYJIyynA+VifbFHhT4b2loS1vAiOwAaQlpJWA7NNKzynrjG7GO1XrXVQe9aCTVaszw5QcdGWCaY701mrg/id48lt4itrAbq8cYt4c7UBPHm3Mp+WK3jPLHO5sbVyWOHJ2CNNyaSKPj/UftM8dgp/dgLNqHPPlEnyLU7TkfaXXc44zDG46PXfW0a+UMAZBxjAHTpwOMBcAY9vSvnf4A+Fp7Y3/ANrnFxeTXayXki5wGa1hZYoycHy4gxVAAFA4AwK9/wBLYnj3p0JpN36/gehXockVYvRw1KqClxxVXVNUSJS7nAH6nsoHcnsP8Kp6Hn6yaSLgX6f5/DNczrvjhI38qOOa5m43RwKreWD0M8jMkUOeMCSQMR0Brh5dVu9RlaG3dreFCBdToRujHXyY2x81064JP3YFIJBYop9Qt9Ois4RFCoUdeSSxY/ekd2JZ3Y8l2JYkc969LC4OVbV6L8Sq0PZtRer7LocNrXj++UlY9PVTx8013AME9tkImOcZ/iFcnqurak/LCEf7KzlR7ZPkMeOR1Ofau5uLbJJ5yec59evv+tVnsf8APFe9HLKVtbnbRqKlqkr99zxL4gfC5tQjMN7Z28yYOx/tLCSMlSC0Mot1eJhwODsPdWya+adA/Yj1C0muDC1vJBJE8MIebbKFLRuplPlCNim3BK43cHAzgffb2X+f88/hnBqpPbVUsqozi4yTa9T0aeYVISTjb7j84vGP7FesSSb1it2AUAAXKZ49mVepJ71y8v7G+tIH/wBDD7ht+SeAkcgnjeM5xjiv04aD/P8A9aqmrSxwxSTzSJDBEu6WWQ7Y0HbJ53Mc4VEDOxICgk4qY5VQhFRVzolmlVu7sfkb4w/Z31WFfm0676qp2Qs45bHWPdyTwB3rz3W9DlhkMU0UsMq4LRyxvG6gjKko4VgD1BxgjpX6l6v8U7m4J8jfZ2pHyZBW7mHUO7Z/0SNsZWFczEffaPO2vhL9sLWHl1iVpHaRxbWylmbc33GIGTk8Ajv/APXxxOA9jS513GsROpPXqcD8M9QWOb5yArpjngZyCMn0yK9X+VwejqevRl/EdK5fwdaxy20YdFYrlTkc8E9xg8g+vYdatf8ACDovMbyRn/Zbj8Qef1r81xs6dSs+ZuMlp5afifeYOEoUlZJr8f8Agk974Et36LtPcoSP/HeR+h71ly/CND0kIP8ACdvI/EEflW1Z2typ/wBZHIP9oFT/AN9Ctu1vm/iTHT7rAj+h/SuOWJxFP4Kif9eZ2fVaNX4oW/ryOR0v4f3US7Yrx40yW2ruUZPU4DgAnvgDJ56kmrf/AAi99/z/AMv/AH0//wAXXapMP/15pfMHtT/tnFfzfgg/snDfyn//1Oq8P/DGKOwvXT5fJ1a6jhUHjy2nkAiA/wBgKuCecA57GvMfH+mHEKKTud3CHGcM0DxIR9HlGPqPaveNOZl0q33sHe6vb+6kfaF3j7VKqPtXhQRzgcDPHFeZ3Vh5urWEQHyxxz3cvsIzGsYx23S7cey9DXw8leN15WPosPRdTFcr7/qer6F4bjt4lgiRVjVQpAGAx2hWd+DvaTDFi2Sckc1j+P8A4UtZRBmTzLKVdsmQT9kZyB5UmOfsjHAimyTA+FYgeWy+m+BdH8yUE/cTDN74+6M/XB98GvY/s4ZSrAFWVldWAKsrAhldSNrBlJBUjkZ65rmSvqfSZu4ySpJWsfnR488BecotpZCkhYNa3Jw6TMqlRb3yNgSyhDsEvDyxnIJKlG4rwh45vNHmSKRJDCpyiBt0kXYyWUuP9JgHeBv3iAY2jBr69+KnwCaBXe2ia4siP3toMtNbd91ryXmt1PzCEZmgIzFvACjxDUI4nQRXO2e2c4huCeA2cKszjDQ3CnhZhs3NkHY+Q3RSqNaM+Hq0mj6V+FX7RUF1GjSOmH4SdM+Wx7rIuMxSAjDA8Bsghecdd8RfAy3SB0I85RmMggh1xkoT0wfvK2SB9DXwPa/DO5sLrz7aVpLVwRcxMu584+SSSJSvn7CMNLDsuNuDtmKkN7p8K/j0yFYwQw7wO2Qf7xt5CFIPcoVV153xrXXzJmSpStzR26lj7A6SGSL93OvyuGBCyqpP7m4UfNhedkmN8TElcqSK9V+GOvrI2cFXVSJI2xujYjoccFTyUdflYdP4sR63HDejzrc4mVcyxEAMwGByD1ZegZc7uhxxVbwF4fM1xEFOyTJG/uFwSyt/eQ45U9+RtIBr0KGHjJ3PewmMlCDjJ6M9CvfCT3cbqB8h4LHoOhyB1JU9SAcc4zXUeDvhBbooLZcjqOAufYLz19TXbaJZOihXKnAwCoI6cY6/0H9a1kjxX0EPdVlocNbGzfuxI9N0lI12ooUewA//AF/WrQTFPU0lJu55Dk5big0tIKC1ITEcjvXh/wASdfE8u0HKR5Ue7cbm+mRjPPT3ruPiN4w8tfKQ/O33jn7q9/xOeOnr6V5BLxx/n866qUOp9Bl2Gt+9kvQ4PxBGUYgj3Hv/AJ/n+vKXMteo67pglUjof4D6Htn1B7/pzivKtTiZWKsMEHBH+HrnqMcEc16MT7vCVVNEDTVWm1GmXMnBPp+uayZ5vWuhRPQvYuSatULaz7f5/LtWXI1VXl/z/SteTS5Skd98OrIS3Jl6i3jIHtJc8E/VYo2A/wB/tmrHxX8WNxawnEkn3j1CKCCzsOm2NecE8uYx60nwyuhDZzTtgb5pCD6+XiKMZ6YyjE+gznGDXmd9qRMN1dk5aSJzEe4jAKx49DI7GU4PdR24/lTParx2a1G9lNRS6PWyX5sxbvK7K2laOvkgqD/pUnGevlElQT7+QjOSRy8hPcV0nh/TxJNI38IIhjHQKsZy5H+9ISDjHEa+lcx4e1VlVi3K2dsAD/tsu1V/75QZAB+9UWm+PxAiLJG6HaDuUhwx53Nxgjc2TyO9fruU4J18wfL8NGEYr/E1qdkKsU0m+h7Bd6WoTgDgcfmSc+2efxrz/wALx5V5m4ErF1J7RJlYsntlQ0hPq54xU+m/EaOdXgicmWX5V4IKIRmaTJ4ASMEj1Yr611/grwUt3L5bDFla7PtJ6CVlAMNip7jAVp8dEwufmbHzHHWKlOpHAJ2+1PyXQjEV1GFr3Oi+E/hYoPt0oIklUrYo2AYrdx89yeDiW5/h6FYsD+Jq7kLj/Pt/Pr+dT3k5ck4HPYcAAHAUDsFAwAOP1rmvHet+TbyNnBI2D6vkE/8AAVyc+uOlfjeIqKclGK0WiPMpLW8t3+BrfBDURLNqMw6NcxxA/wCzBbR7f1kY/jX0Ppz5FfK/7LEpa3vCev25+nZRb2+0H328n1r6E0bXhx1+vr7V+uZcuShCP91HzmYUnNux2XtVHVtXWIerHooPX378fWs3VfFIUccuegzwPc4/l3x378KwmuJfJiOXOGnmYZSBD0Yjo8zDPlQ8dNzbVU59aPNNqEN2eNTwtlz1HaK/EXWNZnuZDBAAZBgyuwzDbIf45R/HKw/1cGdznBbagJrqtF8Kx26FEyxY7pZXOZJn7ySNxn/ZUAJGOFAAAroNG8Nx28YjiGFyS5PLSOfvSyNkF5H7t6YAwBimXEdfY4HBxo+89ZdWZ1MQ6nurRdP+CY0q1Xer9wlUpDXtJBe5wvxJ8KGeIlP9YgJT3x1X8eo9xXyf4mdY5FmYfK/+j3YOcYdisLMp4/dysY26EJLz90AfcEleI/G/4R+akk0S7gykXUQHLKRhpUHdwOWwM8bhyDWWNwsMbhp4efVaPs+h6uCxPJKzPFvFimeCJJSpls5YzG8qeYJLWZvsrmRMrve3EoRyCrEFH65NeYat8MbjTp0W4j/dEGMXSZaBiECAyNy1uzCKMETAAnJDNnNdXJFJJayRMxNxahgH6eavlsY3ODkrcRDa4/56o3dVr6D+E3xFh1CJBt8ud4kaW2k2ksroCZYjytxAc5+XJTJDqp6/j2VYarQ9rRkvglr8/wCvxPqKrjKN2fOttp6f3055+8v881TvYU8xyrKcWU54dT91kPYnnvj0r7u8M/BO0X5vslspJyQsEPHTn7uMk98V0ep/B6ymTZLbQOpBBBij6EYIyFyAehwRxmvacfI8KWNhTkeEeDNOKW1sn922gX2+WFOn6n19q1JY8TWIPQ3i5/4Db3DDP/AgD9QPw2/FXwvktFLWQaRUUkWksjFG2gYS3mkMjwNxwpLxnphODXmMfjGa5Fq8UMYaO5hmKCfExWMsk8SrLFFG0pV5FEZlRi4xjNTDD1KvwRvZnrvGQqU9GfYmnN8o/wA9qvKa5HwB4tiuYyYX37GMcqnKyRSJ9+OaNgHjkXurAH+ddWVrq5GlZnwdb3ZO5xHjGwLOCoy2Nq59T/Tufp78a/hTwqsCYHLMS0jH7zO33mb37D0AAHQVq/ZAW3fl+I//AFf/AFqtEf5/z+tYxppO7R0TxDcFBbdSvIoGSfc/p2+n8q8d+IvipY8yEFzny4Yl+9K5BKovpnBZmPCIGJ6V6L498TJbws7tgD0GSSTtVUXq7OxCqoHJIHPbx2x8MyyiS7uBhgCsEeciFWIxHnkGVyA00g/iARflXnlqvmbiuh6uWw+3N+h5r4p1s2sFxdykPPgM5XgPKcJbwRgklYo2KpGM8KGYgksT8r6fdFQAeScljnqzHcxz7sSfx69a9E+OPxBF1MIIWzb2znLD7s1wOHZT0McHKKRlS5kPIAz5ksdeFjb1NF0PqqtRWUUdZoHitreQyoNyNxdxcbZYv4mC9POjX5lbqwBQkgrX1F8GfG/kSJBv3QygPYSk5G1l3/Zyx6/Kd8J6lQy8mPB+ObeTBz/n6fjXo3grUnGnzRrkyQTFbLn5vMd45bNUI5zHNLsB/ucdM18xXoyUozXxJpeqen4fk/I5bKouVn3XaauLecPuBiuJEjuCPurI4CwXGMcFm2wS9AR5R/hOfRXT/P4/5/PtyB80w+KDdaeS48uVgYZ05zHcI22QZA/hkXcpGeMEV7/4N1gzW0Ep5aSGNnPHLlRv4HT5s+1fU5LjXX56Mt4/r0PlMdh/YyUkOv7bj/Pevg39tHT9uqwP3OnKn5Xcpz+Ir9ALhK/P/wDbguwNURSeFsYf/Hp7g9OTk4HA5PYGvRzK/stPT9D2uH6n+1xu+9z5h8RadJcXEFtEN0szLHGP9qV8An0CjLH2WvuibwxDb26aZDH5x8jyPJGAPLZCjzXEnSBJGJcswZnc4QMea+V/hh8Kb06lb3zlbKCD96klyAskoKNGTb2z4eTaHOGdAm4jh+lfaHhVSBttbeQq7FpJp38oyseDI5kDXEzHruMaqo4UAAARQpulRjDq1d/5H1eYYuUptp6I8K8LfsXgxLHe3bMAArJaqFyq/dzPMGYnAAJWJe+McV6f4N/ZK0mFl2WvmFTuV5pZZCGBHzAFlTd7hR/LHquo+Hb9FJW0S44JCw3KBjxkD/SI4Rknj72Bj61534F+P8q6jBZ3+mz6csxdFlncMBIoBjUlI/KKTE7FdZSN20d812QUoOy67nzNbHe1Taldpf1odP44+G0UEK3NpEEmgy8yxjAngHMsTAHDSKmZImOSJEUZwzA5dp4cTPnW7tA8ihhJCVAlVhlWljYGGbIIbLLuB6OOlfQV5pOe2R3/AB4x6Y/nzXiPh/STA89melu4aAHqba43SQAdyIm8y3zwP3aiirdNGOExSqLkk7+pNYeNLyAfvolulBH7y3xHLj1a2kbYxH/TKbnnCV2Pg/4u21yWSKXMicSQuDHOnrvgkCyAe+3B7E8VgFP8/wCT2z+FZOseFIZsebGrMv3H5WVPdJkKyIR6qw/Gp52jarhYTWp6/Nr46Z/+vnp/Q9u1cH47+KENthWzJM/+pt4gGmlPTKpnCouOZZNqJ3btXE3Xh+82skeoSqhGFZ4oZJ0Bx9y4O3J6gNIkjc5znmoNC8AxW4YoGaSTmaeRi88p9ZJWOSo7IuEXnCilKUmTRwMIvUZ8LvEFw17eC5CI8yQ3UaRklURQ1s8Zc48x49kW9woDF+BjFfReit/n/H0/XmvmLxPE0DwXign7K588D+K1nAjuRjPzeUAlwByf3J9a+ifD+qqE3bgVwDnPByMgjHXIIxyeCPataLtoYZlRSV4Lc39U1VYk3seOw9SegA7n9O/08l1K5nvpxBE21yNztjK20ROC5HRpnwRErfeOWPyKaseKPE0kjgJGZHkPl20X+118x2BAREA3yvnhRjBJAPqngDwSlpCFHzSP888pAzLIerH+6qjCoo4RFUDoc+3hMN7eV38K38zwpzjg4Xt77/At+GvDkVrCkMK4RB35LMTlndjkvI7ZZmIyWJNZ17GWJzzXQXAJ/wA/5/z61CbYV9dBKCskeNGTXvS1Zzn2CmvYf5/ya6Q2wqlPBW6Z0KdzmLm0rIuYv8/5/wA8/jXU3UB6evSuV8Y62lom+TDM2RFFnBcjksx/hiQcs3HYA81tHXRHRCWtjC8U+JoLOJp7ltqAEqvQvtGSe4VFP3nPfAXcxCn5R8W+Pbi9uIrm/Qx2W4DTYc4itpSTsnvYSPllmUjyJnLCFjh9rvuG9f30upT+fKS9urZgXBAnkQ4V9nQWsJGII8YkfLkEbc9h4k+GM8USvPHlJgQQwz94HKSjszjnBz36kYr0aVNLf7jujyw+Lc5R1Pf3yPrj8+f8nk18IftLz79WvD/d8iP/AL928ZP0+8Rj/wDVX13Bot1bTGNLjzIpD/oyXSl0G0Za1E6fvonUDMbsJUeMEEAoc/Lnxl+GeoC5ubqa1cJNK0m+I+fGqkBUDPGNy4UAZZFBNcGbqdSklFbM9HDJc2r9DlPhhq4DNE38eCn1AIIx6sMflXpJrwxYu4PIPY4I/mQemP8A6/F638QTIcCRx7Zz+hP9Pzr8lxuXOpNzTs+qZ9phMb7OHI1dLqe0q/8Ann/69TLJ/n/6xryWHxxOP4/zC5/lUyfEKb1H4qP6V4ssqq9LfievHHw63PWhKP8AOKXzR6fqK8rHxEm9V/75o/4WJN6r/wB81l/ZVXy/E2+v0z//1fVr8/6BpP8A15g/i0xLH6seSe5rj/CA/wCJrcH0022x7Zup849M4GfXA9K7C/8A+PHSf+vNf/RxrkPB/wDyFbn/ALB1t/6VXFfEy+BH2GXf74/Vn0l8Ml+V/wDfH/oBr0Kx6j/dJ/Hjn61598M/uv8A74/9ANeg2HUf7p/pXNDY7cz/AIj/AK6C3R+b/PpXxt8ZLNV1uSNVURy2e+aMABJHJAMkqAbZHI4LMCSO9fZF397/AD/dr49+NP8AyHj/ANeH/swrOW6PFl8DOG8BzFrSIsSx/eDJJJwsjhRk84UAADsAAOlch8dUCxpIo2yZPzrw/wArAKd4w3yjgc8V1vw8/wCPOL6y/wDo2SuU+Pv+oT6v/wChLXQt0eZh/iPYvAl03lWr7jvMaEtk7iSRklupJ9c19AeFxi/gxxkpnHGcq2c+ue+etfPXgT/UWv8A1yj/APQhX0L4a/4/7f6x/wDoLV9Hgtzop7SPoaMdKeetMj7U89a9lnlS3Y6Q/wBf6VOKgl/x/pU4pE9AFRz9D9P8KkFRz9D9P6imtxrdep8/ai+ZHzz8zdeejEDrWKT1rZvP9Y/+8/8A6Eaxj3r0Y7H3UPhXoEYrzn4mL88Z74P6Nx+VejxV5z8TfvR/Rv8A0KuiB6GD+NHCXR+X/gR/pWPJ1P4Vr3P3f+BH+lZEnU/hXbE9zqVnqpOf5j+dW3qpP/UfzrSp8DLWxu625GjR4OP3d2eOOTLKM8d8EjPoTWB4wQCwbAx8kI4443QjH0xxj0re1/8A5A0f/XK6/wDR0tYXjT/jwb/dh/8AQ4a/kep/yMV/2EfqYmIf+Pa+/wCu0AP0xBx9OTx7msvxAeQO21eO33RWo3/Hrff9doP/AG3rK1/7w/3V/wDQRX9CcJ/7ziv+vj/9JRk/iLvwDQfabg45EC4PcZmOcHtnAz9B6V9a/CdANLssDG9Xd8fxO0p3O395m5yxyT3zXyX8Av8Aj4uP+uK/+jmr61+FX/ILsP8Acb/0Ya/H+MP+RrifSP5I5pbR9Wak3Vvr/SvJ/jxIdkIycEnI7HlOo716xN1b6/0ryX48/cg+p/mlfl/20dcDrf2RT+4vf+v5v/SaCvTY5SJJcE9VI59SQT+I4rzH9kP/AFF7/wBf7f8ApNBXpaf62X/gH8zX7Fhv4EPRHj1f4kvQ0oj83+fWuu+Cg/0CJv4naVnbuzefINznqzYUDccnAHoK5CD7w/z3rr/gp/yD4P8Atr/6US19RlH8V+h4eZ/wl6na3H9B/Wsu5rUuOv4D+ZrLua+yhseBAybmsy4rTuazLiupHatio1ROf5/41K1RP/X/ABrSO5tDofHfjqELrEyqAq+XdZUAAfLLAV4GB8pZiOOCzY6nPB2E5SztXQlHje3MbqSrITKFJRlwyEjj5SOOK7/4g/8AIZl/653f/oy3rz1f+PG3/wB62/8ARwr5Sh/vmK9IH1D/AIS9D9NtKb5F90Qn3JHU+9Wh3qppH3E/3E/lVsd68We58dV3+Zka39018N/E3ibVgOALqEqBwAXjtGcgDoWYlmI6sSTkmvuTWvumvhv4pf6/V/8Ar5t//RVnXs5R/Ffoz3sJ/Dl6Efxf1F4tXuHido3aK2ZnjZkZmMT5ZmQgljgZJOeB6Cvoz9nzxLPLjzZpZOV/1kkj+v8AeY181/HP/kKT/wDXG1/9FSV9Bfs09v8AeX+tbYrqeZX+E+j5x0qLuPx/lU1x2/z3qEdR+P8AKvBqHmS2Z4b8cjm/0tTypmuGKnkbktyUYg8bkJJU4ypJxisz49XrJoV4yMysLWYqykqwIVuQwIIPuDmtL43f8hDS/wDrpdf+kxrG/aF/5AF7/wBek/8A6Ca8VbTPqKfwUz4WSMBUAAACLgAYA+UdAOBUZFTHov8AuL/6DUJrhme3IYw/rXe/CT/j4th2Oovkdjt00suR0O1gGHowBGDXBt/jXefCL/j5tf8AsIyf+ms15a/ix+X5oul/n+R9HaucT6iBwBcWhAHTLWVuWIHTLHknuete+/Bn/kH2v/XM/wDobV4DrX/HxqP/AF8Wf/pDb1778GP+Qda/7h/9Dascj/36v8vzZ4OY/wAGHr/mdhN0P0/qK+Bf2yJyuvWrKSrCC3KspIIIe+wQRggjAxg198z9D9P6ivgP9tD/AJDtt/17wf8Aod9X02K+H/t4WR/x/wDt1l79m796bqeX95OJSgmk+eUKBwglfLhR2UNgV9K+FxmVfw/pXzV+y3/q7v8A67t/IV9LeFf9av8AwH+YpR3R7+M+GR6wv+H/AKFVDxTpiSQusiI64PyuqsP4ucMCP0q+v+H/AKFUOt/6t/of/Zq9Oex8DD+KfOP7O2rSfbruHzH8lMbItzeWvzfwR52L+Ciu1+LkYF/p5AALC8RyOCyLCjqjEcsiv84U5AbkDPNcB+zr/wAhO9/D/wBCr0H4w/8AH9pv1vv/AEnSuWXwo9bC/wAZEbdB9B/IVC1THoPoP5CoWrie59J3EFQsOamFRN1rY0iVrqEEEEAg5BBAIIIIII7gjgg8Gs34KzE6VZZJP7jHJJ4UyBRz2UAADsAB2Fak3T/PoayPgj/yCrL/AK4n/wBClqqfxMzxGy9T0H4YIDf3GedtpBt/2d7yb9v93dtXdjG7aM5wK9qj6V4t8Lv+P+5/69Lb/wBDlr2mPpX22Xfwj4DMf4jIHpyimvTlr2TiWwMKoXNX2qhc1oti4Gfp6/N/n0NfIv7XV2268G5sAQKBk8K7Q7kHPCtubcvQ7jkHJz9d6b97/Poa+P8A9rn797/27f8AoUFdeH+J+h6GH+M7/wCCdov22Ndq7V37VwMLsVwm0YwNgAC4Hy4GMYr6D+IluDaTggEeUxwQDyFyDz3BAIPYivAfgl/x/J/20/8AQZK+gviB/wAes/8A1yf/ANAq63xxFX+NHwh8TRi2nI4KruU9wyuhVgezKehGCO1asPUf571l/E//AI9rj/cP/oa1qR9R/nvXrrZnrUzwD9rHQYUWKRIo1kZ13uqIrtkc7nChmz3yTXzVrtsoPAA69ABX1J+13/qoP99P5V8weIf8a/Oc0+Nn0uA+E5WSiI0slNirwonoS3J91G6koqhH/9k=)
        }
        .nf-bg span {
            font-size: 1.5rem;
            font-weight: bold;
            padding: 0.6rem 1rem;
            color: rgba(255, 0, 0, 0.8);
            line-height: 120%;
            display: table-cell;
            height: calc((100vw - 4px) / 4);
            vertical-align: middle;
        }
        .faith {
            text-align: center;
        }
        .faith .xg1 a{
            font-size: 120%;
            color: red !important;
        }
    ' + '</style>';

}

/* Chinese translation plugin from https://github.com/hustlzp/jquery-s2t, this is a compressed version */
!function(t){var e=new String("万与丑专业丛东丝丢两严丧个丬丰临为丽举么义乌乐乔习乡书买乱争于亏云亘亚产亩亲亵亸亿仅从仑仓仪们价众优伙会伛伞伟传伤伥伦伧伪伫体余佣佥侠侣侥侦侧侨侩侪侬俣俦俨俩俪俭债倾偬偻偾偿傥傧储傩儿兑兖党兰关兴兹养兽冁内冈册写军农冢冯冲决况冻净凄凉凌减凑凛几凤凫凭凯击凼凿刍划刘则刚创删别刬刭刽刿剀剂剐剑剥剧劝办务劢动励劲劳势勋勐勚匀匦匮区医华协单卖卢卤卧卫却卺厂厅历厉压厌厍厕厢厣厦厨厩厮县参叆叇双发变叙叠叶号叹叽吁后吓吕吗吣吨听启吴呒呓呕呖呗员呙呛呜咏咔咙咛咝咤咴咸哌响哑哒哓哔哕哗哙哜哝哟唛唝唠唡唢唣唤唿啧啬啭啮啰啴啸喷喽喾嗫呵嗳嘘嘤嘱噜噼嚣嚯团园囱围囵国图圆圣圹场坂坏块坚坛坜坝坞坟坠垄垅垆垒垦垧垩垫垭垯垱垲垴埘埙埚埝埯堑堕塆墙壮声壳壶壸处备复够头夸夹夺奁奂奋奖奥妆妇妈妩妪妫姗姜娄娅娆娇娈娱娲娴婳婴婵婶媪嫒嫔嫱嬷孙学孪宁宝实宠审宪宫宽宾寝对寻导寿将尔尘尧尴尸尽层屃屉届属屡屦屿岁岂岖岗岘岙岚岛岭岳岽岿峃峄峡峣峤峥峦崂崃崄崭嵘嵚嵛嵝嵴巅巩巯币帅师帏帐帘帜带帧帮帱帻帼幂幞干并广庄庆庐庑库应庙庞废庼廪开异弃张弥弪弯弹强归当录彟彦彻径徕御忆忏忧忾怀态怂怃怄怅怆怜总怼怿恋恳恶恸恹恺恻恼恽悦悫悬悭悯惊惧惨惩惫惬惭惮惯愍愠愤愦愿慑慭憷懑懒懔戆戋戏戗战戬户扎扑扦执扩扪扫扬扰抚抛抟抠抡抢护报担拟拢拣拥拦拧拨择挂挚挛挜挝挞挟挠挡挢挣挤挥挦捞损捡换捣据捻掳掴掷掸掺掼揸揽揿搀搁搂搅携摄摅摆摇摈摊撄撑撵撷撸撺擞攒敌敛数斋斓斗斩断无旧时旷旸昙昼昽显晋晒晓晔晕晖暂暧札术朴机杀杂权条来杨杩杰极构枞枢枣枥枧枨枪枫枭柜柠柽栀栅标栈栉栊栋栌栎栏树栖样栾桊桠桡桢档桤桥桦桧桨桩梦梼梾检棂椁椟椠椤椭楼榄榇榈榉槚槛槟槠横樯樱橥橱橹橼檐檩欢欤欧歼殁殇残殒殓殚殡殴毁毂毕毙毡毵氇气氢氩氲汇汉污汤汹沓沟没沣沤沥沦沧沨沩沪沵泞泪泶泷泸泺泻泼泽泾洁洒洼浃浅浆浇浈浉浊测浍济浏浐浑浒浓浔浕涂涌涛涝涞涟涠涡涢涣涤润涧涨涩淀渊渌渍渎渐渑渔渖渗温游湾湿溃溅溆溇滗滚滞滟滠满滢滤滥滦滨滩滪漤潆潇潋潍潜潴澜濑濒灏灭灯灵灾灿炀炉炖炜炝点炼炽烁烂烃烛烟烦烧烨烩烫烬热焕焖焘煅煳熘爱爷牍牦牵牺犊犟状犷犸犹狈狍狝狞独狭狮狯狰狱狲猃猎猕猡猪猫猬献獭玑玙玚玛玮环现玱玺珉珏珐珑珰珲琎琏琐琼瑶瑷璇璎瓒瓮瓯电画畅畲畴疖疗疟疠疡疬疮疯疱疴痈痉痒痖痨痪痫痴瘅瘆瘗瘘瘪瘫瘾瘿癞癣癫癯皑皱皲盏盐监盖盗盘眍眦眬着睁睐睑瞒瞩矫矶矾矿砀码砖砗砚砜砺砻砾础硁硅硕硖硗硙硚确硷碍碛碜碱碹磙礼祎祢祯祷祸禀禄禅离秃秆种积称秽秾稆税稣稳穑穷窃窍窑窜窝窥窦窭竖竞笃笋笔笕笺笼笾筑筚筛筜筝筹签简箓箦箧箨箩箪箫篑篓篮篱簖籁籴类籼粜粝粤粪粮糁糇紧絷纟纠纡红纣纤纥约级纨纩纪纫纬纭纮纯纰纱纲纳纴纵纶纷纸纹纺纻纼纽纾线绀绁绂练组绅细织终绉绊绋绌绍绎经绐绑绒结绔绕绖绗绘给绚绛络绝绞统绠绡绢绣绤绥绦继绨绩绪绫绬续绮绯绰绱绲绳维绵绶绷绸绹绺绻综绽绾绿缀缁缂缃缄缅缆缇缈缉缊缋缌缍缎缏缐缑缒缓缔缕编缗缘缙缚缛缜缝缞缟缠缡缢缣缤缥缦缧缨缩缪缫缬缭缮缯缰缱缲缳缴缵罂网罗罚罢罴羁羟羡翘翙翚耢耧耸耻聂聋职聍联聩聪肃肠肤肷肾肿胀胁胆胜胧胨胪胫胶脉脍脏脐脑脓脔脚脱脶脸腊腌腘腭腻腼腽腾膑臜舆舣舰舱舻艰艳艹艺节芈芗芜芦苁苇苈苋苌苍苎苏苘苹茎茏茑茔茕茧荆荐荙荚荛荜荞荟荠荡荣荤荥荦荧荨荩荪荫荬荭荮药莅莜莱莲莳莴莶获莸莹莺莼萚萝萤营萦萧萨葱蒇蒉蒋蒌蓝蓟蓠蓣蓥蓦蔷蔹蔺蔼蕲蕴薮藁藓虏虑虚虫虬虮虽虾虿蚀蚁蚂蚕蚝蚬蛊蛎蛏蛮蛰蛱蛲蛳蛴蜕蜗蜡蝇蝈蝉蝎蝼蝾螀螨蟏衅衔补衬衮袄袅袆袜袭袯装裆裈裢裣裤裥褛褴襁襕见观觃规觅视觇览觉觊觋觌觍觎觏觐觑觞触觯詟誉誊讠计订讣认讥讦讧讨让讪讫训议讯记讱讲讳讴讵讶讷许讹论讻讼讽设访诀证诂诃评诅识诇诈诉诊诋诌词诎诏诐译诒诓诔试诖诗诘诙诚诛诜话诞诟诠诡询诣诤该详诧诨诩诪诫诬语诮误诰诱诲诳说诵诶请诸诹诺读诼诽课诿谀谁谂调谄谅谆谇谈谊谋谌谍谎谏谐谑谒谓谔谕谖谗谘谙谚谛谜谝谞谟谠谡谢谣谤谥谦谧谨谩谪谫谬谭谮谯谰谱谲谳谴谵谶谷豮贝贞负贠贡财责贤败账货质贩贪贫贬购贮贯贰贱贲贳贴贵贶贷贸费贺贻贼贽贾贿赀赁赂赃资赅赆赇赈赉赊赋赌赍赎赏赐赑赒赓赔赕赖赗赘赙赚赛赜赝赞赟赠赡赢赣赪赵赶趋趱趸跃跄跖跞践跶跷跸跹跻踊踌踪踬踯蹑蹒蹰蹿躏躜躯车轧轨轩轪轫转轭轮软轰轱轲轳轴轵轶轷轸轹轺轻轼载轾轿辀辁辂较辄辅辆辇辈辉辊辋辌辍辎辏辐辑辒输辔辕辖辗辘辙辚辞辩辫边辽达迁过迈运还这进远违连迟迩迳迹适选逊递逦逻遗遥邓邝邬邮邹邺邻郁郄郏郐郑郓郦郧郸酝酦酱酽酾酿释里鉅鉴銮錾钆钇针钉钊钋钌钍钎钏钐钑钒钓钔钕钖钗钘钙钚钛钝钞钟钠钡钢钣钤钥钦钧钨钩钪钫钬钭钮钯钰钱钲钳钴钵钶钷钸钹钺钻钼钽钾钿铀铁铂铃铄铅铆铈铉铊铋铍铎铏铐铑铒铕铗铘铙铚铛铜铝铞铟铠铡铢铣铤铥铦铧铨铪铫铬铭铮铯铰铱铲铳铴铵银铷铸铹铺铻铼铽链铿销锁锂锃锄锅锆锇锈锉锊锋锌锍锎锏锐锑锒锓锔锕锖锗错锚锜锞锟锠锡锢锣锤锥锦锨锩锫锬锭键锯锰锱锲锳锴锵锶锷锸锹锺锻锼锽锾锿镀镁镂镃镆镇镈镉镊镌镍镎镏镐镑镒镕镖镗镙镚镛镜镝镞镟镠镡镢镣镤镥镦镧镨镩镪镫镬镭镮镯镰镱镲镳镴镶长门闩闪闫闬闭问闯闰闱闲闳间闵闶闷闸闹闺闻闼闽闾闿阀阁阂阃阄阅阆阇阈阉阊阋阌阍阎阏阐阑阒阓阔阕阖阗阘阙阚阛队阳阴阵阶际陆陇陈陉陕陧陨险随隐隶隽难雏雠雳雾霁霉霭靓静靥鞑鞒鞯鞴韦韧韨韩韪韫韬韵页顶顷顸项顺须顼顽顾顿颀颁颂颃预颅领颇颈颉颊颋颌颍颎颏颐频颒颓颔颕颖颗题颙颚颛颜额颞颟颠颡颢颣颤颥颦颧风飏飐飑飒飓飔飕飖飗飘飙飚飞飨餍饤饥饦饧饨饩饪饫饬饭饮饯饰饱饲饳饴饵饶饷饸饹饺饻饼饽饾饿馀馁馂馃馄馅馆馇馈馉馊馋馌馍馎馏馐馑馒馓馔馕马驭驮驯驰驱驲驳驴驵驶驷驸驹驺驻驼驽驾驿骀骁骂骃骄骅骆骇骈骉骊骋验骍骎骏骐骑骒骓骔骕骖骗骘骙骚骛骜骝骞骟骠骡骢骣骤骥骦骧髅髋髌鬓魇魉鱼鱽鱾鱿鲀鲁鲂鲄鲅鲆鲇鲈鲉鲊鲋鲌鲍鲎鲏鲐鲑鲒鲓鲔鲕鲖鲗鲘鲙鲚鲛鲜鲝鲞鲟鲠鲡鲢鲣鲤鲥鲦鲧鲨鲩鲪鲫鲬鲭鲮鲯鲰鲱鲲鲳鲴鲵鲶鲷鲸鲹鲺鲻鲼鲽鲾鲿鳀鳁鳂鳃鳄鳅鳆鳇鳈鳉鳊鳋鳌鳍鳎鳏鳐鳑鳒鳓鳔鳕鳖鳗鳘鳙鳛鳜鳝鳞鳟鳠鳡鳢鳣鸟鸠鸡鸢鸣鸤鸥鸦鸧鸨鸩鸪鸫鸬鸭鸮鸯鸰鸱鸲鸳鸴鸵鸶鸷鸸鸹鸺鸻鸼鸽鸾鸿鹀鹁鹂鹃鹄鹅鹆鹇鹈鹉鹊鹋鹌鹍鹎鹏鹐鹑鹒鹓鹔鹕鹖鹗鹘鹚鹛鹜鹝鹞鹟鹠鹡鹢鹣鹤鹥鹦鹧鹨鹩鹪鹫鹬鹭鹯鹰鹱鹲鹳鹴鹾麦麸黄黉黡黩黪黾鼋鼌鼍鼗鼹齄齐齑齿龀龁龂龃龄龅龆龇龈龉龊龋龌龙龚龛龟志制咨只里系范松没尝尝闹面准钟别闲干尽脏拼"),n=new String("萬與醜專業叢東絲丟兩嚴喪個爿豐臨為麗舉麼義烏樂喬習鄉書買亂爭於虧雲亙亞產畝親褻嚲億僅從侖倉儀們價眾優夥會傴傘偉傳傷倀倫傖偽佇體餘傭僉俠侶僥偵側僑儈儕儂俁儔儼倆儷儉債傾傯僂僨償儻儐儲儺兒兌兗黨蘭關興茲養獸囅內岡冊寫軍農塚馮衝決況凍淨淒涼淩減湊凜幾鳳鳧憑凱擊氹鑿芻劃劉則剛創刪別剗剄劊劌剴劑剮劍剝劇勸辦務勱動勵勁勞勢勳猛勩勻匭匱區醫華協單賣盧鹵臥衛卻巹廠廳曆厲壓厭厙廁廂厴廈廚廄廝縣參靉靆雙發變敘疊葉號歎嘰籲後嚇呂嗎唚噸聽啟吳嘸囈嘔嚦唄員咼嗆嗚詠哢嚨嚀噝吒噅鹹呱響啞噠嘵嗶噦嘩噲嚌噥喲嘜嗊嘮啢嗩唕喚呼嘖嗇囀齧囉嘽嘯噴嘍嚳囁嗬噯噓嚶囑嚕劈囂謔團園囪圍圇國圖圓聖壙場阪壞塊堅壇壢壩塢墳墜壟壟壚壘墾坰堊墊埡墶壋塏堖塒塤堝墊垵塹墮壪牆壯聲殼壺壼處備複夠頭誇夾奪奩奐奮獎奧妝婦媽嫵嫗媯姍薑婁婭嬈嬌孌娛媧嫻嫿嬰嬋嬸媼嬡嬪嬙嬤孫學孿寧寶實寵審憲宮寬賓寢對尋導壽將爾塵堯尷屍盡層屭屜屆屬屢屨嶼歲豈嶇崗峴嶴嵐島嶺嶽崠巋嶨嶧峽嶢嶠崢巒嶗崍嶮嶄嶸嶔崳嶁脊巔鞏巰幣帥師幃帳簾幟帶幀幫幬幘幗冪襆幹並廣莊慶廬廡庫應廟龐廢廎廩開異棄張彌弳彎彈強歸當錄彠彥徹徑徠禦憶懺憂愾懷態慫憮慪悵愴憐總懟懌戀懇惡慟懨愷惻惱惲悅愨懸慳憫驚懼慘懲憊愜慚憚慣湣慍憤憒願懾憖怵懣懶懍戇戔戲戧戰戩戶紮撲扡執擴捫掃揚擾撫拋摶摳掄搶護報擔擬攏揀擁攔擰撥擇掛摯攣掗撾撻挾撓擋撟掙擠揮撏撈損撿換搗據撚擄摑擲撣摻摜摣攬撳攙擱摟攪攜攝攄擺搖擯攤攖撐攆擷擼攛擻攢敵斂數齋斕鬥斬斷無舊時曠暘曇晝曨顯晉曬曉曄暈暉暫曖劄術樸機殺雜權條來楊榪傑極構樅樞棗櫪梘棖槍楓梟櫃檸檉梔柵標棧櫛櫳棟櫨櫟欄樹棲樣欒棬椏橈楨檔榿橋樺檜槳樁夢檮棶檢欞槨櫝槧欏橢樓欖櫬櫚櫸檟檻檳櫧橫檣櫻櫫櫥櫓櫞簷檁歡歟歐殲歿殤殘殞殮殫殯毆毀轂畢斃氈毿氌氣氫氬氳彙漢汙湯洶遝溝沒灃漚瀝淪滄渢溈滬濔濘淚澩瀧瀘濼瀉潑澤涇潔灑窪浹淺漿澆湞溮濁測澮濟瀏滻渾滸濃潯濜塗湧濤澇淶漣潿渦溳渙滌潤澗漲澀澱淵淥漬瀆漸澠漁瀋滲溫遊灣濕潰濺漵漊潷滾滯灩灄滿瀅濾濫灤濱灘澦濫瀠瀟瀲濰潛瀦瀾瀨瀕灝滅燈靈災燦煬爐燉煒熗點煉熾爍爛烴燭煙煩燒燁燴燙燼熱煥燜燾煆糊溜愛爺牘犛牽犧犢強狀獷獁猶狽麅獮獰獨狹獅獪猙獄猻獫獵獼玀豬貓蝟獻獺璣璵瑒瑪瑋環現瑲璽瑉玨琺瓏璫琿璡璉瑣瓊瑤璦璿瓔瓚甕甌電畫暢佘疇癤療瘧癘瘍鬁瘡瘋皰屙癰痙癢瘂癆瘓癇癡癉瘮瘞瘺癟癱癮癭癩癬癲臒皚皺皸盞鹽監蓋盜盤瞘眥矓著睜睞瞼瞞矚矯磯礬礦碭碼磚硨硯碸礪礱礫礎硜矽碩硤磽磑礄確鹼礙磧磣堿镟滾禮禕禰禎禱禍稟祿禪離禿稈種積稱穢穠穭稅穌穩穡窮竊竅窯竄窩窺竇窶豎競篤筍筆筧箋籠籩築篳篩簹箏籌簽簡籙簀篋籜籮簞簫簣簍籃籬籪籟糴類秈糶糲粵糞糧糝餱緊縶糸糾紆紅紂纖紇約級紈纊紀紉緯紜紘純紕紗綱納紝縱綸紛紙紋紡紵紖紐紓線紺絏紱練組紳細織終縐絆紼絀紹繹經紿綁絨結絝繞絰絎繪給絢絳絡絕絞統綆綃絹繡綌綏絛繼綈績緒綾緓續綺緋綽緔緄繩維綿綬繃綢綯綹綣綜綻綰綠綴緇緙緗緘緬纜緹緲緝縕繢緦綞緞緶線緱縋緩締縷編緡緣縉縛縟縝縫縗縞纏縭縊縑繽縹縵縲纓縮繆繅纈繚繕繒韁繾繰繯繳纘罌網羅罰罷羆羈羥羨翹翽翬耮耬聳恥聶聾職聹聯聵聰肅腸膚膁腎腫脹脅膽勝朧腖臚脛膠脈膾髒臍腦膿臠腳脫腡臉臘醃膕齶膩靦膃騰臏臢輿艤艦艙艫艱豔艸藝節羋薌蕪蘆蓯葦藶莧萇蒼苧蘇檾蘋莖蘢蔦塋煢繭荊薦薘莢蕘蓽蕎薈薺蕩榮葷滎犖熒蕁藎蓀蔭蕒葒葤藥蒞蓧萊蓮蒔萵薟獲蕕瑩鶯蓴蘀蘿螢營縈蕭薩蔥蕆蕢蔣蔞藍薊蘺蕷鎣驀薔蘞藺藹蘄蘊藪槁蘚虜慮虛蟲虯蟣雖蝦蠆蝕蟻螞蠶蠔蜆蠱蠣蟶蠻蟄蛺蟯螄蠐蛻蝸蠟蠅蟈蟬蠍螻蠑螿蟎蠨釁銜補襯袞襖嫋褘襪襲襏裝襠褌褳襝褲襇褸襤繈襴見觀覎規覓視覘覽覺覬覡覿覥覦覯覲覷觴觸觶讋譽謄訁計訂訃認譏訐訌討讓訕訖訓議訊記訒講諱謳詎訝訥許訛論訩訟諷設訪訣證詁訶評詛識詗詐訴診詆謅詞詘詔詖譯詒誆誄試詿詩詰詼誠誅詵話誕詬詮詭詢詣諍該詳詫諢詡譸誡誣語誚誤誥誘誨誑說誦誒請諸諏諾讀諑誹課諉諛誰諗調諂諒諄誶談誼謀諶諜謊諫諧謔謁謂諤諭諼讒諮諳諺諦謎諞諝謨讜謖謝謠謗諡謙謐謹謾謫譾謬譚譖譙讕譜譎讞譴譫讖穀豶貝貞負貟貢財責賢敗賬貨質販貪貧貶購貯貫貳賤賁貰貼貴貺貸貿費賀貽賊贄賈賄貲賃賂贓資賅贐賕賑賚賒賦賭齎贖賞賜贔賙賡賠賧賴賵贅賻賺賽賾贗讚贇贈贍贏贛赬趙趕趨趲躉躍蹌蹠躒踐躂蹺蹕躚躋踴躊蹤躓躑躡蹣躕躥躪躦軀車軋軌軒軑軔轉軛輪軟轟軲軻轤軸軹軼軤軫轢軺輕軾載輊轎輈輇輅較輒輔輛輦輩輝輥輞輬輟輜輳輻輯轀輸轡轅轄輾轆轍轔辭辯辮邊遼達遷過邁運還這進遠違連遲邇逕跡適選遜遞邐邏遺遙鄧鄺鄔郵鄒鄴鄰鬱郤郟鄶鄭鄆酈鄖鄲醞醱醬釅釃釀釋裏钜鑒鑾鏨釓釔針釘釗釙釕釷釺釧釤鈒釩釣鍆釹鍚釵鈃鈣鈈鈦鈍鈔鍾鈉鋇鋼鈑鈐鑰欽鈞鎢鉤鈧鈁鈥鈄鈕鈀鈺錢鉦鉗鈷缽鈳鉕鈽鈸鉞鑽鉬鉭鉀鈿鈾鐵鉑鈴鑠鉛鉚鈰鉉鉈鉍鈹鐸鉶銬銠鉺銪鋏鋣鐃銍鐺銅鋁銱銦鎧鍘銖銑鋌銩銛鏵銓鉿銚鉻銘錚銫鉸銥鏟銃鐋銨銀銣鑄鐒鋪鋙錸鋱鏈鏗銷鎖鋰鋥鋤鍋鋯鋨鏽銼鋝鋒鋅鋶鐦鐧銳銻鋃鋟鋦錒錆鍺錯錨錡錁錕錩錫錮鑼錘錐錦鍁錈錇錟錠鍵鋸錳錙鍥鍈鍇鏘鍶鍔鍤鍬鍾鍛鎪鍠鍰鎄鍍鎂鏤鎡鏌鎮鎛鎘鑷鐫鎳鎿鎦鎬鎊鎰鎔鏢鏜鏍鏰鏞鏡鏑鏃鏇鏐鐔钁鐐鏷鑥鐓鑭鐠鑹鏹鐙鑊鐳鐶鐲鐮鐿鑔鑣鑞鑲長門閂閃閆閈閉問闖閏闈閑閎間閔閌悶閘鬧閨聞闥閩閭闓閥閣閡閫鬮閱閬闍閾閹閶鬩閿閽閻閼闡闌闃闠闊闋闔闐闒闕闞闤隊陽陰陣階際陸隴陳陘陝隉隕險隨隱隸雋難雛讎靂霧霽黴靄靚靜靨韃鞽韉韝韋韌韍韓韙韞韜韻頁頂頃頇項順須頊頑顧頓頎頒頌頏預顱領頗頸頡頰頲頜潁熲頦頤頻頮頹頷頴穎顆題顒顎顓顏額顳顢顛顙顥纇顫顬顰顴風颺颭颮颯颶颸颼颻飀飄飆飆飛饗饜飣饑飥餳飩餼飪飫飭飯飲餞飾飽飼飿飴餌饒餉餄餎餃餏餅餑餖餓餘餒餕餜餛餡館餷饋餶餿饞饁饃餺餾饈饉饅饊饌饢馬馭馱馴馳驅馹駁驢駔駛駟駙駒騶駐駝駑駕驛駘驍罵駰驕驊駱駭駢驫驪騁驗騂駸駿騏騎騍騅騌驌驂騙騭騤騷騖驁騮騫騸驃騾驄驏驟驥驦驤髏髖髕鬢魘魎魚魛魢魷魨魯魴魺鮁鮃鯰鱸鮋鮓鮒鮊鮑鱟鮍鮐鮭鮚鮳鮪鮞鮦鰂鮜鱠鱭鮫鮮鮺鯗鱘鯁鱺鰱鰹鯉鰣鰷鯀鯊鯇鮶鯽鯒鯖鯪鯕鯫鯡鯤鯧鯝鯢鯰鯛鯨鯵鯴鯔鱝鰈鰏鱨鯷鰮鰃鰓鱷鰍鰒鰉鰁鱂鯿鰠鼇鰭鰨鰥鰩鰟鰜鰳鰾鱈鱉鰻鰵鱅鰼鱖鱔鱗鱒鱯鱤鱧鱣鳥鳩雞鳶鳴鳲鷗鴉鶬鴇鴆鴣鶇鸕鴨鴞鴦鴒鴟鴝鴛鴬鴕鷥鷙鴯鴰鵂鴴鵃鴿鸞鴻鵐鵓鸝鵑鵠鵝鵒鷳鵜鵡鵲鶓鵪鶤鵯鵬鵮鶉鶊鵷鷫鶘鶡鶚鶻鶿鶥鶩鷊鷂鶲鶹鶺鷁鶼鶴鷖鸚鷓鷚鷯鷦鷲鷸鷺鸇鷹鸌鸏鸛鸘鹺麥麩黃黌黶黷黲黽黿鼂鼉鞀鼴齇齊齏齒齔齕齗齟齡齙齠齜齦齬齪齲齷龍龔龕龜誌製谘隻裡係範鬆冇嚐嘗鬨麵準鐘彆閒乾儘臟拚");function i(t,i){var r,a,u,f,o,c,l="";if(i?(o=e,c=n):(o=n,c=e),"string"!=typeof t)return t;for(r=0;r<t.length;r++)a=t.charAt(r),(u=t.charCodeAt(r))>13312&&u<40899||u>63744&&u<64106?l+=-1!==(f=o.indexOf(a))?c.charAt(f):a:l+=a;return l}function r(t,e,n){var a,u;if(e instanceof Array)for(a=0;a<e.length;a++)r(t,e[a],n);else""!==(u=t.getAttribute(e))&&null!==u&&t.setAttribute(e,i(u,n))}function a(t,e){var n,u;if(1===t.nodeType)for(u=t.childNodes,n=0;n<u.length;n++){var f=u.item(n);if(1===f.nodeType){if(-1!=="|BR|HR|TEXTAREA|SCRIPT|OBJECT|EMBED|".indexOf("|"+f.tagName+"|"))continue;r(f,["title","data-original-title","alt","placeholder"],e),"INPUT"===f.tagName&&""!==f.value&&"text"!==f.type&&"hidden"!==f.type&&(f.value=i(f.value,e)),a(f,e)}else 3===f.nodeType&&(f.data=i(f.data,e))}}t.extend({s2t:function(t){return i(t,!0)},t2s:function(t){return i(t,!1)}}),t.fn.extend({s2t:function(){return this.each(function(){a(this,!0)})},t2s:function(){return this.each(function(){a(this,!1)})}})}(jQuery);
