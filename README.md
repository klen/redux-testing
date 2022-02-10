# redux-testing

[![Tests](https://github.com/klen/redux-testing/actions/workflows/test.yml/badge.svg)](https://github.com/klen/redux-testing/actions/workflows/test.yml)
[![Build](https://github.com/klen/redux-testing/actions/workflows/build.yml/badge.svg)](https://github.com/klen/redux-testing/actions/workflows/build.yml)
[![npm version](https://badge.fury.io/js/redux-testing.svg)](https://badge.fury.io/js/redux-testing)

A library to testing your [Redux](https://reduxjs.org) application.

Features:

* Reset store's state
* Update any part of store's state
* Record and check recorded actions

## Installation

```bash
npm install --save-dev redux-testing
```

## Initialization

First you have to install `testEnhancer` to your store:

```javascript
import { createStore } from 'redux'
import testEnhancer from 'redux-testing'

// A simple reducer for an example
const reducer = (state = 0, action) => {
    switch (action.type) {
    case 'INCREMENT':
        return state + 1;
    case 'DECREMENT':
        return state - 1;
    default:
        return state;
    }
};

// Initialize a store with the testEnhancer
const store = createStore(reducer, undefined, testEnhancer)
```

If you are using middlewares or other enhancers

```javascript
import { createStore, compose, applyMiddleware } from 'redux'

// Prepare middlewares
let enhancer = applyMiddleware(middleware1, middleware2)

// Optionally apply the testEnhancer for testing
if (process.env.NODE_ENV == 'DEVELOPMENT') enhancer = compose(testEnhancer, enhancer)

// Initialize a store with the enhancer
const store = createStore(reducer, undefined, enhancer)
```

## Usage

### Reset store

Reset you store and actions log any time:

```javascript
// Lets make some actions
store.dispatch({ type: 'INCREMENT' })
store.dispatch({ type: 'INCREMENT' })
store.dispatch({ type: 'DECREMENT' })

// State has been changed
expect(store.getState()).toBe(1) // 0 + 1 + 1 - 1 = 1

store.reset()

expect(store.getState()).toBe(0) // initial state
```

### Update store state

Customize your store state:

```javascript
store.update(42)
expect(store.getState()).toBe(42)

/** Other examples
*
* // Update by object
* store.update({deep: {child: {state: { value: 42}}}})
*
* // Update by path
* store.update(42, 'deep.child.state.value')
*/
```

### Get recorded actions

```javascript
// Lets make some actions
store.dispatch({ type: 'INCREMENT' })
store.dispatch({ type: 'INCREMENT' })
store.dispatch({ type: 'DECREMENT' })

const actions = store.getActions()
expect(actions).toEqual([
  {type: 'INCREMENT'}, {type: 'INCREMENT'}, {type: 'DECREMENT'}
])

```

### Get an recorded action

```javascript
// Lets make some actions
store.dispatch({ type: 'INCREMENT' });
store.dispatch({ type: 'INCREMENT' });
store.dispatch({ type: 'DECREMENT' });

let action;

// Get latest action
action = store.getAction();
expect(action).toEqual({ type: 'DECREMENT' });

// Get action by index
action = store.getAction(0);
expect(action).toEqual({ type: 'INCREMENT' });
action = store.getAction(2);
expect(action).toEqual({ type: 'DECREMENT' });

// Get relative action
action = store.getAction(-1); // previous before latest
expect(action).toEqual({ type: 'INCREMENT' });
action = store.getAction(-2); // previous before above
expect(action).toEqual({ type: 'INCREMENT' });
```

### Clear actions

```javascript
// Lets make some actions
store.dispatch({ type: 'INCREMENT' });
store.dispatch({ type: 'INCREMENT' });
store.dispatch({ type: 'DECREMENT' });

// Ensure that we have actions recorded
expect(store.getActions()).toBeTruthy();

// Reset the recorded actions
store.clearActions();

// Ensure that we have cleared the records
expect(store.getActions()).toEqual([]);

```

## License

This project is licensed under the MIT license, Copyright (c) 2017 Kirill Klenov. For more information see `LICENSE.md`.

## Acknowledgements

[Dan Abramov](https://github.com/gaearon) for Redux
