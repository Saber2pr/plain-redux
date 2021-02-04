import { Reducer, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createStore as createReduxStore, PreloadedState } from 'redux';

/**
 * state manager for next.js
 * @see https://github.com/Saber2pr/plain-redux.git
 */
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

  /**
   * init page store
   * for example:
   * ```tsx
   * const store = useStore(AppProps?.pageProps?.initialReduxState)
   * <Provider store={store}>
   * ```
   */
  function useStore(initialState: PreloadedState<State>) {
    const store = useMemo(() => initializeStore(initialState), [initialState])
    return store
  }

  const useSelectState = <T extends keyof State = keyof State>(type: T, equalityFn?: (left: State[T], right: State[T]) => boolean) =>
    useSelector<State, State[T]>(state => state[type], equalityFn)

  const useDispatchState = () => {
    const dispatch = useDispatch()
    return <T extends keyof State = keyof State>(type: T, payload: State[T]) =>
      dispatch<Action<T>>({ type, payload })
  }

  /**
   * Partial Redux State [initialReduxState]
   */
  const initState = (pageProps: Partial<State>) => ({
    initialReduxState: pageProps
  })

  type FetchOptions<T extends keyof State> = {
    type: T,
    request: () => Promise<State[T]>
    initData?: State[T]
    equalityFn?: (left: State[T], right: State[T]) => boolean,
    onError?(error: any): any
    autoLoad?: boolean
  }

  const useFetchState = <T extends keyof State = keyof State>({
    type,
    equalityFn,
    request,
    initData = null,
    autoLoad = true,
    onError,
  }: FetchOptions<T>): [State[T], boolean, () => Promise<void>] => {
    const payload = useSelectState(type, equalityFn) ?? initData
    const dispatch = useDispatchState()
    const [loading, setLoading] = useState(false)

    const fetchData = async () => {
      try {
        setLoading(true)
        dispatch(type, await request())
      } catch (error) {
        console.log(error)
        onError && onError(error)
      } finally {
        setLoading(false)
      }
    }

    useEffect(() => {
      autoLoad && fetchData()
    }, [autoLoad])

    return [payload, loading, fetchData]
  }

  return {
    store,
    useStore,
    useSelectState,
    useDispatchState,
    initState,
    useFetchState
  }
}
