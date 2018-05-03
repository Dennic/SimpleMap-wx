const BaseLayer = require("./BaseLayer").BaseLayer
const TileManager = require("../utils/tile").TileManager

class TileMapLayer extends BaseLayer {
	constructor(map, width, height) {
		super(map, width, height)
		this.levels = []
		this.measured = false
	}
	setPosition(x, y) { }
	measureSize() {
		if (!this.measured && this.levels.length > 0) {
			const level = this.levels[0]
			const scale = Math.max(
				level.width / this.width,
				level.height / this.height
			)
			this.width = level.width / scale
			this.height = level.height / scale
			this.measured = true
		}
	}
	addTileLevel(maxZoom, path, width, height, tileWidth, tileHeight) {
		if (path.indexOf("{column}") == -1 || path.indexOf("{row}") == -1){
			throw new TypeError("TileLevel path is illegal.Must contain \'{column}\' and \'{row}\'")
		}
		const columnCount = Math.ceil(width / tileWidth)
		const rowCount = Math.ceil(height / tileHeight)
		const tileManager = new TileManager(path)
		const level = {
			zoom: maxZoom,
			width: width,
			height: height,
			tileWidth: tileWidth,
			tileHeight: tileHeight,
			columnCount: columnCount,
			rowCount: rowCount,
			grid: {
				width: tileWidth / 10,
				height: tileHeight / 10
			},
			tiles: tileManager
		}
		this.levels.push(level)
		this.measureSize()
		return true
	}
	draw(ctx, matrix) {
		ctx.beginPath()
		ctx.setFillStyle("#FFFFFF")
		ctx.fillRect(0, 0, this.width, this.height)
		const value = matrix.getValue()
		const currZoom = value[2]
		var currLevel = null
		for (const level of this.levels) {
			if (level.zoom >= currZoom && (currLevel == null || level.zoom < currLevel.zoom)) {
				currLevel = level
			}
		}
		if (currLevel == null) {
			for (const level of this.levels) {
				if (currLevel == null || level.zoom > currLevel.zoom) {
					currLevel = level
				}
			}
		}
		if (currLevel == null)
			return
		const scale = Math.max(
			currLevel.width / this.width,
			currLevel.height / this.height
		)
		let screen = this._map.getScreenRegion()
		let display = {
			minColumn: Math.ceil(screen.left / currLevel.tileWidth * scale),
			maxColumn: Math.ceil(screen.right / currLevel.tileWidth * scale),
			minRow: Math.ceil(screen.top / currLevel.tileHeight * scale),
			maxRow: Math.ceil(screen.bottom / currLevel.tileHeight * scale),
		}
		let drawWidth = currLevel.tileWidth / scale
		let drawHeight = currLevel.tileHeight / scale
		let drawGrid = {
			width: currLevel.grid.width / scale,
			height: currLevel.grid.height / scale,
		}
		for (let column = 1; column <= currLevel.columnCount; column++) {
			for (let row = 1; row <= currLevel.rowCount; row++) {
				if (column >= display.minColumn && column <= display.maxColumn
					&& row >= display.minRow && row <= display.maxRow) {
					let left = drawWidth * (column - 1)
					let top = drawHeight * (row - 1)
					let tile = currLevel.tiles.getTile(column, row)
					if (tile != null) {
						let width = tile.width / scale
						let height = tile.height / scale
						ctx.drawImage(tile.path, left, top, width, height)
					} else {
						let tileRect = {
							left: left,
							top: top,
							right: Math.min(left + drawWidth, this.width),
							bottom: Math.min(top + drawHeight, this.height)
						}
						ctx.setStrokeStyle("#EAEAEA")
						ctx.setLineWidth(1 / currZoom)
						ctx.beginPath()
						for (let x=tileRect.left; x<tileRect.right; x+=drawGrid.width){
							ctx.moveTo(x, tileRect.top)
							ctx.lineTo(x, tileRect.bottom)
						}
						for (let y = tileRect.top; y < tileRect.bottom; y += drawGrid.height) {
							ctx.moveTo(tileRect.left, y)
							ctx.lineTo(tileRect.right, y)
						}
						ctx.stroke()
						ctx.setStrokeStyle("#CACACA")
						ctx.setLineWidth(1.2 / currZoom)
						ctx.beginPath()
						ctx.moveTo(tileRect.left, tileRect.bottom)
						ctx.lineTo(tileRect.left, tileRect.top)
						ctx.lineTo(tileRect.right, tileRect.top)
						ctx.stroke()
					}
				}
			}
		}
	};
}

module.exports = {
	TileMapLayer: TileMapLayer
}