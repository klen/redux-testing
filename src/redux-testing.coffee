TYPES =
    ACTION: 'TESTS/ACTION'
    ACTIONS: 'TESTS/ACTIONS'
    RESET: 'TESTS/RESET'
    UPDATE: 'TESTS/UPDATE'

ACTIONS = []

module.exports = (createStore) -> (appReducer, preloadedState, enhancer) ->

    # Support reseting
    reducer = (state, action) ->
        switch action.type
            when TYPES.UPDATE
                value = action.value
                return value unless action.path
                cursor = state
                [paths..., tail] = action.path.split('.')
                for part in paths
                    obj = cursor[part]
                    cursor = cursor[part] = {obj...} if obj? and typeof obj == 'object'
                cursor[tail] = value
                return {state...}

            when TYPES.RESET then appReducer(undefined, action)
            else appReducer(state, action)

    # Create a store
    store = createStore(reducer, preloadedState, enhancer)

    # Support tests actions
    dispatch = (action) ->
        switch action and action.type
            when TYPES.ACTIONS
                return ACTIONS
            when TYPES.ACTION
                length = ACTIONS.length or 0
                return ACTIONS[length - 1]
            when TYPES.RESET
                ACTIONS = []
            else
                ACTIONS.push(action)
        return store.dispatch(action)

    return {store..., dispatch}
