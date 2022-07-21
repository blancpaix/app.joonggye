import React from 'react';
import { Text, StyleSheet, View, } from 'react-native';

import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

import { texts } from '../StyleSheetMain';

const RoomList = ({ info }) => (
  <>
    <Text style={[texts.md, texts.bgGreyPadder]}>{info.title}</Text>
    <View style={st.footerBox}>
      <View>
        {info.password && <FontAwesome5 name="lock" size={15} style={{ marginLeft: 3 }} />}
      </View>
      <Text style={st.countText} >
        {info.count} / {info.max}
      </Text>
    </View>
  </>
);

const st = StyleSheet.create({
  footerBox: {
    marginTop: 1.5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
  },
  countText: {
    fontSize: 13,
  },
})

export default RoomList;