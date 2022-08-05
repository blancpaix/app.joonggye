import produce from 'immer';
import { blockedUserSet } from '../socket/createSocketChannel';

export const initialState = {
  sessionInfo: null,

  checkSessionLoad: false,
  checkSessionDone: false,
  checkSessionErr: null,

  updateProfileLoad: false,
  updateProfileDone: false,
  updateProfileErr: null,
  signoutLoad: false,
  signoutDone: false,
  signoutErr: null,
  dropoutLoad: false,
  dropoutDone: false,
  dropoutErr: null,

  myFavorites: [],
  loadFavoritesLoad: false,
  loadFavoritesDone: false,
  loadFavoritesErr: null,
  addFavProgramLoad: false,
  addFavProgramHit: false,
  addFavProgramErr: null,
  deleteFavProgramLoad: false,
  deleteFavProgramHit: false,
  deleteFavProgramErr: null,

  // 차단된 유저 목록 (클라이언트 삭제 시 초기화)
  blockedUsers: {},
};

export const CHECK_SESSION_REQ = 'CHECK_SESSION_REQ';
export const CHECK_SESSION_HIT = 'CHECK_SESSION_HIT';
export const CHECK_SESSION_ERR = 'CHECK_SESSION_ERR';
export const UPDATE_SESSION = 'UPDATE_SESSION';
export const UPDATE_PROFILE_REQ = 'UPDATE_PROFILE_REQ';
export const UPDATE_PROFILE_HIT = 'UPDATE_PROFILE_HIT';
export const UPDATE_PROFILE_ERR = 'UPDATE_PROFILE_ERR';
export const UPDATE_PROFILE_RESET = 'UPDATE_PROFILE_RESET';
export const SIGNOUT_FB_REQ = 'SIGNOUT_FB_REQ';
export const SIGNOUT_FB_HIT = 'SIGNOUT_FB_HIT';
export const SIGNOUT_FB_ERR = 'SIGNOUT_FB_ERR';
export const DROP_OUT_REQ = 'DROP_OUT_REQ';
export const DROP_OUT_HIT = 'DROP_OUT_HIT';
export const DROP_OUT_ERR = 'DROP_OUT_ERR';

export const LOAD_FAVORITES_REQ = 'LOAD_FAVORITES_REQ';
export const LOAD_FAVORITES_HIT = 'LOAD_FAVORITES_HIT';
export const LOAD_FAVORITES_ERR = 'LOAD_FAVORITES_ERR';
export const ADD_FAVORITE_PROGRAM_REQ = 'ADD_FAVORITE_PROGRAM_REQ';
export const ADD_FAVORITE_PROGRAM_HIT = 'ADD_FAVORITE_PROGRAM_HIT';
export const ADD_FAVORITE_PROGRAM_ERR = 'ADD_FAVORITE_PROGRAM_ERR';
export const DELETE_FAVORITE_PROGRAM_REQ = 'DELETE_FAVORITE_PROGRAM_REQ';
export const DELETE_FAVORITE_PROGRAM_HIT = 'DELETE_FAVORITE_PROGRAM_HIT';
export const DELETE_FAVORITE_PROGRAM_ERR = 'DELETE_FAVORITE_PROGRAM_ERR';
export const RESET_FAVORITE_PROGRAM = 'RESET_FAVORITE_PROGRAM';

export const ADD_BLOCK_USER = 'ADD_BLOCK_USER';
export const DELETE_BLOCK_USER = 'DELETE_BLOCK_USER';


const sessionReducer = (state = initialState, action) => produce(state, (draft) => {
  switch (action.type) {
    case CHECK_SESSION_REQ:
      draft.checkSessionLoad = true;
      draft.checkSessionDone = false;
      draft.checkSessionErr = null;
      break;
    case CHECK_SESSION_HIT:
      draft.checkSessionLoad = false;
      draft.checkSessionDone = true;
      draft.sessionInfo = action.data;
      break;
    case CHECK_SESSION_ERR:
      draft.checkSessionLoad = true;
      draft.checkSessionDone = false;
      draft.checkSessionErr = action.error;
      break;
    case UPDATE_SESSION:
      draft.sessionInfo = action.data;
      break;
    case UPDATE_PROFILE_REQ:
      draft.updateProfileLoad = true;
      draft.updateProfileDone = false;
      draft.updateProfileErr = null
      break;
    case UPDATE_PROFILE_HIT:
      draft.updateProfileLoad = false;
      draft.updateProfileDone = true;
      draft.sessionInfo = action.data;
      break;
    case UPDATE_PROFILE_ERR:
      draft.updateProfileLoad = false;
      draft.updateProfileDone = false;
      draft.updateProfileErr = action.error;
      break;
    case UPDATE_PROFILE_RESET:
      draft.updateProfileLoad = false;
      draft.updateProfileDone = false;
      draft.updateProfileErr = null;
      break;
    case SIGNOUT_FB_REQ:
      draft.signoutLoad = true;
      draft.signoutDone = false;
      draft.signoutErr = null;
      break;
    case SIGNOUT_FB_HIT:
      draft.verified = null;
      draft.signoutLoad = false;
      draft.signoutDone = true;
      draft.sessionInfo = null;
      draft.myFavorites = [];
      break;
    case SIGNOUT_FB_ERR:
      draft.signoutLoad = false;
      draft.signoutDone = false;
      draft.signoutErr = action.err;
      break;
    case DROP_OUT_REQ:
      draft.dropoutLoad = true;
      draft.dropoutDone = false;
      draft.dropoutErr = null;
      break;
    case DROP_OUT_HIT:
      draft.dropoutLoad = false;
      draft.dropoutDone = true;
      draft.sessionInfo = null;
      draft.myFavorites = [];
      break;
    case DROP_OUT_ERR:
      draft.dropoutLoad = false;
      draft.dropoutDone = false;
      draft.dropoutErr = action.error;
      break;

    case LOAD_FAVORITES_REQ:
      draft.loadFavoritesLoad = true;
      draft.loadFavoritesDone = false;
      draft.loadFavoritesErr = null;
      break;
    case LOAD_FAVORITES_HIT:
      draft.loadFavoritesLoad = false;
      draft.loadFavoritesDone = true;
      if (action.data.length > 0) draft.myFavorites = action.data;
      break;
    case LOAD_FAVORITES_ERR:
      draft.loadFavoritesLoad = false;
      draft.loadFavoritesDone = false;
      draft.loadFavoritesErr = action.err;
      break;
    case ADD_FAVORITE_PROGRAM_REQ:
      draft.addFavProgramLoad = true;
      draft.addFavProgramHit = false;
      draft.addFavProgramErr = null;
      break;
    case ADD_FAVORITE_PROGRAM_HIT:
      draft.addFavProgramLoad = false;
      draft.addFavProgramHit = true;
      draft.myFavorites.unshift(action.data);
      break;
    case ADD_FAVORITE_PROGRAM_ERR:
      draft.addFavProgramLoad = true;
      draft.addFavProgramHit = false;
      draft.addFavProgramErr = null;
      break;
    case DELETE_FAVORITE_PROGRAM_REQ:
      draft.deleteFavProgramLoad = true;
      draft.deleteFavProgramHit = false;
      draft.deleteFavProgramErr = null;
      break;
    case DELETE_FAVORITE_PROGRAM_HIT:
      draft.deleteFavProgramLoad = false;
      draft.deleteFavProgramHit = true;
      draft.myFavorites = draft.myFavorites.filter(v => v.id !== action.data);
      break;
    case DELETE_FAVORITE_PROGRAM_ERR:
      draft.deleteFavProgramLoad = true;
      draft.deleteFavProgramHit = false;
      draft.deleteFavProgramErr = null;
      break;
    case RESET_FAVORITE_PROGRAM:
      draft.addFavProgramHit = false;
      draft.addFavProgramErr = null;
      draft.deleteFavProgramHit = false;
      draft.deleteFavProgramErr = null;
      break;

    case ADD_BLOCK_USER:
      draft.blockedUsers[action.data] = true;
      blockedUserSet.set(action.data, true);
      break;
    case DELETE_BLOCK_USER:
      delete draft.blockedUsers[action.data];
      blockedUserSet.delete(action.data);
      break;

    default:
      break;
  }
});

export default sessionReducer;