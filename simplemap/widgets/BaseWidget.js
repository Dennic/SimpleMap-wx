const Rpx = require("../utils/convert").rpxToPx

class BaseWidget {
	constructor(map, width, height) {
		this.map = map
		this.width = width ? width : 0
		this.height = height ? height : 0
		this.left = 0
		this.top = 0
		this.visible = true
	}
	setSize(width, height) {
		this.width = Rpx(width)
		this.height = Rpx(height)
	}
	setClickCallback(callback) {
		this._clickCallback = callback
	}
	setLongTapCallback(callback) {
		this._longTapCallback = callback
	}
	isVisible() {
		return this.visible
	}
	setVisible(visible) {
		this.visible = visible
	}
	setPosition(x, y) {
		this.left = x
		this.top = y
	}
	onTouch(x, y) {
		if (!this.visible)
			return false
		if (this.checkHover(x, y)) {
			this._hover = true
			return true
		}
		return false
	};
	onClick(x, y) {
		if (!this.visible)
			return false
		if (this.checkHover(x, y)) {
			this._hover = false
			if (this._clickCallback != null) {
				this._clickCallback(this)
			}
			return true
		}
		return false
	};
	click() {
		if (this._clickCallback != null) {
			this._clickCallback(this)
		}
	}
	onLongTap(x, y) {
		if (!this.visible)
			return false
		if (this.checkHover(x, y)) {
			this._hover = false
			if (this._longTapCallback != null) {
				this._longTapCallback(this)
			}
			return true
		}
		return false
	};
	draw(ctx, matrix) { };
	checkHover(x, y) {
		var hover = this.checkInside(x, y)
		if (!hover) {
			this._hover = hover
		}
		return hover
	}
	setHover(hover) {
		this._hover = hover
	}
	checkInside(x, y) {
		return (this.visible
			&& x > this.left
			&& x < this.left + this.width
			&& y > this.top
			&& y < this.top + this.height)
	}
}

module.exports = {
	BaseWidget: BaseWidget
}