// simplemap.js
var app = getApp()
const Downloader = require("./utils/downloader")
const Convert = require("./utils/convert")
const Renderer = require("./utils/renderer")
const Slider = require("./utils/slider").Slider
const Region = require("./utils/region").Region
const Matrix = require("./utils/matrix").Matrix
const TouchManager = require("./utils/touch").TouchManager

const defaultOptions = {
	maxZoom: 2,
	minZoom: 0.6,
	slide: true
}

function checkOptions(options){
	options = options != null && typeof (options) == "object" ? options : {}
	for (const key in defaultOptions) {
		const defaultValue = defaultOptions[key]
		if (options[key] == undefined || options[key].constructor !== defaultValue.constructor) {
			options[key] = defaultValue
		}
	}
}

class SimpleMap {
	constructor(page, name, options, readyCallback) {
		checkOptions(options)
		this.page = page
		this.name = name
		this.options = options
		this._measured = false
		this._showing = false
		this._readyCallback = readyCallback
		this._init()
		this._bindTouch(page)

		this.resize()
	}

	resize() {
		const that = this
		wx.createSelectorQuery().select("#" + this.name).fields({
			size: true
		}, res => {
			let width
			let height
			if (res == null){
				const systemInfo = wx.getSystemInfoSync()
				width = systemInfo.windowWidth
				height = systemInfo.windowHeight
			} else {
				width = res.width
				height = res.height
			}

			that.width = width
			that.height = height

			const data = {}
			data[this.name] = {
				simplemapWidth: width,
				simplemapHeight: height,
				simplemapShow: true
			}
			that.page.setData(data)

			that.touchManager.setWindowSize(width, height)

			that._measured = true
			that.show()

			if (that._readyCallback != null) {
				that._readyCallback({
					map: that,
					width: height,
					height: height
				})
			}
		}).exec()
	}

	_init() {
		this.ctx = wx.createCanvasContext("simplemap")

		this.map = null
		this.layers = []
		this.widgets = []

		// 重置下载器
		Downloader.reset()
		// 实时变换矩阵
		this.currMatrix = new Matrix()
		// 触摸管理器
		this.touchManager = new TouchManager(this, this.options)
		if (this.options.slide == true) {
			// 平滑滚动器
			this.slider = new Slider()
		}
	}

	_bindTouch(page) {
		var that = this
		page.simplemapTouchStart = e => {
			that.touchManager.update(e)
		}
		page.simplemapTouchMove = e => {
			that.touchManager.update(e)
		}
		page.simplemapTouchEnd = e => {
			that.touchManager.update(e)
		}
		page.simplemapTouchCancel = e => {
			that.touchManager.update(e)
		}
	}

	setOnReadyCallback(callback) {
		if (callback != null && this._measured) {
			callback({
				map: this,
				width: this.height,
				height: this.height
			})
		} else {
			this._readyCallback = callback
		}
	}
	setMap(layer) {
		this.map = layer
	}
	getMap() {
		return this.map
	}
	addLayer(layer) {
		this.layers.push(layer)
	}
	clearLayer() {
		this.layers = []
	}
	addWidget(widget) {
		this.widgets.push(widget)
	}
	clearWidget() {
		this.widgets = []
	}
	getLocation() {
		const location = this.currMatrix.reversePoint(this.width / 2, this.height / 2)
		return location
	}
	setLocation(x, y) {
		if (this.map) {
			x = Math.max(Math.min(x, this.map.width), 0)
			y = Math.max(Math.min(y, this.map.height), 0)
		}
		const value = this.currMatrix.getValue()
		x = x * value[2] - this.width / 2
		y = y * value[2] - this.height / 2
		this.currMatrix.setTranslate(-x, -y)
	}
	getZoom(){
		return this.currMatrix.getValue()[2]
	}
	setZoom(zoom) {
		const nextZoom = Math.max(Math.min(zoom, this.options.maxZoom), this.options.minZoom)
		this.currMatrix.setScale(nextZoom, this.width / 2, this.height / 2)
	}
	setMinZoom(zoom) {
		if (zoom > 0 && zoom < this.options.maxZoom) {
			let value = this.currMatrix.getValue()
			this.options.minZoom = zoom
			if (value[2] < zoom) {
				this.setZoom(zoom)
			}
		}
	}
	setMaxZoom(zoom) {
		if (zoom > this.options.minZoom) {
			let value = this.currMatrix.getValue()
			this.options.maxZoom = zoom
			if (value[2] > zoom) {
				this.setZoom(zoom)
			}
		}
	}
	returnToMap(){
		if (this.map != null) {
			const map = this.map
			const center = { x: this.width / 2, y: this.height / 2 }
			if (!map.checkInside(center.x, center.y, this.currMatrix)) {
				if (this.slider != null)
					this.slider.reset()
				const topLeft = this.currMatrix.mapPoint(0, 0)
				const bottomRight = this.currMatrix.mapPoint(map.width, map.height)
				const destX = Math.min(Math.max(center.x, topLeft.x), bottomRight.x)
				const destY = Math.min(Math.max(center.y, topLeft.y), bottomRight.y)
				this.currMatrix.translate(
					center.x - destX,
					center.y - destY
				)
			}
		}
	}
	getScreenRegion() {
		const topLeft = this.currMatrix.reversePoint(0, 0)
		const bottomRight = this.currMatrix.reversePoint(this.width, this.height)
		const screenRegion = new Region({
			left: topLeft.x,
			top: topLeft.y,
			right: bottomRight.x,
			bottom: bottomRight.y,
		})
		return screenRegion
	}
	draw(ctx, matrix) {
		ctx.setFillStyle("#F0F0F0")
		ctx.fillRect(0, 0, this.width, this.height)
	}
	onRender(frameTime) {
		if (this.ctx == null || this._showing == false || this._measured == false){
			this.hide()
			return
		}
		if (this.slider != null && !this.slider.isFinished()){
			const slide = this.slider.calculate()
			this.currMatrix.translate(
				slide.dx,
				slide.dy
			)
			this.returnToMap()
		}
		try {
			const matrix = new Matrix(this.currMatrix)
			const ctx = this.ctx
			// 绘制背景
			ctx.save()
			this.draw(ctx, matrix)
			ctx.restore()
			// 绘制底图
			if (this.map != null) {
				ctx.save()
				matrix.apply(ctx)
				this.map.draw(ctx, matrix)
				ctx.restore()
			}
			// 绘制图层
			for (const layer of this.layers) {
				ctx.save()
				layer.draw(ctx, matrix)
				ctx.restore()
			}
			// 绘制控件
			for (const widget of this.widgets) {
				ctx.save()
				ctx.setShadow(0, 0, Convert.rpxToPx(4), "#999999")
				widget.draw(ctx, matrix)
				ctx.restore()
			}
			// 真正绘制到画布上
			ctx.draw(false, () => {
				Renderer.render(this)
			})
		} catch (err) {
			if (typeof (err) == string){
				console.error(err)
			} else {
				throw err
			}
		}
	}

	show() {
		if (this._showing == false) {
			this._showing = true
			Renderer.render(this)
		}
	}
	hide() {
		this._showing = false
	}
	stop() {
		this.ctx = null
	}
}

module.exports = {
	SimpleMap: SimpleMap
}