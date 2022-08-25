const socketIO = require('socket.io');
const shortid = require('shortid');

const { searchUser, loadChatRooms, createRoom, hibernateRoom, uploadAggro, } = require('./FB_dataService');

const fbRoom = new Map();   // 채팅 목록인거고
const aggroObj = new Object();
const CACHE_TTL = 500;
const AGGRO_TTL = 30000;

/**
 * @param {WebServer} server - Pass Express server instance 
 */
module.exports = (server) => {
  const io = socketIO(server, {
    path: '/jg',
    pingInterval: 45000,
    transport: ['websocket'],
  });
  const scheduleNsp = io.of(/^\/[\w]{20}$/);

  scheduleNsp.use(async (socket, next) => {
    const { userUID, displayName, photoURL } = socket.handshake.query;
    if (!userUID || !displayName) next(new Error('invalid access'));

    const result = await searchUser(socket.handshake.query);
    if (result) {
      socket.id = userUID;
      socket.userUID = userUID;
      socket.displayName = displayName;
      if (photoURL) socket.photoURL = photoURL;
      next();
    } else {
      console.log('Invalid Access #CE001', userUID)
      next(new Error('Connection denied'));
    };

    // for local dev
    // socket.id = userUID;
    // socket.userUID = userUID;
    // socket.displayName = displayName;
    // next();
  });

  scheduleNsp.on('connect', async (socket) => {
    socket.on('connect_error', err => {
      console.error('[Socket error]', err);
    });
    const namespace = socket.nsp.name.substr(1);
    console.log(`[CONNECTION]\t[${socket.id}] ${namespace}`);

    socket.join(namespace);
    let roomList = getRoomList(namespace);
    if (!!roomList) {
      scheduleNsp.to(socket.id).emit('loadRooms', roomList);
    };

    const sockets = socket.nsp.sockets;
    // const adapter = socket.adapter; //  .nsp; //=== socket.nsp
    const rooms = socket.adapter.rooms; // 현재 활성화 된 rooms => count 계산

    if (!fbRoom.has(namespace)) {
      const result = await loadChatRooms(namespace);

      if (result.code) {
        console.log('[Error] Load Rooms from RealtimeDatabase');
      } else {
        fbRoom.set(namespace, result);
        aggroObj[namespace] = new Object();
        console.log(`${namespace} Room Data load success.`);
      };
    };


    socket.on('loadRooms', () => {
      let roomList = getRoomList(namespace);
      if (!!roomList) {
        scheduleNsp.to(socket.id).emit('loadRooms', roomList);
      }
    });

    // Redis 적용 가능
    socket.on('loadUsers', () => {
      let userList = [];
      sockets.forEach(el => {
        if (el.rm === socket.rm) {
          userList.push({ userUID: el.userUID, displayName: el.displayName, photoURL: el.photoURL });
        }
      });

      scheduleNsp.to(socket.id).emit('loadUsers', userList);
    });

    /**
     * @param {object: { scheduleUID: string, title: string, password?: string, max : int }}
     */
    socket.on('createRoom', async (data) => {
      if (!data.scheduleUID || !data.title || data.max > 120) return;
      const { scheduleUID, title, password, max } = data;
      const result = await createRoom(scheduleUID, socket.userUID, title, password, max);

      if (result.key) {
        const roomData = {
          key: result.key,
          title,
          count: 0,
          max,
        };
        if (password) roomData.password = password;

        fbRoom.get(namespace).push(roomData);

        if (password) roomData.password = true;
        roomData.key = undefined;
        roomData.roomId = result.key;
        scheduleNsp.to(socket.id).emit('createRoomReq', { result: true, roomId: result.key, title, });
        socket.leave(namespace);
        socket.join(result.key);
        socket.rm = result.key;
        scheduleNsp.to(namespace).emit('addRoom', roomData);
      } else {
        scheduleNsp.to(socket.id).emit('createRoomReq', { result: false });
      }
    });

    /**
     * @param {object: { roomId: string, password?: string }}
     */
    socket.on('joinRoom', data => {
      if (!data) return;
      const targetRoom = fbRoom.get(namespace).find(el => el.roomId === data.roomId);
      const countsInRoom = rooms.get(data.roomId);

      if (!targetRoom) {
        scheduleNsp.to(socket.id).emit('joinRoomReq', { result: false, err: 'EJ001' });
        return;
      };

      if (countsInRoom) {
        targetRoom.count = countsInRoom.size;
        if (countsInRoom.size >= targetRoom.max) {
          scheduleNsp.to(socket.id).emit('joinRoomReq', { result: false, err: 'EJ002' });
          return;
        }
      };
      if (targetRoom.password !== data.password) {
        scheduleNsp.to(socket.id).emit('joinRoomReq', { result: false, err: 'EJ003' });
        return;
      };

      const user = {
        userUID: socket.userUID,
        photoURL: socket.photoURL,
      };
      if (socket.displayName) user.displayName = socket.displayName;

      socket.leave(namespace);
      socket.join(data.roomId);
      targetRoom.count++;

      socket.to(namespace).emit('count', { roomId: data.roomId, count: targetRoom.count });

      socket.rm = data.roomId;
      scheduleNsp.to(socket.id).emit('joinRoomReq', { result: true });
      scheduleNsp.to(data.roomId).emit('joinRoom', user);

      console.log('[JOIN]-rooms', rooms, '\n-clients', countsInRoom, new Date());
    });

    /**
     * @param {string} roomId
     */
    socket.on('leaveRoom', roomId => {
      if (!roomId) return;
      const exitUser = { userUID: socket.userUID, displayName: socket.displayName };
      socket.leave(roomId);
      scheduleNsp.to(roomId).emit('leaveRoom', exitUser);

      if (!!fbRoom.get(namespace)) {
        const targetRoom = fbRoom.get(namespace).find(el => el.roomId === roomId);
        const countsInRoom = rooms.get(roomId);
        if (countsInRoom) {
          if (targetRoom) targetRoom.count = countsInRoom.size;
        } else {
          if (targetRoom) {
            if (targetRoom.createdBy === 'admin') {
              targetRoom.count = 0;
              scheduleNsp.to(namespace).emit('count', { roomId, count: 0 });
              return;
            };
            const roomIndex = fbRoom.get(namespace).findIndex(el => el.roomId === roomId);
            fbRoom.get(namespace).splice(roomIndex, 1);
            hibernateRoom(namespace, roomId);
            socket.to(namespace).emit('deleteRoom', roomId);
          }
        };

        scheduleNsp.to(namespace).emit('count', { roomId, count: countsInRoom ? countsInRoom.size : 0 });

        socket.join(namespace);
        socket.rm = namespace;
        // console.log('[LEAVE]-rooms', rooms);
      }
    });

    /**
     * @param {string} reason - socket disconnection reasion
     *   io server disconnect  = The server forcefully disconnected the socket with socket.discconnect()
     *   io client disconnect = The socket was manually disconnected using socket.disconnect()
     *   ping timeout = The server did not respond in the pingTimeout range
     *   transport close  = The conneciton was closed (example : the user has lost conneciton, or the network was changed from WIFI to 4g)
     *   transport error = The connection has encounterd an error (example: trhe server was killed during HTTP long-polling cycle)
     */
    socket.on('disconnect', reason => {
      if (socket.rm === namespace) return;
      const exitUser = { userUID: socket.userUID, displayName: socket.displayName };
      socket.to(socket.rm).emit('leaveRoom', exitUser);

      const targetNsp = fbRoom.get(namespace);
      if (targetNsp) {
        const targetRoom = targetNsp.find(el => el.roomId === socket.rm);
        const countsInRoom = rooms.get(socket.rm);
        if (countsInRoom) {
          if (targetRoom) targetRoom.count = countsInRoom.size
        } else {
          if (targetRoom) {
            if (targetRoom.createdBy === 'admin') {
              targetRoom.count = 0;
              socket.to(namespace).emit('count', { roomId: socket.rm, count: 0 })
              return;
            } else {
              const roomIndex = targetNsp.findIndex(el => el.roomId === socket.rm);
              fbRoom.get(namespace).splice(roomIndex, 1);
              hibernateRoom(namespace, roomId);
              socket.to(namespace).emit('deleteRoom', roomId);
            }
          }
        }
      }

      console.log(`[DISCONNECTION] NSP // UID ${namespace} // ${socket.userUID} \n REASON: ${reason} :: ${new Date()}`);
      delete socket.rm;
      delete socket.displayName;
      delete socket.userUID;
      if (socket.photoURL) delete socket.photoURL;
    });

    /**
     * @param {object: {
     *  type: string,
     *  titleBroad: string,
     *  msg : string,
     *  userUID: string,
     *  displayName: string,
     *  roomId : string,
     * }}
     */
    socket.on('chat', data => {
      if (socket.rm !== data.roomId || socket.rm === namespace) return;
      console.log('[CHAT] socket.rm', socket.rm, '\t NSP: ', namespace, '\t', data,);

      if (data.type === 'N') {
        socket.to(data.roomId).emit('chat', data);
        return;
      }

      if (!data.titleBroad || !data.msg) return;
      const target = aggroObj[namespace][data.roomId];

      if (!target) {
        const aggroUID = aggroInitializer(namespace, data.roomId, data.userUID, data.titleBroad);
        data.aggroUID = aggroUID;
        if (socket.photoURL) data.photoURL = socket.photoURL;

        delete data.titleBroad;
        scheduleNsp.to(data.roomId).emit('aggro', data);

        aggroBreaker(scheduleNsp, namespace, data);
        return;
      }

      socket.to(socket.id).emit('aggroErr', 'EA001');
      return;
    });


    // 과부하 방지를 위해 500ms 주기로 전송~~
    /**
     * @param {string} aggroUID
     */
    socket.on('aggroUp', async aggroUID => {
      if (socket.rm === namespace) return;
      const target = aggroObj[namespace][socket.rm];
      if (!target || aggroUID !== target.aggroUID) return;

      if (target && target.queing) {
        target.point++;
      } else if (target && !target.queing) {
        target.point++;
        target.queing = true;
        await timerSender(scheduleNsp, namespace, socket.rm, aggroUID);
      }
    });

    /**
     * @param {string} aggroUID
     */
    socket.on('aggroDown', async aggroUID => {
      if (socket.rm === namespace) return;
      const target = aggroObj[namespace][socket.rm];
      if (!target || aggroUID !== target.aggroUID) return;

      if (target && target.queing) {
        target.point--;
      } else if (target && !target.queing) {
        target.point--;
        target.queing = true;
        await timerSender(scheduleNsp, namespace, socket.rm, aggroUID);
      };
    });
  });
};


/**
 * @param {string} namespace 
 * @returns {Arrray} 현재 네임스페이스의 활성화된 채팅방 목록
 */
const getRoomList = (namespace) => {
  let roomList = [];
  if (fbRoom.get(namespace)) {
    fbRoom.get(namespace).map(el => {
      const roomData = {
        roomId: el.roomId,
        title: el.title,
        max: el.max,
        count: el.count,
      }
      if (el.password) { roomData.password = true };
      roomList.push(roomData);
    });

    return roomList;
  }
};

/**
 * @param {string} namespace 
 * @param {string} roomId 
 * @param {string} userUID 
 * @param {string} titleBroad 
 * @returns {string} aggroUID
 */
const aggroInitializer = (namespace, roomId, userUID, titleBroad) => {
  const aggroUID = shortid.generate();

  aggroObj[namespace][roomId] = {
    aggroActive: true,
    aggroUID,
    aggroer: userUID,
    point: 0,
    titleBroad,
    queing: false,
  };

  return aggroUID;
};

/**
 * @param {string} scheduleNsp 
 * @param {string} namespace 
 * @param {object: {
 *  userUID: string,
 *  msg : string,
 *  titleBroad : string,
 *  point: int
 * }} data 
 */
const aggroBreaker = (scheduleNsp, namespace, data) => {
  setTimeout(() => {
    scheduleNsp.to(data.roomId).emit('stopAggro', data.aggroUID);
    const target = aggroObj[namespace][data.roomId];
    uploadAggro(data.userUID, data.msg, target.titleBroad, target.point);

    delete aggroObj[namespace][data.roomId];
  }, AGGRO_TTL);
};

/**
 * @param {string} scheduleNsp 
 * @param {string} namespace 
 * @param {string} roomId 
 * @param {string} aggroUID 
 */
const timerSender = async (scheduleNsp, namespace, roomId, aggroUID) => {
  setTimeout(() => {
    const target = aggroObj[namespace][roomId];
    if (target) {
      target.queing = false;
      scheduleNsp.to(roomId).emit('aggroPoint', { aggroUID, point: target.point });
    }
  }, CACHE_TTL)
};
