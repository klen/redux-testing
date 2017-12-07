enhancer = require('../src/redux-testing.coffee')
Redux = require('redux')

exports.ReduxTesting =

    setUp: (callback) ->
        @initial = initial = value: 0, calls: 0, deep: inside: value: 'custom'

        reducer = (state=initial, action) ->
            switch action.type
                when 'INCREMENT' then {value: state.value + 1, calls: state.calls + 1}
                when 'DECREMENT' then {value: state.value - 1, calls: state.calls + 1}
                else state

        @store = Redux.createStore(reducer, @initial, enhancer)

        callback()

    tearDown: (callback) ->
        @store.dispatch type: 'TESTS/RESET'
        callback()

    'Redux store is working': (test) ->
        @store.dispatch type: 'INCREMENT'
        @store.dispatch type: 'INCREMENT'
        @store.dispatch type: 'DECREMENT'
        state = @store.getState()

        test.equal(state.value, 1, 'Reducer doesnt work')
        test.done()

    'Record actions': (test) ->
        actions = @store.dispatch type: 'TESTS/ACTIONS'
        test.deepEqual(actions, [], 'Actions are empty')

        action = @store.dispatch type: 'TESTS/ACTION'
        test.equal(action, undefined, 'Last action is undefined')

        @store.dispatch type: 'INCREMENT'
        @store.dispatch type: 'DECREMENT'
        actions = @store.dispatch type: 'TESTS/ACTIONS'
        test.equal(actions.length, 2, 'Actions are recorded')
        
        action = @store.dispatch type: 'TESTS/ACTION'
        test.equal(action.type, 'DECREMENT', 'Last action is recorded')

        @store.dispatch type: 'TESTS/RESET'
        actions = @store.dispatch type: 'TESTS/ACTIONS'
        test.equal(actions.length, 0, 'Actions have been reseted')

        action = @store.dispatch type: 'TESTS/ACTION'
        test.equal(action, undefined, 'Last action is undefined')

        test.done()

    'Manage state': (test) ->
        state = @store.getState()
        test.deepEqual(state, @initial, 'State has to be initial')

        @store.dispatch type: 'INCREMENT'
        @store.dispatch type: 'INCREMENT'
        state = @store.getState()
        test.equal(state.value, 2, 'State has to be changed')

        @store.dispatch type: 'TESTS/RESET'
        state = @store.getState()
        test.equal(state, @initial, 'State has to be reseted')

        @store.dispatch type: 'TESTS/UPDATE', path: 'value', value: 4
        state = @store.getState()
        test.deepEqual(state.value, 4, 'State has to be updated')

        @store.dispatch type: 'TESTS/UPDATE', path: 'deep.inside.value', value: 'changed'
        state = @store.getState()
        test.equal(state.deep.inside.value, 'changed', 'State has to be reseted')

        test.done()

    'Test example': (test) ->
        Redux = require('redux')
        testing = require('../src/redux-testing.coffee')

        reducer = (state=0, action) ->
            switch action.type
                when 'INCREMENT' then state + 1
                when 'DECREMENT' then state - 1
                else state

        configureStore = (reducer, initial, tests=false) ->
            # If you already have an enhancer (middlewares/devtools and etc)
            # use Redux.compose(enhancer, testing)
            enhancer = testing

            return Redux.createStore(reducer, initial, enhancer)

        # Create store for tests
        store = configureStore(reducer, 0, true)

        # Make some actions
        store.dispatch type: 'INCREMENT'
        store.dispatch type: 'INCREMENT'
        store.dispatch type: 'DECREMENT'

        # State has been changed
        store.getState()  # -> 1

        # We can get list of actions
        actions = store.dispatch type: 'TESTS/ACTIONS' # -> [{type: 'INCREMENT', ...}, ...]

        # We can get a last action
        action = store.dispatch type: 'TESTS/ACTION' # -> {type: 'DECREMENT', ...}, ...

        # We can reset whole store to initial state, actions will be reseted too
        store.dispatch type: 'TESTS/RESET'
        store.getState()  # -> 0

        # We can manually setup any part of our state
        # Complex paths also supported: for example: dispatch type: 'TESTS/UPDATE', path: 'deep.inside.state', value: 'some_value'
        store.dispatch type: 'TESTS/UPDATE', value: 5
        store.getState()  # -> 5

        test.done()
