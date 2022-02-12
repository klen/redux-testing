/* eslint-disable @typescript-eslint/no-explicit-any */

export function applyUpdate<State>(state: State, value: any, path?: string): State {
  if (!isPlainObject(state)) return value

  if (path && path.length > 0) {
    value = path
      .split('.')
      .reverse()
      .reduce((value, name) => ({ [name]: value }), value)
    return applyUpdate(state, value)
  }
  for (const name in value) state[name] = applyUpdate(state[name], value[name])
  return { ...state }
}

const isPlainObject = (val: any) => !!val && typeof val === 'object' && val.constructor === Object
