import { all, call, fork, put, throttle, } from 'redux-saga/effects';
import {
  CHECK_SESSION_REQ, CHECK_SESSION_HIT, CHECK_SESSION_ERR,
  UPDATE_PROFILE_REQ, UPDATE_PROFILE_ERR, UPDATE_PROFILE_HIT,
  SIGNOUT_FB_REQ, SIGNOUT_FB_HIT, SIGNOUT_FB_ERR,
  DROP_OUT_REQ, DROP_OUT_HIT, DROP_OUT_ERR,
  LOAD_FAVORITES_REQ, LOAD_FAVORITES_HIT, LOAD_FAVORITES_ERR,
  ADD_FAVORITE_PROGRAM_REQ, ADD_FAVORITE_PROGRAM_HIT, ADD_FAVORITE_PROGRAM_ERR,
  DELETE_FAVORITE_PROGRAM_REQ, DELETE_FAVORITE_PROGRAM_HIT, DELETE_FAVORITE_PROGRAM_ERR,
} from '../reducers/session';

import auth from '@react-native-firebase/auth';

import {
  FB_loadFavorites, FB_updateProfile, FB_uploadProfileImg,
  FB_trxAddFavProgram, FB_trxDelFavProgram,
} from '../firebaseFn';

function* checkSession_fb() {
  try {
    const user = auth().currentUser;
    if (user.displayName) {
      yield put({
        type: CHECK_SESSION_HIT,
        data: { user },
      })
    } else {
      yield put({
        type: CHECK_SESSION_ERR,
        error: '유저 데이터가 없습니다.',
      })
    }
  } catch (err) {
    yield put({
      type: CHECK_SESSION_ERR,
      error: '유저 데이터를 불러올 수 없습니다. ',
    })
  }
};

// action.data: {displayName, phoneNumber, img:Object}
function* updateProfile(action) {
  let result;
  try {
    if (action.data.img && !action.data.displayName) {
      const imgPath = yield call(FB_uploadProfileImg, {
        phoneNumber: action.data.phoneNumber,
        img: action.data.img,
      });
      const updateData = {
        photoURL: imgPath,
      };
      result = yield call(FB_updateProfile, updateData);
    } else if (action.data.displayName && !action.data.img) {
      const updateData = {
        displayName: action.data.displayName
      };
      result = yield call(FB_updateProfile, updateData);
    } else {

      const imgPath = yield call(FB_uploadProfileImg, {
        phoneNumber: action.data.phoneNumber,
        img: action.data.img,
      });
      const updateData = {
        displayName: action.data.displayName,
        photoURL: imgPath,
      };
      result = yield call(FB_updateProfile, updateData);
    };

    yield put({
      type: UPDATE_PROFILE_HIT,
      data: { user: result },
    });
  } catch (err) {
    yield put({
      type: UPDATE_PROFILE_ERR,
      data: '업데이트에 실패하였습니다.'
    })
  }
}

function* signout_fb() {
  try {
    yield call([auth(), auth().signOut]);
    yield put({ type: SIGNOUT_FB_HIT });
  } catch (err) {
    yield put({
      type: SIGNOUT_FB_ERR,
      error: '로그아웃에 실패하였습니다.',
    })
  }
};

function* dropout_fb() {
  try {
    yield call([auth().currentUser, auth().currentUser.delete]);
    yield put({
      type: DROP_OUT_HIT
    });
  } catch (err) {
    yield put({
      type: DROP_OUT_ERR,
      error: '회원탈퇴에 실패하였습니다.'
    })
  }
}

function* loadFavorites_fb(action) {
  try {
    const data = yield call(FB_loadFavorites, action.data);
    yield put({
      type: LOAD_FAVORITES_HIT,
      data,
    });
  } catch (err) {
    yield put({
      type: LOAD_FAVORITES_ERR,
      error: '불러오기에 실패하였습니다.',
    })
  }
}

function* addFavoriteProgram(action) {
  const { userUID, programUID, titleBroad } = action.data;
  try {
    yield call(FB_trxAddFavProgram, userUID, programUID, titleBroad);
    yield put({
      type: ADD_FAVORITE_PROGRAM_HIT,
      data: { id: programUID, titleBroad, createdAt: new Date() },
    })
  } catch (err) {
    yield put({
      type: ADD_FAVORITE_PROGRAM_ERR,
      error: '즐겨찾기 추가에 실패했습니다.',
    })
  }
};

function* deleteFavoriteProgram(action) {
  const { userUID, programUID } = action.data;
  try {
    yield call(FB_trxDelFavProgram, userUID, programUID);
    yield put({
      type: DELETE_FAVORITE_PROGRAM_HIT,
      data: programUID,
    })
  } catch (err) {
    yield put({
      type: DELETE_FAVORITE_PROGRAM_ERR,
      error: '즐겨찾기 삭제에 실패했습니다.',
    })
  }
};


function* watchCheckSessionFb() {
  yield throttle(3000, CHECK_SESSION_REQ, checkSession_fb);
}
function* watchUpdateProfile() {
  yield throttle(3000, UPDATE_PROFILE_REQ, updateProfile);
}
function* watchSignoutFb() {
  yield throttle(3000, SIGNOUT_FB_REQ, signout_fb);
}
function* watchDropout() {
  yield throttle(3000, DROP_OUT_REQ, dropout_fb);
}
function* watchLoadFavorites() {
  yield throttle(3000, LOAD_FAVORITES_REQ, loadFavorites_fb);
}
function* watchAddFavoriteProgram() {
  yield throttle(3000, ADD_FAVORITE_PROGRAM_REQ, addFavoriteProgram);
}
function* watchDeleteFavoriteProgram() {
  yield throttle(3000, DELETE_FAVORITE_PROGRAM_REQ, deleteFavoriteProgram);
}

export default function* sessionSaga() {
  yield all([
    fork(watchCheckSessionFb),
    fork(watchUpdateProfile),
    fork(watchSignoutFb),
    fork(watchDropout),
    fork(watchLoadFavorites),
    fork(watchAddFavoriteProgram),
    fork(watchDeleteFavoriteProgram),
  ])
};