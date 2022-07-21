import React, { useCallback, useEffect, useState } from 'react';

import { Button, Comment, Input, Layout, List, Select, Table } from 'antd';
import { useDispatch, useSelector } from 'react-redux';

import {
  connectSocket, disconnect,
  joinRoom, leaveRoom, sendMsg,
  socket, getUserList, loadRooms,
  countUp, countDown,
} from '../socket/clientSocket';
import { BUILD_CHAT_CHANNEL, BUILD_MSG_CHANNEL, BUILD_ROOM_CHANNEL, DISCONNECT_SOCKET, JOIN_ROOM_REQ, } from '../reducers/chat';
import Checkbox from 'antd/lib/checkbox/Checkbox';

const { Sider, Content } = Layout;
const { Option } = Select;

const Home = () => {
  const dispatch = useDispatch();
  const [scheduleUID, setScheduleUID] = useState('');
  const [term, setTerm] = useState('');

  const [currentType, setCurrentType] = useState('N');

  const [displayName, setDisplayName] = useState('testing');
  const [userUID, setUserUID] = useState('tester');

  const [roomId, setRoomId] = useState('');
  const [password, setPassword] = useState(null);

  const [title, setTitle] = useState('');
  const [broadcastor, setBroadcastor] = useState('');


  const { socketActive, roomUser, ableSendMsg, currentRoomId, rooms, joinRoomHit,
    chats, aggros } = useSelector(state => state.chat);

  useEffect(() => {
    if (joinRoomHit) {
      console.log('이거를 만드는거야')
      dispatch({
        type: BUILD_CHAT_CHANNEL,
      });
      dispatch({
        type: BUILD_MSG_CHANNEL,
      })
    }
  }, [joinRoomHit])

  const onClickConnect = useCallback(() => {
    if (!scheduleUID || !userUID || !displayName) return;
    connectSocket(userUID, displayName, scheduleUID);
    dispatch({
      type: BUILD_ROOM_CHANNEL,
    });
  }, [userUID, displayName, scheduleUID]);

  const onClickDisconnect = useCallback(() => {
    dispatch({
      type: DISCONNECT_SOCKET,
    });
    disconnect();
  }, []);

  const onClickJoin = useCallback(() => {
    joinRoom({ roomId, password });
    dispatch({
      type: JOIN_ROOM_REQ,
      data: { roomId, password }
    })
  }, [roomId, password]);

  // leave 가 사실상 따로 없고, 다른 방에 접속하면 끊기고 연결됨
  const onClickLeave = useCallback(() => {
    leaveRoom(currentRoomId);
    dispatch({
      type: BUILD_ROOM_CHANNEL,
      roomId: currentRoomId,
    });
  }, [currentRoomId]);

  const onClickLoadRooms = useCallback(() => {
    console.log('load Rooms from ', scheduleUID);
    loadRooms();
  }, [scheduleUID]);

  const onClickSend = useCallback(() => {
    console.log('send term', term);

    if (socket) {
      if (currentType === 'A') {
        socket.emit('chat', {
          type: currentType,
          titleBroad: title + '_' + broadcastor,
          msg: term, userUID: userUID, displayName, roomId: currentRoomId
        });
      } else {
        socket.emit('chat', { type: currentType, msg: term, userUID: userUID, displayName, roomId: currentRoomId });
      }
    }

    setTerm('');
  }, [term, socket, currentType, displayName]);


  const onClickUserList = useCallback(() => {
    getUserList(roomId)
  }, [roomId])

  const onToggleItem = useCallback((item) => {
    console.log('체크를', item);
    setCurrentType(item);
  }, []);


  const onPressCountUp = useCallback((aggroUID) => {
    if (!aggroUID) return;
    countUp(aggroUID);
  }, []);

  const onPressCountDown = useCallback((aggroUID) => {
    if (!aggroUID) return;
    countDown(aggroUID);
  }, []);


  const columns = [
    {
      title: 'Room Id',
      dataIndex: 'roomId',
      key: 'roomId',
      render: (text) => <h4>{text}</h4>,
    },
    {
      title: '제목',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '현재 인원',
      dataIndex: 'count',
      key: 'count',
    },
    {
      title: '최대 인원',
      dataIndex: 'max',
      key: 'max',
    },
  ];

  return (
    <>

      <Layout>
        <div style={{ background: 'orange', padding: 4, }}>

          <div style={{ display: 'flex', flexDirection: 'row', padding: 4 }}>
            <h4>Title</h4>
            <Input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
            <h4>Broad</h4>
            <Input placeholder="Broadcastor" value={broadcastor} onChange={e => setBroadcastor(e.target.value)} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'row', padding: 4 }}>
            <h4>Schedule UID</h4>
            <Input placeholder="Schedule UID" value={scheduleUID} onChange={e => setScheduleUID(e.target.value)}
              style={{ maxWidth: '15vh' }}
            />
            <h4>User UID</h4>
            <Input placeholder="User UID" value={userUID} onChange={(e) => { setUserUID(e.target.value) }}
              style={{ maxWidth: '18vh' }}
            />
            <h4>Name</h4>
            <Input placeholder="Display Name" value={displayName} onChange={(e) => setDisplayName(e.target.value)}
              style={{ maxWidth: '18vh' }}
            />
            <Button type="primary" onClick={onClickConnect} >Connect</Button>
            <Button type="defalt" onClick={onClickDisconnect} disabled={!socketActive}>Disconnect</Button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'row', padding: 4 }}>
            <h4>RoomId</h4>
            <Input placeholder="room UID 입력" value={roomId}
              onChange={e => setRoomId(e.target.value)} />
            <h4>Password</h4>
            <Checkbox checked={password} style={{ visibility: 'hidden' }} />
            <Input placeholder="password" value={password}
              onChange={e => setPassword(e.target.value)} />

            <Button type="primary" onClick={onClickJoin}>JOIN</Button>
            <Button type="defalt" onClick={onClickLeave}>LEAVE</Button>
          </div>

        </div>

        <Layout style={{ minHeight: '100vh' }}>
          {currentRoomId
            ?
            <>
              <Sider style={{ background: 'grey' }}>
                <div style={{ display: 'flex' }}>
                  <Button type="default" onClick={onClickUserList} >유저 불러오기</Button>
                  {socketActive && currentRoomId ? <p>O</p> : <p>X</p>}
                </div>
                현재 인원 : {roomUser.length}

                {roomUser.length > 0
                  ?
                  <List
                    className="RoomUser-list"
                    itemLayout="horizontal"
                    dataSource={roomUser}
                    renderItem={item => (
                      <li>
                        <Comment
                          author={item.userUID}
                          content={item.displayName}
                        />
                        <br />
                      </li>
                    )}
                  />
                  : <h2>채팅방에 접속하세요</h2>}
              </Sider>
              <Content>
                <div style={{ display: 'flex', flexDirection: 'row', margin: 4 }}>
                  <Select defaultValue="N" style={{ width: 120 }} onChange={onToggleItem} >
                    <Option value="N">Normal</Option>
                    <Option value="A">Aggro</Option>
                    <Option value="AP">Aggro+</Option>
                  </Select>
                  <Input.TextArea
                    disabled={!ableSendMsg}
                    placeholder="메시지" value={term} autoSize rows={4} onChange={e => setTerm(e.target.value)} style={{ marginLeft: 4, marginRight: 4 }} />
                  <Button type="primary" onClick={onClickSend} >전송</Button>
                </div>

                <div className="chat-box" style={{ margin: 4, background: 'white' }}>
                  <div id="aggros">
                    {aggros.map(el => {

                      return (
                        <div style={{ display: 'flex', flexDirection: 'row', margin: 4, background: 'yellow' }}>
                          {el.msg} {'\t'}
                          <Button type="primary" onClick={() => onPressCountUp(el.aggroUID)}>UP</Button>
                          <Button type="default" onClick={() => onPressCountDown(el.aggroUID)}>DOWN</Button>
                          {'\t'}
                          <h4>{el.point}</h4>
                          {el.aggroUID} - {el.userUID}
                          {/* 바로바로 안돌아가면 그냥 막혀버림 이거 어떻게하면 좋니? */}
                        </div>
                      )
                    })}
                  </div>
                  <div id="msgs">
                    {chats.map(el => {

                      return (
                        <p>{el.msg}</p>
                      )
                    })
                    }
                  </div>
                </div>
              </Content>
            </>
            : <>
              <Content >
                {socketActive
                  ?
                  <>
                    <Button type="primary" onClick={onClickLoadRooms}>채팅방 불러오기</Button>
                    <br />
                    <Table columns={columns} dataSource={rooms} style={{ margin: 8, }} key={rooms.roomId} />

                  </>
                  : <h2>연결부터 먼저하세요</h2>
                }
              </Content>
            </>
          }

        </Layout>
      </Layout>
    </>

  )
};

export default Home;




/*
J7TnsN504n4WpNJNtAVb
*/