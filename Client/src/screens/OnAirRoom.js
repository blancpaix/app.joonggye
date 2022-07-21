import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, RefreshControl, ScrollView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import {
  SOCKET_CONNECT_INIT, SOCKET_DISCONNECTED, LOAD_ROOMS_REQ,
} from '../reducers/chat';

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import duration from 'dayjs/plugin/duration';
dayjs.extend(relativeTime);
dayjs.extend(duration);

import CreateRoomOverlay from '../components/OnAirRoom/CreateRoomOverlay';
import ProgramInfoBox from '../components/OnAirRoom/ProgramInfoBox';
import RoomsManager from '../components/OnAirRoom/RoomsManager';
import TimeManager from '../components/OnAirRoom/TimeManager';
import { socket } from '../socket/createSocketChannel';

const OnAirRoom = ({ navigation }) => {
  const dispatch = useDispatch();
  const { pickedProgram } = useSelector(state => state.program);
  const { socketConnHit, loadRooms } = useSelector(state => state.chat);

  const [now, setNow] = useState(dayjs());
  const [startTime] = useState(dayjs(pickedProgram.startAt.toDate()));
  const [endTime] = useState(dayjs(pickedProgram.endAt.toDate()));
  const [programDuration] = useState(endTime.diff(startTime, 'm'));
  const [playingTime, setPlayingTime] = useState(now.diff(startTime, 'm'));
  const [disabled, setDisabled] = useState(false);
  const [disconnected, setDisconnected] = useState(false);

  const timer = useRef();

  useEffect(() => {
    if (socket.disconnected && !disconnected) {
      setDisconnected(true);
      Alert.alert('서버와의 연결이 끊어졌습니다.');
      dispatch({
        type: SOCKET_DISCONNECTED
      });
      navigation.pop(2);
    }
  }, [socket, disconnected])

  useEffect(() => {
    if (socketConnHit) {
      dispatch({
        type: SOCKET_CONNECT_INIT,
      });
    }
  }, [socketConnHit]);

  useEffect(() => {
    if (programDuration + 5 < playingTime) {
      setDisabled(true);
      Alert.alert('프로그램 중계가 종료되었습니다', '', [{
        text: '확인',
        onPress: () => navigation.pop(),
      }])
    }
  }, [programDuration, playingTime])

  useEffect(() => {
    if (playingTime > programDuration) return;
    timer.current = setInterval(updateTime, 60000);
    return () => clearInterval(timer.current)
  }, []);

  const updateTime = useCallback(() => {
    const timeNow = dayjs();
    setNow(timeNow);
    setPlayingTime(timeNow.diff(startTime, 'm'));
  }, [startTime])

  const onPressLoadRooms = useCallback(() => {
    dispatch({
      type: LOAD_ROOMS_REQ
    });
  }, []);

  return (
    <>
      <ScrollView contentContainerStyle={{ marginBottom: 50 }}
        refreshControl={<RefreshControl refreshing={loadRooms} onRefresh={onPressLoadRooms} />}
      >
        <ProgramInfoBox data={pickedProgram} navi={navigation} />
        <TimeManager time={{ startTime, endTime, programDuration }} playingTime={playingTime} />
        <RoomsManager navi={navigation} disabled={disabled} />
      </ScrollView>
      <CreateRoomOverlay data={pickedProgram} navi={navigation} disabled={disabled} />
    </>
  )
};

export default OnAirRoom;