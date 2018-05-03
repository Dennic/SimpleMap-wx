class BaseLayer {
	constructor(map, width, height) {
		this._map = map
		this.visible = true
		this.width = width
		this.height = height
		this.x = 0
		this.y = 0
	}
	setPosition(x, y) {
		this.x = x
		this.y = y
	}
	getPosition() {
		return { x: this.x, y: this.y }
	}
	isVisible() {
		return this.visible
	}
	setVisible(visible) {
		this.visible = visible
	}
	setClickCallback(callback) {
		this._callback = callback
	}
	setLongTapCallback(callback) {
		this._longTapCallback = callback
	}
	onClick(x, y, matrix) {
		if (this.visible && this.checkInside(x, y, this._map.currMatrix)) {
			if (this._callback != null) {
				let point = matrix.reversePoint(x, y)
				this._callback({
					target: this,
					x: point.x,
					y: point.y
				})
			}
			return true
		}
		return false
	};
	click() {
		if (this._callback != null) {
			this._callback({
				target: this,
				x: this.x,
				y: this.y
			})
		}
	}
	onLongTap(x, y, matrix) {
		if (this.visible && this.checkInside(x, y, this._map.currMatrix)) {
			if (this._longTapCallback != null) {
				let point = matrix.reversePoint(x, y)
				this._longTapCallback({
					target: this,
					x: point.x,
					y: point.y
				})
			}
		}
	};
	measureSize() { };
	draw(ctx, matrix) { };
	checkVisibility(region) { };
	checkInside(x, y, matrix) {
		let point = matrix.reversePoint(x, y)
		return (this.visible
			&& point.x > this.x
			&& point.x < this.x + this.width
			&& point.y > this.y
			&& point.y < this.y + this.height)
	}
}

module.exports = {
	BaseLayer: BaseLayer
}