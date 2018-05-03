const Convert = require("../utils/convert")
const Rpx = Convert.rpxToPx

const BaseWidget = require("./BaseWidget").BaseWidget
const TEXT_SIZE = 14 // 默认字体大小 px
const TEXT_ALIGN = "center" // 默认字体对齐位置
const TEXT_COLOR = "black" // 默认字体颜色
const TEXT_BASELINE = "middle" // 默认字体基线
const TEXT_STYLE = "normal" // 默认字体样式 normal, bold

class Text extends BaseWidget {
	constructor(map, x, y, text, textSize) {
		super(map)
		this.setPosition(x, y)
		this.textSize = textSize ? textSize : TEXT_SIZE
		this.align = TEXT_ALIGN
		this.color = TEXT_COLOR
		this.style = TEXT_STYLE
		this.baseline = TEXT_BASELINE
		this.text = text ? text : null
		this.measureSize()
	}
	setText(text) {
		this.text = text
	}
	setTextStyle(style) {
		if (style == "normal" || style == "bold") {
			this.style = style
		}
	}
	setTextColor(color) {
		this.color = color
	}
	setTextAlign(align) {
		this.align = align
	}
	setTextBaseline(baseline) {
		this.baseline = baseline
	}
	measureSize() {
		this.width = Convert.measureTextWidth(this.text, this.textSize)
		this.height = this.textSize
	}
	draw(ctx, matrix) {
		if (!this.visible || this.text == null)
			return false
		ctx.setFillStyle(this.color)
		ctx.setStrokeStyle(this.color)
		ctx.setTextBaseline(this.baseline)
		ctx.setTextAlign(this.align)
		ctx.setFontSize(this.textSize)
		ctx.setShadow(0, 0, 1, "white")
		if (this.style == "bold") {
			ctx.setLineWidth(this.height * 0.04)
			ctx.strokeText(this.text, this.left, this.top)
			ctx.setShadow(0, 0, 0, "white")
		}
		ctx.fillText(this.text, this.left, this.top)
		return true
	}
}

module.exports = {
	Text: Text
}