import { createWrapper } from 'next-redux-wrapper';
import { composeWithDevTools } from 'redux-devtools-extension';
import { createStore, applyMiddleware, compose } from 'redux';
import createSagaMiddleware from 'redux-saga';

import reducer from '../reducers';
import saga from '../sagas';

const logger = ({ dispatch, getState }) => next => action => {
  console.log(action);
  next(action);
};

const configureStore = () => {
  const sagaMiddleware = createSagaMiddleware();
  const middlewares = [sagaMiddleware, logger];
  const enhancer = process.env.NODE_ENV === 'production'
    ? compose(applyMiddleware(...middlewares))
    : composeWithDevTools(applyMiddleware(...middlewares));

  const store = createStore(reducer, enhancer);
  store.sagaTask = sagaMiddleware.run(saga);

  return store;
}

const wrapper = createWrapper(configureStore, { debug: process.env.NODE_ENV === 'development' });

export default wrapper;