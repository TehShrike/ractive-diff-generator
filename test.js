'use strict'

var test = require('tape-catch')
var diff = require('./')
var Ractive = require('ractive')
Ractive.DEBUG = false

test('value on old not on new + value on new not on old', t => {
	var b = {}
	var output = diff(Object.freeze({
		a: 3,
		b: b
	}), {
		c: 'something else'
	})

	t.equal(output.set.a, null)
	t.equal(output.set.b, null)
	t.equal(output.set.c, 'something else')
	t.equal(Object.keys(output.set).length, 3)
	t.end()
})

test('new object of different type should be copied', t => {
	var b = {}
	var output = diff(Object.freeze({
		a: 3,
		b: 'buh'
	}), {
		b: b
	})

	t.equal(output.set.a, null)
	t.notEqual(output.set.b, b)
	t.equal(Object.keys(output.set).length, 2)
	t.end()
})

test('new primitive of different type', t => {
	var output = diff(Object.freeze({
		a: 3
	}), {
		a: 'three'
	})

	t.equal(output.set.a, 'three')
	t.equal(Object.keys(output.set).length, 1)
	t.end()
})

test('new primitive of same type', t => {
	var output = diff(Object.freeze({
		a: 3
	}), {
		a: 4
	})

	t.equal(output.set.a, 4)
	t.equal(Object.keys(output.set).length, 1)
	t.end()
})

test('new primitive of same value', t => {
	var output = diff(Object.freeze({
		a: 3
	}), {
		a: 3
	})

	t.notOk(output.set.a)
	t.equal(Object.keys(output.set).length, 0)
	t.end()
})

test('nested object with different value', t => {
	var first = Object.freeze({})

	var output = diff(Object.freeze({
		a: {
			first: first,
			second: Object.freeze({})
		}
	}), {
		a: {
			first: first,
			second: {
				newValue: true
			}
		}
	})

	t.notOk(output.set['a.first'])
	t.equal(output.set['a.second.newValue'], true)
	t.equal(Object.keys(output.set).length, 1)
	t.end()
})

test('new values in an array', t => {
	var a = {}
	var output = diff(Object.freeze({
		ary: Object.freeze([1, 2, a])
	}), {
		ary: [1, 3, a, { newObject: true }]
	})

	t.deepEqual(output.merge[0], {
		keypath: 'ary',
		array: [1, 3, a, { newObject: true }]
	})
	t.equal(output.merge.length, 1)
	t.equal(Object.keys(output.set).length, 0)
	t.end()
})

test('removed values in an array', t => {
	var a = Object.freeze({})
	var b = Object.freeze([ { eh: 'lol' } ])
	var output = diff(Object.freeze({
		whatever: 'eh',
		deeper: {
			ary: Object.freeze([1, 2, a, 'eh']),
			ary2: b
		}
	}), {
		whatever: 'eh',
		deeper: {
			ary: [1, 3, a],
			ary2: b
		}
	})

	t.deepEqual(output.merge[0], {
		keypath: 'deeper.ary',
		array: [1, 3, a]
	})
	t.equal(output.merge.length, 1)
	t.equal(Object.keys(output.set).length, 0)
	t.end()
})

test('Inputs arrays are not modified', t => {
	var ary = [1, 2]
	var objectWithArray = {
		ary: ary
	}
	var originalObject = {
		someObject: objectWithArray
	}

	var ractive = new Ractive()

	var firstChange = diff({}, originalObject)
	diff.apply(ractive, firstChange)

	t.notOk(ractive.get('someObject.ary') === ary)
	t.deepEqual(ractive.get('someObject.ary'), ary)

	var secondChange = diff(ractive.get(), {
		someObject: {
			ary: [1, 2, 3]
		}
	})

	diff.apply(ractive, secondChange)

	t.deepEqual(ary, [1, 2], 'The original array still only has two elements')
	t.ok(originalObject.someObject === objectWithArray, 'The original object still has the same property')
	t.ok(objectWithArray.ary === ary, 'The nested object is still pointing to the original array')

	t.end()
})

test('Complex array elements are not altered', t => {
	var first = {
		a: 'yes, a'
	}
	var nested = {
		nested: 'totally'
	}
	var second = {
		b: nested
	}
	var ary = [first, second]
	var originalObject = {
		ary: ary
	}

	var ractive = new Ractive()

	var firstChange = diff({}, originalObject)
	diff.apply(ractive, firstChange)

	var secondChange = diff(originalObject, {
		ary: [first, { b: { nested: 'different' } }]
	})

	diff.apply(ractive, secondChange)

	t.equal(ary[1].b.nested, 'totally')
	t.equal(nested.nested, 'totally')
	t.equal(ractive.get('ary.1.b.nested'), 'different')

	t.end()
})

test('Input objects are not changed', t => {
	var grandchild = {
		number: 1
	}
	var child = {
		grandchild: grandchild
	}
	var main = {
		child: child
	}

	var ractive = new Ractive()

	var firstChange = diff({}, main)
	diff.apply(ractive, firstChange)

	var secondChange = diff(main, {
		child: {
			grandchild: {
				number: 2
			}
		}
	})

	diff.apply(ractive, secondChange)

	t.equal(main.child, child)
	t.equal(child.grandchild, grandchild)
	t.equal(grandchild.number, 1)
	t.end()
})
