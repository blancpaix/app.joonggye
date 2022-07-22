import { eventChannel, buffers } from 'redux-saga';
import socketIO from 'socket.io-client';

import firestore from '@react-native-firebase/firestore';


const ERR_CODE = (code) => {
  switch (code) {
    case 'EJ001':
      return '채팅방이 존재하지 않습니다.';
    case 'EJ002':
      return '허용 인원을 초과하였습니다.';
    case 'EJ003':
      return '비밀번호가 일치하지 않습니다';
    case 'EA001':
      return '어그로를 끌기에 늦었습니다.';
    default:
      return '실패하였습니다.';
  }
};

// 방송중인 프로그램 실시간 업데이트
export const createScheduleChannel = () => {
  const scheduleRef = firestore().collection('onAir').orderBy('endAt')

  return eventChannel(emit => {
    scheduleRef.onSnapshot({ includeMetadataChanges: false }, snapshot => {
      if (snapshot) {
        const changeSet = snapshot.docChanges().map(change => {
          switch (change.type) {
            case 'added':
              return Object.assign({ scheduleId: change.doc.id }, change.doc.data());
            case 'removed':
              return change.doc.id;
            default:
              break;
          }
        });

        if (snapshot.docChanges().length == 0) return;
        if (snapshot.docs.length === snapshot.docChanges().length) {
          emit({ type: 'LOAD_SCHEDULE_HIT', data: changeSet });
        } else {
          let addPrograms = changeSet.filter(el => el.hasOwnProperty('broadcastor'));
          let delPrograms = changeSet.filter(el => !el.hasOwnProperty('broadcastor'));
          if (addPrograms.length > 0) {
            emit({ type: 'ADD_PROGRAMS', data: changeSet });
            addPrograms = null;
          }
          if (delPrograms.length > 0) {
            emit({ type: 'DELETE_PROGRAMS', data: changeSet });
            delPrograms = null;
          }
        }
      }
    });

    return () => scheduleRef;
  })
};

const SOCKET_SERVER = 'https://www.joonggye.live'
// const LOCAL_SERVER = 'http://10.0.2.2:3000';

export let socket;

export const destroySocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export function closeChannel(channel) {
  if (channel) channel.close();
};

const defaultMatcher = () => true;

// called when user press the on-air program
export const createChannel = (data, buffer, matcher) => {
  const { namespace, userUID, displayName, photoURL, phoneNumber } = data;
  socket = socketIO(`${SOCKET_SERVER}/${namespace}`, {
    path: '/jg',
    transports: ['websocket'],
    query: {
      userUID,
      displayName,
      photoURL,
      phoneNumber,
    },
    timeout: 10000,
    rejectUnauthorized: true
  });

  return eventChannel(emit => {
    const emitter = data => emit(data);
    const handler = (type, data) => {
      return emit({ type, data })
    }

    socket.on('connect', () => handler('SOCKET_CONNECT_HIT', { namespace, userUID }));
    socket.on('disconnect', (reason) => {
      if (reason === 'io server disconnect') {
        socket.connect();
      }
    });
    socket.on('system', emitter);
    socket.on('connect_error', emitter);
    socket.on('insufficient', () => handler('SOCKET_CONNECT_CANCEL'));
    socket.on('loadRooms', data => handler('LOAD_ROOMS_HIT', data));

    return function unsubscribe() {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('system');
      socket.off('connect_error');
      socket.off('insufficient');
      socket.off('loadRooms');
    }
  }, buffer || buffers.none(), matcher || defaultMatcher);
};

export const createRoomChannel = (buffer, matcher) => {

  return eventChannel(emit => {
    const handler = (type, data) => {
      return emit({ type, data });
    };
    const joinHandler = (data) => {
      if (data.result) {
        return emit({ type: 'JOIN_ROOM_HIT' })
      } else {
        return emit({ type: 'JOIN_ROOM_ERR', error: ERR_CODE(data.err) })
      }
    };
    const createRoomHandler = (data) => {
      if (data.result) {
        return emit({ type: 'CREATE_ROOM_HIT', data: data.roomId });
      } else {
        return emit({ type: 'CREATE_ROOM_ERR', error: '채팅방을 생성할 수 없습니다.' });
      }
    };

    socket.on('count', data => handler('COUNT', data));
    socket.on('addRoom', data => handler('ADD_ROOM', data));
    socket.on('createRoomReq', data => createRoomHandler(data));
    socket.on('deleteRoom', data => handler('DELETE_ROOM', data));
    socket.on('joinRoomReq', data => joinHandler(data));

    return function unsubscribe() {
      socket.off('count');
      socket.off('addRoom');
      socket.off('createRoomReq');
      socket.off('deleteRoom');
      socket.off('joinRoomReq');
    }
  }, buffer || buffers.none(), matcher || defaultMatcher)
}

// 현재 채팅방의 차단된 유저 목록
export const blockedUserSet = new Map();

export const createChatChannel = (buffer, matcher) => {

  return eventChannel(emit => {
    const handler = (type, data) => {
      return emit({ type, data })
    };

    const blockerEmitter = (type, data) => {
      if (blockedUserSet.size) {
        if (blockedUserSet.has(data.userUID)) return;
      } else {
        data.point = 0;
        return emit({ type, data });
      }
    };

    const joinRoomHandler = (type, data) => {
      if (blockedUserSet.size) {
        if (blockedUserSet.has(data.userUID)) {
          emit({ type, data: { ...data, blocked: true } })
        } else {
          emit({ type, data });
        }
      }
    };

    const aggroClearHandler = (data) => {
      emit({ type: 'STOP_AGGRO', data });
      setTimeout(() => {
        emit({ type: 'DELETE_AGGRO', data })
      }, 3000);
    };

    socket.on('joinRoom', data => joinRoomHandler('JOIN_IN_ROOM', data));
    socket.on('leaveRoom', data => handler('LEAVE_IN_ROOM', data));
    socket.on('aggro', data => blockerEmitter('AGGRO', data));
    socket.on('stopAggro', data => aggroClearHandler(data));
    socket.on('deleteAggro', data => handler('DELETE_AGGRO', data));
    socket.on('loadUsers', data => handler('LOAD_ROOM_USERS', data));
    socket.on('aggroErr', err => emit({ type: 'AGGRO_ERR', err: ERR_CODE(err) }));

    return function unsubscribe() {
      socket.off('joinRoom');
      socket.off('leaveRoom');
      socket.off('aggro');
      socket.off('stopAggro');
      socket.off('deleteAggro');
      socket.off('loadUsers');
      socket.off('aggroErr');
    }
  }, buffer || buffers.none(), matcher || defaultMatcher)
};

export const createMsgChannel = (buffer, matcher) => {

  return eventChannel(emit => {
    const blockerEmitter = data => {
      if (blockedUserSet.size) {
        if (blockedUserSet.has(data.userUID)) return;
      } else {
        emit(data);
      }
    }
    socket.on('chat', blockerEmitter);

    return function unsubscribe() {
      socket.off('chat');
    }
  }, buffer || buffers.none(), matcher || defaultMatcher)
};

export const createAggroPointChannel = (buffer, matcher) => {
  return eventChannel(emit => {
    socket.on('aggroPoint', emit);

    return function unsubscribe() {
      socket.off('aggroPoint');
    }
  }, buffer || buffers.none, matcher || defaultMatcher);
};


export function loadRoomFunc() {
  if (!socket.connected) return;
  socket.emit('loadRooms');
};

// data : { scheduleUID, title, max, [password]}
export function createRoomFunc(data) {
  if (!socket.connected) return;
  socket.emit('createRoom', data)
};

// data: { roomId, password }
export function joinRoomFunc(data) {
  if (!socket.connected) return;
  if (!data.password) delete data.password;
  socket.emit('joinRoom', data);
};

export function loadUsersFunc() {
  if (!socket.connected) return;
  socket.emit('loadUsers');
};

export function leaveRoomFunc(roomUID) {
  if (!socket.connected) return;
  socket.emit('leaveRoom', roomUID);
};

// message : { type, roomId, msg, userUID, }
export function sendMsg(message) {
  if (!socket.connected) return;
  socket.emit('chat', message);
};

export function sendAggroUp(aggroUID) {
  if (!socket.connected) return;
  socket.emit('aggroUp', aggroUID);
};
export function sendAggroDown(aggroUID) {
  if (!socket.connected) return;
  socket.emit('aggroDown', aggroUID);
};