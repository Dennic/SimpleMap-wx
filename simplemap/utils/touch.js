var mathTools = require("./math")

class TouchManager {
	constructor(map, options) {
		this._map = map
		this._matrix = map.currMatrix
		this._options = options
		this._startTouch = null
		this._lastTouches = []
		this._touchesLog = []
		this._lastTime = 0
		this._currTouchState = TouchManager.TOUCH_STATE_NONE
		this.longTapId = -1
	}
	setWindowSize(w, h) {
		this._width = w
		this._height = h
	}
	onLongTap() {
		for (var i = this._map.widgets.length; --i >= 0;) {
			const widget = this._map.widgets[i]
			widget.setHover(false)
		}
		wx.vibrateShort()
		for (var i = this._map.widgets.length; --i >= 0;) {
			const widget = this._map.widgets[i]
			if (widget.onLongTap(this._startTouch.x, this._startTouch.y)) {
				return
			}
		}
		for (var i = this._map.layers.length; --i >= 0;) {
			const layer = this._map.layers[i]
			if (layer.onLongTap(this._startTouch.x, this._startTouch.y, this._matrix)) {
				return
			}
		}
		if (this._map.map != null)
			this._map.map.onLongTap(this._startTouch.x, this._startTouch.y, this._matrix)
	}
	checkLongTap(check) {
		if (check) {
			const manager = this
			this.longTapId = setTimeout(function () {
				manager._currTouchState = TouchManager.TOUCH_STATE_NONE
				manager.onLongTap()
			}, 500)
		} else {
			if (this.longTapId != -1) {
				clearTimeout(this.longTapId)
				this.longTapId = -1
			}
		}
	}
	update(event) {
		switch (event.type) {
			case "touchstart":
				if (this._map.slider != null)
					this._map.slider.reset()
				if (this._currTouchState == TouchManager.TOUCH_STATE_NONE) {
					this._startTouch = event.touches[0]
					this._currTouchState = TouchManager.TOUCH_STATE_CLICK
					for (var i = this._map.widgets.length; --i >= 0;) {
						const widget = this._map.widgets[i]
						if (widget.onTouch(event.touches[0].x, event.touches[0].y)) {
							this._currTouchState = TouchManager.TOUCH_STATE_WIDGET
							this._hoverWidget = widget
							break
						}
					}
					this.checkLongTap(true)
				} else if (event.touches.length > 1) {
					this.checkLongTap(false)
					this._currTouchState = TouchManager.TOUCH_STATE_SCALE
				}
				break
			case "touchmove":
				switch (this._currTouchState) {
					case TouchManager.TOUCH_STATE_WIDGET:
						if (!this._hoverWidget.checkHover(event.touches[0].x, event.touches[0].y)) {
							this.checkLongTap(false)
							this._currTouchState = TouchManager.TOUCH_STATE_NONE
						}
						if (Math.abs(event.touches[0].x - this._startTouch.x) > 5
							|| Math.abs(event.touches[0].y - this._startTouch.y)) {
							this.checkLongTap(false)
						}
						break
					case TouchManager.TOUCH_STATE_CLICK:
						if (Math.abs(event.touches[0].x - this._startTouch.x) > 5
							|| Math.abs(event.touches[0].y - this._startTouch.y)) {
							this.checkLongTap(false)
							this._currTouchState = TouchManager.TOUCH_STATE_MOVE
						}
						break
					case TouchManager.TOUCH_STATE_MOVE:
						this._matrix.translate(
							event.touches[0].x - this._lastTouches[0].x,
							event.touches[0].y - this._lastTouches[0].y
						)
						if (this._map.slider != null)
							this._map.slider.record(event.touches, event.timeStamp)
						break
					case TouchManager.TOUCH_STATE_SCALE:
						var lastDist = mathTools.getDistance(
							this._lastTouches[0].x, this._lastTouches[0].y,
							this._lastTouches[1].x, this._lastTouches[1].y
						)
						var currDist = mathTools.getDistance(
							event.touches[0].x, event.touches[0].y,
							event.touches[1].x, event.touches[1].y
						)
						var lastMidpoint = mathTools.getMidpoint(
							this._lastTouches[0].x, this._lastTouches[0].y,
							this._lastTouches[1].x, this._lastTouches[1].y
						)
						var currMidpoint = mathTools.getMidpoint(
							event.touches[0].x, event.touches[0].y,
							event.touches[1].x, event.touches[1].y
						)
						var value = this._matrix.getValue()
						var scale = currDist / lastDist
						var nextZoom = value[2] + (scale - 1)
						if (nextZoom < this._options.minZoom) {
							scale = this._options.minZoom - value[2] + 1
						} else if (nextZoom > this._options.maxZoom) {
							scale = this._options.maxZoom - value[2] + 1
						}
						this._matrix.scale(scale, this._width / 2, this._height / 2)
						this._matrix.translate(
							currMidpoint.x - lastMidpoint.x,
							currMidpoint.y - lastMidpoint.y
						)
						break
				}
				break
			case "touchend":
				this.checkLongTap(false)
				switch (this._currTouchState) {
					case TouchManager.TOUCH_STATE_WIDGET:
						this._hoverWidget.onClick(event.changedTouches[0].x, event.changedTouches[0].y)
						break
					case TouchManager.TOUCH_STATE_CLICK:
						var layerClicked = false
						for (var i = this._map.layers.length; --i >= 0;) {
							const layer = this._map.layers[i]
							if (layer.onClick(this._startTouch.x, this._startTouch.y, this._matrix)) {
								layerClicked = true
								break
							}
						}
						if (!layerClicked && this._map.map != null) {
							this._map.map.onClick(this._startTouch.x, this._startTouch.y, this._matrix)
						}
						break
				}
				if (event.touches.length == 1) {
					this._currTouchState = TouchManager.TOUCH_STATE_MOVE
				} else if (event.touches.length == 0) {
					if (this._currTouchState == TouchManager.TOUCH_STATE_MOVE) {
						if (this._map.slider != null){
							this._map.slider.record(event.changedTouches, event.timeStamp)
							this._map.slider.slide()
						}
					}
					this._currTouchState = TouchManager.TOUCH_STATE_NONE
				}
				this._map.returnToMap()
				break
			case "touchcancel":
				this.checkLongTap(false)
				this._currTouchState = TouchManager.TOUCH_STATE_NONE
				this._map.returnToMap()
				break
		}
		this._lastTouches = event.touches
		this._lastTime = event.timeStamp
	}
}
TouchManager.TOUCH_STATE_NONE = 1
TouchManager.TOUCH_STATE_CLICK = 2
TouchManager.TOUCH_STATE_MOVE = 3
TouchManager.TOUCH_STATE_SCALE = 4
TouchManager.TOUCH_STATE_WIDGET = 5

module.exports = {
	TouchManager: TouchManager
}