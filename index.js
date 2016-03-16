module.exports = function diff(oldObject, newObject) {
	var keypathValues = {}
	diffToKeypathValues(keypathValues, '', oldObject, newObject)
	return keypathValues
}

function diffToKeypathValues(keypathValues, valueKeypath, oldObject, newObject) {
	function keypath(key) {
		return (valueKeypath ? (valueKeypath + '.') : '') + key
	}
	iterateOverAllProperties(oldObject, newObject, key => {
		var oldValue = oldObject[key]
		var newValue = newObject[key]
		var currentKeypath = keypath(key)

		function set(value) {
			keypathValues[currentKeypath] = value
		}

		if (typeof newValue === 'undefined') {
			set(null)
		} else if (typeof oldValue === 'undefined') {
			set(newValue)
		} else if (type(oldValue) !== type(newValue)) {
			set(newValue)
		} else if (type(newValue) === 'other' && newValue !== oldValue) {
			set(newValue)
		} else if (Array.isArray(newValue) && newValue.length < oldValue.length) {
			set(newValue)
		} else if (objectOrArray(newValue) && newValue !== oldValue) {
			diffToKeypathValues(keypathValues, currentKeypath, oldValue, newValue)
		}
	})
}

function iterateOverAllProperties(oldObject, newObject, cb) {
	var seenAlready = {}
	Object.keys(oldObject).forEach(key => {
		seenAlready[key] = true
		cb(key)
	})
	Object.keys(newObject).filter(key => !seenAlready[key]).forEach(key => cb(key))
}

function objectOrArray(o) {
	return object(o) || Array.isArray(o)
}

function object(o) {
	return o && typeof o === 'object'
}

function type(o) {
	if (Array.isArray(o)) {
		return 'array'
	} else if (object(o)) {
		return 'object'
	} else {
		return 'other'
	}
}
