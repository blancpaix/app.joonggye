import produce from 'immer';

const initialState = {
  session: null,
  loadedNoneImgPrograms: [],
  searchPrograms: [],
  broadcastingPrograms: [],
  chatRooms: [],


  signinReq: false,
  signinHit: false,
  signinErr: null,

  loadBraodcastingProgramReq: false,
  loadBraodcastingProgramHit: false,
  loadBraodcastingProgramErr: null,

  loadChatRoomsReq: false,
  loadChatRoomsHit: false,
  loadChatRoomsErr: null,

  loadNonImgProgramReq: false,
  loadNonImgProgramHit: false,
  loadNonImgProgramErr: null,

  uploadImgReq: false,
  uploadImgHit: false,
  uploadImgErr: null,
  searchProgramReq: false,
  searchProgramHit: false,
  searchProgramErr: null,

  uploadNoticeReq: false,
  uploadNoticeHit: false,
  uploadNoticeErr: null,

  loadWeeklyScheduleReq: false,
  loadWeeklyScheduleHit: false,
  loadWeeklyScheduleErr: false,
  weeklySchedules: [],

  deleteProgramDataReq: false,
  deleteProgramDataHit: false,
  deleteProgramDataErr: false,

  notices: [],
};
export const SIGN_IN_REQ = 'SIGN_IN_REQ';
export const SIGN_IN_HIT = 'SIGN_IN_HIT';
export const SIGN_IN_ERR = 'SIGN_IN_ERR';

export const LOAD_BROADCASTING_PROGRAM_REQ = 'LOAD_BROADCASTING_PROGRAM_REQ';
export const LOAD_BROADCASTING_PROGRAM_HIT = 'LOAD_BROADCASTING_PROGRAM_HIT';
export const LOAD_BROADCASTING_PROGRAM_ERR = 'LOAD_BROADCASTING_PROGRAM_ERR';

export const LOAD_CHAT_ROOMS_REQ = 'LOAD_CHAT_ROOMS_REQ'
export const LOAD_CHAT_ROOMS_HIT = 'LOAD_CHAT_ROOMS_HIT'
export const LOAD_CHAT_ROOMS_ERR = 'LOAD_CHAT_ROOMS_ERR'

export const LOAD_NON_IMG_PROGRAM_REQ = 'LOAD_NON_IMG_PROGRAM_REQ';
export const LOAD_NON_IMG_PROGRAM_HIT = 'LOAD_NON_IMG_PROGRAM_HIT';
export const LOAD_NON_IMG_PROGRAM_ERR = 'LOAD_NON_IMG_PROGRAM_ERR';
export const UPLOAD_IMG_REQ = 'UPLOAD_IMG_REQ';
export const UPLOAD_IMG_HIT = 'UPLOAD_IMG_HIT';
export const UPLOAD_IMG_ERR = 'UPLOAD_IMG_ERR';

export const SEARCH_PROGRAM_REQ = "SEARCH_PROGRAM_REQ";
export const SEARCH_PROGRAM_HIT = "SEARCH_PROGRAM_HIT";
export const SEARCH_PROGRAM_ERR = "SEARCH_PROGRAM_ERR";

export const UPLOAD_NOTICE_REQ = 'UPLOAD_NOTICE_REQ';
export const UPLOAD_NOTICE_HIT = 'UPLOAD_NOTICE_HIT';
export const UPLOAD_NOTICE_ERR = 'UPLOAD_NOTICE_ERR';

export const LOAD_WEEKLYSCHEDULE_REQ = 'LOAD_WEEKLYSCHEDULE_REQ';
export const LOAD_WEEKLYSCHEDULE_HIT = 'LOAD_WEEKLYSCHEDULE_HIT';
export const LOAD_WEEKLYSCHEDULE_ERR = 'LOAD_WEEKLYSCHEDULE_ERR';

export const DELETE_PROGRAM_DATA_REQ = 'DELETE_PROGRAM_DATA_REQ';
export const DELETE_PROGRAM_DATA_HIT = 'DELETE_PROGRAM_DATA_HIT';
export const DELETE_PROGRAM_DATA_ERR = 'DELETE_PROGRAM_DATA_ERR';

const reducer = (state = initialState, action) => produce(state, draft => {
  switch (action.type) {
    case SIGN_IN_REQ:
      draft.signinReq = true;
      draft.signinHit = false;
      draft.signinErr = null;
      break;
    case SIGN_IN_HIT:
      draft.signinReq = false;
      draft.signinHit = true;
      draft.session = action.data
      break;
    case SIGN_IN_ERR:
      draft.signinReq = false;
      draft.signinHit = false;
      draft.signinErr = action.error;
      break;

    case LOAD_BROADCASTING_PROGRAM_REQ:
      draft.loadBraodcastingProgramReq = true;
      draft.loadBraodcastingProgramHit = false;
      draft.loadBraodcastingProgramErr = null;
      break;
    case LOAD_BROADCASTING_PROGRAM_HIT:
      draft.loadBraodcastingProgramReq = false;
      draft.loadBraodcastingProgramHit = true;
      draft.broadcastingPrograms = action.data;
      break;
    case LOAD_BROADCASTING_PROGRAM_ERR:
      draft.loadBraodcastingProgramReq = false;
      draft.loadBraodcastingProgramHit = false;
      draft.loadBraodcastingProgramErr = action.error;
      break;

    case LOAD_CHAT_ROOMS_REQ:
      draft.loadChatRoomsReq = true;
      draft.loadChatRoomsHit = false;
      draft.loadChatRoomsErr = null;
      break;
    case LOAD_CHAT_ROOMS_HIT:
      draft.loadChatRoomsReq = false;
      draft.loadChatRoomsHit = true;
      draft.chatRooms = action.data;
      break;
    case LOAD_CHAT_ROOMS_ERR:
      draft.loadChatRoomsReq = false;
      draft.loadChatRoomsHit = false;
      draft.loadChatRoomsErr = action.error;
      break;

    case LOAD_NON_IMG_PROGRAM_REQ:
      draft.loadNonImgProgramReq = true;
      draft.loadNonImgProgramHit = false;
      draft.loadNonImgProgramErr = null;
      break;
    case LOAD_NON_IMG_PROGRAM_HIT:
      draft.loadNonImgProgramReq = false;
      draft.loadNonImgProgramHit = true;
      draft.loadedNoneImgPrograms = action.data;
      break;
    case LOAD_NON_IMG_PROGRAM_ERR:
      draft.loadNonImgProgramReq = false;
      draft.loadNonImgProgramHit = false;
      draft.loadNonImgProgramErr = action.error;
      break;

    case UPLOAD_IMG_REQ:
      draft.uploadImgReq = true;
      draft.uploadImgHit = false;
      draft.uploadImgErr = null;
      break;
    case UPLOAD_IMG_HIT:
      draft.uploadImgReq = false;
      draft.uploadImgHit = true;
      break;
    case UPLOAD_IMG_ERR:
      draft.uploadImgReq = false;
      draft.uploadImgHit = false;
      draft.uploadImgErr = action.error;
      break;

    case SEARCH_PROGRAM_REQ:
      draft.searchProgramReq = true;
      draft.searchProgramHit = false;
      draft.searchProgramErr = null;
      break;
    case SEARCH_PROGRAM_HIT:
      draft.searchProgramReq = false;
      draft.searchProgramHit = true;
      draft.searchPrograms = action.data;
      break;
    case SEARCH_PROGRAM_ERR:
      draft.searchProgramReq = false;
      draft.searchProgramHit = false;
      draft.searchProgramErr = action.error;
      break;


    case UPLOAD_NOTICE_REQ:
      draft.uploadNoticeReq = true;
      draft.uploadNoticeHit = false;
      draft.uploadNoticeErr = null;
      break;
    case UPLOAD_NOTICE_HIT:
      draft.uploadNoticeReq = false;
      draft.uploadNoticeHit = true;
      break;
    case UPLOAD_NOTICE_ERR:
      draft.uploadNoticeReq = false;
      draft.uploadNoticeHit = false;
      draft.uploadNoticeErr = action.error;
      break;

    case LOAD_WEEKLYSCHEDULE_REQ:
      draft.loadWeeklyScheduleReq = true;
      draft.loadWeeklyScheduleHit = false;
      draft.loadWeeklyScheduleErr = false;
      break;
    case LOAD_WEEKLYSCHEDULE_HIT:
      draft.loadWeeklyScheduleReq = false;
      draft.loadWeeklyScheduleHit = true;
      const sorted = action.data.sort((a, b) => {
        return a.startAt.seconds - b.startAt.seconds
      });
      draft.weeklySchedules = sorted;
      break;
    case LOAD_WEEKLYSCHEDULE_ERR:
      draft.loadWeeklyScheduleReq = false;
      draft.loadWeeklyScheduleHit = false;
      draft.loadWeeklyScheduleErr = action.error;
      break;
    case DELETE_PROGRAM_DATA_REQ:
      draft.deleteProgramDataReq = true;
      draft.deleteProgramDataHit = false;
      draft.deleteProgramDataErr = false;
      break;
    case DELETE_PROGRAM_DATA_HIT:
      draft.deleteProgramDataReq = false;
      draft.deleteProgramDataHit = true;
      draft.deleteProgramDataErr = false;
      break;
    case DELETE_PROGRAM_DATA_ERR:
      draft.deleteProgramDataReq = false;
      draft.deleteProgramDataHit = false;
      draft.deleteProgramDataErr = action.err;
      break;


    default:
      break;
  }
});

export default reducer;