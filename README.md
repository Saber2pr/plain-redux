# @saber2pr/plain-redux

```bash
yarn add @saber2pr/plain-redux
```

### start

```tsx
import createPlainRedux from '@saber2pr/plain-redux'

const {
  getStore,
  useStore,
  useSelectState,
  useDispatchState,
  initState,
  useFetchState
} = createPlainRedux({
  key: 'value'
})
```

### in next.js


```tsx
// ./src/page.tsx
export const getServerSideProps = (ctx) => {
  return {
    props: initState({})
  }
  // same as:
  // return {
  //   props: {
  //     initialReduxState: {}
  //   }
  // }
}
```

```tsx
// ./src/app.tsx
export default function App(AppProps: AppProps) {
  const store = useStore(AppProps?.initialReduxState)
  return (
    <Provider store={store}>
      <ComponentWrapper {...AppProps} />
    </Provider>
  )
}
```

### useFetchState

global state fetch.