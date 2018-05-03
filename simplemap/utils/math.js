const getDistance = function(x1, y1, x2, y2) {
	return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
}

const getMidpoint = function(x1, y1, x2, y2) {
	return { x: (x1 + x2) / 2, y: (y1 + y2) / 2}
}

module.exports = {
	getDistance: getDistance,
	getMidpoint: getMidpoint,
}