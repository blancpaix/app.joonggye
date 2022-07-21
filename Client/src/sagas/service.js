import { all, call, fork, put, throttle, } from 'redux-saga/effects';
import { FB_loadAggros, FB_loadNotices, FB_loadTerms } from '../firebaseFn';
import {
  VERIFY_PHONE_REQ, VERIFY_PHONE_HIT, VERIFY_PHONE_ERR,
  CONFIRM_VERIFY_PHONE_REQ, CONFIRM_VERIFY_PHONE_HIT, CONFIRM_VERIFY_PHONE_ERR,
  LOAD_AGGROS_REQ, LOAD_AGGROS_HIT, LOAD_AGGROS_ERR,
  LOAD_NOTICES_REQ, LOAD_NOTICES_HIT, LOAD_NOTICES_ERR,
  LOAD_TERMS_REQ, LOAD_TERMS_HIT, LOAD_TERMS_ERR
} from '../reducers/service';

import auth from '@react-native-firebase/auth';

function* verifyPhoneNumber_fb(action) {
  try {
    const fullPhoneNumber = '+82 ' + action.data;
    const result = yield call(
      [auth(), auth().signInWithPhoneNumber],
      fullPhoneNumber
    );

    yield put({
      type: VERIFY_PHONE_HIT,
      data: result,
    });
  } catch (err) {
    let msg = '사용자 인증 오류가 발생하였습니다.';
    switch (err.code) {
      case 'auth/internal-error':
        msg = '인증 서버에 오류가 발생하였습니다. 잠시후 시도해주세요.';
        break;
      case 'auth/invalid-display-name':
        msg = '사용할 수 없는 닉네임입니다. 다시한번 확인해주세요.';
        break;
      case 'auth/invalid-photo-url':
        msg = '잘못된 이미지 파일입니다. 다시한번 확인해주세요.';
        break;
      case 'auth/phone-number-already-exists':
        msg = '이미 사용중인 번호입니다.';
        break;
      case 'auth/user-not-found	':
        msg = '사용자가 존재하지 않습니다.';
        break;
      case 'auth/internal-error':
        msg = '인증 서버에 오류가 발생하였습니다. 잠시후 시도해주세요';
        break;
      case 'auth/invalid-phone-number':
        msg = '잘못된 전화번호입니다.';
        break;
      default:
        msg = '실패하였습니다.'
        break;
    }
    yield put({
      type: VERIFY_PHONE_ERR,
      error: msg,
    })
  }
};

function* confirmVerifyPhone_fb(action) {
  try {
    const { verifier, verifyCode } = action.data;
    if (!verifier) throw Error('인증 중 오류가 발생했습니다.');
    const user = yield call(
      [verifier, verifier.confirm],
      verifyCode
    );
    yield put({
      type: CONFIRM_VERIFY_PHONE_HIT,
      data: user,
    });
  } catch (err) {
    let msg;
    switch (err.code) {
      case 'auth/invalid-verification-code':
        msg = '인증 번호가 일치하지않습니다.'
        break;
      case 'auth/missing-verification-code':
        msg = '인증이 유효하지 않습니다.'
        break;
      default:
        msg = '인증 중 오류가 발생하였습니다.'
        break;
    }
    yield put({
      type: CONFIRM_VERIFY_PHONE_ERR,
      error: msg,
    })
  }
}

function* loadAggros_fb(action) {
  try {
    const data = yield call(FB_loadAggros, action.data);
    yield put({
      type: LOAD_AGGROS_HIT,
      data,
    });
  } catch (err) {
    yield put({
      type: LOAD_AGGROS_ERR,
      error: '불러오기에 실패하였습니다.',
    })
  }
}

function* loadNotices_fb() {
  try {
    const data = yield call(FB_loadNotices);
    yield put({
      type: LOAD_NOTICES_HIT,
      data,
    })
  } catch (err) {
    yield put({
      type: LOAD_NOTICES_ERR,
      error: '불러오기에 실패하였습니다.',
    })
  }
}

function* loadTerms_fb() {
  try {
    const data = yield call(FB_loadTerms);
    yield put({
      type: LOAD_TERMS_HIT,
      data,
    })
  } catch (err) {
    yield put({
      type: LOAD_TERMS_ERR,
      error: '불러오기에 실패하였습니다.',
    })
  }
}

function* watchFbVerifyPhone() {
  yield throttle(5000, VERIFY_PHONE_REQ, verifyPhoneNumber_fb);
};
function* watchFbConfirmVerifyPhone() {
  yield throttle(5000, CONFIRM_VERIFY_PHONE_REQ, confirmVerifyPhone_fb);
}
function* watchLoadAggros() {
  yield throttle(3000, LOAD_AGGROS_REQ, loadAggros_fb);
}
function* watchLoadNotices() {
  yield throttle(3000, LOAD_NOTICES_REQ, loadNotices_fb);
}
function* watchLoadTerms() {
  yield throttle(3000, LOAD_TERMS_REQ, loadTerms_fb);
}

export default function* serviceSaga() {
  yield all([
    fork(watchFbVerifyPhone),
    fork(watchFbConfirmVerifyPhone),
    fork(watchLoadAggros),
    fork(watchLoadNotices),
    fork(watchLoadTerms),
  ])
};