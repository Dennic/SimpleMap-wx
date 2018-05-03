var screenWidth = null
const getScreenWidth = function() {
	if (screenWidth == null) {
		const info = wx.getSystemInfoSync()
		screenWidth = info.screenWidth
	}
	return screenWidth
}
const rpxToPx = function(rpx) {
	return rpx * getScreenWidth() / 750
}
const pxToRpx = function(px) {
	return px / getScreenWidth() * 750
}

const URL_PATTERN = new RegExp("(https)://[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]")
const isUrl = function(url){
	return URL_PATTERN.test(url)
}

var measureCtx = null
const measureTextWidth = function(text, size) {
	if (measureCtx == null) {
		measureCtx = wx.createCanvasContext("simplemap-measure")
	}
	measureCtx.save()
	measureCtx.setFontSize(size)
	var textWidth = 0
	if (measureCtx.measureText) {
		textWidth = measureCtx.measureText(text).width
	} else {
		textWidth = text.length * size * 0.8
	}
	measureCtx.restore()
	return textWidth
}

module.exports = {
	rpxToPx: rpxToPx,
	pxToRpx: pxToRpx,
	isUrl: isUrl,
	measureTextWidth: measureTextWidth,
}