export const TESTING_TYPES = {
  GET_ACTION: 'TESTS/GET_ACTION',
  GET_ACTIONS: 'TESTS/GET_ACTIONS',
  CLEAR_ACTIONS: 'TESTS/CLEAR_ACTIONS',
  RESET: 'TESTS/RESET',
  UPDATE: 'TESTS/UPDATE'
}

/**
 * Reset the given store
 * @return {void}
 */
export const reset = ({ dispatch }) => dispatch({ type: TESTING_TYPES.RESET })

/**
 * Update the given store
 * @return {void}
 */
export const update = (store, value, path) => {
  store.dispatch({ type: TESTING_TYPES.UPDATE, payload: { value, path } })
}

/**
 * Get logged actions from the given store
 * @return {{type}[]} list of actions
 */
export const getActions = ({ dispatch }) =>
  dispatch({ type: TESTING_TYPES.GET_ACTIONS })

/**
 * Clear logged actions from the given store
 * @return {void}
 */
export const clearActions = ({ dispatch }) =>
  dispatch({ type: TESTING_TYPES.CLEAR_ACTIONS })

/**
 * Get a logged action from the given store
 * @param {{dispatch: ({type}) => any}} store a redux store
 * @param {number} index an optional action's index
 * @return {{type} | null} an optional action
 */
export const getAction = ({ dispatch }, index) =>
  dispatch({ type: TESTING_TYPES.GET_ACTION, payload: index })

/**
 * Enhance the given store with the testing functions
 * @return {{dispatch, getState}} store a redux store
 */
export const enhancer =
  createStore => (appReducer, preloadedState, enhancer) => {
    const actionsLog = []

    function reducer (state, action = {}) {
      switch (action.type) {
        case TESTING_TYPES.UPDATE:
          return applyUpdate(state, action.payload.value, action.payload.path)

        case TESTING_TYPES.RESET:
          return appReducer(undefined, action)

        default:
          return appReducer(state, action)
      }
    }

    // Create a store
    const store = createStore(reducer, preloadedState, enhancer)

    // Support testing actions
    function dispatch (action = {}) {
      switch (action?.type) {
        case TESTING_TYPES.GET_ACTIONS:
          return actionsLog

        case TESTING_TYPES.GET_ACTION:
          return action.payload >= 0
            ? actionsLog[action.payload]
            : actionsLog[actionsLog.length - 1 + (action.payload || 0)]

        case TESTING_TYPES.CLEAR_ACTIONS:
          return (actionsLog.length = 0)

        case TESTING_TYPES.RESET:
          actionsLog.length = 0
          break

        case TESTING_TYPES.UPDATE:
          break

        default:
          actionsLog.push(action)
          break
      }
      return store.dispatch(action)
    }

    return { ...store, dispatch }
  }

export default enhancer

function applyUpdate (state, value, path) {
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
