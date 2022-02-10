/* eslint-disable @typescript-eslint/ban-ts-comment */
import { StoreEnhancer, AnyAction } from 'redux'

export const TESTING_TYPES = {
  RESET: 'TESTS/RESET',
  UPDATE: 'TESTS/UPDATE',
}

/**
 * Enhance the given store with the testing functions
 */
export const enhancer: StoreEnhancer<{
  /** Get recorded actions */
  getActions: () => AnyAction[]

  /** Clear recorded actions */
  clearActions: () => void

  /** Get a recorded action
   * @param index an optional action's index
   */
  getAction: (index?: number) => AnyAction

  /** Reset the store */
  reset: () => void

  /** Update the store */
  update: (value, path?: string) => void
}> = next => (appReducer, preload) => {
  const actionsLog: AnyAction[] = []

  // Support UPDATE/RESET
  const reducer = (state, action) => {
    switch (action.type) {
      case TESTING_TYPES.UPDATE:
        return applyUpdate(state, action.payload?.value, action.payload?.path)

      case TESTING_TYPES.RESET:
        actionsLog.length = 0
        return appReducer(undefined, action)

      default:
        break
    }
    return appReducer(state, action)
  }

  // Create a store
  const store = next(reducer, preload)

  // Record actions
  const dispatch = action => {
    if (!(action.type in TESTING_TYPES)) actionsLog.push(action)
    return store.dispatch(action)
  }

  return {
    ...store,
    dispatch,

    /** Get recorded actions */
    getActions: () => actionsLog,

    /** Clear recorded actions */
    clearActions: () => {
      actionsLog.length = 0
    },

    /** Get a recorded action
     * @param index an optional action's index
     */
    getAction: (index?: number) =>
      typeof index !== 'undefined' && index >= 0
        ? actionsLog[index]
        : actionsLog[actionsLog.length - 1 + (index || 0)],

    /** Reset the store */
    reset: () => store.dispatch({ type: TESTING_TYPES.RESET }),

    /** Update the store */
    update: (value, path?: string) =>
      store.dispatch({ type: TESTING_TYPES.UPDATE, payload: { value, path } }),
  }
}

export default enhancer

function applyUpdate<S>(state: S, value, path?: string): S {
  if (typeof state !== 'object') return value
  if (path && path.length > 0) {
    value = path
      .split('.')
      .reverse()
      .reduce((value, name) => ({ [name]: value }), value)
    return applyUpdate(state, value)
  }
  // @ts-ignore
  for (const name in value) state[name] = applyUpdate(state[name], value[name])
  return state
}
