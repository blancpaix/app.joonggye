import { all, fork } from 'redux-saga/effects';

import session from './session';
import program from './program';
import chat from './chat';
import service from './service';

export default function* rootSaga() {
  yield all([
    fork(session),
    fork(program),
    fork(chat),
    fork(service),
  ]);
};