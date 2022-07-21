import React, { useCallback, useEffect } from 'react';
import { Alert, BackHandler as ChatBackHandler, Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { BUILD_ROOM_CHANNEL } from '../../reducers/chat';

import { Button } from 'react-native-elements';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

import { layouts, texts } from '../StyleSheetMain';

const HeaderBox = ({ navi }) => {
  const dispatch = useDispatch();
  const { chatRoomInfo: { roomId, title }, chatRoomUsers } = useSelector(state => state.chat);

  useEffect(() => {
    const backHandlerChat = ChatBackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );
    return () => backHandlerChat.remove();
  }, []);

  const onPressBackwardChat = useCallback(() => {
    dispatch({
      type: BUILD_ROOM_CHANNEL,
      roomId,
    });
    navi.pop();
  }, [navi, roomId]);

  const backAction = () => {
    Alert.alert('중계 나가기', '중계를 그만두시겠습니까?', [
      {
        text: '취소',
        onPress: () => null,
      },
      {
        text: "나가기",
        onPress: onPressBackwardChat
      }
    ]);
    return true;
  };

  return (
    <View accessibilityRole='header' style={layouts.header} >
      <Button type="clear" icon={<FontAwesome5 name="chevron-left" size={16} />}
        onPress={backAction}
      />
      <View style={{ flexDirection: 'row', marginHorizontal: 6, flex: 1, }}>
        <Text style={texts.mdBoldLeft}>
          {title}
        </Text>
        <Text style={[texts.md, { color: 'tomato', marginLeft: 6, }]}>
          {chatRoomUsers.length}
        </Text>
      </View>
      <Button type="clear" icon={<FontAwesome5 name="bars" size={17} />}
        onPress={() => navi.openDrawer()} />
    </View>
  )
};

export default HeaderBox;