function runAfterLoad (){

    if (/\bmobile=1\b/.test (window.location.search) ) {

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