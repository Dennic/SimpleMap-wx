const BaseLayer = require("./BaseLayer").BaseLayer
const MarkLayer = require("./MarkLayer").MarkLayer

class MarkGroupLayer extends BaseLayer {
	constructor(map) {
		super(map)
		this.visibleZoom = {}
		this.marks = []
	}
	addMark(mark, index) {
		if (mark instanceof MarkLayer) {
			if (!this.marks.includes(mark)) {
				if (index != null) {
					this.marks.splice(index, 0, mark);
				} else {
					this.marks.push(mark)
				}
				return true
			} else {
				return false
			}
		} else {
			throw new TypeError("Not a MarkLayer.")
		}
	}
	removeMark(mark) {
		if (mark instanceof MarkLayer) {
			const index = this.marks.indexOf(mark)
			if (index != -1) {
				this.marks.splice(index, 1)
				return true
			} else {
				return false
			}
		} else {
			throw new TypeError("Not a MarkLayer.")
		}
	}
	setVisibleZoom(min, max) {
		this.visibleZoom.min = min
		this.visibleZoom.max = max
	}
	setClickCallback(callback) {
		return false
	}
	setLongTapCallback(callback) {
		return false
	}
	onClick(x, y, matrix) {
		if (this.visible) {
			for (var i = this.marks.length; --i >= 0;) {
				const mark = this.marks[i]
				if (mark.onClick(x, y, matrix)) {
					return true
				}
			}
		}
		return false
	};
	onLongTap(x, y, matrix) {
		if (this.visible) {
			for (var i = this.marks.length; --i >= 0;) {
				const mark = this.marks[i]
				if (mark.onLongTap(x, y, matrix)) {
					return true
				}
			}
		}
		return false
	};
	draw(ctx, matrix) {
		if (this.visible) {
			const currZoom = matrix.getValue()[2]
			if (
				(this.visibleZoom.min != null ? currZoom > this.visibleZoom.min : true)
				&& (this.visibleZoom.max != null ? currZoom <= this.visibleZoom.max : true)
			){
				ctx.restore()
				for (const mark of this.marks) {
					ctx.save()
					mark.draw(ctx, matrix)
					ctx.restore()
				}
				ctx.save()
			}
		}
	};
}

module.exports = {
	MarkGroupLayer: MarkGroupLayer
}