// pages/demo/demo.js
const util = require('../../utils/util.js')

const Rpx = require("../../simplemap/utils/convert").rpxToPx
const SimpleMap = require("../../simplemap/simplemap").SimpleMap
const Layer = require("../../simplemap/layers/Layer")
const Widget = require("../../simplemap/widgets/Widget")

const SERVER_URL = "https://www.dennic365.com/static/"


Page({

	marks: {},

	/**
	 * 页面的初始数据
	 */
	data: {
		top: "10%",
		results: [],
		showMap: true,
	},

	onInput: function (e) {
		const value = e.detail.value
		if (value != "") {
			const results = util.searchWord(value, this.allMarks, (o) => { return o.tag })
			if (e.type == "confirm") {
				if (results.length > 0) {
					this.setData({
						results: [],
						showMap: true
					})
					this.marks[results[0].tag].click()
				} else {
					wx.showToast({
						title: "无搜索结果",
						icon: "none"
					})
				}
			} else {
				this.setData({
					results: results,
					showMap: results.length == 0
				})
			}
		}
		this.searchValue = value
		return value
	},
	onSearch: function(e) {
		if (this.data.showMap) {
			if (this.searchValue != null && this.searchValue != "") {
				const results = util.searchWord(this.searchValue, this.allMarks, (o) => { return o.tag })
				if (results.length > 0) {
					this.setData({
						results: results,
						showMap: false
					})
				}else {
					wx.showToast({
						title: "无搜索结果",
						icon: "none"
					})
				}
			}
		} else {
			this.setData({
				results: [],
				showMap: true,
				searchValue: ""
			})
		}
	},
	selectResult: function(e) {
		this.setData({
			showMap: true
		})
		const tag = e.target.dataset.tag
		if (tag in this.marks){
			// 强制触发点击回调
			this.marks[tag].click()
		}
	},

	onMapReady: function (res) {
		console.log(res.width) // 实际地图 Canvas 宽度
		console.log(res.height) // 实际地图 Canvas 高度
		const map = res.map

		// 配置瓦片图图层
		const mapLayer = new Layer.TileMapLayer(map, 1000, 1000)
		mapLayer.addTileLevel(1.4, SERVER_URL + "cqcet/cqcet-s-{column}-{row}.jpg", 1001, 1438, 500, 500)
		mapLayer.addTileLevel(2.4, SERVER_URL + "cqcet/cqcet-m-{column}-{row}.jpg", 2669, 3835, 800, 800)
		mapLayer.addTileLevel(2.8, SERVER_URL + "cqcet/cqcet-l-{column}-{row}.jpg", 5000, 7185, 800, 800)
		// 将图层设为底图
		map.setMap(mapLayer)
		// 设置瓦片图图层长按回调
		mapLayer.setLongTapCallback(e => {
			console.log(e)
			wx.showToast({
				icon: "none",
				title: "x=" + e.x.toFixed(1) + " y=" + e.y.toFixed(1),
			})
		})

		// 配置缩放按钮
		const btnZoomIn = new Widget.ImageButton(map, map.width - Rpx(140), map.height - Rpx(336), "/resource/zoom-in.png", Rpx(36), Rpx(36))
		const btnZoomOut = new Widget.ImageButton(map, map.width - Rpx(140), map.height - Rpx(220), "/resource/zoom-out.png", Rpx(36), Rpx(36))
		btnZoomIn.setPadding(Rpx(20))
		btnZoomOut.setPadding(Rpx(20))
		btnZoomIn.setClickCallback(widget => {
			map.setZoom(map.getZoom() * 1.5)
		})
		btnZoomOut.setClickCallback(widget => {
			map.setZoom(map.getZoom() / 1.5)
		})
		// 配置并添加按钮组
		const btnGroup = new Widget.ButtonGroup(map, map.width - Rpx(140), map.height - Rpx(256))
		btnGroup.setVerticalAlign("middle")
		btnGroup.addButton(btnZoomIn)
		btnGroup.addButton(btnZoomOut)
		map.addWidget(btnGroup)

		// 配置并添加文字Logo
		const text = new Widget.Text(map, 10, map.height - 10, "一个简单的地图")
		text.setTextColor("#333333")
		text.setTextBaseline("bottom")
		text.setTextAlign("left")
		map.addWidget(text)

		// 配置并添加指北针图标
		const image = new Widget.Image(map, "/resource/north.png", 16, 16, 32, 32)
		map.addWidget(image)

		// 在线获取地图标记列表并添加Mark图层到地图
		wx.showLoading({
			title: "加载中",
			mask: true
		})
		const that = this
		wx.request({
			url: SERVER_URL + "locations.json",
			success: (res) => {
				that.allMarks = res.data
				const marks = []
				const clearClick = () => {
					for (const mark of marks) {
						mark.setTextSize(12)
						mark.setIcon(null)
					}
				}
				for (const m of that.allMarks) {
					const mark = new Layer.MarkLayer(map, null, m.x, m.y)
					mark.setVisibleZoom(m.min, m.max)
					mark.setTag(m.tag)
					mark.setTextColor("#363636")
					mark.setTagPosition("bottom")
					mark.setClickCallback(e => {
						clearClick()
						e.target.setTextSize(14)
						e.target.setIcon("/resource/position.png", 24, 32)
						e.target.setOffset(-12, -32)
						map.setLocation(e.target.x, e.target.y)
						map.setZoom(e.target.getShowZoom())
					})
					map.addLayer(mark)
					marks.push(mark)
					that.marks[m.tag] = mark
				}
				mapLayer.setClickCallback(e => {
					clearClick()
				})
			},
			complete: (res) => {
				wx.hideLoading()
			}
		})

	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		const mapOptions = {
			minZoom: 0.6, // 最小缩放倍数
			maxZoom: 3, // 最大缩放倍数
			slide: true // 开启惯性滑动
		}
		const map = new SimpleMap(this, "map", mapOptions)
		// 设置地图canvas准备完毕回调
		map.setOnReadyCallback(this.onMapReady)
		this.map = map
	},

	onShow: function(){
		// 在页面显示时调用show方法，开始绘制地图。
		this.map.show()
	},
	onHide: function () {
		// 在页面显示时调用hide方法，停止绘制地图以节省资源。
		this.map.hide()
	},
	onUnload: function () {
		// 在页面被回收时调用stop方法，彻底结束掉地图绘制。
		this.map.stop()
	}
})