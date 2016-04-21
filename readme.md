If you're dealing with immutable state using some library like Redux, creating a map of keypath changes with this library should be more efficient than calling `ractive.set` because it can make use of `===` to drop entire objects and arrays that have not been changed.

Get more context for this library by reading [this issue on the Ractive repo](https://github.com/ractivejs/ractive/issues/2364).

# Use

`npm i ractive-diff-generator`

<!-- js
var diff = require('.');
-->

```js

var unchangingState = {
	value1: 'one',
	value2: 'two'
}

var oldState = {
	state: unchangingState,
	otherState: {
		value1: 'totally one'
	}
}

var newState = {
	state: unchangingState,
	otherState: {
		value1: 'totally one',
		value2: 'totally two'
	}
}

diff(oldState, newState) // => { set: { 'otherState.value2': 'totally two' }, merge: [] }

var oldStateWithArray = {
	someArray: [ unchangingState ]
}

var newStateWithArray = {
	someArray: [ unchangingState, { arbitraryValue: 'butts' } ]
}

diff(oldStateWithArray, newStateWithArray) // => { set: {}, merge: [ { keypath: 'someArray', array: [ unchangingState, { arbitraryValue: 'butts' }] }]}

```

In the above example, the properties of `otherState` were compared to find which ones should be updated, but the properties of `state` were skipped because the object was the same object in memory as it was before.

If you consider your objects as immutable, this means that none of the objects properties had changed.

You may apply these changes to a Ractive instance like so:

<!-- js
var ractive = {
	set: function() {},
	merge: function(keypath, array, options) {
		if (typeof keypath !== 'string') {
			throw new Error('NOT STRING')
		}
		if (!Array.isArray(array)) {
			throw new Error('NOT ARRAY')
		}
		if (typeof options.compare !== 'function') {
			throw new Error('NOT FUNCTION')
		}
	}
}
-->

```js

var someDiff = diff({
	someKey: 'value A',
	someArray: [ 'eh?' ]
}, {
	someKey: 'value B',
	someArray: [ 'wat' ]
})

var mergeOptions = {
	compare: function identity(o) {
		return o
	}
}

diff.apply(ractive, someDiff)

```

# Algorithm

"Type": object, array, other

Given two objects, `oldState` and `newState`, take the set of their properties, and for each one:

1. if their values are the same, ignore the property and move on
2. if the property does not exist in `newState`, set its keypath value to `null`.
3. if the new value is not a string or an array, just set the keypath value to it
4. if the two values have different types, make a deep copy of the new value and use that as the new value for that keypath
5. if the two values are arrays, add the new array value to the `merge` list
6. if the two values are objects, note the keypath and recursively perform the algorithm on the objects

# License

[WTFPL](http://wtfpl2.com/)
