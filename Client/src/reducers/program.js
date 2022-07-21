import produce from 'immer';

export const initialState = {
  // 방송 중 프로그램 목록
  broadcasting: [],
  pickedProgram: {},
  searchInOnair: [],
  loadScheduleLoad: false,
  loadScheduleHit: false,
  loadScheduleErr: null,

  // 프로그램 검색 목록
  searchPrograms: [],
  pickedSearchProgram: {},
  searchProgramLoad: false,
  searchProgramDone: false,
  searchProgramErr: null,

  // 좋아하는 프로그램 확인
  loadFavCntLoad: false,
  loadFavCntHit: false,
  loadFavCntErr: null,

  // 편성표
  airTable: [],
  loadAirTableLoad: false,
  loadAirTableHit: false,
  loadAirTableErr: null,
};

export const LOAD_SCHEDULE_REQ = 'LOAD_SCHEDULE_REQ';
export const LOAD_SCHEDULE_HIT = 'LOAD_SCHEDULE_HIT';
export const LOAD_SCHEDULE_ERR = 'LOAD_SCHEDULE_ERR';

// 방송중인 프로그램 실시간 업데이트
export const ADD_PROGRAMS = 'ADD_PROGRAMS';
export const DELETE_PROGRAMS = 'DELETE_PROGRAMS';
export const PICKED_PROGRAM = 'PICKED_PROGRAM';

export const SEARCH_PROGRAM_PICK = 'SEARCH_PROGRAM_PICK';
export const CLEAR_SEARCH_PROGRAM = `CLEAR_SEARCH_PROGRAM`;
export const SEARCH_PROGRAM_REQ = 'SEARCH_PROGRAM_REQ';
export const SEARCH_PROGRAM_HIT = 'SEARCH_PROGRAM_HIT';
export const SEARCH_PROGRAM_ERR = 'SEARCH_PROGRAM_ERR';

export const LOAD_FAV_COUNT_REQ = 'LOAD_FAV_COUNT_REQ';
export const LOAD_FAV_COUNT_HIT = 'LOAD_FAV_COUNT_HIT';
export const LOAD_FAV_COUNT_ERR = 'LOAD_FAV_COUNT_ERR';
export const INCREASE_FAV = 'INCRESE_FAV';
export const DECREASE_FAV = 'DECREASE_FAV';

export const LOAD_AIR_TABLE_REQ = "LOAD_AIR_TABLE_REQ";
export const LOAD_AIR_TABLE_HIT = "LOAD_AIR_TABLE_HIT";
export const LOAD_AIR_TABLE_ERR = "LOAD_AIR_TABLE_ERR";




const programReducer = (state = initialState, action) => produce(state, (draft) => {
  switch (action.type) {
    case LOAD_SCHEDULE_REQ:
      draft.loadScheduleLoad = true;
      draft.loadScheduleHit = false;
      draft.loadScheduleErr = null;
      break;
    case LOAD_SCHEDULE_HIT:
      draft.loadScheduleLoad = false;
      draft.loadScheduleHit = true;
      const reverseSchedule = action.data.reverse();
      const spacingData = [
        { scheduleId: 'left-spacer', title: '' },
        ...reverseSchedule,
        { scheduleId: 'right-spacer', title: '' },
      ];
      draft.broadcasting = spacingData;
      break;
    case LOAD_SCHEDULE_ERR:
      draft.loadScheduleLoad = false;
      draft.loadScheduleHit = false;
      draft.loadScheduleErr = action.error;
      break;

    case ADD_PROGRAMS:
      const reverseAddedProgram = action.data.reverse();
      draft.broadcasting.splice(1, 0, ...reverseAddedProgram);
      break;
    case DELETE_PROGRAMS:
      draft.broadcasting = draft.broadcasting.filter(el => !action.data.includes(el.scheduleId));
      break;
    case PICKED_PROGRAM:
      draft.pickedProgram = draft.broadcasting.find(v => v.scheduleId === action.data);
      draft.loadFavCntHit = false;
      break;

    case CLEAR_SEARCH_PROGRAM:
      draft.searchInOnair = [];
      draft.searchPrograms = [];
      break;
    case SEARCH_PROGRAM_PICK:
      draft.pickedSearchProgram = draft.searchPrograms.find(v => v.programUID === action.data);
      break;
    case SEARCH_PROGRAM_REQ:
      draft.searchProgramLoad = true;
      draft.searchProgramDone = false;
      draft.searchProgramErr = null;
      draft.searchInOnair = draft.broadcasting.filter(el => el.title.indexOf(action.data) !== -1);
      break;
    case SEARCH_PROGRAM_HIT:
      draft.searchProgramLoad = false;
      draft.searchProgramDone = true;
      draft.searchPrograms = action.data;
      break;
    case SEARCH_PROGRAM_ERR:
      draft.searchProgramLoad = false;
      draft.searchProgramDone = false;
      draft.loadAirTableErr = action.err;
      break;

    case LOAD_FAV_COUNT_REQ:
      draft.loadFavCntLoad = true;
      draft.loadFavCntHit = false;
      draft.loadFavCntErr = null;
      break;
    case LOAD_FAV_COUNT_HIT:
      draft.loadFavCntLoad = false;
      draft.loadFavCntHit = true;
      draft.pickedProgram.likes = action.data;
      break;
    case LOAD_FAV_COUNT_ERR:
      draft.loadFavCntLoad = false;
      draft.loadFavCntHit = false;
      draft.loadFavCntErr = action.error;
      break;
    case INCREASE_FAV:
      draft.pickedProgram.likes++;
      break;
    case DECREASE_FAV:
      draft.pickedProgram.likes--;
      break;

    case LOAD_AIR_TABLE_REQ:
      draft.loadAirTableLoad = true;
      draft.loadAirTableHit = false;
      draft.loadAirTableErr = null;
      break;
    case LOAD_AIR_TABLE_HIT:
      draft.loadAirTableLoad = false;
      draft.loadAirTableHit = true;
      draft.airTable = action.data;
      break;
    case LOAD_AIR_TABLE_ERR:
      draft.loadAirTableLoad = false;
      draft.loadAirTableHit = false;
      draft.airTable = [];
      draft.loadAirTableErr = action.err;
      break;

    default:
      break;
  }
});

export default programReducer;