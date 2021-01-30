# @saber2pr/plain-redux

```bash
yarn add @saber2pr/plain-redux
```

### start

```tsx
import createPlainRedux from '@saber2pr/plain-redux'

const {
  useStore,
  useDispatchState,
  useSelectState,
  store,
} = createPlainRedux({
  show: false
})
```