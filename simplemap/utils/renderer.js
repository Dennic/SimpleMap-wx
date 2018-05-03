const maxFps = 30
const frameTime = 1000 / maxFps

var lastFrameId = null
var lastFrameTime = 0

const render = function(map) {
	if (lastFrameId != null) {
		clearTimeout(lastFrameId)
		lastFrameId = null
	}
	const currTime = new Date().getTime()
	const timeToCall = Math.max(0, frameTime - (currTime - lastFrameTime))
	const id = setTimeout(function () {
		lastFrameId = null
		map.onRender(currTime + timeToCall) 
	}, timeToCall)
	lastFrameId = id
	lastFrameTime = currTime + timeToCall
	return id
}

module.exports = {
	render: render
}