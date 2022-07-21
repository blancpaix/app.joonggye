import { createStore, applyMiddleware } from 'redux';
import createSagaMiddleWare from 'redux-saga';
import { composeWithDevTools } from 'redux-devtools-extension';

import rootReducer from '../reducers';
import rootSaga from '../sagas';

const sagaMiddleWare = createSagaMiddleWare();

export const store = createStore(
  rootReducer,
  composeWithDevTools(
    applyMiddleware(sagaMiddleWare),
  )
);

sagaMiddleWare.run(rootSaga);

