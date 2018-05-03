const Downloader = require("../utils/downloader")
const Convert = require("../utils/convert")

const Button = require("./Button").Button

class ImageButton extends Button {
	constructor(map, x, y, path, width, height, padding) {
		super(map, x, y, null, null, padding ? padding : 0)
		this.width = width
		this.height = height
		this.radius = Math.max(0, Math.min(this.radius, Math.min(this.width / 2, this.height / 2)))
		this.setIcon(path)
	}
	setIcon(path) {
		this.path = path
		this._downloading = false
		this.online = Convert.isUrl(path)
		if (this.online) {
			this._image = null
			this._download()
		} else {
			this._image = path
		}
	}
	setRadius(radius) {
		this.radius = Math.max(0, Math.min(radius, Math.min(this.width/2, this.height/2)))
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
					}
				},
				complete: function (res) {
					that._downloading = false
				}
			})
		}
	}
	draw(ctx, matrix) {
		if (!this.visible || this._image == null || this.width == null || this.height == null)
			return false
		this.drawBox(ctx, matrix)
		ctx.setShadow(0, 0, 0, "white")
		ctx.drawImage(
			this._image, 
			this.left + this.padding,
			this.top + this.padding,
			this.width,
			this.height,
		)
		return true
	};
}

module.exports = {
	ImageButton: ImageButton
}