const MAX_DOWNLOAD_TASK = 4
var downloadTaskCount = 0

const cachedFiles = {}
const downloadTasks = {}

const reset = function(){
	for (var key in downloadTasks) delete downloadTasks[key];
	downloadTaskCount = 0
}


const complete = function(options, res) {
	if (typeof (options.complete) == "function")
		options.complete(res)
}
const fail = function(options, res, final) {
	if (typeof (options.fail) == "function")
		options.fail(res)
	if (!final)
		complete(options, res)
}
const success = function(options, res, final) {
	if (typeof (options.success) == "function")
		options.success(res)
	if (!final)
		complete(options, res)
}

const load = function(options) {
	if (options.url == null){
		throw new TypeError("parameter.url is required.")
	} else if (typeof (options.url) != "string") {
		throw new TypeError("parameter.url should be String.")
	} else {
		if (cachedFiles[options.url] != null) {
			success(options, cachedFiles[options.url])
		} else {
			if (downloadTaskCount < MAX_DOWNLOAD_TASK && downloadTasks[options.url] == null) {
				const downloadTask = wx.downloadFile({
					url: options.url,
					header: {
						"Connection": "Keep-Alive"
					},
					success: (res) => {
						if (res.statusCode === 200) {
							cachedFiles[options.url] = res.tempFilePath
							success(options, res.tempFilePath, true)
						} else {
							if (typeof (options.fail) == "function") {
								options.fail(res, true)
							}
						}
					},
					fail: (res) => {
						fail(options, res, true)
					},
					complete: (res) => {
						downloadTasks[options.url] = null
						downloadTaskCount--
						complete(options, res)
					}
				})
				downloadTask.onProgressUpdate((res) => {
					if (typeof (options.onProgressUpdate) == "function") {
						options.onProgressUpdate(res)
					}
				})
				downloadTasks[options.url] = downloadTask
				downloadTaskCount++
			} else {
				fail(options, undefined)
			}
		}
	}
}

module.exports = {
	reset: reset,
	load: load
}