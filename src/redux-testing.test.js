import { createStore } from 'redux';
import testsEnhancer, {
  reset,
  getActions,
  getAction,
  update,
  clearActions,
} from './redux-testing';

describe('redux-testing', () => {
  describe('base tests', () => {
    const initial = {
      value: 0,
      calls: 0,
      deep: {
        child1: { value: 'custom1', any: 'any' },
        child2: { value: 'custom2' },
      },
    };
    const reducer = (state = initial, action = {}) => {
      state = { ...state, calls: state.calls + 1 };
      if (action.type == 'INCREMENT') state.value += 1;
      else if (action.type == 'DECREMENT') state.value -= 1;
      return state;
    };
    const store = createStore(reducer, initial, testsEnhancer);

    beforeEach(() => {
      store.dispatch({ type: 'INCREMENT' });
      store.dispatch({ type: 'INCREMENT' });
      store.dispatch({ type: 'DECREMENT' });
    });

    afterEach(() => {
      reset(store);
    });

    it('Redux store is working', async () => {
      const state = store.getState();
      expect(state.value).toBe(1);
    });

    it('reset()', async () => {
      store.dispatch({ type: 'INCREMENT' });
      expect(store.getState().value).toBe(2);
      reset(store);
      expect(store.getState().value).toBe(0);
      const actions = getActions(store);
      expect(actions.length).toBe(0);
    });

    it('update()', async () => {
      update(store, { deep: { child1: { value: 'changed' } } });
      expect(store.getState().deep).toEqual({
        child1: { value: 'changed', any: 'any' },
        child2: { value: 'custom2' },
      });

      update(store, 'changed', 'deep.child2.value');
      expect(store.getState().deep).toEqual({
        child1: { value: 'changed', any: 'any' },
        child2: { value: 'changed' },
      });
    });

    it('getActions()', async () => {
      const expected = [
        { type: 'INCREMENT' },
        { type: 'INCREMENT' },
        { type: 'DECREMENT' },
      ];
      let actions;
      actions = getActions(store);
      expect(actions).toBeTruthy();
      expect(actions).toEqual(expected);
    });

    it('getAction()', async () => {
      let action;
      action = getAction(store);
      expect(action).toEqual({ type: 'DECREMENT' });

      // Get a previous action
      action = getAction(store, -1);
      expect(action).toEqual({ type: 'INCREMENT' });

      // Get an unknown action
      action = getAction(store, -4);
      expect(action).toBeFalsy();

      // Get an action by the given index
      action = getAction(store, 0);
      expect(action).toEqual({ type: 'INCREMENT' });

      action = getAction(store, 2);
      expect(action).toEqual({ type: 'DECREMENT' });
    });

    it('clearActions()', async () => {
      let actions;
      actions = getActions(store);
      expect(actions.length).toBe(3);

      clearActions(store);
      actions = getActions(store);
      expect(actions.length).toBe(0);
    });
  });
  describe('readme examples', () => {
    // eslint-disable-next-line unicorn/consistent-function-scoping
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
    const store = createStore(reducer, undefined, testsEnhancer);

    afterEach(() => {
      reset(store);
    });

    it('Reset store', async () => {
      // Lets make some actions
      store.dispatch({ type: 'INCREMENT' });
      store.dispatch({ type: 'INCREMENT' });
      store.dispatch({ type: 'DECREMENT' });

      // State has been changed
      expect(store.getState()).toBe(1); // 0 + 1 + 1 - 1 = 1

      reset(store);

      expect(store.getState()).toBe(0); // initial state
    });

    it('Update store state', async () => {
      update(store, 42);
      expect(store.getState()).toBe(42);
    });

    it('Get recorded actions', async () => {
      // Lets make some actions
      store.dispatch({ type: 'INCREMENT' });
      store.dispatch({ type: 'INCREMENT' });
      store.dispatch({ type: 'DECREMENT' });

      // State has been changed
      expect(store.getState()).toBe(1);

      const actions = getActions(store);
      expect(actions).toEqual([
        { type: 'INCREMENT' },
        { type: 'INCREMENT' },
        { type: 'DECREMENT' },
      ]);
    });

    it('Get an recorded action', async () => {
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
    });

    it('Clear actions', async () => {
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
    });
  });
});
