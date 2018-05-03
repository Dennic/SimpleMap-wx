const Downloader = require("../utils/downloader")
const Convert = require("../utils/convert")
const BaseLayer = require("./BaseLayer").BaseLayer

class MapLayer extends BaseLayer {
	constructor(map, path, width, height) {
		super(map, width, height)
		this.path = path
		this.measured = false
		this._downloading = false
		this.online = Convert.isUrl(path)
		if (this.online) {
			this._image = null
			this._downloadMap()
		} else {
			this._image = path
		}
		this.measureSize()
	}
	setPosition(x, y) { }
	measureSize() {
		if (!this.measured && this._image != null) {
			const that = this
			wx.getImageInfo({
				src: this._image,
				success: res => {
					const scale = Math.max(
						res.width / that.width,
						res.height / that.height
					)
					that.width = res.width / scale
					that.height = res.height / scale
				},
				fail: res => {
					that.measured = false
				}
			})
			this.measured = true
		}
	}
	_downloadMap() {
		if (!this._downloading) {
			this._downloading = true
			const that = this
			Downloader.load({
				url: this.path,
				success: function (image) {
					that._image = image
					that.measureSize()
				},
				complete: function (res) {
					that._downloading = false
				}
			})
		}
	}
	draw(ctx, matrix) {
		ctx.beginPath()
		ctx.rect(0, 0, this.width, this.height)
		ctx.clip()
		ctx.setFillStyle("#FFFFFF")
		ctx.fill()
		if (this._image != null){
			ctx.drawImage(this._image, 0, 0, this.width, this.height)
		} else {
			if (this.online) {
				this._downloadMap()
			}
			const value = matrix.getValue()
			const currZoom = value[2]
			const grid = {
				width: this.width / Math.round(this.width / 50),
				height: this.height / Math.round(this.height / 50)
			}
			ctx.setStrokeStyle("#EAEAEA")
			ctx.setLineWidth(1 / currZoom)
			ctx.beginPath()
			for (let x = 0; x < this.width; x += grid.width) {
				ctx.moveTo(x, 0)
				ctx.lineTo(x, this.height)
			}
			for (let y = 0; y < this.height; y += grid.height) {
				ctx.moveTo(0, y)
				ctx.lineTo(this.width, y)
			}
			ctx.stroke()
			ctx.setStrokeStyle("#CACACA")
			ctx.setLineWidth(1.2 / currZoom)
			ctx.strokeRect(0, 0, this.width, this.height)
		}
	};
}

module.exports = {
	MapLayer: MapLayer
}