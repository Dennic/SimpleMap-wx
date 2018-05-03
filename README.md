# SimpleMap-WX
为微信小程序提供的一个基于Canvas的自定义地图控件，实现了瓦片地图、自定义标记图层和多种交互部件。

<br>

仓库根目录是一个小程序 Demo 项目，可以直接使用微信开发者工具打开进行预览，预览时需勾上“不校验合法域名”。

## 简单使用

1. 可以选择 `clone` 或下载此仓库到本地。

2. 将 simplemap 目录复制到你的项目根目录下（不必须，可以放到任意位置，但要注意引入模块时的路径）。

3. 编辑要使用 SimpleMap 地图的页面 wxml 布局文件，添加以下代码。

```html
<import src="/simplemap/simplemap.wxml"/>

<template is="SimpleMap" data="{{...map}}"/>
```