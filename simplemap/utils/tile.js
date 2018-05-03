const Downloader = require("../utils/downloader")
const Convert = require("../utils/convert")

class TileManager{
	constructor(path, name){
		this.path = path
		this.name = name
		this._online = Convert.isUrl(path)
		this._tiles = []
		this._measuring = {}
	}
	getTilePath(column, row){
		const tilePath = this.path.replace("{column}", column).replace("{row}", row)
		return tilePath
	}
	initTile(tilePath, tempPath) {
		const that = this
		wx.getImageInfo({
			src: tempPath == null ? tilePath : tempPath,
			success: function (res) {
				that._tiles[tilePath] = {
					path: tempPath == null ? tilePath : tempPath,
					width: res.width,
					height: res.height,
				}
			},
			complete: function (res) {
				that._measuring[tilePath] = null
			}
		})
	}
	getTile(column, row){
		const tilePath = this.getTilePath(column, row)
		if (this._tiles[tilePath] != null){
			return this._tiles[tilePath]
		} else {
			const that = this
			if (this._online) {
				if (this._measuring[tilePath] == null) {
					this._measuring[tilePath] = true
					Downloader.load({
						url: tilePath,
						success: function (tempPath) {
							that.initTile(tilePath, tempPath)
						},
						fail: function (res) {
							that._measuring[tilePath] = null
						}
					})
				}
			} else {
				if (this._measuring[tilePath] == null) {
					this._measuring[tilePath] = true
					this.initTile(tilePath)
				}
			}
			return null
		}
	}
}

module.exports = {
	TileManager: TileManager
}