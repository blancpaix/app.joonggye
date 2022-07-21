import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { BUILD_MSG_CHANNEL, CREATE_ROOM_REQ, CREATE_ROOM_CANCEL, CLEAR_ROOM, } from '../../reducers/chat';

import { Button, CheckBox, Overlay, Input } from 'react-native-elements';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

import { RGX_INT } from '../Constants';
import { buttons, inputs, overlays, texts } from '../StyleSheetMain';
import useInput from '../../hooks/useInput';

const CreateRoomOverlay = ({ data, navi, disabled }) => {
  const dispatch = useDispatch();
  const { createRoomLoad, createRoomHit, createRoomErr } = useSelector(state => state.chat);
  const [visibleCreateRoom, setVisibleCreateRoom] = useState(false);
  const [roomTitle, setRoomTitle] = useState('');
  const [roomTitleError, setRoomTitleError] = useState(null);
  const [roomCount, setRoomCount] = useState('30');
  const [roomCountError, setRoomCountError] = useState(null);
  const [usePassword, setUsePassword] = useState(false);
  const [roomPassword, setRoomPassword] = useInput(null);
  const [roomPasswordError, setRoomPasswordError] = useState(null);
  const [visibleAlert, setVisibleAlert] = useState(false);

  useEffect(() => {
    if (createRoomHit) {
      const data = { title: roomTitle, max: parseInt(roomCount) };
      if (roomPassword) data.password = true;
      dispatch({
        type: BUILD_MSG_CHANNEL,
        data,
      });
      navi.navigate('OnAirChat');

      setVisibleCreateRoom(false);
      setRoomTitle('');
      setRoomTitleError(null);
      setRoomCount('30');
      setRoomCountError(null);
      setUsePassword(false);
      setRoomPassword(null);
      setRoomPasswordError(null);
    }
  }, [createRoomHit])

  useEffect(() => {
    if (createRoomErr) {
      setVisibleAlert(true);
    }
  }, [createRoomErr]);

  const toggleErrorOverlay = useCallback(() => {
    setVisibleAlert(!visibleAlert);
  }, [visibleAlert])

  const toggleCreateOverlay = useCallback(() => {
    setVisibleCreateRoom(!visibleCreateRoom)
  }, [visibleCreateRoom]);

  const onTypeRoomTitle = useCallback(e => {
    setRoomTitle(e);
    if (!e || !e.trim()) {
      setRoomTitleError('방 제목을 입력해주세요');
    } else {
      setRoomTitleError(null);
    }
  }, []);

  const onTypeRoomCount = useCallback((e) => {
    setRoomCount(e);
    if (e.match(RGX_INT)) {
      if (parseInt(e) > 120) {
        setRoomCountError('정원은 120명을 초과할 수 없습니다')
      } else if (parseInt(e) < 2) {
        setRoomCountError('최소 두명이 필요합니다')
      } else {
        setRoomCountError(null);
      }
    } else {
      setRoomCountError('숫자를 입력해주세요');
    }
  }, []);

  const toggleUsePassword = useCallback(() => {
    setUsePassword(!usePassword);
    if (usePassword) setRoomPasswordError(null);
  }, [usePassword]);

  const onTypeRoomPassword = useCallback((e) => {
    setRoomPassword(e);
    if (!e || !e.trim()) {
      setRoomPasswordError('비밀번호를 입력해주십시오.')
    } else {
      setRoomPasswordError(null);
    }
  }, []);

  const onPressCreateRoom = useCallback(() => {
    if (roomTitleError || !roomTitle.length) { setRoomTitleError('방 이름을 확인해주세요.'); return; }
    if (roomCountError || !roomCount.length) { setRoomCountError('인원을 확인해주세요.'); return; }
    if (usePassword && roomPassword.length < 2) { setRoomPasswordError('비밀번호를 입력해주세요.'); return; }
    const roomData = {
      scheduleUID: data.scheduleId,
      title: roomTitle,
      max: parseInt(roomCount),
    };
    if (usePassword) roomData.password = roomPassword;

    dispatch({
      type: CLEAR_ROOM,
    });
    dispatch({
      type: CREATE_ROOM_REQ,
      data: roomData,
    });
  }, [roomTitle, roomTitleError, roomCount, roomCountError, roomPassword,])

  const onPressCreateRoomCancel = useCallback(() => {
    setVisibleCreateRoom(!visibleCreateRoom);
    dispatch({
      type: CREATE_ROOM_CANCEL,
    });
  }, [visibleCreateRoom]);

  return (
    <View>
      {!disabled && (
        <Button
          onPress={toggleCreateOverlay} type="clear"
          icon={<FontAwesome5 name="plus" size={30} color="tomato" />}
          containerStyle={[buttons.xlRoundContainer, { bottom: 75 }]}
          buttonStyle={buttons.xlRoundButton}
        />
      )}

      <Overlay overlayStyle={overlays.centerOverlay}
        isVisible={visibleAlert}
        onBackdropPress={toggleErrorOverlay}
      >
        <Text style={texts.lgBoldCenter}>알림</Text>
        <View style={{ paddingVertical: 42 }}>
          <Text style={texts.mdBoldCenter}>{createRoomErr}</Text>
        </View>
        <View style={{ flexDirection: 'row', }}>
          <Button title="확인" onPress={toggleErrorOverlay}
            containerStyle={[overlays.pressButtonContainer, { alignItems: 'center' }]}
            buttonStyle={[overlays.pressButton, { width: 150, }]}
            titleStyle={overlays.pressButtonTitle}
          />
        </View>
      </Overlay>

      <Overlay overlayStyle={overlays.bottomOverlay}
        isVisible={visibleCreateRoom}
        onBackdropPress={toggleCreateOverlay}
      >
        <Text style={[texts.md, { marginBottom: 12, marginLeft: 9, }]}>채팅 방 만들기</Text>
        <View>
          <Input leftIcon={<FontAwesome5 name="comment-dots" solid size={18} />}
            autoCorrect={false} autoCapitalize="none"
            value={roomTitle} onChangeText={onTypeRoomTitle} maxLength={20}
            placeholder="방 이름"
            inputStyle={{ fontSize: 15, }}
            inputContainerStyle={inputs.backgroundInputContainer}
            errorMessage={roomTitleError}
            errorStyle={inputs.error}
          />
          <Input leftIcon={<FontAwesome5 name="user-friends" size={18} />}
            keyboardType="numeric" maxLength={3}
            value={roomCount} onChangeText={onTypeRoomCount}
            placeholder="인원 수"
            numericvalue
            inputContainerStyle={inputs.backgroundInputContainer}
            inputStyle={{ fontSize: 15, }}
            errorMessage={roomCountError}
            errorStyle={inputs.error}
          />
          <Input leftIcon={usePassword ? <FontAwesome5 name="lock" size={18} /> : <FontAwesome5 name="unlock" size={18} />}
            secureTextEntry={true}
            onChangeText={onTypeRoomPassword} maxLength={16}
            placeholder="비밀번호"
            disabled={!usePassword}
            rightIcon={
              <CheckBox
                checked={usePassword}
                checkedColor="tomato"
                containerStyle={{ margin: 0, padding: 0 }}
                onPress={toggleUsePassword}
              />}
            inputContainerStyle={inputs.backgroundInputContainer}
            inputStyle={{ fontSize: 15, }}
            errorMessage={roomPasswordError}
            errorStyle={inputs.error}
          />
        </View>

        <View style={{ flexDirection: 'row', marginTop: 12, }}>
          <Button title="취소" onPress={onPressCreateRoomCancel}
            containerStyle={st.buttonContainer}
            buttonStyle={[st.button, { backgroundColor: 'grey' }]}
            titleStyle={st.buttonText}
          />
          <Button
            title="확인" onPress={onPressCreateRoom}
            loading={createRoomLoad}
            containerStyle={st.buttonContainer}
            buttonStyle={st.button}
            titleStyle={st.buttonText}
            disabled={disabled}
          />
        </View>
      </Overlay>
    </View>
  )
};

export default CreateRoomOverlay;

const st = StyleSheet.create({
  buttonContainer: {
    flex: 1,
    marginHorizontal: 3,
  },
  button: {
    borderRadius: 9,
    backgroundColor: 'tomato',
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 15,
  }
});