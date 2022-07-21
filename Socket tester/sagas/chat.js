import { buffers } from 'redux-saga';
import { all, call, flush, fork, put, take, throttle, delay } from 'redux-saga/effects'
import {
  BUILD_ROOM_CHANNEL, BUILD_CHAT_CHANNEL,
} from '../reducers/chat';
import {
  createRoomChannel, createChatChannel,
  createMsgChannel, createAggroPointChannel,
  leaveRoom, loadUsers,
  closeChannel,
} from '../socket/clientSocket';


function* buildRoomChannel(action) {
  try {
    if (!!action && action.roomId) {
      leaveRoom(action.roomId);
    };

    const roomChannel = yield call(createRoomChannel);

    yield fork(function* () {
      yield take('JOIN_ROOM_HIT');
      closeChannel(roomChannel);
    });
    yield fork(function* () {
      yield take('DISCONNECT_SOCKET');
      closeChannel(roomChannel);
    });

    while (true) {
      const eventMsg = yield take(roomChannel);
      yield put(eventMsg);
    }
  } catch (err) {

  }
};

function* buildChatChannel() {
  try {
    const chatChannel = yield call(createChatChannel, buffers.sliding(5));
    yield call(loadUsers);

    yield fork(function* () {
      yield take('BUILD_ROOM_CHANNEL');
      closeChannel(roomChannel);
    });
    yield fork(function* () {
      yield take('DISCONNECT_SOCKET');
      closeChannel(roomChannel);
    });


    while (true) {
      const eventMsg = yield take(chatChannel);
      yield put(eventMsg);
    };
  } catch (err) {
    console.error('Error in Build Chat Channel', err);
  }
};


function* buildMsgChannel() {
  try {
    const msgChannel = yield call(createMsgChannel, buffers.expanding(50));

    yield fork(function* () {
      yield take('BUILD_ROOM_CHANNEL');
      closeChannel(roomChannel);
    });
    yield fork(function* () {
      yield take('DISCONNECT_SOCKET');
      closeChannel(roomChannel);
    });

    while (true) {
      const messages = yield flush(msgChannel);

      if (messages.length) {
        yield put({ type: 'CHAT', data: messages });
      };
      yield delay(400);
    }
  } catch (err) {
    console.error('Error in Build MSG Channel', err);
  }
};


function* buildAggroPointChannel() {
  try {
    const aggroPointChannel = yield call(createAggroPointChannel, buffers.expanding(10));

    yield fork(function* () {
      yield take('BUILD_ROOM_CHANNEL');
      closeChannel(roomChannel);
    });
    yield fork(function* () {
      yield take('DISCONNECT_SOCKET');
      closeChannel(roomChannel);
    });

    while (true) {
      const points = yield flush(aggroPointChannel);

      if (points.length) {
        yield put({ type: 'AGGRO_POINT', data: points[points.length - 1] });
      };

      yield delay(500);
    }
  } catch (err) {
    console.error('Error in Build AggroPoint Channel', err);
  }
};


function* watchListenRooms() {
  yield throttle(500, BUILD_ROOM_CHANNEL, buildRoomChannel);
};

function* watchListenChats() {
  yield throttle(500, BUILD_CHAT_CHANNEL, buildChatChannel);
  yield throttle(500, BUILD_CHAT_CHANNEL, buildMsgChannel);
  yield throttle(500, BUILD_CHAT_CHANNEL, buildAggroPointChannel);
};


export default function* chatSaga() {
  yield all([
    fork(watchListenRooms),
    fork(watchListenChats),
  ])
} 