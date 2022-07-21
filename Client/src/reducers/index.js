import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers } from 'redux';
import { persistReducer } from 'redux-persist';

import session from './session';
import program from './program';
import chat from './chat';
import service from './service';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['session'],
};

const rootReducer = combineReducers({
  session,
  program,
  chat,
  service,
});

const persistedReducer = persistReducer(persistConfig, rootReducer)

export default persistedReducer;