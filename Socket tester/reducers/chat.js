import produce from 'immer';

export const initialStat = {
  socketActive: false,
  currentRoomId: null,
  roomUser: [],
  aggros: [],
  aggroErr: null,
  chats: [],

  rooms: [],

  ableSendMsg: false,

  joinRoomReq: false,
  joinRoomHit: false,
  joinRoomErr: null,
};


// ADD_ROOM
// DELETE_ROOM
// COUNT

// export const SOCKET_CONNECT_REQ = 'SOCKET_CONNECT_REQ';
// export const SOCKET_CONNECT_HIT = 'SOCKET_CONNECT_HIT';
// export const SOCKET_CONNECT_ERR = 'SOCKET_CONNECT_ERR';

export const DISCONNECT_SOCKET = 'DISCONNECT_SOCKET';

export const BUILD_ROOM_CHANNEL = 'BUILD_ROOM_CHANNEL';
export const BUILD_CHAT_CHANNEL = 'BUILD_CHAT_CHANNEL';
export const BUILD_MSG_CHANNEL = 'BUILD_MSG_CHANNEL';
export const BUILD_AGGRO_POINT_CHANNEL = 'BUILD_AGGRO_POINT_CHANNEL';

export const LOAD_ROOMS = 'LOAD_ROOMS';

export const JOIN_ROOM_REQ = 'JOIN_ROOM_REQ';
export const JOIN_ROOM_HIT = 'JOIN_ROOM_HIT';
export const JOIN_ROOM_ERR = 'JOIN_ROOM_ERR';

export const LOAD_ROOM_USERS = 'LOAD_ROOM_USERS';

export const AGGRO = 'AGGRO';
export const STOP_AGGRO = 'STOP_AGGRO';
export const DELETE_AGGRO = 'STOP_AGGRO';

export const AGGRO_UP = 'AGGRO_UP';
export const AGGRO_DOWN = 'AGGRO_DOWN';
export const AGGRO_ERR = 'AGGRO_ERR';
export const CHAT = 'CHAT';

export const AGGRO_POINT = 'AGGRO_POINT';



const reducer = (state = initialStat, action) => produce(state, draft => {
  switch (action.type) {

    case DISCONNECT_SOCKET:
      draft.socketActive = false;
      draft.socketConnHit = false;
      draft.currentSocket = null;
      break;

    case BUILD_ROOM_CHANNEL:
      draft.socketActive = true;
      draft.currentRoomId = null;
      draft.roomUser = [];
      draft.aggros = [];
      draft.chats = [];
      draft.ableSendMsg = false;
      break;
    case BUILD_CHAT_CHANNEL:
      break;
    case BUILD_MSG_CHANNEL:
      draft.ableSendMsg = true;
      break;
    case BUILD_AGGRO_POINT_CHANNEL:
      break;
    case LOAD_ROOMS:
      draft.rooms = action.data;
      break;


    case JOIN_ROOM_REQ:
      draft.joinRoomReq = true;
      draft.joinRoomHit = false;
      draft.joinRoomErr = null;
      draft.currentRoomId = action.data.roomId;
      break;
    case JOIN_ROOM_HIT:
      draft.joinRoomReq = false;
      draft.joinRoomHit = true;
      break;
    case JOIN_ROOM_ERR:
      draft.joinRoomReq = false;
      draft.joinRoomHit = false;
      draft.joinRoomErr = action.error;
      draft.currentRoomId = null;
      break;

    case LOAD_ROOM_USERS:
      draft.roomUser = action.data;
      break;

    case AGGRO:
      draft.aggros = draft.aggros.concat(action.data);
      break;
    case STOP_AGGRO:
      const aggroTarget = draft.aggros.find(el => el.aggroUID === action.data.aggroUID);
      if (aggroTarget) aggroTarget.clear = true;
      break;
    case DELETE_AGGRO:
      draft.aggros = draft.aggros.filter(el => el.aggroUID !== action.data);
      break;
    case AGGRO_ERR:
      draft.aggroErr = action.err;
      break;
    case AGGRO_UP:
      const upTarget = draft.aggros.find(el => el.aggroUID === action.data.aggroUID);
      if (upTarget) upTarget.point = action.data.point;
      break;
    case AGGRO_DOWN:
      const downTarget = draft.aggros.find(el => el.aggroUID === action.data.aggroUID);
      if (downTarget) upTarget.point = action.data.point;
      break;


    case CHAT:
      draft.chats = draft.chats.concat(action.data);
      break;

    case AGGRO_POINT:
      const target = draft.aggros.find(el => el.aggroUID === action.data.aggroUID);
      if (target) target.point = action.data.point;
      break;



    // case SOCKET_CONNECT_REQ:
    //   draft.socketConnLoad = true;
    //   draft.socketConnHit = false;
    //   draft.socketConnErr = null;
    //   break;
    // case SOCKET_CONNECT_HIT:
    //   draft.socketConnLoad = false;
    //   draft.socketConnHit = true;
    //   break;
    // case SOCKET_CONNECT_ERR:
    //   draft.socketConnLoad = false;
    //   draft.socketConnHit = false;
    //   draft.socketConnErr = action.error;
    //   break;
  }
});

export default reducer;