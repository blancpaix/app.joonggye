import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import {
  SEARCH_ROOMS, RESET_SEARCH_ROOMS, BUILD_CHAT_CHANNEL,
  CLEAR_ROOM, JOIN_ROOM_REQ,
} from '../../reducers/chat';

import { debounce } from 'lodash';
import { Button, Input, Overlay } from 'react-native-elements';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

import { inputs, layouts, overlays, texts } from '../StyleSheetMain';
import LottieRenderer from '../LottieRenderer';
import RoomList from './RoomList';
import useInput from '../../hooks/useInput';

const RoomsManager = ({ navi, disabled }) => {
  const dispatch = useDispatch();
  const { chatRooms, chatRoomInfo, filteredChatRooms, joinRoomHit, joinRoomErr, } = useSelector(state => state.chat);

  const [errorOverlay, setErrorOverlay] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchTermErr, setSearchTermErr] = useState(null);
  const [passwordOverlay, setPasswordOverlay] = useState(false);
  const [password, onChangePassword] = useInput(null);
  const [selectedRoom, setSelectedRoom] = useState({});

  useEffect(() => {
    if (joinRoomHit) {
      dispatch({
        type: BUILD_CHAT_CHANNEL,
      });
      navi.navigate('OnAirChat');
    }
  }, [joinRoomHit]);

  useEffect(() => {
    if (joinRoomErr) {
      setErrorOverlay(true);
    };
  }, [joinRoomErr]);

  useEffect(() => {
    if (searchTerm && !filteredChatRooms.length) {
      setSearchTermErr('일치하는 방이 없습니다.')
    }
  }, [filteredChatRooms, searchTerm]);

  const searchbyRoomTitle = (searchTerm) => {
    setSearchTermErr(null);
    if (!searchTerm.length) {
      dispatch({
        type: RESET_SEARCH_ROOMS
      });
    } else {
      dispatch({
        type: SEARCH_ROOMS,
        data: searchTerm
      })
    }
  };

  const delayedSearch = useCallback(debounce(e => searchbyRoomTitle(e), 100), []);
  const onSearchRoom = useCallback(e => {
    setSearchTerm(e);
    delayedSearch(e);
  }, []);

  const clearSearchTerm = useCallback(() => {
    setSearchTerm('');
    setSearchTermErr(null);
    dispatch({
      type: RESET_SEARCH_ROOMS
    });
  }, []);

  // without password
  const onPressRoom = useCallback(info => {
    console.log('info??, where is your info', info);
    setSelectedRoom({ roomId: info.roomId, title: info.title, });
    if (info.password) { setPasswordOverlay(true); return }


    if (chatRoomInfo && chatRoomInfo.roomId !== info.roomId) {
      dispatch({
        type: CLEAR_ROOM
      });
    };

    dispatch({
      type: JOIN_ROOM_REQ,
      data: { roomId: info.roomId, title: info.title, }
    });
  }, [chatRoomInfo]);

  // on overlay join with password
  const requestJoinRoom = useCallback(() => {
    if (!password.length) return;
    if (chatRoomInfo?.roomId !== selectedRoom.roomId) {
      dispatch({
        type: CLEAR_ROOM
      });
    };
    dispatch({
      type: JOIN_ROOM_REQ,
      data: { roomId: selectedRoom.roomId, title: selectedRoom.title, password, }
    });
    onChangePassword(null);
    setPasswordOverlay(false);
  }, [selectedRoom, password, chatRoomInfo]);


  const toggleErrorOverlay = useCallback(() => {
    setErrorOverlay(!errorOverlay);
  }, [errorOverlay])

  const togglePasswordOverlay = useCallback(() => {
    setPasswordOverlay(!passwordOverlay);
    if (password) onChangePassword(null);
  }, [passwordOverlay, password])

  return (
    <View style={layouts.listBox} >
      {!filteredChatRooms.length && !chatRooms.length
        ? <LottieRenderer type="emptyRoom" />
        :
        <>
          <Input
            inputStyle={inputs.inputStyle}
            leftIcon={<FontAwesome5 name="search" size={18} color="tomato" />}
            leftIconContainerStyle={inputs.iconContainer}
            rightIcon={searchTerm ? <FontAwesome5 name="times" size={18} onPress={clearSearchTerm} /> : null}
            rightIconContainerStyle={inputs.iconContainer}
            containerStyle={inputs.containerStyle}
            value={searchTerm}
            onChangeText={onSearchRoom}
            placeholder={disabled ? "중계 종료" : "채팅방 검색"}
            disabled={disabled}
            errorMessage={searchTermErr}
            errorStyle={{ color: 'tomato', }}
          />
          {filteredChatRooms.length
            ?
            filteredChatRooms.map((el) => {
              return (
                <TouchableOpacity
                  key={'rmFilter-' + el.roomId}
                  onPress={() => onPressRoom(el)}
                  style={layouts.contentList}
                  disabled={disabled}>
                  <RoomList info={el} />
                </TouchableOpacity>
              );
            })
            :
            chatRooms.map((el) => {
              return (
                <TouchableOpacity
                  key={'rm-' + el.roomId}
                  onPress={() => onPressRoom(el)}
                  style={disabled ? layouts.disabledContentList : layouts.contentList}
                  disabled={disabled}
                >
                  <RoomList info={el} />
                </TouchableOpacity>
              );
            })
          }
        </>
      }

      <Overlay overlayStyle={overlays.centerOverlay}
        isVisible={errorOverlay} onBackdropPress={toggleErrorOverlay}>
        <Text style={texts.lgBoldCenter}>알림</Text>
        <View style={{ paddingVertical: 42 }}>
          <Text style={texts.mdBoldCenter}>{joinRoomErr}</Text>
        </View>
        <View style={{ flexDirection: 'row', }}>
          <Button title="확인" onPress={toggleErrorOverlay}
            containerStyle={[overlays.pressButtonContainer, { alignItems: 'center' }]}
            buttonStyle={[overlays.pressButton, { width: 150, }]}
            titleStyle={overlays.pressButtonTitle}
          />
        </View>
      </Overlay>

      <Overlay overlayStyle={overlays.centerOverlay}
        isVisible={passwordOverlay} onBackdropPress={togglePasswordOverlay}>
        <View style={{ alignSelf: 'stretch', marginVertical: 30 }}>
          <Input
            label="비밀번호"
            labelStyle={{ marginBottom: 15, }}
            leftIcon={<FontAwesome5 name="lock" size={18} />}
            secureTextEntry={true}
            onChangeText={onChangePassword} maxLength={16}
            inputContainerStyle={inputs.backgroundInputContainer}
            inputStyle={{ fontSize: 18, }}
          />
        </View>
        <View style={{ flexDirection: 'row' }}>
          <Button title="취소" onPress={togglePasswordOverlay}
            containerStyle={overlays.pressButtonContainer}
            titleStyle={overlays.pressButtonTitle}
            buttonStyle={[overlays.pressButton, { borderRadius: 9, backgroundColor: 'grey' }]}
          />
          <Button title="확인" disabled={!password}
            onPress={requestJoinRoom}
            containerStyle={overlays.pressButtonContainer}
            buttonStyle={overlays.pressButton}
            titleStyle={overlays.pressButtonTitle}
          />
        </View>
      </Overlay>
    </View>
  )
};

export default RoomsManager;