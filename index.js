module.exports = function diff(oldObject, newObject) {
	var keypathValues = {
		set: {},
		merge: []
	}
	diffToKeypathValues(keypathValues, '', oldObject, newObject)
	return keypathValues
}

function diffToKeypathValues(keypathValues, valueKeypath, oldObject, newObject) {
	function keypath(key) {
		return (valueKeypath ? (valueKeypath + '.') : '') + key
	}
	iterateOverAllProperties(oldObject, newObject, function(key) {
		var oldValue = oldObject[key]
		var newValue = newObject[key]
		var currentKeypath = keypath(key)

		function set(value) {
			keypathValues.set[currentKeypath] = value
		}

		var newType = type(newValue)
		var oldType = type(oldValue)

		if (newValue === oldValue) {
			return
		} else if (newType === 'undefined') {
			set(null)
		} else if (newType === 'other') {
			set(newValue)
		} else if (oldType !== newType) {
			set(copy(newValue))
		} else if (newType === 'array') {
			keypathValues.merge.push({
				keypath: currentKeypath,
				array: newValue
			})
		} else if (type(newValue) === 'object') {
			diffToKeypathValues(keypathValues, currentKeypath, oldValue, newValue)
		}
	})
}

function iterateOverAllProperties(oldObject, newObject, cb) {
	var seenAlready = {}
	Object.keys(oldObject).forEach(function(key) {
		seenAlready[key] = true
		cb(key)
	})
	Object.keys(newObject).filter(function(key) {
		return !seenAlready[key]
	}).forEach(function(key) {
		cb(key)
	})
}

function copy(value) {
	var t = type(value)
	if (t === 'array') {
		return value.map(copy)
	} else if (t === 'object') {
		var target = {}
		Object.keys(value).forEach(function(key) {
			target[key] = copy(value[key])
		})
		return target
	} else {
		return value
	}
}

function object(o) {
	return o && typeof o === 'object'
}

function type(o) {
	if (typeof o === 'undefined') {
		return 'undefined'
	} else if (Array.isArray(o)) {
		return 'array'
	} else if (object(o)) {
		return 'object'
	} else {
		return 'other'
	}
}

var mergeOptions = {
	compare: function identity(o) {
		return o
	}
}

module.exports.apply = function(ractive, diff) {
	ractive.set(diff.set)
	diff.merge.forEach(function(arrayToMerge) {
		ractive.merge(arrayToMerge.keypath, arrayToMerge.array, mergeOptions)
	})
}
