import { all, call, fork, put, take, throttle, debounce } from 'redux-saga/effects';
import { FB_loadFavCnt, FB_loadAirTable, FB_searchByTitle } from '../firebaseFn';
import {
  LOAD_FAV_COUNT_REQ, LOAD_FAV_COUNT_HIT, LOAD_FAV_COUNT_ERR,
  LOAD_AIR_TABLE_REQ, LOAD_AIR_TABLE_HIT, LOAD_AIR_TABLE_ERR,
  LOAD_SCHEDULE_REQ, LOAD_SCHEDULE_ERR, SEARCH_PROGRAM_REQ, SEARCH_PROGRAM_HIT, SEARCH_PROGRAM_ERR,
} from '../reducers/program';

import { createScheduleChannel } from '../socket/createSocketChannel';

function* loadSchedules() {
  try {
    const channel = yield call(createScheduleChannel);

    while (true) {
      const eventMsg = yield take(channel);
      yield put(eventMsg);
    }
  } catch (err) {
    yield put({
      type: LOAD_SCHEDULE_ERR,
      error: '불러오기에 실패하였습니다.',
    })
  }
}

// action = programUID
function* loadFavCntPrgram(action) {
  try {
    const result = yield call(FB_loadFavCnt, action.data);
    yield put({
      type: LOAD_FAV_COUNT_HIT,
      data: result
    })
  } catch (err) {
    console.log('err LOAD FAV COUNT ERR', err);
    yield put({
      type: LOAD_FAV_COUNT_ERR,
      error: '데이터를 불러올 수 없습니다.',
    });
  }
};

function* loadAirTable(action) {
  try {
    const result = yield call(FB_loadAirTable, action.data);
    yield put({
      type: LOAD_AIR_TABLE_HIT,
      data: result.airTable,
    })
  } catch (err) {
    yield put({
      type: LOAD_AIR_TABLE_ERR,
      error: '데이터를 불러올 수 없습니다.',
    })
  }
};
function* searchProgarms(action) {
  try {
    const result = yield call(FB_searchByTitle, action.data);
    yield put({
      type: SEARCH_PROGRAM_HIT,
      data: result
    })
  } catch (err) {
    yield put({
      type: SEARCH_PROGRAM_ERR,
      error: '데이터를 찾을 수 없습니다.'
    })
  }
};

function* watchLoadSchedules() {
  yield throttle(30000, LOAD_SCHEDULE_REQ, loadSchedules);
}
function* watchLoadFavoriteCount() {
  yield throttle(3000, LOAD_FAV_COUNT_REQ, loadFavCntPrgram);
}
function* watchLoadAirTable() {
  yield throttle(3000, LOAD_AIR_TABLE_REQ, loadAirTable);
}
function* watchSearchPrograms() {
  yield throttle(1500, SEARCH_PROGRAM_REQ, searchProgarms);
}

export default function* programSaga() {
  yield all([
    fork(watchLoadSchedules),
    fork(watchLoadFavoriteCount),
    fork(watchLoadAirTable),
    fork(watchSearchPrograms),
  ])
};
