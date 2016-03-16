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

	t.equal(output.a, null)
	t.equal(output.b, null)
	t.equal(output.c, 'something else')
	t.equal(Object.keys(output).length, 3)
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

	t.equal(output.a, null)
	t.equal(output.b, b)
	t.equal(Object.keys(output).length, 2)
	t.end()
})

test('new primitive of different type', t => {
	var output = diff({
		a: 3
	}, {
		a: 'three'
	})

	t.equal(output.a, 'three')
	t.equal(Object.keys(output).length, 1)
	t.end()
})

test('new primitive of same type', t => {
	var output = diff({
		a: 3
	}, {
		a: 4
	})

	t.equal(output.a, 4)
	t.equal(Object.keys(output).length, 1)
	t.end()
})

test('new primitive of same value', t => {
	var output = diff({
		a: 3
	}, {
		a: 3
	})

	t.notOk(output.a)
	t.equal(Object.keys(output).length, 0)
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

	t.notOk(output['a.first'])
	t.equal(output['a.second.newValue'], true)
	t.equal(Object.keys(output).length, 1)
	t.end()
})

test('new values in an array', t => {
	var a = {}
	var output = diff({
		ary: [1, 2, a]
	}, {
		ary: [1, 3, a, { newObject: true }]
	})

	t.equal(output['ary.1'], 3)
	t.equal(output['ary.3'].newObject, true)
	t.equal(Object.keys(output).length, 2)
	t.end()
})

test('removed values in an array', t => {
	var a = {}
	var output = diff({
		ary: [1, 2, a, 'eh']
	}, {
		ary: [1, 3, a]
	})

	t.equal(output.ary[0], 1)
	t.equal(output.ary[1], 3)
	t.equal(output.ary[2], a)
	t.equal(Object.keys(output).length, 1)
	t.end()
})
