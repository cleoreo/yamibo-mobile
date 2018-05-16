desktopLoadAtFirst();

function desktopLoadAtFirst () {
	$.noConflict();
	if (!/\bmobile=1\b/.test(window.location.search) && !/\bmobile=2\b/.test(window.location.search) && !/\bmobile=yes\b/.test(window.location.search)) {
		/* Add Image overflow fixing CSS */
		jQuery('body').css('min-width', '1024px');
		jQuery('head').append('<style>img { max-width: 100% !important; }</style>');
		jQuery('head').append('<style>.batch-reply-checkbox { float: right; } #batch-reply, #copy-reply { float: left; border-radius: 20px; border: 3px solid white; padding: 3px 10px; margin-top: 8px; height: auto; } #scrollbottom { position: fixed; right: 0; top: 100px; display: block; margin: -30px 0 0 2px; width: 40px; background-color: #f4f4f4; border: 1px #cdcdcd solid; border-radius: 3px; cursor: pointer; } #scrollbottom a{ display: block; width: 30px; height: 24px; padding: 3px 5px; line-height: 12px; text-align: center; color: transparent; text-decoration: none; background: url(https://bbs.yamibo.com/template/oyeeh_com_baihe/img/shdm1020/scrolltop.png) no-repeat 0 0; -webkit-transform: rotate(180deg); -moz-transform: rotate(180deg); -ms-transform: rotate(180deg); -o-transform: rotate(180deg); transform: rotate(180deg);}</style>');

		/* Add go to bottom button */
		jQuery('body').append('<div id=\'scrollbottom\'><span hidefocus=\'true\'><a title=\'去最底\' onclick=\'window.scrollTo(0,document.body.scrollHeight);\'><b>去最底</b></a></span></div>');

		var postHeader = jQuery('#postlist >table').first().find('td:last-of-type .y').first();

		if (postHeader.length > 0) {
		    if(jQuery('#select-all-comment').length == 0){
		        postHeader.prepend('<a id=\'select-all-comment\' href=\'javascript:void(0);\'>全選/取消</a>');
                addCheckbox();

                jQuery('#select-all-comment').click(function () {
                    if (jQuery('.batch-reply-checkbox').length === jQuery('.batch-reply-checkbox:checked').length) {
                        jQuery('.batch-reply-checkbox').prop('checked', false);
                    } else {
                        jQuery('.batch-reply-checkbox').prop('checked', true);
                    }

                });

                var paginationDiv = jQuery('#modactions').next('div');
                paginationDiv.append('<button id=\'batch-reply\' class=\'pn pnc vm\' type=\'button\'>批量回覆</button>');
                paginationDiv.append('<button id=\'copy-reply\' class=\'pn pnc vm\' type=\'button\'>僅複製留言引用</button>');


                jQuery('#batch-reply').click(function () {
                    openReplyPageInNewTab();
                });

                jQuery('#copy-reply').click(function () {
                    copyAllQuoteComments();
                });
		    }
		}

		if (jQuery('#editorbox').length > 0 && getUrlParameter('action') == 'reply' && window.localStorage.getItem('quotedComment').length > 0) {
			newEditor(1, bbcode2html(window.localStorage.getItem('quotedComment')));
			window.localStorage.removeItem('quotedComment');
		}
	}
}

function addCheckbox () {
	var commentDivs = jQuery('#postlist >div[id^="post_"]');
	var commentHeaders = jQuery('#postlist >div[id^="post_"] .plc >.pi >strong');

	/* append checkbox */
	commentHeaders.each(function (index) {
		var commentId = jQuery(this).closest('div[id^="post_"]').attr('id');
		jQuery(this).append('<input class="batch-reply-checkbox" type="checkbox" value="' + commentId + '"/>');
	});
}

function openReplyPageInNewTab () {
	var forumUrl = 'https://bbs.yamibo.com/';
	var replyUrl = forumUrl + jQuery('#post_replytmp').attr('onclick').split(',')[1].split('\'')[1];

	var allQuoteComment = getAllQuoteComments();
	if (allQuoteComment != false) {
		window.localStorage.setItem('quotedComment', allQuoteComment);
		window.location.href = replyUrl;
		/* window.open(replyUrl, '_blank'); */
	}

}

function copyAllQuoteComments () {
	var allQuoteComment = getAllQuoteComments();

	if (allQuoteComment != false) {
		window.prompt('請複製引用', allQuoteComment);
	}
}

function getAllQuoteComments () {
	var checkedBox = jQuery('.batch-reply-checkbox:checked');

	if (checkedBox.length == 0) {
		window.alert('請先勾選回覆！');
		return false;
	}
	var allQuoteComment = '';
	checkedBox.each(function () {
		allQuoteComment += formatQuoteComment(jQuery(this).val());
	});

	return allQuoteComment;
}

function formatQuoteComment (commentId) {
	var commentDiv = jQuery('#postlist >div[id="' + commentId + '"]');
	var commentUrl = commentDiv.find('.plc >.pi >strong >a').attr('href').split('&fromuid')[0];
	var commentAuthor = commentDiv.find('.favatar .authi >a').text();
	var commentTime = commentDiv.find('.plc .authi em').text();
	var commentTextHtml = commentDiv.find('.plc td[id^="postmessage_"]').parent().html();
	commentTextHtml = jQuery(commentTextHtml).find('i').remove().end();
	var commentText = jQuery(commentTextHtml).find('div').remove().end().text();
	commentText = jQuery.trim(commentText).substr(0, 50);
	commentText = jQuery.trim(commentText) + '...';

	var quotedComment = '[quote][size=2]';
	quotedComment += '[url=' + commentUrl + ']';
	quotedComment += '[color=#999999]' + commentAuthor + ' ' + commentTime + '[/color][/url][/size]\n';
	quotedComment += commentText;
	quotedComment += '[/quote]\n';
	quotedComment += '@' + commentAuthor + '\n\n\n';

	return quotedComment;
}

function getUrlParameter (sParam) {
	var sPageURL = decodeURIComponent(window.location.search.substring(1)),
			sURLVariables = sPageURL.split('&'),
			sParameterName,
			i;

	for (i = 0; i < sURLVariables.length; i++) {
		sParameterName = sURLVariables[i].split('=');

		if (sParameterName[0] === sParam) {
			return sParameterName[1] === undefined ? true : sParameterName[1];
		}
	}
}
