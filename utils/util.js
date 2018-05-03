const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

const searchWord = (word, array, filter, limit) => {
	const weights = []
	for (const item of array) {
		const content = filter == null ? item : filter(item)
		if (content != null){
			let weight = 0
			let lastIndex = -1
			for (const char of word) {
				const index = content.indexOf(char)
				if (index != -1) {
					if (index > lastIndex) {
						weight += 1
					} else {
						weight += 0.5
					}
				}
				lastIndex = index
			}
			if (weight > 0){
				weights.push({
					item: item,
					weight: weight
				})
			}
		}
	}
	weights.sort((a, b) => {
		return b.weight - a.weight
	})
	const result = []
	for (const sorted of weights){
		result.push(sorted.item)
	}
	return typeof (limit) == "number" ? result.slice(0, limit) : result
}

module.exports = {
  formatTime: formatTime,
  searchWord: searchWord
}
