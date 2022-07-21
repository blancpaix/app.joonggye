import { all, call, fork, throttle, put, takeLatest } from 'redux-saga/effects';

import {
  LOAD_BROADCASTING_PROGRAM_REQ, LOAD_BROADCASTING_PROGRAM_HIT, LOAD_BROADCASTING_PROGRAM_ERR,
  LOAD_NON_IMG_PROGRAM_ERR, LOAD_NON_IMG_PROGRAM_HIT, LOAD_NON_IMG_PROGRAM_REQ,
  LOAD_CHAT_ROOMS_REQ, LOAD_CHAT_ROOMS_HIT, LOAD_CHAT_ROOMS_ERR,
  SEARCH_PROGRAM_ERR,
  SEARCH_PROGRAM_HIT,
  SEARCH_PROGRAM_REQ,
  SIGN_IN_ERR, SIGN_IN_HIT, SIGN_IN_REQ,
  UPLOAD_IMG_ERR, UPLOAD_IMG_HIT, UPLOAD_IMG_REQ,
  UPLOAD_NOTICE_HIT, UPLOAD_NOTICE_REQ, UPLOAD_NOTICE_ERR, LOAD_WEEKLYSCHEDULE_REQ, LOAD_WEEKLYSCHEDULE_ERR, LOAD_WEEKLYSCHEDULE_HIT, DELETE_PROGRAM_DATA_ERR, DELETE_PROGRAM_DATA_REQ, DELETE_PROGRAM_DATA_HIT,
} from '../reducers/program';
import {
  FB_deleteProgramData, FB_loadBroadcastingPrograms, FB_loadChatRooms,
  FB_loadNoneImgPrograms, FB_loadWeeklySchedules, FB_searchProgram,
  FB_singin, FB_updateImgSrc, FB_uploadImg, FB_uploadNotice
} from '../src/firebaseFn';

function* doSignin(action) {
  try {
    const result = yield call(FB_singin, action.data);

    yield put({
      type: SIGN_IN_HIT,
      data: result,
    })
  } catch (err) {
    console.error('err!', err);
    yield put({
      type: SIGN_IN_ERR,
      error: err,
    })
  };
};

function* loadBroadcastingPrograms() {
  try {
    const result = yield call(FB_loadBroadcastingPrograms);
    console.log('result??', result);
    yield put({
      type: LOAD_BROADCASTING_PROGRAM_HIT,
      data: result,
    });
  } catch (err) {
    console.error('error!', err);
    yield put({
      type: LOAD_BROADCASTING_PROGRAM_ERR,
      error: err,
    })
  }
};

function* loadChatRooms(action) {
  try {
    console.log('what is action. data', action.data);
    const result = yield call(FB_loadChatRooms, action.data);
    console.log('result? 이게 왜 먼저뜸?', result);
    yield put({
      type: LOAD_CHAT_ROOMS_HIT,
      data: result,
    });
  } catch (err) {
    console.error('error!', err);
    yield put({
      type: LOAD_CHAT_ROOMS_ERR,
      error: err,
    })
  }
}

function* loadNoneImgProgram(action) {
  try {
    const result = yield call(FB_loadNoneImgPrograms, action.data);
    yield put({
      type: LOAD_NON_IMG_PROGRAM_HIT,
      data: result,
    })
  } catch (err) {
    console.error('error!', err);
    yield put({
      type: LOAD_NON_IMG_PROGRAM_ERR,
      error: err,
    })
  }
}

function* uploadImg(action) {
  try {
    const upload = yield call(FB_uploadImg, action.data);
    console.log('upload', upload);
    const result = yield call(FB_updateImgSrc, action.data);
    yield put({
      type: UPLOAD_IMG_HIT,
      data: result,
    })
  } catch (err) {
    console.error('err!!!', err);
    yield put({
      type: UPLOAD_IMG_ERR,
      error: err,
    })
  }
}

function* searchProgram(action) {
  try {
    const result = yield call(FB_searchProgram, action.data);
    console.log('result?', result);

    yield put({
      type: SEARCH_PROGRAM_HIT,
      data: result,
    })
  } catch (err) {
    console.error('error Occured!', err);
    yield put({
      type: SEARCH_PROGRAM_ERR,
      error: err,
    })
  }
}

function* uploadNotice(action) {
  try {
    console.log('action', action);
    const result = yield call(FB_uploadNotice, action.data);
    yield put({
      type: UPLOAD_NOTICE_HIT,
      data: result,
    })
  } catch (err) {
    console.error('error Occured!', err);
    yield put({
      type: UPLOAD_NOTICE_ERR,
      error: err,
    })
  }
}
function* loadWeeklySchedules(action) {
  try {
    console.log('action', action);
    const result = yield call(FB_loadWeeklySchedules, action.data);
    yield put({
      type: LOAD_WEEKLYSCHEDULE_HIT,
      data: result,
    })
  } catch (err) {
    console.error('err Occuredd!!', err);
    yield put({
      type: LOAD_WEEKLYSCHEDULE_ERR,
      error: err,
    })
  }
}
function* deleteProgramData(action) {
  try {
    yield call(FB_deleteProgramData, action.data);
    yield put({
      type: DELETE_PROGRAM_DATA_HIT,
    })
  } catch (err) {
    console.error('err Occured!', err);
    yield put({
      type: DELETE_PROGRAM_DATA_ERR,
      error: err,
    })
  }
}

function* watchDoSignin() {
  yield takeLatest(SIGN_IN_REQ, doSignin);
};

function* watchLoadBraodcastingPrograms() {
  yield throttle(3000, LOAD_BROADCASTING_PROGRAM_REQ, loadBroadcastingPrograms);
};
function* watchLoadChatRooms() {
  yield throttle(3000, LOAD_CHAT_ROOMS_REQ, loadChatRooms);
};
function* watchLoadNoneImgProgram() {
  yield throttle(3000, LOAD_NON_IMG_PROGRAM_REQ, loadNoneImgProgram);
};


function* watchUploadImg() {
  yield throttle(1000, UPLOAD_IMG_REQ, uploadImg);
};

function* watchSearchProgram() {
  yield throttle(1000, SEARCH_PROGRAM_REQ, searchProgram);
};

function* watchUploadNotice() {
  yield throttle(1000, UPLOAD_NOTICE_REQ, uploadNotice);
};
function* watchLoadWeeklySchedules() {
  yield throttle(1000, LOAD_WEEKLYSCHEDULE_REQ, loadWeeklySchedules);
};
function* watchDeleteProgramData() {
  yield throttle(1000, DELETE_PROGRAM_DATA_REQ, deleteProgramData);
};

export default function* programSaga() {
  yield all([
    fork(watchDoSignin),
    fork(watchLoadBraodcastingPrograms),
    fork(watchLoadChatRooms),
    fork(watchLoadNoneImgProgram),
    fork(watchUploadImg),
    fork(watchSearchProgram),
    fork(watchUploadNotice),
    fork(watchLoadWeeklySchedules),
    fork(watchDeleteProgramData),
  ]);
};