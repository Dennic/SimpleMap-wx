const Downloader = require("../utils/downloader")
const Convert = require("../utils/convert")
const BaseLayer = require("./BaseLayer").BaseLayer
const TEXT_SIZE = 12 // 默认字体大小 px
const TAG_POSITION = ["top", "bottom", "left", "right"] // 标签显示位置
const TAG_OFFSET = Convert.rpxToPx(4) // 默认标签位置偏移

class MarkLayer extends BaseLayer {
	constructor(map, path, x, y, width, height) {
		super(map, width, height)
		this.path = path
		this.offset = { x: 0, y: 0 }
		this.tagPosition = { position: TAG_POSITION[1], offset: TAG_OFFSET, x: x, y: y}
		this.textColor = "#000000"
		this.textSize = {}
		this.visibleZoom = {min: null, max: null}
		this.x = x
		this.y = y
		this.setIcon(path, width, height)
	}
	setIcon(path, width, height) {
		this.path = path
		this.measured = false
		if (this.path && width && height) {
			this.width = width
			this.height = height
			this.measured = true
		} else {
			this.width = Convert.rpxToPx(24)
			this.height = Convert.rpxToPx(24)
			this.offset = { x: Convert.rpxToPx(-12), y: Convert.rpxToPx(-12) }
			this.measureTagPosition()
		}
		this._downloading = false
		this.online = Convert.isUrl(path)
		if (this.online) {
			this._image = null
			this._download()
		} else {
			this._image = path
		}
		this.measureSize()
	}
	setVisibleZoom(min, max) {
		this.visibleZoom.min = min
		this.visibleZoom.max = max
	}
	getVisibleZoom() {
		return this.visibleZoom
	}
	getShowZoom() {
		const min = this.visibleZoom.min == null ? this._map.options.minZoom : Math.max(this._map.options.minZoom, this.visibleZoom.min)
		const max = this.visibleZoom.max == null ? this._map.options.maxZoom : Math.min(this._map.options.maxZoom, this.visibleZoom.max)
		return (min + max) / 2
	}
	setTag(tag, size) {
		this.tag = tag
		if (tag != null) {
			this.textSize.height = size == null ? (this.textSize.height == null ? TEXT_SIZE : this.textSize.height) : size
			const textWidth = Convert.measureTextWidth(this.tag, this.textSize.height)
			this.textSize.width = textWidth
			this.setTagPosition(this.tagPosition.position)
			this.measureTagPosition()
		}
	}
	getTag() {
		return this.tag != null ? this.tag : ""
	}
	setTextSize(size) {
		this.setTag(this.tag, size)
	}
	setTextColor(color) {
		this.textColor = color
	}
	setTagOffset(offset) {
		if (offset != null){
			this.tagPosition.offset = offset
			this.measureTagPosition()
		}
	}
	measureTagPosition() {
		this.setTagPosition(this.tagPosition.position)
	}
	setTagPosition(pos) {
		pos = pos.toLowerCase()
		if (TAG_POSITION.includes(pos)) {
			this.tagPosition.position = pos
			if (this.tag != null && this.x != null && this.y != null) {
				switch (pos) {
					case "top":
						this.tagPosition.x = this.offset.x + this.width / 2
						this.tagPosition.y = this.offset.y - this.textSize.height / 2 - this.tagPosition.offset
						break
					case "bottom":
						this.tagPosition.x = this.offset.x + this.width / 2
						this.tagPosition.y = this.offset.y + this.height + this.textSize.height / 2 + this.tagPosition.offset
						break
					case "left":
						this.tagPosition.x = this.offset.x - this.textSize.width / 2 - this.tagPosition.offset
						this.tagPosition.y = 0
						break
					case "right":
						this.tagPosition.x = this.offset.x + this.width + this.textSize.width / 2 + this.tagPosition.offset
						this.tagPosition.y = 0
						break
				}
			}
		}
	}
	setSize(width, height) {
		this.width = width
		this.height = height
		this.measured = true
		this.measureTagPosition()
	}
	setPosition(x, y) {
		super.setPosition(x, y)
		this.measureTagPosition()
	}
	setOffset(x, y) {
		this.offset.x = x
		this.offset.y = y
		this.measureTagPosition()
	}
	measureSize() {
		if (!this.measured && this._image != null) {
			const that = this
			wx.getImageInfo({
				src: this._image,
				success: res => {
					that.width = res.width
					that.height = res.height
				},
				fail: res => {
					that.measured = false
				}
			})
			this.measured = true
		}
	}
	_download() {
		if (!this._downloading) {
			this._downloading = true
			const that = this
			const path = this.path
			Downloader.load({
				url: path,
				success: function (image) {
					if (path == that.path) {
						that._image = image
						that.measureSize()
					}
				},
				complete: function (res) {
					that._downloading = false
				}
			})
		}
	}
	checkInZoom(currZoom) {
		return (this.visibleZoom.min != null ? currZoom > this.visibleZoom.min : true)
			&& (this.visibleZoom.max != null ? currZoom <= this.visibleZoom.max : true)
	}
	draw(ctx, matrix) {
		const screen = this._map.getScreenRegion()
		if (this.visible && screen.contains(this.x, this.y)) {
			const currZoom = matrix.getValue()[2]
			if (this.checkInZoom(currZoom)) {
				if (this.x != null && this.y != null) {
					const position = matrix.mapPoint(this.x, this.y)
					if (this.path != null && this._image != null){
						ctx.drawImage(this._image, position.x + this.offset.x, position.y + this.offset.y, this.width, this.height)
					} else {
						ctx.beginPath()
						ctx.arc(position.x, position.y, Convert.rpxToPx(10), 0, 2 * Math.PI)
						ctx.setFillStyle("white")
						ctx.setShadow(0, 1, Convert.rpxToPx(4), "#333333")
						ctx.fill()
						ctx.beginPath()
						ctx.arc(position.x, position.y, Convert.rpxToPx(4), 0, 2 * Math.PI)
						ctx.setFillStyle("#AC9C9C")
						ctx.setShadow(0, 0, 0, "white")
						ctx.fill()
					}
					if (this.tag != null && this.tagPosition.x != null && this.tagPosition.y != null) {
						ctx.setFillStyle(this.textColor)
						ctx.setStrokeStyle(this.textColor)
						ctx.setLineWidth(this.textSize.height * 0.04)
						ctx.setTextBaseline("middle")
						ctx.setTextAlign("center")
						ctx.setFontSize(this.textSize.height)
						ctx.setShadow(0, 0, 1, "white")
						ctx.strokeText(this.tag, position.x + this.tagPosition.x, position.y + this.tagPosition.y)
						ctx.setShadow(0, 0, 0, "white")
						ctx.fillText(this.tag, position.x + this.tagPosition.x, position.y + this.tagPosition.y)
					}
				} else {
					if (this.online) {
						this._download()
					}
				}
			}
		}
	}
	checkInside(x, y, matrix) {
		if (this.x != null && this.y != null) {
			let point = matrix.reversePoint(x, y)
			const currZoom = matrix.getValue()[2]
			return this.checkInZoom(currZoom) && this.visible && 
			(
				(
					point.x > this.x + this.offset.x / currZoom
					&& point.x < this.x + this.width / currZoom + this.offset.x / currZoom
					&& point.y > this.y + this.offset.y / currZoom
					&& point.y < this.y + this.height / currZoom + this.offset.y / currZoom
				) || (
					this.tag != null && this.tagPosition.x != null && this.tagPosition.y != null
					&& point.x > this.x + this.tagPosition.x / currZoom - this.textSize.width / 2 / currZoom
					&& point.x < this.x + this.tagPosition.x / currZoom + this.textSize.width / 2 / currZoom
					&& point.y > this.y + this.tagPosition.y / currZoom - this.textSize.height / 2 / currZoom
					&& point.y < this.y + this.tagPosition.y / currZoom + this.textSize.height / 2 / currZoom
				)
			)
		}
	}
}

module.exports = {
	MarkLayer: MarkLayer
}