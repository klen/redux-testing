# redux-testing

[![npm version](https://badge.fury.io/js/redux-testing.svg)](https://badge.fury.io/js/redux-testing)
[![travis build](https://travis-ci.org/klen/redux-testing.svg?branch=develop)](https://travis-ci.org/klen/redux-testing)

A library to testing your redux application. The library is allowing you to use
your real redux store inside your tests. Reset or update it's state and check
your actions. I like projects like `redux-mock-store` but some times I really
need my application store, with inited state and ability to dispatch actions.

## Installation

```bash
npm install --save redux-testing
```

## Usage

```javascript

Redux = require('redux')
testing = require('redux-testing')

// Let's create a simplest reducer
reducer = (state=0, action) => {
    switch (action.type) {
        case 'INCREMENT': return state + 1;
        case 'DECREMENT': return state - 1;
        default: return state;
    }
}

configureStore = (reducer, initial, tests=false) => {
    // If you already have an enhancer (middlewares/devtools and etc)
    // use Redux.compose(enhancer, testing)
    // for example we are just using only one enhancer from the lib
    enhancer = testing
    return Redux.createStore(reducer, initial, enhancer)
}


// Initialize application store with testing enhancer
store = configureStore(reducer, 0, true)

// Lets make some actions
store.dispatch({ type: 'INCREMENT' })
store.dispatch({ type: 'INCREMENT' })
store.dispatch({ type: 'DECREMENT' })

// State has been changed
store.getState()  // -> 1

// We can get list of actions
actions = store.dispatch({ type: 'TESTS/ACTIONS' }) // -> [{type: 'INCREMENT', ...}, ...]

// We can get a last action
action = store.dispatch ({ type: 'TESTS/ACTION' }) // -> {type: 'DECREMENT', ...}, ...

// We can reset whole store to initial state, actions will be reseted too
store.dispatch ({ type: 'TESTS/RESET' })
store.getState()  // -> 0

// We can manually setup any part of our state
// Complex paths also supported: for example: dispatch type: 'TESTS/UPDATE', path: 'deep.inside.state', value: 'some_value'
store.dispatch ({ type: 'TESTS/UPDATE', value: 5 })
store.getState()  // -> 5

```

## Actions

The enhancer adding custom reducer/actions for your tests. Dispatch them as
usual and get actions/change state as you want.

*type: TESTS/ACTIONS* — Get list of dispatched actions

*type: TESTS/ACTION* — Get a last dispatched action

*type: TESTS/RESET* — Reset store to initial state (reinitialize the store's reducers)

*type: TESTS/UPDATE, value: <new value>, [path: 'path.to.state.part']* — Update store's state (path param is optional)

## License

This project is licensed under the MIT license, Copyright (c) 2017 Kirill Klenov. For more information see `LICENSE.md`.

## Acknowledgements

[Dan Abramov](https://github.com/gaearon) for Redux
