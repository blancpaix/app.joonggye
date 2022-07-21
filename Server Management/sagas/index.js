import { all, fork } from 'redux-saga/effects';

import program from './program';

export default function* rootSaga() {
  yield all([
    fork(program),
  ])
};