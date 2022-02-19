/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  StoreEnhancer,
  AnyAction,
  Store,
  Reducer,
  PreloadedState,
  StoreEnhancerStoreCreator,
} from 'redux'
import { applyUpdate } from './utils'

export const TESTING_TYPES = {
  GET_ACTIONS: 'TESTS/GET_ACTIONS',
  GET_ACTION: 'TESTS/GET_ACTION',
  CLEAR_ACTIONS: 'TESTS/CLEAR_ACTIONS',
  RESET: 'TESTS/RESET',
  UPDATE: 'TESTS/UPDATE',
}

interface TestEnhancerType {
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
export const enhancer: StoreEnhancer<TestEnhancerType> =
  (createStore: StoreEnhancerStoreCreator): StoreEnhancerStoreCreator<TestEnhancerType> =>
  <S, A extends AnyAction>(appReducer: Reducer<S, A>, preloadedState?: PreloadedState<S>) => {
    const actionsLog: AnyAction[] = []

    // Support UPDATE/RESET
    const reducer = (state: S, action: A) => {
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
    const store = createStore(reducer, preloadedState)

    return {
      ...store,

      /** Get recorded actions */
      getActions: () => actionsLog,

      /** Clear recorded actions */
      clearActions: () => {
        store.dispatch({ type: TESTING_TYPES.CLEAR_ACTIONS } as A)
      },

      /** Get a recorded action
       * @param index an optional action's index
       */
      getAction: (index?: number) =>
        typeof index !== 'undefined' && index >= 0
          ? actionsLog[index]
          : actionsLog[actionsLog.length - 1 + (index || 0)],

      /** Reset the store */
      reset: () => store.dispatch({ type: TESTING_TYPES.RESET } as A),

      /** Update the store */
      update: (value, path?: string) =>
        store.dispatch({ type: TESTING_TYPES.UPDATE, payload: { value, path } } as unknown as A),
    }
  }

export default enhancer
