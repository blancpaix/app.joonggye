import socketIO from 'socket.io-client';
import { buffers, eventChannel } from 'redux-saga';

export let socket;

export const connectSocket = (userUID, displayName, scheduleUID) => {
  console.log('userUID, ', userUID, displayName, scheduleUID);
  let photoURL = null;

  socket = socketIO.connect(`ws://localhost:3000/${scheduleUID}`, {
    path: '/jg',
    transports: ['websocket'],
    query: {
      userUID,
      displayName,
      photoURL,
    },
    timeout: 6000,
  });

  socket.on('connect_error', err => {
    console.log('connect_err??', err);
  });

  // console.log('socket?/', socket);
  // socket =>_callbacks => eventListener  $connect $receiving
  // 끊었다가 채널을 고대로 다시 연결하면 채널은 유지가 되고있는가??? 그게 의문임
}


const defaultMatcher = () => true;

export const createRoomChannel = (buffer, matcher) => {

  return eventChannel(emit => {
    const handler = (type, data) => {
      console.log('type : ', type, ' // data : ', data);
      return emit({ type, data })
    };
    const joinHandler = (data) => {
      if (data.result) {
        return emit({ type: 'JOIN_ROOM_HIT' });
      } else {
        return emit({ type: 'JOIN_ROOM_ERR', error: data.err });
      }
    };

    // socket.on(eventType, emitter);
    socket.on('loadRooms', data => handler('LOAD_ROOMS', data));
    socket.on('joinRoomReq', joinHandler);
    socket.on('addRoom', data => handler('ADD_ROOM', data));
    socket.on('deleteRoom', data => handler('DELETE_ROOM', data));
    socket.on('count', data => handler('COUNT', data));

    return function unsubscribe() {
      socket.off('loadRooms');
      socket.off('joinRoomReq');
      socket.off('addRoom');
      socket.off('deleteRoom');
      socket.off('count');
    };
  }, buffer || buffers.none(), matcher || defaultMatcher);
};

export const createChatChannel = (buffer, matcher) => {

  return eventChannel(emit => {
    const handler = (type, data) => {
      console.log('이번에 들어온 데이터? ', type, " : ", data);
      return emit({ type, data });
    };
    const clearAggroHandler = data => {
      emit({ type: 'STOP_AGGRO', data });
      // setTimeout(() => {
      //   console.log('이거는 왜 안돌아가는기야?, DELETE_AGGRO!!!');
      //   emit({ type: 'DELETE_AGGRO', data });
      // }, 3000)
    }

    socket.on('loadUsers', data => handler('LOAD_ROOM_USERS', data));
    socket.on('joinRoom', data => handler('JOIN_IN_ROOM', data));
    socket.on('leaveRoom', data => handler('LEAVE_IN_ROOM', data));

    socket.on('aggro', data => handler('AGGRO', data));
    socket.on('stopAggro', data => clearAggroHandler(data));
    socket.on('deleteAggro', data => handler('DELETE_AGGRO', data));

    socket.on('aggroUp', data => handler('AGGRO_UP', data));
    socket.on('aggroDown', data => handler('AGGRO_DOWN', data));
    socket.on('aggroErr', err => emit({ type: 'AGGRO_ERR', err: '늦음' }));

    return function unsubscribe() {
      socket.off('loadUsers');
      socket.off('joinRoom');
      socket.off('leaveRoom');

      socket.off('aggro');
      socket.off('stopAggro');
      socket.off('deleteAggro');

      socket.off('aggroUp');
      socket.off('aggroDown');
      socket.off('aggroErr');
    }
  }, buffer || buffer.none(), matcher || defaultMatcher);
};

export const createMsgChannel = (buffer, matcher) => {
  return eventChannel(emit => {
    socket.on('chat', emit);

    return function unsubscribe() {
      socket.off('chat');
    };
  }, buffer || buffer.none(), matcher || defaultMatcher);
};

export const createAggroPointChannel = (buffer, matcher) => {
  return eventChannel(emit => {
    socket.on('aggroPoint', emit);

    return function unsubscribe() {
      socket.off('aggroPoint');
    }
  }, buffer || buffers.none, matcher || defaultMatcher);
};


export const disconnect = () => {
  socket.disconnect();
};
export const loadRooms = () => {
  if (!socket.connected) return;
  console.log('이거는 나가는데??');
  socket.emit('loadRooms');
}

// param : roomUID 하나밖에 없음
export const joinRoom = (data) => {
  if (!data.password) delete data.password;
  socket.emit('joinRoom', data);
};
export const loadUsers = () => {
  if (!socket.connected) return;
  socket.emit('loadUsers');
};

export const leaveRoom = (data) => {
  if (!socket.connected) return;
  socket.emit('leaveRoom', data);
};



export const sendMsg = (data) => {
  let type = 'N';
  socket.emit('chat', { type, msg: data, userUID: 'userUIDsample', displayName: '테스트1' })
};

// data : aggroUID
export const countUp = (data) => {
  if (!socket.connected) return;
  socket.emit('aggroUp', data);
};

export const countDown = data => {
  if (!socket.connected) return;
  socket.emit('aggroDown', data);
}

export const getUserList = (data) => {
  socket.emit('loadUsers', data);
};

export function closeChannel(channel) {
  if (channel) channel.close();
}
