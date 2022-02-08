# redux-testing

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

## Usage

### Initialize a store

```javascript
import { createStore } from 'redux'
import testsEnhancer from 'redux-testing'

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

// Initialize a store with the testsEnhancer
const store = createStore(reducer, undefined, testsEnhancer)
```

### Use with middlewares

```javascript
import { createStore, compose, applyMiddleware } from 'redux'

// Prepare middlewares
let enhancer = applyMiddleware(middleware1, middleware2)

// Optionally apply the testsEnhancer for testing
if (process.env.NODE_ENV == 'DEVELOPMENT') enhancer = compose(enhancer, testsEnhancer)

// Initialize a store with the enhancer
const store = createStore(reducer, undefined, enhancer)
```

### Reset store

```javascript
import { reset } from 'redux-testing'

// Lets make some actions
store.dispatch({ type: 'INCREMENT' })
store.dispatch({ type: 'INCREMENT' })
store.dispatch({ type: 'DECREMENT' })

// State has been changed
expect(store.getState()).toBe(1) // 0 + 1 + 1 - 1 = 1

reset(store)

expect(store.getState()).toBe(0) // initial state
```

### Update store state
```javascript
import { update } from 'redux-testing'

update(store, 42)
expect(store.getState()).toBe(42)

/** Other examples
*
* // Update by object
* update(store, {deep: {child: {state: { value: 42}}}})
*
* // Update by path
* update(store, 42, 'deep.child.state.value')
*/
```

### Get recorded actions

```javascript
import { getActions } from 'redux-testing'

// Lets make some actions
store.dispatch({ type: 'INCREMENT' })
store.dispatch({ type: 'INCREMENT' })
store.dispatch({ type: 'DECREMENT' })

const actions = getActions(store)
expect(actions).toEqual([
  {type: 'INCREMENT'}, {type: 'INCREMENT'}, {type: 'DECREMENT'}
])

```

### Get an recorded action

```javascript
import { getAction } from 'redux-testing'

// Lets make some actions
store.dispatch({ type: 'INCREMENT' });
store.dispatch({ type: 'INCREMENT' });
store.dispatch({ type: 'DECREMENT' });

let action;

// Get latest action
action = getAction(store);
expect(action).toEqual({ type: 'DECREMENT' });

// Get action by index
action = getAction(store, 0);
expect(action).toEqual({ type: 'INCREMENT' });
action = getAction(store, 2);
expect(action).toEqual({ type: 'DECREMENT' });

// Get relative action
action = getAction(store, -1); // previous before latest
expect(action).toEqual({ type: 'INCREMENT' });
action = getAction(store, -2); // previous before above
expect(action).toEqual({ type: 'INCREMENT' });
```

### Clear actions

```javascript
import { clearActions } from 'redux-testing'

// Lets make some actions
store.dispatch({ type: 'INCREMENT' });
store.dispatch({ type: 'INCREMENT' });
store.dispatch({ type: 'DECREMENT' });

// Ensure that we have actions recorded
expect(getActions(store)).toBeTruthy();

// Reset the recorded actions
clearActions(store);

// Ensure that we have cleared the records
expect(getActions(store)).toEqual([]);

```

## License

This project is licensed under the MIT license, Copyright (c) 2017 Kirill Klenov. For more information see `LICENSE.md`.

## Acknowledgements

[Dan Abramov](https://github.com/gaearon) for Redux
