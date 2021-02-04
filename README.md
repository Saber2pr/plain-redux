# @saber2pr/plain-redux

```bash
yarn add @saber2pr/plain-redux
```

### start

```tsx
import createPlainRedux from '@saber2pr/plain-redux'

const {
  store,
  useStore,
  useSelectState,
  useDispatchState,
  initState,
  useFetchState
} = createPlainRedux({
  show: false
})
```