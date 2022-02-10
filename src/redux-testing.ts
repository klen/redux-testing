import { StoreEnhancer, AnyAction, Store, Reducer, Action, PreloadedState } from 'redux'

export const TESTING_TYPES = {
  GET_ACTIONS: 'TESTS/GET_ACTIONS',
  GET_ACTION: 'TESTS/GET_ACTION',
  CLEAR_ACTIONS: 'TESTS/CLEAR_ACTIONS',
  RESET: 'TESTS/RESET',
  UPDATE: 'TESTS/UPDATE',
}

type TestEnhancerType = {
  reset: () => void
  getActions: () => AnyAction[]
  getAction: (index?: number) => AnyAction
  clearActions: () => void
  update: (value, path?: string) => void
}

export const reset = (store: Store) => store.dispatch({ type: TESTING_TYPES.RESET })

export const update = (store: Store, value, path?: string) =>
  store.dispatch({ type: TESTING_TYPES.UPDATE, payload: { value, path } })

export const clearActions = (store: Store) => store.dispatch({ type: TESTING_TYPES.CLEAR_ACTIONS })

/**
 * Enhance the given store with the testing functions
 */
export const testEnhancer: StoreEnhancer<TestEnhancerType> =
  (createStore) =>
  <S, A extends Action = AnyAction>(
    appReducer: Reducer<S, A>,
    initialState?: PreloadedState<S>,
  ): Store<S, A> & TestEnhancerType => {
    const actionsLog: AnyAction[] = []

    // Support UPDATE/RESET
    const reducer = (state, action) => {
      switch (action.type) {
        case TESTING_TYPES.UPDATE:
          if (action.payload) return applyUpdate(state, action.payload.value, action.payload.path)
          break

        case TESTING_TYPES.RESET:
          actionsLog.length = 0
          return appReducer(undefined, action)

        case TESTING_TYPES.CLEAR_ACTIONS:
          actionsLog.length = 0
          return state

        default:
          if (!(action.type in TESTING_TYPES)) actionsLog.push(action)
          break
      }
      return appReducer(state, action)
    }

    // Create a store
    const store = createStore(reducer, initialState)

    return {
      ...store,

      /** Get recorded actions */
      getActions: () => actionsLog,

      /** Clear recorded actions */
      clearActions: () => {
        store.dispatch({ type: TESTING_TYPES.CLEAR_ACTIONS })
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

export default testEnhancer

function applyUpdate<S>(state: S, value, path?: string): S {
  if (typeof state !== 'object') return value
  if (path && path.length > 0) {
    value = path
      .split('.')
      .reverse()
      .reduce((value, name) => ({ [name]: value }), value)
    return applyUpdate(state, value)
  }

  for (const name in value) state[name] = applyUpdate(state[name], value[name])
  return state
}
