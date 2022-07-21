import { combineReducers } from 'redux';

import chat from './chat';

const combindedReducer = combineReducers({
  chat,
});

export default combindedReducer;