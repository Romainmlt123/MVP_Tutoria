import assert from 'node:assert/strict'
import {
  MODULE_WIDTH,
  buildWorldPath,
  extendPath,
  generateModule,
  validatePath,
} from './pathGenerator.js'

const HEIGHT = 5

function testModule() {
  const { path, centerRow } = generateModule({ width: MODULE_WIDTH, height: HEIGHT, seed: 42 })
  assert.equal(path[0].row, centerRow)
  assert.equal(path[0].col, 0)
  assert.equal(path[path.length - 1].row, centerRow)
  assert.equal(path[path.length - 1].col, MODULE_WIDTH - 1)

  const v = validatePath(path, { height: HEIGHT })
  assert.equal(v.valid, true, v.errors.join('; '))
}

function testWorldContinuity() {
  const path = buildWorldPath(4, HEIGHT, 1)
  const v = validatePath(path, { height: HEIGHT })
  assert.equal(v.valid, true, v.errors.join('; '))

  for (let m = 1; m < 4; m += 1) {
    const boundary = m * MODULE_WIDTH
    const left = path.filter((c) => c.col === boundary - 1).pop()
    const right = path.find((c) => c.col === boundary)
    assert.ok(left && right, `seam ${boundary}`)
    assert.equal(left.row, right.row, `row mismatch at seam ${boundary}`)
  }
}

function testExtendNoDuplicate() {
  const m1 = generateModule({ width: MODULE_WIDTH, height: HEIGHT, seed: 1 })
  const m2 = generateModule({ width: MODULE_WIDTH, height: HEIGHT, seed: 2 })
  let path = extendPath([], m1.path, 0)
  path = extendPath(path, m2.path, MODULE_WIDTH)
  const keys = new Set(path.map((c) => `${c.row}:${c.col}`))
  assert.equal(keys.size, path.length)
}

testModule()
testWorldContinuity()
testExtendNoDuplicate()
console.log('pathGenerator tests OK')
