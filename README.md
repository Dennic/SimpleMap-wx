# SimpleMap-WX
为微信小程序提供的一个基于Canvas的自定义地图控件，实现了瓦片地图、自定义标记图层和多种交互部件。

<br>

仓库根目录是一个小程序 Demo 项目，可以直接使用微信开发者工具打开进行预览，预览时需勾上“不校验合法域名”。

<br>

> SimpleMap 组件实际使用案例：
> 
> 微信小程序“小恐龙课程表” —— 校园地图功能
>
> [无法加载动图？点击这里](https://dennic365.com/dino/static/GIF-180504_111653.gif)<br/>
> ![演示动图](https://dennic365.com/dino/static/GIF-180504_111653.gif)

----------

+ [详细文档](#详细文档)
+ [简单使用](#简单使用)
	+ [添加组件到 wxml](#3-编辑要使用-simplemap-地图的页面-wxml-布局文件添加以下代码)
	+ [在 js 中初始化](#5-分别在-onloadonshowonhide-和-onunload-回调函数中添加代码对-simplemap-进行初始化开始绘制暂停绘制和结束绘制的操作)
	+ [地图组件准备完成](#6-推荐在-readycallback-回调函数中设置地图图层)
	+ [添加标记图层](#7-向地图组件中添加-mark-标记图层)
	+ [添加按钮部件](#8-向地图组件中添加-ui-按钮部件)
+ [类目录结构](#类目录结构)
+ [部分类方法参数说明](#部分类构造方法说明)
	+ [SimpleMap](#simplemappage-name-options-readycallback)
	+ [Layer](#layermaplayermap-path-width-height)
		+ [MapLayer](#layermaplayermap-path-width-height)
		+ [TileMapLayer](#layertilemaplayermap-width-height)
		+ [MarkLayer](#layermarklayermap-path-x-y-width-height)
	+ [Widget](#widgetbuttonmap-x-y-text-textsize-padding)
		+ [Button](#widgetbuttonmap-x-y-text-textsize-padding)
		+ [ImageButton](#widgetimagebuttonmap-x-y-path-width-height-padding)

## 详细文档

[查看详细文档](https://github.com/Dennic/SimpleMap-wx/wiki)

## 简单使用

#### 1. 可以选择 `clone` 或下载此仓库到本地。

#### 2. 将 simplemap 目录复制到你的项目根目录下（不必须，可以放到任意位置，但要注意引入模块时的路径）。

#### 3. 编辑要使用 SimpleMap 地图的页面 wxml 布局文件，添加以下代码。

```html
<import src="/simplemap/simplemap.wxml"/>

<template is="SimpleMap" data="{{...demo_map}}"/>
```

- *demo_map 为地图的唯一名称，可以更改为自己想要的名称。*

- *SimpleMap 组件默认会占满整个页面，且置于所有组件的最顶层。*

- *如需指定 SimpleMap 组件的大小和位置，只需将 SimpleMap 模板包含在 id 和地图名称相同的父元素内，并对父元素进行定位即可，例如：*

```html
<view id="demo_map" style="width: 300px; height: 200px;"> 
	<template is="SimpleMap" data="{{...demo_map}}"/>
</view>
```

#### 4. 编辑页面的 js 文件，在代码顶部引入 SimpleMap 和其他相关类。

```javascript
// 需改为在项目中的实际路径（相对路径）
const SimpleMap = require("../../simplemap/simplemap").SimpleMap // SimpleMap 核心类
const Layer = require("../../simplemap/layers/Layer") // 图层模块包
const Widget = require("../../simplemap/widgets/Widget") // UI 部件模块包
```

#### 5. 分别在 onLoad、onShow、onHide 和 onUnload 回调函数中添加代码，对 SimpleMap 进行初始化、开始绘制、暂停绘制和结束绘制的操作。

```javascript
onMapReady: function(res){
	// res.map 准备好的 SimpleMap 对象
	// res.width 确定后的 SimpleMap 组件宽度
	// res.height 确定后的 SimpleMap 组件高度
}
onLoad: function (options) {
	const mapOptions = {
		minZoom: 0.6, // 最小缩放倍数
		maxZoom: 3, // 最大缩放倍数
		slide: true // 开启惯性滑动
	}
	const map = new SimpleMap(this, "demo_map", mapOptions)
	// 设置地图 canvas 准备完毕的回调
	map.setOnReadyCallback(this.onMapReady)
	this.map = map
},
onShow: function(){
	// 在页面显示时调用show方法，开始绘制地图。
	this.map.show()
},
onHide: function () {
	// 在页面显示时调用hide方法，暂停绘制地图以节省资源。
	this.map.hide()
},
onUnload: function () {
	// 在页面被回收时调用stop方法，彻底结束掉地图绘制。
	this.map.stop()
}
```

#### 6. （推荐）在 readyCallback 回调函数中设置地图图层。

```javascript
onMapReady: function(res){
	const map = res.map
	const TILE_URL = "https://www.dennic365.com/static/cqcet/"
	// 配置瓦片图图层
	const mapLayer = new Layer.TileMapLayer(map, 1000, 1000)
	mapLayer.addTileLevel(1.4, TILE_URL + "cqcet-s-{column}-{row}.jpg", 1001, 1438, 500, 500)
	mapLayer.addTileLevel(2.4, TILE_URL + "cqcet-m-{column}-{row}.jpg", 2669, 3835, 800, 800)
	mapLayer.addTileLevel(2.8, TILE_URL + "cqcet-l-{column}-{row}.jpg", 5000, 7185, 800, 800)
	// 将图层设为底图
	map.setMap(mapLayer)
}
```

#### 7. 向地图组件中添加 Mark 标记图层。

```javascript
// 实例化一个新的 Mark 标签，传入标签在地图中的坐标
const mark = new Layer.MarkLayer(map, null, 100, 150)
// 设置可见标记的缩放范围
mark.setVisibleZoom(1, 1.8)
// 设置标记文字标签
mark.setTag("一个标记")
// 设置标记文字颜色
mark.setTextColor("#363636")
// 设置标记文字位置
mark.setTagPosition("bottom")
// 设置标记点击回调
mark.setClickCallback(e => {
	wx.showToast({
		title: "点击标记"
	})
})
// 设置标记长按回调
mark.setLongTapCallback(e => {
	wx.showToast({
		title: "长按标记"
	})
})
// 将标记图层添加到地图组件中
map.addLayer(mark)
```

#### 8. 向地图组件中添加 UI 按钮部件。

```javascript
// 实例化一个新的按钮部件，传入按钮位置和按钮文字。
const btnZoomIn = new Widget.ImageButton(map, 50, 100, "放大")
// 设置按钮的点击回调
btnZoomIn.setClickCallback(widget => {
	map.setZoom(map.getZoom() * 1.5)
})
// 将按钮部件添加到地图组件中
map.addWidget(btnZoomIn)
```

## 类目录结构

+ SimpleMap
+ Layer
	+ MapLayer  			-- *单一图片地图图层*
	+ TileMapLayer			-- *瓦片地图图层*
	+ MarkLayer				-- *标记图层*
	+ MarkGroupLayer		-- *标记组图层*
+ Widget
	+ Button				-- *按钮组件*
	+ ImageButton			-- *图标按钮组件*
	+ ButtonGroup			-- *按钮组组件*
	+ Text					-- *文字组件*
	+ Image					-- *图片组件*
+ Utils
	+ Convert				-- *单位转换和测量工具*
	+ Math					-- *数学计算工具*
	+ Region				-- *区块工具*
	+ Matrix				-- *矩阵工具*
	+ Slider				-- *惯性滑动工具*
	+ Touch					-- *触摸管理工具*
	+ Renderer				-- *渲染工具*
	+ Downloader			-- *文件下载和缓存工具*
	+ Tile					-- *瓦片图管理工具*

## 部分类构造方法说明

> 详细的类方法说明文档正在编辑中......

### SimpleMap(page, name, options, readyCallback) 

#### SimpleMap 组件的核心类

##### 构造函数参数说明：

| 参数   | 类型    |  必须   |  说明  |
| :----- | :------ | :----- | :----- |
| page   | Object  |   是   | 传入当前的页面对象   |
| name   | String  |   是   | 地图的唯一名称，与 wxml 中一致   |
| options   | Object  |   否   | 地图配置参数  |
| readyCallback   | Function  |   否   | 监听地图准备完毕回调函数  |

##### options 参数说明:

| 参数   | 类型    |  默认值   |  说明  |
| :----- | :------ | :----- | :----- |
| minZoom   | Number  |   0.6   | 最小缩放倍数   |
| maxZoom   | Number  |   2   | 最大缩放倍数   |
| slide   | Boolean  |   true   | 是否开启惯性滑动  |

##### readyCallback 返回参数说明：

| 参数   | 类型     |  说明    |
| :----- | :------ | :------- |
| map    | Object  | 准备完毕的 SimpleMap 对象   |
| width  | Number  | 确定后的 SimpleMap 组件宽度   |
| height | Number  | 确定后的 SimpleMap 组件高度  |

----------

### Layer.MapLayer(map, path, width, height) 

#### 单一图片地图图层

##### 构造函数参数说明：

| 参数   | 类型    |  必须   |  说明  |
| :----- | :------ | :----- | :----- |
| map   | Object  |   是   | SimpleMap 地图组件对象   |
| path   | String  |   是   | 图片资源路径（本地文件路径或网络图片URL）   |
| width   | Number  |   是   | 地图图层宽度  |
| height   | Number  |   是   | 地图图层高度  |

----------

### Layer.TileMapLayer(map, width, height) 

#### 瓦片地图图层

##### 构造函数参数说明：

| 参数   | 类型    |  必须   |  说明  |
| :----- | :------ | :----- | :----- |
| map   | Object  |   是   | SimpleMap 地图组件对象   |
| width   | Number  |   是   | 地图图层宽度  |
| height   | Number  |   是   | 地图图层高度  |

----------

### Layer.MarkLayer(map, path, x, y, width, height) 

#### 地图标记图层

##### 构造函数参数说明：

| 参数   | 类型    |  必须   |  说明  |
| :----- | :------ | :----- | :----- |
| map   | Object  |   是   | SimpleMap 地图组件对象   |
| path   | String  |   是   | 标记图片资源路径（本地文件路径或网络图片URL）（若该参数为 null，默认将绘制一个纽扣图标）   |
| x   | Number  |   是   | 标记坐标 X  |
| y   | Number  |   是   | 标记坐标 Y  |
| width   | Number  |   是   | 标记图标宽度  |
| height   | Number  |   是   | 标记图标高度  |

----------

### Widget.Button(map, x, y, text, textSize, padding) 

#### 普通按钮部件

##### 构造函数参数说明：

| 参数   | 类型    |  必须   |  默认值   |  说明  |
| :----- | :------ | :----- | :------- | :----- |
| map   | Object  |   是   |           | SimpleMap 地图组件对象   |
| x   | Number  |   是   |           | 部件坐标 X  |
| y   | Number  |   是   |           | 部件坐标 Y  |
| text   | String  |   是   |           | 按钮文字  |
| textSize   | Number  |   否   | 14px  | 字体大小  |
| padding   | Number  |   否   | 24rpx  | 文字周围填充尺寸  |

----------

### Widget.ImageButton(map, x, y, path, width, height, padding) 

#### 图标按钮部件

##### 构造函数参数说明：

| 参数   | 类型    |  必须   |  默认值   |  说明  |
| :----- | :------ | :----- | :------- | :----- |
| map   | Object  |   是   |           | SimpleMap 地图组件对象   |
| x   | Number  |   是   |           | 部件坐标 X  |
| y   | Number  |   是   |           | 部件坐标 Y  |
| path   | String  |   是   |           | 图片资源路径（本地文件路径或网络图片URL）   |
| width   | Number  |   是   |           | 图标宽度  |
| height   | Number  |   是   |           | 图标高度  |
| padding   | Number  |   否   | 24rpx  | 图标周围填充尺寸  |
