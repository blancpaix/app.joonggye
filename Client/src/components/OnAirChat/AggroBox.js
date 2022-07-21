import React, { useCallback } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useDispatch } from 'react-redux';
import { DELETE_AGGRO, SEND_AGGRO_DOWN, SEND_AGGRO_UP } from '../../reducers/chat';

import { Avatar, Button } from 'react-native-elements';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Ticker from 'react-native-ticker';

import { sendAggroDown, sendAggroUp } from '../../socket/createSocketChannel';
import { ProfileUrlMaker } from '../Constants';
import { aggros, icons, msgs, texts } from '../StyleSheetMain';
import AdMobBanner from '../Ad/AdMobBanner';

const AggroBox = ({ data }) => {
  const dispatch = useDispatch();

  const onPressUp = useCallback(() => {
    sendAggroUp(data.aggroUID);
    dispatch({
      type: SEND_AGGRO_UP,
      data: data.aggroUID,
    });
  }, []);

  const onPressDown = useCallback(() => {
    sendAggroDown(data.aggroUID);
    dispatch({
      type: SEND_AGGRO_DOWN,
      data: data.aggroUID,
    });
  }, []);

  const onPressDelete = useCallback(() => {
    dispatch({
      type: DELETE_AGGRO,
      data: data.aggroUID,
    });
  }, []);

  return (
    <ScrollView
      style={aggros.aggroBox}
      showsVerticalScrollIndicator={false}
    >
      <View style={st.flexRow} >

        <Avatar
          overlayContainerStyle={icons.avatarOverlayContainer}
          rounded
          title={data.displayName[0]}
          size="medium"
          containerStyle={{ alignSelf: 'center' }}
          source={data.photoURL && { uri: ProfileUrlMaker(data.photoURL) }}
        />

        <View style={st.topIconMargin}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignContent: 'center' }}>
            <Text style={msgs.displayName}>
              {data.displayName}
            </Text>
            <FontAwesome5 size={18} name="times" style={{ paddingHorizontal: 8 }}
              onPress={onPressDelete}
            />
          </View>

          <View style={[st.flexRow, { height: 42 }]}>
            {!data.clear &&
              <Button
                type="outline"
                onPress={onPressUp}
                containerStyle={[st.buttonsBox, { marginRight: 12 }]}
                icon={
                  <FontAwesome5
                    name="thumbs-up"
                    size={15}
                    color="#3949ab"
                    solid={data.pressedUp}
                  />
                }
                disabled={data.pressedDown || data.pressedUp}
                disabledStyle={{ backgroundColor: '#eeeeee' }}
              />
            }

            <View style={st.tickerBox}>
              <Ticker duration={210} textStyle={[texts.xlBoldCenter]}>
                {data.point}
              </Ticker>
            </View>


            {!data.clear &&
              <Button
                type="outline"
                onPress={onPressDown}
                containerStyle={[st.buttonsBox, { marginLeft: 12 }]}
                icon={
                  <FontAwesome5
                    name="thumbs-down"
                    size={15}
                    color='#e53935'
                    solid={data.pressedDown}
                  />
                }
                disabled={data.pressedDown || data.pressedUp}
                disabledStyle={{ backgroundColor: '#eeeeee' }}
              />
            }


          </View>
        </View>
      </View>
      <AdMobBanner type='aggro' />
      <Text style={[texts.mdBoldCenter, { fontSize: 16, marginTop: 4, }]}>
        {data.msg}
      </Text>
    </ScrollView>
  );
};

const st = StyleSheet.create({
  topIconMargin: {
    marginLeft: 9,
    marginBottom: 3,
    flex: 1,
  },
  flexRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignContent: 'center',
  },
  buttonsBox: {
    minWidth: 62,
    marginHorizontal: 3,
  },
  tickerBox: {
    height: 42,
    alignItems: 'center',
    flex: 1
  }
});

export default AggroBox;