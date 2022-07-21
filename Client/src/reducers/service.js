import produce from 'immer';

export const initialState = {
  // 전화번호 입력 인증
  verifier: null,
  verifyPhoneLoad: false,
  verifyPhoneDone: false,
  verifyPhoneErr: null,
  // SMS 인증번호 인증
  verified: null,
  confirmVerifyPhoneLoad: false,
  confirmVerifyPhoneDone: false,
  confirmVerifyPhoneErr: null,

  myAggros: [],
  loadAggrosLoad: false,
  loadAggrosDone: false,
  loadAggrosErr: null,
  aggrosEndReach: false,

  notices: [],
  loadNoticesLoad: false,
  loadNoticesDone: false,
  loadNoticesErr: null,
  selectedNotice: null,

  loadTermsLoad: false,
  loadTermsDone: false,
  loadTermsErr: null,
  termsPath: null,
};

export const VERIFY_PHONE_REQ = 'VERIFY_PHONE_REQ';
export const VERIFY_PHONE_HIT = 'VERIFY_PHONE_HIT';
export const VERIFY_PHONE_ERR = 'VERIFY_PHONE_ERR';
export const CONFIRM_VERIFY_PHONE_REQ = 'CONFIRM_VERIFY_PHONE_REQ';
export const CONFIRM_VERIFY_PHONE_HIT = 'CONFIRM_VERIFY_PHONE_HIT';
export const CONFIRM_VERIFY_PHONE_ERR = 'CONFIRM_VERIFY_PHONE_ERR';
export const RESET_VERIFIED = 'RESET_VERIFIED';

export const LOAD_AGGROS_REQ = 'LOAD_AGGROS_REQ';
export const LOAD_AGGROS_HIT = 'LOAD_AGGROS_HIT';
export const LOAD_AGGROS_ERR = 'LOAD_AGGROS_ERR';

export const LOAD_NOTICES_REQ = 'LOAD_NOTICES_REQ';
export const LOAD_NOTICES_HIT = 'LOAD_NOTICES_HIT';
export const LOAD_NOTICES_ERR = 'LOAD_NOTICES_ERR';

export const LOAD_TERMS_REQ = 'LOAD_TERMS_REQ';
export const LOAD_TERMS_HIT = 'LOAD_TERMS_HIT';
export const LOAD_TERMS_ERR = 'LOAD_TERMS_ERR';
export const PICKED_NOTICE = 'PICKED_NOTICE';

const serviceReducer = (state = initialState, action) => produce(state, (draft) => {
  switch (action.type) {
    case VERIFY_PHONE_REQ:
      draft.verifyPhoneLoad = true;
      draft.verifyPhoneDone = false;
      draft.verifyPhoneErr = null;
      break;
    case VERIFY_PHONE_HIT:
      draft.verifyPhoneLoad = false;
      draft.verifyPhoneDone = true;
      draft.verifier = action.data;
      break;
    case VERIFY_PHONE_ERR:
      draft.verifyPhoneLoad = false;
      draft.verifyPhoneDone = false;
      draft.verifyPhoneErr = action.error;
      break;
    case CONFIRM_VERIFY_PHONE_REQ:
      draft.confirmVerifyPhoneLoad = true;
      draft.confirmVerifyPhoneDone = false;
      draft.confirmVerifyPhoneErr = null;
      break;
    case CONFIRM_VERIFY_PHONE_HIT:
      draft.confirmVerifyPhoneLoad = false;
      draft.confirmVerifyPhoneDone = true;
      draft.verified = action.data;
      break;
    case CONFIRM_VERIFY_PHONE_ERR:
      draft.confirmVerifyPhoneLoad = false;
      draft.confirmVerifyPhoneDone = false;
      draft.confirmVerifyPhoneErr = action.error;
      break;
    case RESET_VERIFIED:
      draft.verified = null;
      draft.verifier = null;
      draft.verifyPhoneDone = false;
      draft.confirmVerifyPhoneDone = false;
      break;

    case LOAD_AGGROS_REQ:
      draft.loadAggrosLoad = true;
      draft.loadAggrosDone = false;
      draft.loadAggrosErr = null;
      break;
    case LOAD_AGGROS_HIT:
      draft.loadAggrosLoad = false;
      draft.loadAggrosDone = true;
      if (!action.data.aggros) break;
      draft.myAggros = draft.myAggros.concat(action.data.aggros);
      draft.aggrosEndReach = action.data.isEnd;
      break;
    case LOAD_AGGROS_ERR:
      draft.loadAggrosLoad = false;
      draft.loadAggrosDone = false;
      draft.loadAggrosErr = action.err;
      break;

    case LOAD_NOTICES_REQ:
      draft.loadNoticesLoad = true;
      draft.loadNoticesDone = false;
      draft.loadNoticesErr = null;
      break;
    case LOAD_NOTICES_HIT:
      draft.loadNoticesLoad = false;
      draft.loadNoticesDone = true;
      if (!action.data) break;
      draft.notices = draft.notices.concat(action.data);
      break;
    case LOAD_NOTICES_ERR:
      draft.loadNoticesLoad = false;
      draft.loadNoticesDone = false;
      draft.loadNoticesErr = action.error;
      break;

    case LOAD_TERMS_REQ:
      draft.loadTermsLoad = true;
      draft.loadTermsDone = false;
      draft.loadTermsErr = null;
      break;
    case LOAD_TERMS_HIT:
      draft.loadTermsLoad = false;
      draft.loadTermsDone = true;
      draft.termsPath = action.data;
      break;
    case LOAD_TERMS_ERR:
      draft.loadTermsLoad = false;
      draft.loadTermsDone = false;
      draft.loadTermsErr = action.error;
      break;
    case PICKED_NOTICE:
      draft.selectedNotice = draft.notices.find(el => el.id === action.data);
      break;

    default:
      break;
  }
});

export default serviceReducer;