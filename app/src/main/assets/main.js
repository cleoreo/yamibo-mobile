var imgArr = [];

runAfterLoad();

function runAfterLoad () {

  loadGlobalCSS();
  /* if it is in mobile standard mode (mobile=1) */
  if (/\bmobile=1\b/.test(window.location.search)) {
    mobile1SetUp();
  }

  /* if it is in mobile search page */
  if (/\bmobile=2\b/.test(window.location.search) && /\bsearch.php\b/.test(window.location.href)) {
    jQuery('head').append(customCSS());

    new MutationObserver(function (mutations) {
      jQuery('.header h2 img').css('opacity', '0');
      jQuery('.header h2 img').attr('src', '/template/oyeeh_com_baihe/img/config/img/logo.png');
      jQuery('.header h2 img').css('opacity', '1');
    }).observe(document, {childList: true, subtree: true});

    jQuery(document).ready(function () {
      initSettings();
      /* change logo link to mobile 1 */
      jQuery('.header h2 a').attr('href', jQuery('.header h2 a').attr('href').replace("mobile=2", "mobile=1"));

      /* replace search result links to open in mobile 1 view */
      jQuery('.threadlist ul a').each(function () {
        var newhref = jQuery(this).attr('href').replace('mobile=2', 'mobile=1');
        jQuery(this).attr('href', newhref);
      });

      /* remove last link */
      var links = jQuery('.footer div:last-of-type').html().split("|");
      links = links.slice(0, -1);
      links = links.join("|");
      jQuery('.footer div:last-of-type').html(links);
    });
  }

  /* for debuging */
  setTimeout(function () {
    if (jQuery('.debug-tool').length === 0) {
      jQuery('body').append('<div class="debug-tool"><button class="copy-link">複製本頁鏈接</button></div>');
    }
    jQuery('.copy-link').click(function () {
      var toBeCopy = window.location.href;
      if (window.localStorage.getItem("copyUrl") === "desktop" && /\bmobile=1\b/.test(window.location.search)) {
        toBeCopy = jQuery('.ft .xw0').last().attr("href");
      }
      window.prompt('你已複製鏈接', toBeCopy);
    });
  }, 800);
}

function mobile1SetUp () {
  var head = jQuery('head');
  var body = jQuery('body');
  var menuBtn = jQuery('#menu-btn');
  var scrollBtn = jQuery('#scroll-button');
  var historyBtn = jQuery('#history-button');
  var sideMenu = jQuery('#side-menu');

  /* Add CSS on page load */
  body.css('min-width', '100vw');
  head.append('<meta name=\"viewport\" content=\"initial-scale=1,maximum-scale=1,width=device-width,user-scalable=0\">');

  themeSetting();

  head.append(customCSS());

  /* check logo exist and change it */
  new MutationObserver(function (mutations) {
    var logo = jQuery('.hd img');
    logo.css('opacity', '0');
    logo.attr('src', '/template/oyeeh_com_baihe/img/config/img/logo.png');
    logo.css('opacity', '1');
  }).observe(document, {childList: true, subtree: true});

  /* when document ready add html elements */
  jQuery(document).ready(function () {

    /* add back to top button and go to bottom button */
    if (scrollBtn.length === 0) {
      body.append(scrollBtnHtml());
    }
    if (historyBtn.length === 0) {
      body.append(historyBtnHtml());
    }

    /* add menu button */
    if (menuBtn.length === 0) {
      jQuery('.hd').append(menuBtnHtml());
      /* menu button listener */
      jQuery('#menu-btn').click(function () {
        jQuery('body').addClass('menu-opened');
        jQuery('#side-menu >div').scrollTop(0);
        window.scrollTo(0, 0);
      });
    }

    /* move prev page link before next link */
    jQuery('.wp .pg .prev').each(function () {
      jQuery(this).parent().find('label').after(jQuery(this));
    });

    /* add side menu */
    if (sideMenu.length === 0) {
      jQuery('body').append(sideMenuHtml());
    }

    /* move logout link to side menu */
    jQuery('#logout').html(jQuery('.wp >.pd2 a').last()[0].outerHTML);
    if (jQuery('.wp >.pd2 a').length > 1) {
      jQuery('.wp >.pd2 a:last').remove();
    }
    /* Add search link on top */
    if (jQuery('#search-link').length === 0) {
      jQuery('.wp >.pd2').append('<a href="https://bbs.yamibo.com/search.php?mod=forum&mobile=2" id="search-link">搜索</a>');
    }

    /* add side menu listener */
    jQuery('#side-menu').click(function (e) {
      if (e.target == this) {
        jQuery('body').removeClass('menu-opened');
      }
    });

    /* init all settings */
    initSettings();

    /* format all textarea */
    textAreaAutoGrow();

    /* replace all form url in action*/
    formActionUrlHandler();

    /* error handling */
    if (jQuery('#messagetext').length) {
      jQuery('#messagetext a').each(function () {
        if (jQuery(this).attr('href').split('/./?mobile=1')) {
          jQuery(this).attr('href', "https://bbs.yamibo.com/forum.php?mobile=1");
        }
      });
    }
  });

  /* when inside a forum page */
  if (/\b&fid=\b/.test(window.location.search) && !/\b&action=\b/.test(window.location.search)) {
    forumPageSetup();
  }

  /* when inside a post */
  if ((/\b&tid=\b/.test(window.location.search) || /\bthread\b/.test(window.location.href)) && !/\baction=\b/.test(window.location.search)) {
    postPageSetUp();
  }

  /* when inside pm page */
  if (/\bdo=pm\b/.test(window.location.search)) {
    pmPageSetUp();
  }

  /* when inside logout page */
  if (/\baction=logout\b/.test(window.location.search)) {
    logoutPageSetUp();
  }
}


function forumPageSetup () {

  jQuery('body').addClass('is-forum');

  jQuery(document).ready(function () {
    /* format post date and time */
    jQuery('.tl .bm_c .xg1').each(function () {
      var dateText = jQuery.trim(jQuery(this).clone().children().remove().end().text());
      var linkElement = jQuery(this).html().split('</a>')[0] + '</a>';
      var newHtml = '<div class="post-info">' + linkElement;
      if (dateText.split('回').length > 1) {
        newHtml += '<span class="no-of-reply"><i class="fas fa-comment-dots"></i>' + dateText.split('回')[1] + '</span>';
      } else {
        newHtml += '<span class="no-of-reply"><i class="fas fa-comment-dots"></i>0</span>';
      }
      newHtml += '</div>';
      newHtml += '<div  class="time"><span class="create-time">' + dateText.split('回')[0] + '</span></div>';
      jQuery(this).html(newHtml);
    });

    /* check display post time setting */
    displayPostTimeSetting();

    /* add mobile=1 into go to page field redirect link  */
    var redirectStr = jQuery('input[name=custompage]').attr('onkeydown').split('&page=');
    redirectStr = redirectStr[0] + '&mobile=1' + '&page=' + redirectStr[1];
    jQuery('input[name=custompage]').attr('onkeydown', redirectStr);
  });
}

function postPageSetUp () {
  /* handle keyboard cover comment box */
  jQuery('body').addClass('is-post');

  jQuery(document).ready(function () {

    jQuery('.vt >.bm >.bm_h a:last-of-type').contents().unwrap();
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
        if (/\bmobile=yes\b/.test(href) || /\bmobile=2\b/.test(href) || /\bmobile=no\b/.test(href)) {
          href = href.replace('mobile=yes', 'mobile=1');
          href = href.replace('mobile=no', 'mobile=1');
          href = href.replace('mobile=2', 'mobile=1');
        } else {
          if (href.split('?').length > 1) {
            href = href.split('?')[0] + '?mobile=1&' + href.split('?')[1];
          } else {
            if (href.slice(-1) === "/") {
              href = href + "forum.php?mobile=1";
            } else if (href.slice(-4) === ".com") {
              href = href + "/forum.php?mobile=1";
            } else if (href.split('#').length > 1) {
              href = href.split('#')[0] + '?mobile=1' + href.split('#')[1];
            } else {
              href = href + '?mobile=1';
            }
          }
        }
        jQuery(this).attr('href', href);
      }
    });
  });

}

function pmPageSetUp () {

  jQuery('body').addClass('is-pm');

  jQuery(document).ready(function () {
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

    if (/\bsubop=view\b/.test(window.location.search)) {
      jQuery('body').addClass('is-pm-details');
    }
  });
}

function logoutPageSetUp () {

  jQuery('body').addClass('is-logout');

  jQuery(document).ready(function () {

    jQuery('a').each(function () {
      var href = jQuery(this).attr('href');
      if (href.split("mobile=2")) {
        jQuery(this).attr('href', href.replace("mobile=2", "mobile=1"));
      } else if (href.split("mobile=yes")) {
        jQuery(this).attr('href', href.replace("mobile=yes", "mobile=1"));
      }
    });

  });
}



/*||mobile2Functions||*/


function loadGlobalCSS () {
  jQuery('html').find('script').filter(function () {
    return jQuery(this).attr('src') === 'https://bbs.yamibo.com/source/plugin/oyeeh_geo/template/js/geo.js';
  }).remove();
  var head = jQuery('head');
  head.append(photoswipeCSS());
  head.append(photoswipeDefaultSkinCSS());
  head.append(fontAwesomeCSS());
}

function photoswipeCSS () {
  return '<style>' + '.pswp{display:none;position:absolute;width:100%;height:100%;left:0;top:0;overflow:hidden;-ms-touch-action:none;touch-action:none;z-index:1500;-webkit-text-size-adjust:100%;-webkit-backface-visibility:hidden;outline:0}.pswp *{-webkit-box-sizing:border-box;box-sizing:border-box}.pswp img{max-width:none}.pswp--animate_opacity{opacity:.001;will-change:opacity;-webkit-transition:opacity 333ms cubic-bezier(.4,0,.22,1);transition:opacity 333ms cubic-bezier(.4,0,.22,1)}.pswp--open{display:block}.pswp--zoom-allowed .pswp__img{cursor:-webkit-zoom-in;cursor:-moz-zoom-in;cursor:zoom-in}.pswp--zoomed-in .pswp__img{cursor:-webkit-grab;cursor:-moz-grab;cursor:grab}.pswp--dragging .pswp__img{cursor:-webkit-grabbing;cursor:-moz-grabbing;cursor:grabbing}.pswp__bg{position:absolute;left:0;top:0;width:100%;height:100%;background:#000;opacity:0;-webkit-transform:translateZ(0);transform:translateZ(0);-webkit-backface-visibility:hidden;will-change:opacity}.pswp__scroll-wrap{position:absolute;left:0;top:0;width:100%;height:100%;overflow:hidden}.pswp__container,.pswp__zoom-wrap{-ms-touch-action:none;touch-action:none;position:absolute;left:0;right:0;top:0;bottom:0}.pswp__container,.pswp__img{-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;-webkit-tap-highlight-color:transparent;-webkit-touch-callout:none}.pswp__zoom-wrap{position:absolute;width:100%;-webkit-transform-origin:left top;-ms-transform-origin:left top;transform-origin:left top;-webkit-transition:-webkit-transform 333ms cubic-bezier(.4,0,.22,1);transition:transform 333ms cubic-bezier(.4,0,.22,1)}.pswp__bg{will-change:opacity;-webkit-transition:opacity 333ms cubic-bezier(.4,0,.22,1);transition:opacity 333ms cubic-bezier(.4,0,.22,1)}.pswp--animated-in .pswp__bg,.pswp--animated-in .pswp__zoom-wrap{-webkit-transition:none;transition:none}.pswp__container,.pswp__zoom-wrap{-webkit-backface-visibility:hidden}.pswp__item{position:absolute;left:0;right:0;top:0;bottom:0;overflow:hidden}.pswp__img{position:absolute;width:auto;height:auto;top:0;left:0}.pswp__img--placeholder{-webkit-backface-visibility:hidden}.pswp__img--placeholder--blank{background:#222}.pswp--ie .pswp__img{width:100%!important;height:auto!important;left:0;top:0}.pswp__error-msg{position:absolute;left:0;top:50%;width:100%;text-align:center;font-size:14px;line-height:16px;margin-top:-8px;color:#ccc}.pswp__error-msg a{color:#ccc;text-decoration:underline}' + '</style>';
}

function photoswipeDefaultSkinCSS () {
  return '<style>' + '.pswp__button{width:44px;height:44px;position:relative;background:0 0;cursor:pointer;overflow:visible;-webkit-appearance:none;display:block;border:0;padding:0;margin:0;float:right;opacity:.75;-webkit-transition:opacity .2s;transition:opacity .2s;-webkit-box-shadow:none;box-shadow:none}.pswp__button:focus,.pswp__button:hover{opacity:1}.pswp__button:active{outline:0;opacity:.9}.pswp__button::-moz-focus-inner{padding:0;border:0}.pswp__ui--over-close .pswp__button--close{opacity:1}.pswp__button,.pswp__button--arrow--left:before,.pswp__button--arrow--right:before{background:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQgAAABYCAQAAACjBqE3AAAB6klEQVR4Ae3bsWpUQRTG8YkkanwCa7GzVotsI/gEgk9h4Vu4ySLYmMYgbJrc3lrwZbJwC0FMt4j7F6Y4oIZrsXtgxvx/1c0ufEX4cnbmLCmSJEmSJEmSJEmSJP3XCBPvbJU+8doWmDFwyZpLBmYlNJebz0KwzykwsuSYJSNwykEJreV2BaBMaLIQZ2xYcFgqDlmw4ayE/FwL0dDk4Qh4W37DAjgqIT+3HRbigjH+iikVdxgZStgyN0Su2sXIeTwTT+esdpcbIlfNAuZ/TxresG4zV8kYWSZNiKUTokMMSWeIwTNEn4fK2TW3gRNgVkJLuVksROA9G+bEvoATNlBCa7nZXEwdxEZxzpKRKFh+bsv8LmPFmhX1OwfIz81jIRJQ5eeqG9B+riRJkiRJkiRJkiRJkiRJkiRJUkvA/8RQoEpKlJWINFkJ62AlrEP/mNBibnv2yz/A3t7Uq3LcpoxP8COjC1T5vxoAD5VdoEqdDrd5QuW1swtUSaueh3zkiuBiqgtA2OlkeMcP/uDqugsJdbjHF65VdPMKwS0+WQc/MgKvrIOHysB9vgPwk8+85hmPbnQdvHZyDMAFD7L3EOpgMcVdvnHFS0/vlatrXvCVx0U9gt3fxvnA0/hB4nmRJEmSJEmSJEmSJGmHfgFLaDPoMu5xWwAAAABJRU5ErkJggg==) 0 0 no-repeat;background-size:264px 88px;width:44px;height:44px}@media (-webkit-min-device-pixel-ratio:1.1),(-webkit-min-device-pixel-ratio:1.09375),(min-resolution:105dpi),(min-resolution:1.1dppx){.pswp--svg .pswp__button,.pswp--svg .pswp__button--arrow--left:before,.pswp--svg .pswp__button--arrow--right:before{background-image:url(\"data:image/svg+xml;charset=UTF-8,%3csvg width=\'264\' height=\'88\' viewBox=\'0 0 264 88\' xmlns=\'http://www.w3.org/2000/svg\'%3e%3ctitle%3edefault-skin 2%3c/title%3e%3cg fill=\'none\' fill-rule=\'evenodd\'%3e%3cg%3e%3cpath d=\'M67.002 59.5v3.768c-6.307.84-9.184 5.75-10.002 9.732 2.22-2.83 5.564-5.098 10.002-5.098V71.5L73 65.585 67.002 59.5z\' id=\'Shape\' fill=\'%23fff\'/%3e%3cg fill=\'%23fff\'%3e%3cpath d=\'M13 29v-5h2v3h3v2h-5zM13 15h5v2h-3v3h-2v-5zM31 15v5h-2v-3h-3v-2h5zM31 29h-5v-2h3v-3h2v5z\' id=\'Shape\'/%3e%3c/g%3e%3cg fill=\'%23fff\'%3e%3cpath d=\'M62 24v5h-2v-3h-3v-2h5zM62 20h-5v-2h3v-3h2v5zM70 20v-5h2v3h3v2h-5zM70 24h5v2h-3v3h-2v-5z\'/%3e%3c/g%3e%3cpath d=\'M20.586 66l-5.656-5.656 1.414-1.414L22 64.586l5.656-5.656 1.414 1.414L23.414 66l5.656 5.656-1.414 1.414L22 67.414l-5.656 5.656-1.414-1.414L20.586 66z\' fill=\'%23fff\'/%3e%3cpath d=\'M111.785 65.03L110 63.5l3-3.5h-10v-2h10l-3-3.5 1.785-1.468L117 59l-5.215 6.03z\' fill=\'%23fff\'/%3e%3cpath d=\'M152.215 65.03L154 63.5l-3-3.5h10v-2h-10l3-3.5-1.785-1.468L147 59l5.215 6.03z\' fill=\'%23fff\'/%3e%3cg%3e%3cpath id=\'Rectangle-11\' fill=\'%23fff\' d=\'M160.957 28.543l-3.25-3.25-1.413 1.414 3.25 3.25z\'/%3e%3cpath d=\'M152.5 27c3.038 0 5.5-2.462 5.5-5.5s-2.462-5.5-5.5-5.5-5.5 2.462-5.5 5.5 2.462 5.5 5.5 5.5z\' id=\'Oval-1\' stroke=\'%23fff\' stroke-width=\'1.5\'/%3e%3cpath fill=\'%23fff\' d=\'M150 21h5v1h-5z\'/%3e%3c/g%3e%3cg%3e%3cpath d=\'M116.957 28.543l-1.414 1.414-3.25-3.25 1.414-1.414 3.25 3.25z\' fill=\'%23fff\'/%3e%3cpath d=\'M108.5 27c3.038 0 5.5-2.462 5.5-5.5s-2.462-5.5-5.5-5.5-5.5 2.462-5.5 5.5 2.462 5.5 5.5 5.5z\' stroke=\'%23fff\' stroke-width=\'1.5\'/%3e%3cpath fill=\'%23fff\' d=\'M106 21h5v1h-5z\'/%3e%3cpath fill=\'%23fff\' d=\'M109.043 19.008l-.085 5-1-.017.085-5z\'/%3e%3c/g%3e%3c/g%3e%3c/g%3e%3c/svg%3e\")}.pswp--svg .pswp__button--arrow--left,.pswp--svg .pswp__button--arrow--right{background:0 0}}.pswp__button--close{background-position:0 -44px}.pswp__button--share{background-position:-44px -44px}.pswp__button--fs{display:none}.pswp--supports-fs .pswp__button--fs{display:block}.pswp--fs .pswp__button--fs{background-position:-44px 0}.pswp__button--zoom{display:none;background-position:-88px 0}.pswp--zoom-allowed .pswp__button--zoom{display:block}.pswp--zoomed-in .pswp__button--zoom{background-position:-132px 0}.pswp--touch .pswp__button--arrow--left,.pswp--touch .pswp__button--arrow--right{visibility:hidden}.pswp__button--arrow--left,.pswp__button--arrow--right{background:0 0;top:50%;margin-top:-50px;width:70px;height:100px;position:absolute}.pswp__button--arrow--left{left:0}.pswp__button--arrow--right{right:0}.pswp__button--arrow--left:before,.pswp__button--arrow--right:before{content:\'\';top:35px;background-color:rgba(0,0,0,.3);height:30px;width:32px;position:absolute}.pswp__button--arrow--left:before{left:6px;background-position:-138px -44px}.pswp__button--arrow--right:before{right:6px;background-position:-94px -44px}.pswp__counter,.pswp__share-modal{-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}.pswp__share-modal{display:block;background:rgba(0,0,0,.5);width:100%;height:100%;top:0;left:0;padding:10px;position:absolute;z-index:1600;opacity:0;-webkit-transition:opacity .25s ease-out;transition:opacity .25s ease-out;-webkit-backface-visibility:hidden;will-change:opacity}.pswp__share-modal--hidden{display:none}.pswp__share-tooltip{z-index:1620;position:absolute;background:#fff;top:56px;border-radius:2px;display:block;width:auto;right:44px;-webkit-box-shadow:0 2px 5px rgba(0,0,0,.25);box-shadow:0 2px 5px rgba(0,0,0,.25);-webkit-transform:translateY(6px);-ms-transform:translateY(6px);transform:translateY(6px);-webkit-transition:-webkit-transform .25s;transition:transform .25s;-webkit-backface-visibility:hidden;will-change:transform}.pswp__share-tooltip a{display:block;padding:8px 12px;color:#000;text-decoration:none;font-size:14px;line-height:18px}.pswp__share-tooltip a:hover{text-decoration:none;color:#000}.pswp__share-tooltip a:first-child{border-radius:2px 2px 0 0}.pswp__share-tooltip a:last-child{border-radius:0 0 2px 2px}.pswp__share-modal--fade-in{opacity:1}.pswp__share-modal--fade-in .pswp__share-tooltip{-webkit-transform:translateY(0);-ms-transform:translateY(0);transform:translateY(0)}.pswp--touch .pswp__share-tooltip a{padding:16px 12px}a.pswp__share--facebook:before{content:\'\';display:block;width:0;height:0;position:absolute;top:-12px;right:15px;border:6px solid transparent;border-bottom-color:#fff;-webkit-pointer-events:none;-moz-pointer-events:none;pointer-events:none}a.pswp__share--facebook:hover{background:#3e5c9a;color:#fff}a.pswp__share--facebook:hover:before{border-bottom-color:#3e5c9a}a.pswp__share--twitter:hover{background:#55acee;color:#fff}a.pswp__share--pinterest:hover{background:#ccc;color:#ce272d}a.pswp__share--download:hover{background:#ddd}.pswp__counter{position:absolute;left:0;top:0;height:44px;font-size:13px;line-height:44px;color:#fff;opacity:.75;padding:0 10px}.pswp__caption{position:absolute;left:0;bottom:0;width:100%;min-height:44px}.pswp__caption small{font-size:11px;color:#bbb}.pswp__caption__center{text-align:left;max-width:420px;margin:0 auto;font-size:13px;padding:10px;line-height:20px;color:#ccc}.pswp__caption--empty{display:none}.pswp__caption--fake{visibility:hidden}.pswp__preloader{width:44px;height:44px;position:absolute;top:0;left:50%;margin-left:-22px;opacity:0;-webkit-transition:opacity .25s ease-out;transition:opacity .25s ease-out;will-change:opacity;direction:ltr}.pswp__preloader__icn{width:20px;height:20px;margin:12px}.pswp__preloader--active{opacity:1}.pswp__preloader--active .pswp__preloader__icn{background:url(data:image/gif;base64,R0lGODlhFAAUAPMIAIeHhz8/P1dXVycnJ8/Pz7e3t5+fn29vb////wAAAAAAAAAAAAAAAAAAAAAAAAAAACH/C05FVFNDQVBFMi4wAwEAAAAh+QQFBwAIACwAAAAAFAAUAEAEUxDJSatFxtwaggWAdIyHJAhXoRYSQUhDPGx0TbmujahbXGWZWqdDAYEsp5NupLPkdDwE7oXwWVasimzWrAE1tKFHErQRK8eL8mMUlRBJVI307uoiACH5BAUHAAgALAEAAQASABIAAAROEMkpS6E4W5upMdUmEQT2feFIltMJYivbvhnZ3R0A4NMwIDodz+cL7nDEn5CH8DGZh8MtEMBEoxkqlXKVIgQCibbK9YLBYvLtHH5K0J0IACH5BAUHAAgALAEAAQASABIAAAROEMkpjaE4W5spANUmFQX2feFIltMJYivbvhnZ3d1x4BNBIDodz+cL7nDEn5CH8DGZAsFtMMBEoxkqlXKVIgIBibbK9YLBYvLtHH5K0J0IACH5BAUHAAgALAEAAQASABIAAAROEMkpAaA4W5vpOdUmGQb2feFIltMJYivbvhnZ3Z0g4FNRIDodz+cL7nDEn5CH8DGZgcCNQMBEoxkqlXKVIgYDibbK9YLBYvLtHH5K0J0IACH5BAUHAAgALAEAAQASABIAAAROEMkpz6E4W5upENUmAQD2feFIltMJYivbvhnZ3V0Q4JNhIDodz+cL7nDEn5CH8DGZg8GtUMBEoxkqlXKVIggEibbK9YLBYvLtHH5K0J0IACH5BAUHAAgALAEAAQASABIAAAROEMkphaA4W5tpCNUmHQf2feFIltMJYivbvhnZ3d0w4BMAIDodz+cL7nDEn5CH8DGZBMLNYMBEoxkqlXKVIgoFibbK9YLBYvLtHH5K0J0IACH5BAUHAAgALAEAAQASABIAAAROEMkpQ6A4W5vpGNUmCQL2feFIltMJYivbvhnZ3R1B4NNxIDodz+cL7nDEn5CH8DGZhcINAMBEoxkqlXKVIgwGibbK9YLBYvLtHH5K0J0IACH5BAUHAAcALAEAAQASABIAAANCeLo6wzA6FxkhbaoQ4L3ZxnXLh0EjWZ4RV71VUcCLIByyTNt2PsO8m452sBGJBsNxkUwuD03lAQBASqnUJ7aq5UYSADs=) 0 0 no-repeat}.pswp--css_animation .pswp__preloader--active{opacity:1}.pswp--css_animation .pswp__preloader--active .pswp__preloader__icn{-webkit-animation:clockwise .5s linear infinite;animation:clockwise .5s linear infinite}.pswp--css_animation .pswp__preloader--active .pswp__preloader__donut{-webkit-animation:donut-rotate 1s cubic-bezier(.4,0,.22,1) infinite;animation:donut-rotate 1s cubic-bezier(.4,0,.22,1) infinite}.pswp--css_animation .pswp__preloader__icn{background:0 0;opacity:.75;width:14px;height:14px;position:absolute;left:15px;top:15px;margin:0}.pswp--css_animation .pswp__preloader__cut{position:relative;width:7px;height:14px;overflow:hidden}.pswp--css_animation .pswp__preloader__donut{-webkit-box-sizing:border-box;box-sizing:border-box;width:14px;height:14px;border:2px solid #fff;border-radius:50%;border-left-color:transparent;border-bottom-color:transparent;position:absolute;top:0;left:0;background:0 0;margin:0}@media screen and (max-width:1024px){.pswp__preloader{position:relative;left:auto;top:auto;margin:0;float:right}}@-webkit-keyframes clockwise{0%{-webkit-transform:rotate(0);transform:rotate(0)}100%{-webkit-transform:rotate(360deg);transform:rotate(360deg)}}@keyframes clockwise{0%{-webkit-transform:rotate(0);transform:rotate(0)}100%{-webkit-transform:rotate(360deg);transform:rotate(360deg)}}@-webkit-keyframes donut-rotate{0%{-webkit-transform:rotate(0);transform:rotate(0)}50%{-webkit-transform:rotate(-140deg);transform:rotate(-140deg)}100%{-webkit-transform:rotate(0);transform:rotate(0)}}@keyframes donut-rotate{0%{-webkit-transform:rotate(0);transform:rotate(0)}50%{-webkit-transform:rotate(-140deg);transform:rotate(-140deg)}100%{-webkit-transform:rotate(0);transform:rotate(0)}}.pswp__ui{-webkit-font-smoothing:auto;visibility:visible;opacity:1;z-index:1550}.pswp__top-bar{position:absolute;left:0;top:0;height:44px;width:100%}.pswp--has_mouse .pswp__button--arrow--left,.pswp--has_mouse .pswp__button--arrow--right,.pswp__caption,.pswp__top-bar{-webkit-backface-visibility:hidden;will-change:opacity;-webkit-transition:opacity 333ms cubic-bezier(.4,0,.22,1);transition:opacity 333ms cubic-bezier(.4,0,.22,1)}.pswp--has_mouse .pswp__button--arrow--left,.pswp--has_mouse .pswp__button--arrow--right{visibility:visible}.pswp__caption,.pswp__top-bar{background-color:rgba(0,0,0,.5)}.pswp__ui--fit .pswp__caption,.pswp__ui--fit .pswp__top-bar{background-color:rgba(0,0,0,.3)}.pswp__ui--idle .pswp__top-bar{opacity:0}.pswp__ui--idle .pswp__button--arrow--left,.pswp__ui--idle .pswp__button--arrow--right{opacity:0}.pswp__ui--hidden .pswp__button--arrow--left,.pswp__ui--hidden .pswp__button--arrow--right,.pswp__ui--hidden .pswp__caption,.pswp__ui--hidden .pswp__top-bar{opacity:.001}.pswp__ui--one-slide .pswp__button--arrow--left,.pswp__ui--one-slide .pswp__button--arrow--right,.pswp__ui--one-slide .pswp__counter{display:none}.pswp__element--disabled{display:none!important}.pswp--minimal--dark .pswp__top-bar{background:0 0}' + '</style>';

}

function fontAwesomeCSS () {
  return '<style>' + 'svg:not(:root).svg-inline--fa{overflow:visible}.svg-inline--fa{display:inline-block;font-size:inherit;height:1em;overflow:visible;vertical-align:-.125em}.svg-inline--fa.fa-lg{vertical-align:-.225em}.svg-inline--fa.fa-w-1{width:.0625em}.svg-inline--fa.fa-w-2{width:.125em}.svg-inline--fa.fa-w-3{width:.1875em}.svg-inline--fa.fa-w-4{width:.25em}.svg-inline--fa.fa-w-5{width:.3125em}.svg-inline--fa.fa-w-6{width:.375em}.svg-inline--fa.fa-w-7{width:.4375em}.svg-inline--fa.fa-w-8{width:.5em}.svg-inline--fa.fa-w-9{width:.5625em}.svg-inline--fa.fa-w-10{width:.625em}.svg-inline--fa.fa-w-11{width:.6875em}.svg-inline--fa.fa-w-12{width:.75em}.svg-inline--fa.fa-w-13{width:.8125em}.svg-inline--fa.fa-w-14{width:.875em}.svg-inline--fa.fa-w-15{width:.9375em}.svg-inline--fa.fa-w-16{width:1em}.svg-inline--fa.fa-w-17{width:1.0625em}.svg-inline--fa.fa-w-18{width:1.125em}.svg-inline--fa.fa-w-19{width:1.1875em}.svg-inline--fa.fa-w-20{width:1.25em}.svg-inline--fa.fa-pull-left{margin-right:.3em;width:auto}.svg-inline--fa.fa-pull-right{margin-left:.3em;width:auto}.svg-inline--fa.fa-border{height:1.5em}.svg-inline--fa.fa-li{width:2em}.svg-inline--fa.fa-fw{width:1.25em}.fa-layers svg.svg-inline--fa{bottom:0;left:0;margin:auto;position:absolute;right:0;top:0}.fa-layers{display:inline-block;height:1em;position:relative;text-align:center;vertical-align:-.125em;width:1em}.fa-layers svg.svg-inline--fa{-webkit-transform-origin:center center;transform-origin:center center}.fa-layers-counter,.fa-layers-text{display:inline-block;position:absolute;text-align:center}.fa-layers-text{left:50%;top:50%;-webkit-transform:translate(-50%,-50%);transform:translate(-50%,-50%);-webkit-transform-origin:center center;transform-origin:center center}.fa-layers-counter{background-color:#ff253a;border-radius:1em;-webkit-box-sizing:border-box;box-sizing:border-box;color:#fff;height:1.5em;line-height:1;max-width:5em;min-width:1.5em;overflow:hidden;padding:.25em;right:0;text-overflow:ellipsis;top:0;-webkit-transform:scale(.25);transform:scale(.25);-webkit-transform-origin:top right;transform-origin:top right}.fa-layers-bottom-right{bottom:0;right:0;top:auto;-webkit-transform:scale(.25);transform:scale(.25);-webkit-transform-origin:bottom right;transform-origin:bottom right}.fa-layers-bottom-left{bottom:0;left:0;right:auto;top:auto;-webkit-transform:scale(.25);transform:scale(.25);-webkit-transform-origin:bottom left;transform-origin:bottom left}.fa-layers-top-right{right:0;top:0;-webkit-transform:scale(.25);transform:scale(.25);-webkit-transform-origin:top right;transform-origin:top right}.fa-layers-top-left{left:0;right:auto;top:0;-webkit-transform:scale(.25);transform:scale(.25);-webkit-transform-origin:top left;transform-origin:top left}.fa-lg{font-size:1.33333em;line-height:.75em;vertical-align:-.0667em}.fa-xs{font-size:.75em}.fa-sm{font-size:.875em}.fa-1x{font-size:1em}.fa-2x{font-size:2em}.fa-3x{font-size:3em}.fa-4x{font-size:4em}.fa-5x{font-size:5em}.fa-6x{font-size:6em}.fa-7x{font-size:7em}.fa-8x{font-size:8em}.fa-9x{font-size:9em}.fa-10x{font-size:10em}.fa-fw{text-align:center;width:1.25em}.fa-ul{list-style-type:none;margin-left:2.5em;padding-left:0}.fa-ul>li{position:relative}.fa-li{left:-2em;position:absolute;text-align:center;width:2em;line-height:inherit}.fa-border{border:solid .08em #eee;border-radius:.1em;padding:.2em .25em .15em}.fa-pull-left{float:left}.fa-pull-right{float:right}.fa.fa-pull-left,.fab.fa-pull-left,.fal.fa-pull-left,.far.fa-pull-left,.fas.fa-pull-left{margin-right:.3em}.fa.fa-pull-right,.fab.fa-pull-right,.fal.fa-pull-right,.far.fa-pull-right,.fas.fa-pull-right{margin-left:.3em}.fa-spin{-webkit-animation:fa-spin 2s infinite linear;animation:fa-spin 2s infinite linear}.fa-pulse{-webkit-animation:fa-spin 1s infinite steps(8);animation:fa-spin 1s infinite steps(8)}@-webkit-keyframes fa-spin{0%{-webkit-transform:rotate(0);transform:rotate(0)}100%{-webkit-transform:rotate(360deg);transform:rotate(360deg)}}@keyframes fa-spin{0%{-webkit-transform:rotate(0);transform:rotate(0)}100%{-webkit-transform:rotate(360deg);transform:rotate(360deg)}}.fa-rotate-90{-ms-filter:\"progid:DXImageTransform.Microsoft.BasicImage(rotation=1)\";-webkit-transform:rotate(90deg);transform:rotate(90deg)}.fa-rotate-180{-ms-filter:\"progid:DXImageTransform.Microsoft.BasicImage(rotation=2)\";-webkit-transform:rotate(180deg);transform:rotate(180deg)}.fa-rotate-270{-ms-filter:\"progid:DXImageTransform.Microsoft.BasicImage(rotation=3)\";-webkit-transform:rotate(270deg);transform:rotate(270deg)}.fa-flip-horizontal{-ms-filter:\"progid:DXImageTransform.Microsoft.BasicImage(rotation=0, mirror=1)\";-webkit-transform:scale(-1,1);transform:scale(-1,1)}.fa-flip-vertical{-ms-filter:\"progid:DXImageTransform.Microsoft.BasicImage(rotation=2, mirror=1)\";-webkit-transform:scale(1,-1);transform:scale(1,-1)}.fa-flip-horizontal.fa-flip-vertical{-ms-filter:\"progid:DXImageTransform.Microsoft.BasicImage(rotation=2, mirror=1)\";-webkit-transform:scale(-1,-1);transform:scale(-1,-1)}:root .fa-flip-horizontal,:root .fa-flip-vertical,:root .fa-rotate-180,:root .fa-rotate-270,:root .fa-rotate-90{-webkit-filter:none;filter:none}.fa-stack{display:inline-block;height:2em;position:relative;width:2em}.fa-stack-1x,.fa-stack-2x{bottom:0;left:0;margin:auto;position:absolute;right:0;top:0}.svg-inline--fa.fa-stack-1x{height:1em;width:1em}.svg-inline--fa.fa-stack-2x{height:2em;width:2em}.fa-inverse{color:#fff}.sr-only{border:0;clip:rect(0,0,0,0);height:1px;margin:-1px;overflow:hidden;padding:0;position:absolute;width:1px}.sr-only-focusable:active,.sr-only-focusable:focus{clip:auto;height:auto;margin:0;overflow:visible;position:static;width:auto}' + '</style>';
}

function customCSS () {
  return '<style>' + 'body a,body button,body div,body input,body select,body textarea{font-size:1rem}body img{max-width:100%}body font[size=\"2\"]{font-size:.8rem!important}body font[size=\"3\"]{font-size:1rem!important}body font[size=\"4\"]{font-size:1.2rem!important}body font[size=\"5\"]{font-size:1.4rem!important}body font[size=\"6\"]{font-size:1.6rem!important}body font[size=\"7\"]{font-size:1.8rem!important}body #scroll-button{position:fixed;right:15px;bottom:30px}body #scroll-button a{padding:.8rem .9rem}body #history-button{position:fixed;left:15px;bottom:25px;display:inline-block}body #history-button a{display:inline-block;float:left;padding:.8rem 1.1rem}body #history-button a,body #scroll-button a{display:block;border-radius:3px;line-height:100%}body.left-hand-mode #scroll-button{right:auto;left:15px}body.left-hand-mode #history-button{left:auto;right:15px}body.hide-history-btn #history-button{display:none}body .bm .bm_h{font-size:1rem!important}body .bm blockquote{position:relative;padding:.5rem 1rem;margin:.5rem 0}body .bm blockquote:before{content:\'\"\';font-size:2rem;position:absolute;left:0;top:0}body .bm blockquote:after{content:\'\"\';font-size:2rem;position:relative;right:0;bottom:.5rem;transform:rotate(180deg);display:block}body .fl .bm .bm_h{text-align:center;padding:.5rem;font-style:italic}body .fl .bm .bm_c.add a:first-of-type,body .fl .bm .bm_c.even a:first-of-type{display:inline-block;padding:.6rem 1rem;width:calc(100% - 80px);box-sizing:border-box}body .fl .bm .bm_c.add .xg1,body .fl .bm .bm_c.even .xg1{max-width:80px}body.day-theme{background-color:#fff5d7}body.day-theme #menu-btn div{background-color:#551200}body.day-theme .hd{border-color:#551200}body.day-theme #search-link,body.day-theme .lkcss,body.day-theme a{color:#551200}body.day-theme .box{background-color:#ffe}body.day-theme .bm .bm_h{background-color:#551200!important}body.day-theme .bm .bm_c{border-color:#dbc38c}body.day-theme .bm .bm_c:nth-child(even){background-color:#ffedbb}body.day-theme .bm blockquote:before{color:#551200}body.day-theme .even{background-color:#fff5d7}body.day-theme #history-button a,body.day-theme #scroll-button a{background-color:rgba(255,255,255,.8)!important;border:1px solid #dbc38c}body.day-theme input[type=submit]{border:1px solid #551200;background-color:#ffe}body.day-theme .ttp a.xw1{background-color:#551200;color:#fff}body.night-theme{background-color:#291f1c!important;color:#a3948f;--link-color:#A18C11;--link-color-hover:rgb(179, 163, 20);--link-color-active:rgb(147, 134, 16);--visited-color:rgb(161, 125, 18);--visited-color-hover:rgb(179, 139, 20);--visited-color-active:rgb(147, 114, 16)}body.night-theme .hd{border-color:#7e5f54}body.night-theme #menu-btn div{background-color:#7e5f54}body.night-theme .lkcss,body.night-theme a{color:#905702}body.night-theme .box{background-color:#1c0e09}body.night-theme .bm .bm_h{background-color:#1c0e09!important;color:#a3948f}body.night-theme .bm .bm_h a{color:#905702}body.night-theme .bm .bm_inf{border-color:#7e5f54;background-color:#1c0e09}body.night-theme .bm .bm_c{border-color:#7e5f54;border-bottom:1px solid #7e5f54}body.night-theme .bm .bm_c .bm_user{border-color:#7e5f54;background-color:#1c0e09}body.night-theme .bm .bm_c:nth-child(even){background-color:#0a0707}body.night-theme .bm .bm_c.bt{border-top:2px solid #7e5f54!important}body.night-theme .bm .even{background-color:transparent}body.night-theme .bm blockquote:before{color:#a3948f}body.night-theme div[id^=post]{background-color:#0b0704!important}body.night-theme input,body.night-theme textarea{background:#2b201d;color:#a3948f}body.night-theme select{color:#a3948f}body.night-theme font[color=\"#000000\"]{color:#a3948f!important}body.night-theme #history-button a,body.night-theme #scroll-button a{background-color:rgba(43,32,29,.8)!important;border:1px solid #7e5f54;color:#a3948f}body.night-theme .ttp a.xw1{background-color:#2b201d;color:#a3948f}body.menu-opened{height:100%;position:fixed;top:0}body.menu-opened #menu-btn div{opacity:0}body.menu-opened #menu-btn div:first-of-type{transform:rotate(-45deg);opacity:1}body.menu-opened #menu-btn div:last-of-type{transform:rotate(45deg);opacity:1}body.menu-opened #side-menu{left:0}body.menu-opened #side-menu #logout{position:fixed}body.bg{background:0 0;font-size:1rem}body.bg input{padding:3px 0;font-size:1rem;height:auto!important}body.bg input[type=submit]{border:1px solid;margin-top:5px;background:0 0;font-size:1rem;height:auto;padding:3px!important}body.bg .header h2{padding:0}body.bg .header h2 img{max-height:2rem}body.bg .header .user_fun{display:none}body.bg .threadlist{font-size:1rem}body.bg .threadlist li a{font-size:1rem;line-height:1.5}body.bg .page a:first-of-type,body.bg .page a:last-of-type{margin:5px 0;padding:5px 15px;border:1px solid;background:0 0}body.bg.day-theme input[type=submit]{color:#551200}body.bg.night-theme input[type=submit]{color:#a3948f}.hd{height:2rem;min-height:40px;max-height:2.5rem;display:inline-block;width:calc(100% - 6px);max-width:100vw}.hd img{height:auto;min-height:35px;opacity:0;transition:all 1s;max-width:40vw;width:100%}@media screen and (min-width:767px){.hd img{max-width:18vw}}.hd a{float:left;display:inline-block}.hd a:nth-of-type(2){vertical-align:middle;padding:0 .5rem;line-height:40px}.pipe{margin:0 2px}#menu-btn{background:0 0;border:none;padding:0 .3rem 0 0;float:right;outline:0;margin-top:-2px}#menu-btn div{width:1.9rem;height:.25rem;margin:.4rem 0;transition:all .4s}#menu-btn div:first-of-type{transform-origin:100% 100%}#menu-btn div:last-of-type{transform-origin:100% 0}.is-pm .bm_c a{display:inline-block;width:100%;min-height:1.5rem}.is-pm.is-pm-details .bm_c a{width:auto;float:left}.is-pm.is-pm-details .bm_c span{float:right}.is-pm.is-pm-details .bm_c .xs1{display:inline-block;width:100%}#side-menu{display:block;width:100%;height:100%;position:absolute;left:-100%;top:0;background-color:rgba(0,0,0,.6)}#side-menu>div{display:block;width:70vw;height:100%;position:absolute;left:0;top:0;transition:all 1s;background-color:#16110f;border-right:1px solid #856559;color:#a16c12;overflow:auto;max-height:100%;padding-bottom:3rem}#side-menu .menu-item{padding:10px}#side-menu .menu-item.last{margin-bottom:3rem}#side-menu .menu-item label{display:block;margin:10px 20px}#side-menu .menu-item span{padding-right:5px}#side-menu .ftsize-div,#side-menu .language-div{padding:0}#side-menu .switcher-div label{display:inline-block;margin:0}#side-menu #logout{bottom:0;left:0;width:calc(70vw - 20px);height:auto;padding:10px;border-top:3px solid #a16c12;background-color:#16110f}#search-link{float:right}.tl .bm_c .xg1{display:inline-block;width:100%;text-align:right;font-size:.8rem}.tl .bm_c .xg1 .post-info{display:inline-block;width:100%;font-size:.8rem;float:left;line-height:100%;margin-bottom:3px}.tl .bm_c .xg1 .post-info a{float:left;font-size:.8rem}.tl .bm_c .xg1 .post-info .no-of-reply{display:inline-block;float:right}.tl .bm_c .xg1 .post-info .no-of-reply svg{margin-right:.3rem}.tl .bm_c .xg1 .time{display:inline-block;width:100%;font-size:.8rem;float:left;line-height:100%}.tl .bm_c .xg1 .time .create-time{display:inline-block;margin-right:5px;float:left}.big-image{width:100vw;height:auto}.ft{margin-bottom:100px}.is-post .ft{margin-bottom:40vh}.copy-link{width:100%;border:1px solid #551200;background-color:#551200;color:#fff;padding:10px;font-size:1rem}.wp .box{padding:.3rem 0;line-height:1.2}.wp .pg{display:inline-block;width:100%}.wp .pg>label>span{display:none}.wp .pg a{display:inline-block}.wp .pg .nxt,.wp .pg .prev{margin:5px 0;padding:5px 15px;border:1px solid}.wp .pg .nxt{float:right}.wp .tl .bm .bm_h{padding:.5rem .2rem}.wp .tl .bm .bm_h a{float:right}.wp .tl .bm .bm_c>a:first-of-type{display:inline-block;padding:.5rem 0;width:100%}.vt .bm .bm_h{line-height:1.2}.ttp a{line-height:130%;vertical-align:middle;white-space:nowrap;padding:3px 10px;display:inline-block;border:1px solid;border-radius:5px;margin:3px 0}input[type=submit],input[type=text],textarea{padding:5px!important;width:calc(100% - 12px)!important}input[type=file],input[type=submit]{width:100%!important;max-width:100%!important}div.checkbox.switcher label,div.radio.switcher label{padding:0}div.checkbox.switcher label *,div.radio.switcher label *{vertical-align:middle}div.checkbox.switcher label input,div.radio.switcher label input{display:none}div.checkbox.switcher label input+span,div.radio.switcher label input+span{position:relative;display:inline-block;margin-right:10px;width:2rem;height:1rem;background:#bbb;border:1px solid #eee;border-radius:50px;transition:all .3s ease-in-out}div.checkbox.switcher label input+span small,div.radio.switcher label input+span small{position:absolute;display:block;width:50%;height:100%;background:#fff;border-radius:50%;transition:all .3s ease-in-out;left:0}div.checkbox.switcher label input:checked+span,div.radio.switcher label input:checked+span{background:#269bff;border-color:#269bff}div.checkbox.switcher label input:checked+span small,div.radio.switcher label input:checked+span small{left:50%}' + '</style>';
}


function photoSwipeHtml () {
  return '<div id=\"pswp\" class=\"pswp\" tabindex=\"-1\" role=\"dialog\" aria-hidden=\"true\"><div class=\"pswp__bg\"></div><div class=\"pswp__scroll-wrap\"><div class=\"pswp__container\"><div class=\"pswp__item\"></div><div class=\"pswp__item\"></div><div class=\"pswp__item\"></div></div><div class=\"pswp__ui pswp__ui--hidden\"><div class=\"pswp__top-bar\"><div class=\"pswp__counter\"></div><button class=\"pswp__button pswp__button--close\" title=\"Close (Esc)\"></button> <button class=\"pswp__button pswp__button--share\" title=\"Share\"></button> <button class=\"pswp__button pswp__button--fs\" title=\"Toggle fullscreen\"></button> <button class=\"pswp__button pswp__button--zoom\" title=\"Zoom in/out\"></button><div class=\"pswp__preloader\"><div class=\"pswp__preloader__icn\"><div class=\"pswp__preloader__cut\"><div class=\"pswp__preloader__donut\"></div></div></div></div></div><div class=\"pswp__share-modal pswp__share-modal--hidden pswp__single-tap\"><div class=\"pswp__share-tooltip\"></div></div><button class=\"pswp__button pswp__button--arrow--left\" title=\"Previous (arrow left)\"></button> <button class=\"pswp__button pswp__button--arrow--right\" title=\"Next (arrow right)\"></button><div class=\"pswp__caption\"><div class=\"pswp__caption__center\"></div></div></div></div></div>';
}

function sideMenuHtml () {
  return '<div id=\"side-menu\"><div><div class=\"menu-item\"><span><b>瀏覽設定：</b></span></div><div class=\"menu-item switcher-div\"><div class=\"checkbox switcher\"><label for=\"theme\"><span>夜間模式： </span><input type=\"checkbox\" id=\"theme\" name=\"theme\"> <span><small></small></span></label></div></div><div class=\"menu-item\"><span>字體大小：</span></div><div class=\"menu-item ftsize-div\"><label><span>小 </span><input type=\"radio\" name=\"ftsize\" value=\"S\" id=\"ftsize-S\"></label> <label><span>中 </span><input type=\"radio\" name=\"ftsize\" value=\"M\" id=\"ftsize-M\" checked=\"checked\"></label> <label><span>大 </span><input type=\"radio\" name=\"ftsize\" value=\"L\" id=\"ftsize-L\"></label></div><div class=\"menu-item switcher-div\"><div class=\"checkbox switcher\"><label for=\"left-hand\"><span>左手模式： </span><input type=\"checkbox\" id=\"left-hand\" name=\"left-hand\"> <span><small></small></span></label></div></div><div class=\"menu-item switcher-div\"><div class=\"checkbox switcher\"><label for=\"hide-history\"><span>隱藏前進及後退按鍵： </span><input type=\"checkbox\" id=\"hide-history\" name=\"hide-history\"> <span><small></small></span></label></div></div><hr><div class=\"menu-item\"><span><b>語言設定：</b></span></div><div class=\"menu-item language-div\"><label><span>繁 </span><input type=\"radio\" name=\"language\" value=\"tc\" id=\"language-tc\"></label> <label><span>簡 </span><input type=\"radio\" name=\"language\" value=\"sc\" id=\"language-sc\"></label> <label><span>無 </span><input type=\"radio\" name=\"language\" value=\"none\" id=\"language-none\" checked=\"checked\"></label></div><hr><div class=\"menu-item\"><span><b>流量設定：</b></span></div><div class=\"menu-item switcher-div\"><div class=\"checkbox switcher\"><label for=\"load-big-image\"><span>直接顯示大圖： </span><input type=\"checkbox\" id=\"load-big-image\" name=\"load-big-image\"> <span><small></small></span></label></div></div><hr><div class=\"menu-item\"><span><b>其他設定：</b></span></div><div class=\"menu-item switcher-div\"><div class=\"checkbox switcher\"><label for=\"display-post-time\"><span>顯示發帖時間： </span><input type=\"checkbox\" id=\"display-post-time\" name=\"post-time\"> <span><small></small></span></label></div></div><div class=\"menu-item\"><span>複製鏈接設定：</span></div><div class=\"menu-item copy-link-div\"><label><span>標準版</span> <input type=\"radio\" name=\"copy-link\" value=\"mobile1\" id=\"copy-link-m1\" checked=\"checked\"></label> <label><span>電腦版 </span><input type=\"radio\" name=\"copy-link\" value=\"desktop\" id=\"copy-link-pc\"></label></div><div class=\"menu-item last\"></div><div id=\"logout\"></div></div></div>';
}

function historyBtnHtml () {
  return '<div id=\"history-button\"><a title=\"回上頁\" class=\"prev-page\" onclick=\"window.history.back();\"><i class=\"fas fa-chevron-left\"></i> </a><a title=\"下一頁\" class=\"next-page\" onclick=\"window.history.forward();\"><i class=\"fas fa-chevron-right\"></i></a></div>';
}

function scrollBtnHtml () {
  return '<div id=\"scroll-button\"><a title=\"回最頂\" class=\"go-to-top\" onclick=\"window.scrollTo(0,0);\"><i class=\"fas fa-chevron-up\"></i></a> <a title=\"去最底\" class=\"go-to-bottom\" onclick=\"window.scrollTo(0,document.body.scrollHeight);\"><i class=\"fas fa-chevron-down\"></i></a></div>';
}

function menuBtnHtml () {
  return '<button id=\"menu-btn\" type=\"button\"><div></div><div></div><div></div></button>';
}


/*
    localStorage Setting List:
    1. theme                    // set theme                  || value: "day", "night"        || default: "day"
    2. ftsize                   // set font size              || value: "S", "M", "L"         || default: "M"
    3. language                 // set language               || value: "tc", "sc", "none"    || default: "none"
    4. displayPostCreateTime    // show post time             || value: "true", "false"       || default: "true"
    5. loadBigImageAtFirst      // show big image first       || value: "true", "false"       || default: "false"
    6. copyUrl                  // set url version            || value: "mobile1", "desktop"  || default: "mobile1"
    7. leftHandMode             // change scroll btns position|| value: "true", "false"       || default: "false"
    8. hideHistoryButton        // hide history btns          || value: "true", "false"       || default: "false"
*/


function initSettings () {
  /* checking for theme */
  themeSetting();

  /* checking for font size */
  fontSizeSetting();

  /* checking for language */
  languageSetting();

  /* checking for display post create time */
  displayPostTimeSetting();

  /* checking for image show big one first */
  imageLoadSetting();

  /* checking for copy link */
  copyUrlSetting();

  /* checking for left hand mode */
  leftHandModeSetting();

  /* checking for hide history btns */
  historyButtonSetting();

  /* theme listener*/
  jQuery('#theme').change(function () {
    if (jQuery(this).is(":checked")) {
      window.localStorage.setItem("theme", "night");
    } else {
      window.localStorage.setItem("theme", "day");
    }
    themeSetting();
  });

  /* font-size listener */
  jQuery('input[name=ftsize]').change(function () {
    window.localStorage.setItem("ftsize", jQuery(this).val());
    fontSizeSetting();
  });

  /* language listener */
  jQuery('input[name=language]').change(function () {
    window.localStorage.setItem("language", jQuery(this).val());
    if (jQuery(this).val() === "none") {
      window.location.reload();
    }
    languageSetting();
  });

  /* display post create time listener */
  jQuery('#display-post-time').change(function () {
    if (jQuery(this).is(":checked")) {
      window.localStorage.setItem("displayPostCreateTime", "true");
    } else {
      window.localStorage.setItem("displayPostCreateTime", "false");
    }
    displayPostTimeSetting();
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
    copyUrlSetting();
  });

  /* left hand mode listener*/
  jQuery('#left-hand').change(function () {
    if (jQuery(this).is(":checked")) {
      window.localStorage.setItem("leftHandMode", "true");
    } else {
      window.localStorage.setItem("leftHandMode", "false");
    }
    leftHandModeSetting();
  });

  /* hide history listener*/
  jQuery('#hide-history').change(function () {
    if (jQuery(this).is(":checked")) {
      window.localStorage.setItem("hideHistoryButton", "true");
    } else {
      window.localStorage.setItem("hideHistoryButton", "false");
    }
    historyButtonSetting();
  });
}

function themeSetting () {
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

function fontSizeSetting () {
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
}

function languageSetting () {
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
}

function displayPostTimeSetting () {
  if (window.localStorage.getItem("displayPostCreateTime") === "false") {
    jQuery('.time .create-time').hide();
  } else {
    window.localStorage.setItem("displayPostCreateTime", "true");
    jQuery('.time .create-time').show();
    jQuery('#display-post-time').prop('checked', true);
  }
}

function imageLoadSetting () {
  if (window.localStorage.getItem("loadBigImageAtFirst") === "true") {
    jQuery('#load-big-image').prop('checked', true);
  } else {
    window.localStorage.setItem("loadBigImageAtFirst", "false");
  }
}

function copyUrlSetting () {
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

function leftHandModeSetting () {
  if (window.localStorage.getItem("leftHandMode") === "true") {
    jQuery('body').addClass('left-hand-mode');
    jQuery('#left-hand').prop('checked', true);
  } else {
    window.localStorage.setItem("leftHandMode", "false");
    jQuery('body').removeClass('left-hand-mode');
  }
}

function historyButtonSetting () {
  if (window.localStorage.getItem("hideHistoryButton") === "true") {
    jQuery('body').addClass('hide-history-btn');
    jQuery('#hide-history').prop('checked', true);
  } else {
    window.localStorage.setItem("hideHistoryButton", "false");
    jQuery('body').removeClass('hide-history-btn');
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
    preload: [1,3]
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

    return (y * value) / 100;
  }


  if (jQuery('textarea').length > 0) {
    jQuery('textarea').each(function () {
      var textarea = jQuery(this)[0];
      var heightLimit = vhTOpx(50);

      textarea.style.height = "";
      textarea.style.height = Math.min(textarea.scrollHeight, heightLimit) + "px";

      textarea.oninput = function () {
        textarea.style.height = "";
        textarea.style.height = Math.min(textarea.scrollHeight, heightLimit) + "px";
      };
    });

  }


}

function formActionUrlHandler () {
  jQuery('form').each(function () {
    var form = jQuery(this);
    var formUrl = form.attr('action');

    formUrl = formUrl.replace(/mobile=yes/g, 'mobile=1');
    form.attr('action', formUrl);
  });
}


