import { buffers } from 'redux-saga';
import { fork, call, take, takeEvery, put, all, throttle, delay, flush } from 'redux-saga/effects';
import {
  SOCKET_CONNECT_REQ, SOCKET_CONNECT_ERR, SOCKET_CONNECT_HIT, SOCKET_CONNECT_CANCEL,
  LOAD_ROOMS_REQ,
  CREATE_ROOM_REQ,
  JOIN_ROOM_REQ,
  BUILD_ROOM_CHANNEL, BUILD_CHAT_CHANNEL,
} from '../reducers/chat';
import {
  createChannel, destroySocket,
  createRoomChannel, createChatChannel,
  createMsgChannel, createAggroPointChannel,
  closeChannel,
  createRoomFunc, joinRoomFunc, leaveRoomFunc,
  loadRoomFunc,
  loadUsersFunc,
} from '../socket/createSocketChannel';

function* buildSocket(action) {
  try {
    destroySocket();
    const channel = yield call(createChannel, action.data);

    yield fork(function* () {
      yield take(SOCKET_CONNECT_CANCEL);
      destroySocket();
    });

    while (true) {
      const eventMsg = yield take(channel);
      yield put(eventMsg);
    }
  } catch (err) {
    yield put({
      type: SOCKET_CONNECT_ERR,
      error: '서버에 접속할 수 없습니다.\n잠시 후 다시 시도해주세요.',
    })
  }
}

function* createRoom(action) {
  yield call(createRoomFunc, action.data);
}
function* refreshRooms() {
  yield call(loadRoomFunc);
}

function* listenRoom(action) {
  try {
    if (action.roomId) {
      leaveRoomFunc(action.roomId);
    }
    const channel = yield call(createRoomChannel, buffers.expanding(50));

    yield fork(function* () {
      yield take('BUILD_MSG_CHANNEL');
      closeChannel(channel);
    });

    while (true) {
      const eventMsg = yield take(channel);
      yield put(eventMsg);
    }
  } catch (err) {
  }
};

function* joinRoom(action) {
  const { roomId, password } = action.data;
  yield call(joinRoomFunc, { roomId, password });
};

function* listenChat() {
  try {
    const channel = yield call(createChatChannel, buffers.sliding(5));

    yield call(loadUsersFunc);
    yield fork(function* () {
      yield take('BUILD_ROOM_CHANNEL');
      closeChannel(channel);
    });
    yield fork(function* () {
      yield take('SOCKET_CONNECT_HIT');
      closeChannel(channel);
    });

    while (true) {
      const eventMsg = yield take(channel);
      yield put(eventMsg);
    }
  } catch (err) {
  };
};

function* listenMsg() {
  try {
    const msgChannel = yield call(createMsgChannel, buffers.expanding(50));

    yield fork(function* () {
      yield take('BUILD_ROOM_CHANNEL');
      closeChannel(msgChannel);
    });
    yield fork(function* () {
      yield take('SOCKET_CONNECT_HIT');
      closeChannel(msgChannel);
    });

    while (true) {
      const messages = yield flush(msgChannel);

      if (messages.length) {
        yield put({ type: 'CHAT', data: messages });
      }
      yield delay(400);
    }
  } catch (err) {
  }
};

function* listenAggroPoint() {
  try {
    const aggroPointChannel = yield call(createAggroPointChannel, buffers.expanding(10));

    yield fork(function* () {
      yield take('BUILD_ROOM_CHANNEL');
      closeChannel(aggroPointChannel);
    });
    yield fork(function* () {
      yield take('SOCKET_CONNECT_HIT');
      closeChannel(aggroPointChannel);
    });

    while (true) {
      const points = yield flush(aggroPointChannel);

      if (points.length) {
        yield put({ type: 'AGGRO_POINT', data: points[points.length - 1] });
      };
      yield delay(500);
    }
  } catch (err) {
  }
};

function* watchBuildConnection() {
  yield throttle(2000, SOCKET_CONNECT_REQ, buildSocket);
};
function* watchCreateRoom() {
  yield throttle(2000, CREATE_ROOM_REQ, createRoom);
};
function* watchRefreshRooms() {
  yield throttle(1600, LOAD_ROOMS_REQ, refreshRooms);
};
function* watchListenRoom() {
  yield takeEvery([SOCKET_CONNECT_HIT, BUILD_ROOM_CHANNEL], listenRoom);
};
function* watchJoinRoom() {
  yield throttle(2000, JOIN_ROOM_REQ, joinRoom);
};
function* watchListenChat() {
  yield throttle(500, BUILD_CHAT_CHANNEL, listenChat);
  yield throttle(500, BUILD_CHAT_CHANNEL, listenMsg);
  yield throttle(500, BUILD_CHAT_CHANNEL, listenAggroPoint);
};


export default function* chatSaga() {
  yield all([
    fork(watchBuildConnection),
    fork(watchCreateRoom),
    fork(watchRefreshRooms),
    fork(watchListenRoom),
    fork(watchJoinRoom),
    fork(watchListenChat),
  ])
};