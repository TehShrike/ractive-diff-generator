var test = require('tape')
var diff = require('./')

test('value on old not on new + value on new not on old', t => {
	var b = {}
	var output = diff({
		a: 3,
		b: b
	}, {
		c: 'something else'
	})

	t.equal(output.set.a, null)
	t.equal(output.set.b, null)
	t.equal(output.set.c, 'something else')
	t.equal(Object.keys(output.set).length, 3)
	t.end()
})

test('new object of different type', t => {
	var b = {}
	var output = diff({
		a: 3,
		b: 'buh'
	}, {
		b: b
	})

	t.equal(output.set.a, null)
	t.equal(output.set.b, b)
	t.equal(Object.keys(output.set).length, 2)
	t.end()
})

test('new primitive of different type', t => {
	var output = diff({
		a: 3
	}, {
		a: 'three'
	})

	t.equal(output.set.a, 'three')
	t.equal(Object.keys(output.set).length, 1)
	t.end()
})

test('new primitive of same type', t => {
	var output = diff({
		a: 3
	}, {
		a: 4
	})

	t.equal(output.set.a, 4)
	t.equal(Object.keys(output.set).length, 1)
	t.end()
})

test('new primitive of same value', t => {
	var output = diff({
		a: 3
	}, {
		a: 3
	})

	t.notOk(output.set.a)
	t.equal(Object.keys(output.set).length, 0)
	t.end()
})

test('nested object with different value', t => {
	var first = {}

	var output = diff({
		a: {
			first: first,
			second: {}
		}
	}, {
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
	var output = diff({
		ary: [1, 2, a]
	}, {
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
	var a = {}
	var b = [ { eh: 'lol' } ]
	var output = diff({
		whatever: 'eh',
		deeper: {
			ary: [1, 2, a, 'eh'],
			ary2: b
		}
	}, {
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
