import { createStore } from 'redux';
import testsEnhancer from './redux-testing';

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
    const reducer = (state = initial, action = { type: null }) => {
      state = { ...state, calls: state.calls + 1 };
      if (action.type === 'INCREMENT') state.value += 1;
      else if (action.type === 'DECREMENT') state.value -= 1;
      return state;
    };
    const store = createStore(reducer, initial, testsEnhancer);

    beforeEach(() => {
      store.dispatch({ type: 'INCREMENT' });
      store.dispatch({ type: 'INCREMENT' });
      store.dispatch({ type: 'DECREMENT' });
    });

    afterEach(store.reset);

    it('Redux store is working', async () => {
      const state = store.getState();
      expect(state.value).toBe(1);
    });

    it('reset()', async () => {
      store.dispatch({ type: 'INCREMENT' });
      expect(store.getState().value).toBe(2);
      store.reset();
      expect(store.getState().value).toBe(0);
      const actions = store.getActions();
      expect(actions.length).toBe(0);
    });

    it('update()', async () => {
      store.update({ deep: { child1: { value: 'changed' } } });
      expect(store.getState().deep).toEqual({
        child1: { value: 'changed', any: 'any' },
        child2: { value: 'custom2' },
      });

      store.update('changed', 'deep.child2.value');
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
      const actions = store.getActions();
      expect(actions).toBeTruthy();
      expect(actions).toEqual(expected);
    });

    it('getAction()', async () => {
      let action;
      action = store.getAction();
      expect(action).toEqual({ type: 'DECREMENT' });

      // Get a previous action
      action = store.getAction(-1);
      expect(action).toEqual({ type: 'INCREMENT' });

      // Get an unknown action
      action = store.getAction(-4);
      expect(action).toBeFalsy();

      // Get an action by the given index
      action = store.getAction(0);
      expect(action).toEqual({ type: 'INCREMENT' });

      action = store.getAction(2);
      expect(action).toEqual({ type: 'DECREMENT' });
    });

    it('clearActions()', async () => {
      let actions;
      actions = store.getActions();
      expect(actions.length).toBe(3);

      store.clearActions();
      actions = store.getActions();
      expect(actions.length).toBe(0);
    });
  });

  describe('readme examples', () => {
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

    afterEach(store.reset);

    it('Reset store', async () => {
      // Lets make some actions
      store.dispatch({ type: 'INCREMENT' });
      store.dispatch({ type: 'INCREMENT' });
      store.dispatch({ type: 'DECREMENT' });

      // State has been changed
      expect(store.getState()).toBe(1); // 0 + 1 + 1 - 1 = 1

      store.reset();

      expect(store.getState()).toBe(0); // initial state
    });

    it('Update store state', async () => {
      store.update(42);
      expect(store.getState()).toBe(42);
    });

    it('Get recorded actions', async () => {
      // Lets make some actions
      store.dispatch({ type: 'INCREMENT' });
      store.dispatch({ type: 'INCREMENT' });
      store.dispatch({ type: 'DECREMENT' });

      // State has been changed
      expect(store.getState()).toBe(1);

      const actions = store.getActions();
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
    });

    it('Clear actions', async () => {
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
    });
  });
});
