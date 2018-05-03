
class Slider{
	constructor() {
		this.reset()
	}
	reset() {
		this._finished = true
		this._touchesLog = []
	}
	isFinished(){
		if (!this._finished){
			const nowTime = new Date().getTime()
			const timePass = nowTime - this.startTime
			if (timePass >= this.duration){
				this.reset()
			}
		}
		return this._finished
	}
	record(touches, timeStamp) {
		if (!this.isFinished()){
			this.reset()
		}
		if (touches.length > 0){
			let x = 0
			let y = 0
			for (const touch of touches){
				x += touch.x
				y += touch.y
			}
			x /= touches.length
			y /= touches.length
			this._touchesLog.splice(0, 0, { x: x, y: y, timeStamp: timeStamp })
			if (this._touchesLog.length > 3) {
				this._touchesLog.pop()
			}
		}
	}
	slide() {
		if (this._touchesLog.length == 3) {
			const earliest = this._touchesLog[this._touchesLog.length - 1]
			const newest = this._touchesLog[0]
			const dx = newest.x - earliest.x
			const dy = newest.y - earliest.y
			const dt = newest.timeStamp - earliest.timeStamp
			const vx = Math.max(Math.min(dx / dt * 0.5, 2), -2)
			const vy = Math.max(Math.min(dy / dt * 0.5, 2), -2)
			this.x = 0
			this.y = 0
			this.vx = vx
			this.vy = vy
			this.duration = 500
			this.startTime = new Date().getTime()
			this._finished = false
		}
	}
	calculate() {
		const nowTime = new Date().getTime()
		const timePass = nowTime - this.startTime
		const dx = timePass * this.vx
		const dy = timePass * this.vy
		const progress = Math.min(timePass / this.duration, 1)
		this.vx -= this.vx * progress * 1.2
		this.vy -= this.vy * progress * 1.2
		// const vx = this.vx * (1 - progress)
		// const vy = this.vy * (1 - progress)
		// const dx = timePass * vx
		// const dy = timePass * vy
		if (progress == 1) {
			this.reset()
		}
		return {
			dx: dx,
			dy: dy
		}
	}
}
module.exports = {
	Slider: Slider
}