import { persistStore } from 'redux-persist';
import { createStore, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';
import persistedReducer from '../reducers';
import saga from '../sagas';
import { composeWithDevTools } from 'redux-devtools-extension';

const sagaMiddleware = createSagaMiddleware();

// ~
// const loggerMW = ({ dispatch, getState }) => next => action => {
//   next(action);
// };
// const middlewares = [sagaMiddleware, loggerMW];
// export const store = createStore(persistedReducer, composeWithDevTools(applyMiddleware(...middlewares)));
// ~

sagaMiddleware.run(saga);

// ~
export const store = createStore(persistedReducer, applyMiddleware(sagaMiddleware));
// ~


export const persistor = persistStore(store);

// export default { store, persistor };