import produce from 'immer';
import { blockedUserSet } from '../socket/createSocketChannel';

export const initialState = {
  // socket server
  socketConnLoad: false,
  socketConnHit: false,
  socketConnErr: null,

  // room
  nsp: null,
  chatRooms: [],
  filteredChatRooms: [],
  loadRooms: false,
  createRoomLoad: false,
  createRoomHit: false,
  createRoomErr: null,
  joinRoomLoad: false,
  joinRoomHit: false,
  joinRoomErr: null,

  // chat
  chatRoomInfo: null,
  // 현재 채팅방의 차단된 유저
  blockingUsers: {},
  chatRoomUsers: [],
  chats: [],
  aggros: [],
  aggroErr: null,
};

export const RESET_REQUESTED = 'RESET_REQUESTED';
export const SOCKET_CONNECT_REQ = 'SOCKET_CONNECT_REQ';
export const SOCKET_CONNECT_HIT = 'SOCKET_CONNECT_HIT';
export const SOCKET_CONNECT_ERR = 'SOCKET_CONNECT_ERR';
export const SOCKET_CONNECT_INIT = 'SOCKET_CONNECT_INIT';
export const SOCKET_CONNECT_CANCEL = 'SOCKET_CONNECT_CANCEL';
export const SOCKET_DISCONNECTED = 'SOCKET_DISCONNECTED';

export const BUILD_ROOM_CHANNEL = 'BUILD_ROOM_CHANNEL';

export const CREATE_ROOM_REQ = 'CREATE_ROOM_REQ';
export const CREATE_ROOM_HIT = 'CREATE_ROOM_HIT';
export const CREATE_ROOM_ERR = 'CREATE_ROOM_ERR';
export const CREATE_ROOM_RESET = 'CREATE_ROOM_RESET';
export const CREATE_ROOM_CANCEL = 'CREATE_ROOM_CANCEL';
export const JOIN_ROOM_REQ = 'JOIN_ROOM_REQ';
export const JOIN_ROOM_HIT = 'JOIN_ROOM_HIT';
export const JOIN_ROOM_ERR = 'JOIN_ROOM_ERR';
export const LOAD_ROOMS_REQ = 'LOAD_ROOMS_REQ';
export const LOAD_ROOMS_HIT = 'LOAD_ROOMS_HIT';
export const SEARCH_ROOMS = 'SEARCH_ROOMS';
export const RESET_SEARCH_ROOMS = 'RESET_SEARCH_ROOMS';
export const ADD_ROOM = 'ADD_ROOM';
export const DELETE_ROOM = 'DELETE_ROOM';
export const COUNT = 'COUNT';

export const BUILD_CHAT_CHANNEL = 'BUILD_MSG_CHANNEL';

export const CLEAR_ROOM = 'CLEAR_ROOM';
export const LOAD_ROOM_USERS = 'LOAD_ROOM_USERS';
export const JOIN_IN_ROOM = 'JOIN_IN_ROOM';
export const LEAVE_IN_ROOM = 'LEAVE_IN_ROOM';

export const MERGE_BLOCKED_USERS = 'MERGE_BLOCKED_USERS';
export const ADD_BLOCKED_USER = 'ADD_BLOCKED_USER';
export const DEL_BLOCKED_USER = 'DEL_BLOCKED_USER';

export const CHAT = 'CHAT';
export const AGGRO = 'AGGRO';
export const AGGRO_POINT = 'AGGRO_POINT';
export const AGGRO_ERR = 'AGGRO_ERR';
export const CLEAR_AGGRO_ERR = 'CLEAR_AGGRO_ERR';
export const STOP_AGGRO = 'STOP_AGGRO';
export const DELETE_AGGRO = 'DELETE_AGGRO';

export const CHAT_MINE = 'CHAT_MINE';
export const SEND_AGGRO_UP = 'SEND_AGGRO_UP';
export const SEND_AGGRO_DOWN = 'SEND_AGGRO_DOWN';


const chatReducer = (state = initialState, action) => produce(state, (draft) => {
  switch (action.type) {
    case RESET_REQUESTED:
      draft.socketConnErr = null;
      draft.createRoomErr = null;
      draft.joinRoomErr = null;
      draft.filteredChatRooms = [];
      break;
    case SOCKET_CONNECT_REQ:
      draft.socketConnLoad = true;
      draft.socketConnHit = false;
      draft.socketConnErr = null;
      draft.nsp = null;
      draft.chatRooms = [];
      draft.filteredChatRooms = [];
      draft.createRoomErr = null;
      draft.joinRoomErr = null;
      draft.loadRooms = false;
      // reset
      break;
    case SOCKET_CONNECT_HIT:
      draft.socketConnLoad = false;
      draft.socketConnHit = true;
      draft.nsp = action.data.namespace;
      break;
    case SOCKET_CONNECT_ERR:
      draft.socketConnLoad = false;
      draft.socketConnHit = false;
      draft.socketConnErr = action.error;
      break;
    case SOCKET_CONNECT_INIT:
      draft.socketConnHit = false;
      draft.socketConnLoad = false;
      draft.socketConnErr = null;
      break;
    case SOCKET_CONNECT_CANCEL:
      draft.socketConnLoad = false;
      draft.socketConnErr = null;
      break;
    case SOCKET_DISCONNECTED:
      draft.nsp = null;
      break;

    case CREATE_ROOM_REQ:
      draft.createRoomLoad = true;
      draft.createRoomHit = false;
      draft.createRoomErr = null;
      draft.chatRoomInfo = { title: action.data.title };
      break;
    case CREATE_ROOM_HIT:
      draft.chatRoomInfo = { ...draft.chatRoomInfo, roomId: action.data };
      draft.createRoomLoad = false;
      draft.createRoomHit = true;
      break;
    case CREATE_ROOM_ERR:
      draft.createRoomLoad = false;
      draft.createRoomHit = false;
      draft.createRoomErr = action.error;
      break;
    case CREATE_ROOM_CANCEL:
      draft.createRoomLoad = false;
      draft.createRoomErr = null;
      break;
    case JOIN_ROOM_REQ:
      draft.joinRoomLoad = true;
      draft.joinRoomHit = false;
      draft.joinRoomErr = null;
      draft.chatRoomInfo = { title: action.data.title, roomId: action.data.roomId, };
      break;
    case JOIN_ROOM_HIT:
      draft.joinRoomLoad = false;
      draft.joinRoomHit = true;
      break;
    case JOIN_ROOM_ERR:
      draft.joinRoomLoad = false;
      draft.joinRoomHit = false;
      draft.joinRoomErr = action.error;
      draft.chatRoomInfo = null;
      break;
    case LOAD_ROOMS_REQ:
      draft.loadRooms = true;
      break;
    case LOAD_ROOMS_HIT:
      draft.chatRooms = action.data;
      draft.loadRooms = false;
      break;
    case SEARCH_ROOMS:
      draft.filteredChatRooms = draft.chatRooms.filter(room => room.title.indexOf(action.data) !== -1);
      break;
    case RESET_SEARCH_ROOMS:
      draft.filteredChatRooms = [];
      break;
    case ADD_ROOM:
      draft.chatRooms.push(action.data);
      break;
    case DELETE_ROOM:
      draft.chatRooms = draft.chatRooms.filter(room => room.key !== action.data);
      break;
    case COUNT:
      const roomCountTarget = draft.chatRooms.find(room => room.key === action.data.key);
      if (roomCountTarget) roomCountTarget.count = action.data.count;
      break;

    case BUILD_CHAT_CHANNEL:
      draft.createRoomHit = false;
      draft.joinRoomHit = false;
      draft.aggros = [];
      break;

    case CLEAR_ROOM:
      draft.chatRoomInfo = null;
      draft.chatRoomUsers = [];
      draft.chats = [];
      draft.aggros = [];
      blockedUserSet.clear();
      break;
    case LOAD_ROOM_USERS:
      draft.chatRoomUsers = action.data;
      break;
    case JOIN_IN_ROOM:
      draft.chatRoomUsers.push(action.data);
      if (action.data.blocked) {
        draft.blockingUsers[action.data] = true;
      }
      action.data.type = 'join';
      draft.chats.push(action.data);
      break;
    case LEAVE_IN_ROOM:
      draft.chatRoomUsers = draft.chatRoomUsers.filter(el => el.userUID !== action.data.userUID);
      action.data.type = 'leave'
      draft.chats.push(action.data);
      break;

    case MERGE_BLOCKED_USERS:
      const blockedList = action.data;
      if (blockedList.length) {
        blockedList.map(el => {
          blockedUserSet.set(el, true);
          draft.blockingUsers[el] = true;
        });
      };
      break;
    case ADD_BLOCKED_USER:
      draft.blockingUsers[action.data] = true;
      break;
    case DEL_BLOCKED_USER:
      delete draft.blockingUsers[action.data];
      break;


    case CHAT:
      draft.chats = draft.chats.concat(action.data);
      break;
    case AGGRO:
      draft.aggros.unshift(action.data);
      draft.chats.push(action.data);
      break;
    case AGGRO_POINT:
      const target = draft.aggros.find(el => el.aggroUID === action.data.aggroUID);
      if (target) target.point = action.data.point;
      break;
    case AGGRO_ERR:
      draft.aggroErr = action.err;
      break;
    case CLEAR_AGGRO_ERR:
      draft.aggroErr = null;
      break;
    case STOP_AGGRO:
      const aggroClearTarget = draft.aggros.find(el => el.aggroUID === action.data);
      if (aggroClearTarget) aggroClearTarget.clear = true;
      break;
    case DELETE_AGGRO:
      draft.aggros = draft.aggros.filter(el => el.aggroUID !== action.data)
      break;

    case CHAT_MINE:
      draft.chats.push(action.data);
      break;
    case SEND_AGGRO_UP:
      const sendAggroUpTarget = draft.aggros.find(el => el.aggroUID === action.data);
      sendAggroUpTarget.pressedUp = true;
      break;
    case SEND_AGGRO_DOWN:
      const sendAggroDownTarget = draft.aggros.find(el => el.aggroUID === action.data);
      sendAggroDownTarget.pressedDown = true;
      break;
    default:
      break;
  }
});

export default chatReducer;