/*alert(screen.width);*/
if(screen.width<750) {
	document.getElementById('WebViewport').setAttribute('content', 'width=750px,initial-scale='+screen.width/750+',target-densitydpi=device-dpi,minimum-scale='+screen.width/750+',maximum-scale='+screen.width/750+',user-scalable=1');
}
if(screen.width>750) {
	document.getElementById('WebViewport').setAttribute('content', 'width=750px,initial-scale='+screen.width/750+',target-densitydpi=device-dpi,minimum-scale='+screen.width/750+',maximum-scale='+screen.width/750+',user-scalable=1');
}
(function(doc, win) {
	var docEl = doc.documentElement,
		resizeEvt = 'orientationchange' in window ? 'orientationchange' : 'resize',
		recalc = function() {
			var clientWidth = docEl.clientWidth;
			if (!clientWidth) return;
			docEl.style.fontSize = 12.8 * (clientWidth / 320) + 'px';
		};

	if (!doc.addEventListener) return;
	win.addEventListener(resizeEvt, recalc, false);
	doc.addEventListener('DOMContentLoaded', recalc, false);
})(document, window);