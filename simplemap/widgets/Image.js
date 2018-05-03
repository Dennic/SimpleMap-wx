const Downloader = require("../utils/downloader")
const Convert = require("../utils/convert")

const BaseWidget = require("./BaseWidget").BaseWidget

class Image extends BaseWidget {
	constructor(map, path, x, y, width, height) {
		super(map, width, height)
		this.setPosition(x, y)
		this.setImage(path)
	}
	setImage(path) {
		this.path = path
		this._downloading = false
		this.online = Convert.isUrl(path)
		if (this.online) {
			this._image = null
			this._download()
		} else {
			this._image = path
			this.measureSize()
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
	measureSize() {
		if (this._image != null && (this.width == 0 || this.height == 0)){
			const that = this
			wx.getImageInfo({
				src: this._image,
				success: function (res) {
					that.width = res.width
					that.height = res.height
				}
			})
		}
	}
	draw(ctx, matrix) {
		if (!this.visible || this._image == null || this.width == 0 || this.height == 0)
			return false
		ctx.setShadow(0, 0, 0, "white")
		ctx.drawImage(
			this._image,
			this.left,
			this.top,
			this.width,
			this.height,
		)
		return true
	};
}

module.exports = {
	Image: Image
}