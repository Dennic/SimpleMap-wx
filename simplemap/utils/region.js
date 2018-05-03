
class Region{
	constructor(left, top, right, bottom) {
		if (typeof(left) == "object"){
			const region = left
			this.left = region.left
			this.right = region.right
			this.top = region.top
			this.bottom = region.bottom
		} else {
			this.left = left
			this.right = right
			this.top = top
			this.bottom = bottom
		}
	}
	contains(x, y) {
		return (
			x > this.left
			&& x < this.right
			&& y > this.top
			&& y < this.bottom
		)
	}
}

module.exports = {
	Region: Region
}