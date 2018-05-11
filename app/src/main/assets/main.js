function runAfterLoad (){

    if (/\bmobile=1\b/.test (window.location.search) ) {

        $('head').append(loadCSSPlugin());
        $('head').append(customCSS());

        new MutationObserver(function(mutations) {
            $('.hd img').css('opacity', '0');
            $('.hd img').attr('src', '/template/oyeeh_com_baihe/img/config/img/logo.png');
            $('.hd img').css('opacity', '1');
        }).observe(document, {childList: true, subtree: true});

        $(document).ready(function(){
            jQuery('body').append("<div id='scroll-button'><a title='回最頂' class='go-to-top' onclick='window.scrollTo(0,0);'>></a><a title='去最底' class='go-to-bottom' onclick='window.scrollTo(0,document.body.scrollHeight);'>></a></div>");
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

.bm .bm_c {
border-color: #DBC38C
}

.bm_c:nth-child(even) {
background-color: rgb(255, 237, 187);
}

#scroll-button {
position: fixed;
right: 2px;
bottom: 30px;
}

#scroll-button a {
display: block;
background: rgba(255, 255, 255, 0.8);
border: 1px solid #DBC38C;
border-radius: 3px;
padding: 5px 7px;
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

function loadCSSPlugin (){
    return `.pi-preview,.pi-preview-slider li{height:100%;top:0;z-index:10;width:100%}.pi-preview{position:fixed;left:0;bottom:0;right:0;background:rgba(0,0,0,.95);overflow:hidden;-webkit-transition-property:-webkit-transform;transition-property:-webkit-transform;transition-property:transform;transition-property:transform,-webkit-transform;-webkit-transform:translate3d(100%,0,0);transform:translate3d(100%,0,0);-webkit-transition-duration:.4s;transition-duration:.4s}.pi-preview.pi-active{-webkit-transform:translate3d(0,0,0);transform:translate3d(0,0,0)}.pi-preview ol,.pi-preview ul{list-style:none;padding:0;margin:0;width:100%}.pi-preview-slider{overflow:hidden;height:100%}.pi-preview-slider li{position:absolute;display:-webkit-box;display:-ms-flexbox;display:flex;-webkit-box-pack:center;-ms-flex-pack:center;justify-content:center;-webkit-box-align:center;-ms-flex-align:center;align-items:center;vertical-align:middle;-webkit-transition:all .3s linear;transition:all .3s linear;visibility:hidden}.pi-preview-slider li.pi-preview-slide-prev{-webkit-transform:translate3d(-100%,0,0);transform:translate3d(-100%,0,0);z-index:10}.pi-preview-slider li.pi-preview-slide-next{-webkit-transform:translate3d(100%,0,0);transform:translate3d(100%,0,0);z-index:10}.pi-preview-slider li.pi-active{position:relative;z-index:10;-webkit-transform:translate3d(0,0,0);transform:translate3d(0,0,0);visibility:visible}.pi-preview-slider .pinch-zoom-container{width:100%;z-index:11}.pi-preview-slider .pi-pinch-zoom{position:relative;width:100%;display:-webkit-box;display:-ms-flexbox;display:flex;-webkit-box-pack:center;-ms-flex-pack:center;justify-content:center;-webkit-box-align:center;-ms-flex-align:center;align-items:center}.pi-preview-slider img{position:relative;display:block;max-width:100%;max-height:100%;opacity:0;z-index:200;-webkit-user-drag:none;user-drag:none;-webkit-transition:opacity .15s linear;transition:opacity .15s linear}.pi-preview-slider img.pi-img-loaded{opacity:1}.pi-preview-direction{position:absolute;top:50%;width:100%;margin-top:-18px!important;z-index:12}.pi-preview-only .pi-preview-direction{display:none}.pi-preview-direction li{position:absolute;width:36px;height:36px}.pi-preview-direction a{display:block;height:36px;border:none;color:#ccc;opacity:.5;cursor:pointer;text-align:center;position:relative;z-index:15}.pi-preview-direction .pi-preview-next a:before,.pi-preview-direction .pi-preview-prev a:before{display:inline-block;width:12px;height:12px;min-width:auto;content:"";vertical-align:middle}.pi-preview-actions,.pi-preview-bar{position:absolute;background-color:rgba(0,0,0,.35)}.pi-preview-direction a:hover{opacity:1}.pi-preview-direction .pi-preview-prev{left:10px}.pi-preview-direction .pi-preview-prev a:before{border:solid #fff;border-width:2px 2px 0 0;-webkit-transform:rotate(225deg);transform:rotate(225deg)}.pi-preview-direction .pi-preview-next{right:10px}.pi-preview-direction .pi-preview-next a:before{border:solid #fff;border-width:2px 2px 0 0;-webkit-transform:rotate(45deg);transform:rotate(45deg)}.pi-preview-bar{left:0;right:0;bottom:0;height:44px;color:#999;line-height:44px;padding:0 10px;font-size:16px;display:-webkit-box;display:-ms-flexbox;display:flex}.pi-preview-bar .pi-preview-title{white-space:nowrap;text-overflow:ellipsis;overflow:hidden;margin-right:6px;-webkit-box-flex:1;-ms-flex:1;flex:1;min-width:0}.pi-preview-bar .pi-preview-current{color:#f86f4b}.pi-preview-actions{left:0;right:0;top:0;height:44px}.pi-preview-actions .pi-back{position:relative;height:44px;width:44px;display:inline-block;line-height:44px;text-align:center}.pi-preview-actions .pi-back:before{content:"";vertical-align:middle;display:inline-block;margin-top:14px;margin-left:4px;width:14px;height:14px;border:solid rgba(255,255,255,.9);border-width:2px 2px 0 0;-webkit-transform:rotate(225deg);transform:rotate(225deg);min-width:auto}.pi-preview-actions,.pi-preview-bar{opacity:0;-webkit-transition:.15s;transition:.15s;z-index:20}.pi-preview-bar-active .pi-preview-actions,.pi-preview-bar-active .pi-preview-bar{opacity:1}.pi-preview-nav{position:absolute;bottom:15px;left:0;right:0;text-align:center;z-index:21}.pi-preview-bar-active .pi-preview-nav{display:none}.pi-preview-nav li{display:inline-block;background:#ccc;background:rgba(255,255,255,.5);width:8px;height:8px;margin:0 3px;border-radius:50%;text-indent:-9999px;overflow:hidden;cursor:pointer}.pi-preview-nav .pi-active{background:#fff;background:rgba(255,255,255,.9)}[data-preview] img{cursor:pointer}.pi-preview-active{overflow:hidden}`;
}