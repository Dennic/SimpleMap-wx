const Rpx = require("../utils/convert").rpxToPx

const Button = require("./Button").Button
const BaseWidget = require("./BaseWidget").BaseWidget
const PADDING = Rpx(24) // 默认填充大小 rpx
const RADIUS = Rpx(6) // 默认圆角半径 rpx
const VERTICAL_ALIGN = ["top", "middle", "bottom"] // 垂直对齐方式
const DIVIDER_MARGIN = Rpx(6) // 分割线与边缘的间隔距离

class ButtonGroup extends BaseWidget {
	constructor(map, x, y, padding) {
		super(map)
		this.width = 0
		this.height = 0
		this.radius = RADIUS
		this.padding = padding ? padding : PADDING
		this.verticalAlign = VERTICAL_ALIGN[0]
		this.buttons = []
		this.setPosition(x, y)
	}
	addButton(button, index){
		if (button instanceof Button) {
			if (!this.buttons.includes(button)){
				if (index != null) {
					this.buttons.splice(index, 0, button);
				} else {
					this.buttons.push(button)
				}
				this.measurePosition()
				return true
			} else {
				return false
			}
		} else {
			throw new TypeError("not a button.")
		}
	}
	removeButton(button) {
		if (button instanceof Button) {
			const index = this.buttons.indexOf(button)
			if (index != -1){
				this.buttons.splice(index, 1)
				this.measurePosition()
				return true
			} else {
				return false
			}
		} else {
			throw new TypeError("not a button.")
		}
	}
	setPosition(x, y) {
		this.x = x
		this.y = y
		this.measurePosition()
	}
	setVerticalAlign(align){
		align = align.toLowerCase()
		if (VERTICAL_ALIGN.includes(align)) {
			this.verticalAlign = align
			this.measurePosition()
		}
	}
	setPadding(padding){
		this.padding = padding
		this.measure()
	}
	setRadius(radius) {
		this.radius = radius
		this.measure()
	}
	onTouch(x, y) {
		for (const button of this.buttons) {
			if (button.onTouch(x, y)) {
				this._hoverButton = button
				break
			}
		}
		return super.onTouch(x, y)
	};
	onClick(x, y) {
		if (this._hoverButton) {
			this._hoverButton.onClick(x, y)
			this._hoverButton = null
		}
		return super.onClick(x, y)
	};
	onLongTap(x, y) {
		if (this._hoverButton) {
			this._hoverButton.onLongTap(x, y)
			this._hoverButton = null
		}
		return super.onLongTap(x, y)
	};
	checkHover(x, y) {
		for (const button of this.buttons) {
			button.checkHover(x, y)
		}
		return super.checkHover(x, y)
	}
	measurePosition() {
		this.left = this.x
		this.top = this.y
		this.measure()
		switch (this.verticalAlign) {
			case "bottom":
				this.top -= this.height
				break
			case "middle":
				this.top -= this.height / 2
				break
		}
		this.measure()
	}
	measure() {
		var maxWidth = 0
		var totalHeight = 0
		for (const button of this.buttons) {
			button.setPadding(this.padding)
			const btnWidth = button.width + button.padding * 2
			maxWidth = btnWidth > maxWidth ? btnWidth: maxWidth
		}
		for (const button of this.buttons) {
			button.setPadding((maxWidth - button.width) / 2 + (this.padding - button.padding))
			const btnHeight = button.height + button.padding * 2
			totalHeight += btnHeight
		}
		this.width = maxWidth
		this.height = totalHeight
		if (this.buttons.length > 0)
			this.radius = Math.max(0, Math.min(this.radius, Math.min(this.width / 2, this.height / 2)))
		var nextY = this.top
		for (const button of this.buttons) {
			button.setRadius(this.radius)
			const btnWidth = button.width + button.padding * 2
			const btnHeight = button.height + button.padding * 2
			button.setPosition(this.left + (this.width - btnWidth) / 2, nextY)
			nextY += btnHeight
		}
	}
	drawBox(ctx, matrix) {
		ctx.setFillStyle("#FFFFFF")
		const boxWidth = this.width
		const boxHeight = this.height
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
		if (!this.visible || this.buttons.length == 0)
			return false
		this.drawBox(ctx, matrix)
		ctx.setShadow(0, 0, 0, "white")
		for (const button of this.buttons) {
			button.draw(ctx, matrix)
		}
		ctx.setStrokeStyle("#EAEAEA")
		ctx.setLineWidth(0.8)
		ctx.beginPath()
		for (let i = 0; i < this.buttons.length-1; i++) {
			const button = this.buttons[i]
			const btnRight = button.left + button.width + button.padding * 2
			const btnBottom = button.top + button.height + button.padding * 2
			ctx.moveTo(this.left + DIVIDER_MARGIN, btnBottom)
			ctx.lineTo(btnRight - DIVIDER_MARGIN, btnBottom)
		}
		ctx.stroke()
		return true
	};
	checkInside(x, y) {
		return (this.visible
			&& x > this.left
			&& x < this.left + this.width
			&& y > this.top
			&& y < this.top + this.height
		)
	}
}

module.exports = {
	ButtonGroup: ButtonGroup
}