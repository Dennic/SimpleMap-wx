const Convert = require("../utils/convert")
const Rpx = Convert.rpxToPx

const BaseWidget = require("./BaseWidget").BaseWidget
const TEXT_SIZE = 14 // 默认字体大小 px
const PADDING = Rpx(24) // 默认填充大小 rpx
const RADIUS = Rpx(6) // 默认圆角半径 rpx

class Button extends BaseWidget {
	constructor(map, x, y, text, textSize, padding) {
		super(map)
		this.textSize = textSize ? textSize : TEXT_SIZE
		this.padding = padding ? padding : PADDING
		this.text = text ? text : null
		this.measureSize()
		this.setRadius(RADIUS)
		this.setPosition(x, y)
	}
	setText(text) {
		this.text = text
	}
	setPadding(padding){
		this.padding = padding
	}
	setRadius(radius) {
		this.radius = Math.max(0, Math.min(radius, Math.min(this.width/2, this.height/2)))
	}
	measureSize() {
		if (this.text != null) {
			this.width = Convert.measureTextWidth(this.text, this.textSize)
			this.height = this.textSize
		}
		this.radius = Math.max(0, Math.min(this.radius, Math.min(this.width / 2, this.height / 2)))
	}
	drawBox(ctx, matrix) {
		if (this._hover) {
			ctx.setFillStyle("#B0B0B0")
		} else {
			ctx.setFillStyle("#FFFFFF")
		}
		const boxWidth = this.width + this.padding * 2
		const boxHeight = this.height + this.padding * 2
		const halfRadius = this.radius / 2
		ctx.setLineWidth(0.5)
		ctx.beginPath()
		ctx.moveTo(this.left + this.radius, this.top)
		ctx.lineTo(this.left + boxWidth - this.radius, this.top)
		ctx.bezierCurveTo(this.left + boxWidth - halfRadius, this.top, this.left + boxWidth, this.top + halfRadius, this.left + boxWidth, this.top + this.radius)
		ctx.lineTo(this.left + boxWidth, this.top + boxHeight - this.radius)
		ctx.bezierCurveTo(this.left + boxWidth, this.top + boxHeight - halfRadius, this.left + boxWidth - halfRadius, this.top + boxHeight, this.left + boxWidth - this.radius, this.top + boxHeight)
		ctx.lineTo(this.left + this.radius, this.top + boxHeight)
		ctx.bezierCurveTo(this.left + halfRadius, this.top + boxHeight, this.left, this.top + boxHeight - halfRadius, this.left, this.top + boxHeight - this.radius)
		ctx.lineTo(this.left, this.top + this.radius)
		ctx.bezierCurveTo(this.left, this.top + halfRadius, this.left + halfRadius, this.top, this.left + this.radius, this.top)
		ctx.closePath()
		ctx.fill()
	}
	draw(ctx, matrix) {
		if (!this.visible || this.text == null)
			return false
		this.drawBox(ctx, matrix)
		ctx.setShadow(0, 0, 0, "white")
		ctx.setFillStyle("#000000")
		ctx.setTextBaseline("middle")
		ctx.setTextAlign("center")
		ctx.setFontSize(this.textSize)
		ctx.fillText(this.text, this.left + this.padding + this.width / 2, this.top + this.padding + this.height / 2)
		return true
	};
	checkInside(x, y) {
		return (this.visible
			&& x > this.left
			&& x < this.left + this.width + this.padding * 2
			&& y > this.top
			&& y < this.top + this.height + this.padding * 2
		)
	}
}

module.exports = {
	Button: Button
}