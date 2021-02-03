import { Reducer, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createStore as createReduxStore, PreloadedState } from 'redux';

export const createPlainRedux = <State>(
  initialState: PreloadedState<State>
) => {
  type Action<T extends keyof State = keyof State> = {
    type: T
    payload: State[T]
  }

  const reducer: Reducer<State, Action> = (state, { type, payload }) => ({
    ...state,
    [type]: payload,
  })

  const createStore = (state: PreloadedState<State>) =>
    createReduxStore(reducer, state)
  let store = createStore(initialState)

  const initializeStore = (preloadedState: PreloadedState<State>) => {
    let _store = store ?? createStore(preloadedState)

    // After navigating to a page with an initial Redux state, merge that state
    // with the current state in the store, and create a new store
    if (preloadedState && store) {
      _store = createStore({
        ...store.getState(),
        ...preloadedState,
      })
      // Reset the current store
      store = undefined
    }

    // For SSG and SSR always create a new store
    if (typeof window === 'undefined') return _store
    // Create the store once in the client
    if (!store) store = _store

    return _store
  }

  function useStore(initialState: PreloadedState<State>) {
    const store = useMemo(() => initializeStore(initialState), [initialState])
    return store
  }

  const useSelectState = <T extends keyof State = keyof State>(type: T) =>
    useSelector<State, State[T]>(state => state[type])

  const useDispatchState = () => {
    const dispatch = useDispatch()
    return <T extends keyof State = keyof State>(type: T, payload: State[T]) =>
      dispatch<Action<T>>({ type, payload })
  }

  type PagePropsOptions = {
    initialReduxState: Partial<State>
  }

  const props = <PageProps>(pageProps: PageProps & PagePropsOptions) => {
    for (const key in pageProps) {
      if (pageProps[key] === null || pageProps[key] === undefined) {
        delete pageProps[key]
      }
    }
    return pageProps
  }

  return {
    store,
    useStore,
    useSelectState,
    useDispatchState,
    props
  }
}
