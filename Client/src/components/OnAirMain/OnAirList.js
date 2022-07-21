import React, { useCallback } from 'react';
import { Animated, Text, StyleSheet, View, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RESET_REQUESTED, SOCKET_CONNECT_REQ } from '../../reducers/chat';
import { PICKED_PROGRAM } from '../../reducers/program';

import FastImage from 'react-native-fast-image';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime'
import duration from 'dayjs/plugin/duration';
dayjs.extend(relativeTime);
dayjs.extend(duration);

import { broadcastorImgSelector, ImageUrlMaker } from '../Constants';
import { ITEM_SIZE, SPACEING, texts, icons } from '../StyleSheetMain';

const OnAirList = ({ info, navi, translateY }) => {
  const dispatch = useDispatch();
  const { sessionInfo: { user } } = useSelector(state => state.session);
  const { nsp } = useSelector(state => state.chat);

  const endAt = dayjs(info.endAt.toDate()).format('HH:mm');

  const onPressPushRoom = useCallback((info) => {
    if (nsp === info.scheduleId) {
      dispatch({
        type: RESET_REQUESTED,
      });
      navi.navigate('OnAirRoom')
    } else {
      dispatch({
        type: PICKED_PROGRAM,
        data: info.scheduleId,
      });
      const { uid, displayName, photoURL, phoneNumber } = user;
      dispatch({
        type: SOCKET_CONNECT_REQ,
        data: { namespace: info.scheduleId, userUID: uid, displayName, photoURL, phoneNumber },
      });
    }
  }, [navi, user, nsp]);

  return (
    <Animated.View
      style={{
        transform: [{ translateY }],
        width: ITEM_SIZE,
        paddingHorizontal: SPACEING,
        shadowColor: '#000',
        shadowOpacity: 0.5,
        shadowOffset: { width: 0, height: 0, },
        shadowRadius: 20,
      }}>
      <TouchableOpacity
        style={{
          padding: SPACEING * 2,
          alignItems: 'center',
          backgroundColor: '#f8f8f8',
          borderRadius: 24,
        }}
        onPress={() => onPressPushRoom(info)}
        activeOpacity={0.8}
      >
        <View style={{ width: '100%', }}>
          <FastImage style={st.postImage}
            source={info.img ? { uri: ImageUrlMaker(info.img) } : broadcastorImgSelector(info.broadcastor)}
            resizeMode={FastImage.resizeMode.cover}
          />
          <View style={st.headerBox}>
            <Text style={[texts.lgBoldCenter, texts.broadcastorBox]}>{info.broadcastor}</Text>
            <Text style={icons.limitText}>{info.limit}</Text>
          </View>
          <View style={[icons.expBox, {
            position: 'absolute', bottom: 9, right: 9,
          }]}>
            <Text style={[texts.md, { paddingHorizontal: 6 }]}>종료</Text>
            <Text style={[texts.mdBold, icons.expTimeBox]}>{endAt}</Text>
          </View>
        </View>

        <View style={{ alignItems: 'center', }}>
          <Text style={[texts.mdBoldCenter, { marginVertical: 9 }]}>{info.title}</Text>
          <View style={{ flexDirection: 'row' }}>
            <Text style={icons.infoIconText}>{info.genre}</Text>
            {info.re && <Text style={icons.infoIconText}>{info.re && '재방송'}</Text>}
            {info.special && <Text style={icons.infoIconText}>{info.special && '스페셜'}</Text>}
          </View>
          <Text style={texts.md}>{info.subTitle1}</Text>
          <Text style={texts.md}>{info.subTitle2}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  )
};

const st = StyleSheet.create({
  postImage: {
    width: '100%',
    height: ITEM_SIZE * 1.16,
    borderRadius: 18,
  },
  headerBox: {
    position: 'absolute',
    top: 0,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 9,
  },
});

export default OnAirList;