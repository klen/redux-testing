/* eslint-disable @typescript-eslint/no-explicit-any */

import { applyUpdate } from './utils'

describe('utils', () => {
  it('applyUpdate', () => {
    let value: any

    value = 24
    expect(applyUpdate(42, value)).toBe(value)

    value = [3]
    expect(applyUpdate([1, 2], value)).toBe(value)

    value = { child: { val1: 3 } }
    const state = { child: { val1: 1, val2: 2 } }
    expect(applyUpdate(state, value)).not.toBe(state)
    expect(applyUpdate(state, value)).toEqual({ child: { val1: 3, val2: 2 } })
    expect(applyUpdate(state, 4, 'child.val2')).toEqual({ child: { val1: 3, val2: 4 } })
  })
})
