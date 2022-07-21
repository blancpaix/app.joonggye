import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { icons, texts } from '../StyleSheetMain';

const TimeManager = ({ time, playingTime }) => {
  const [barLength, setBarlength] = useState(0);
  const [timing, setTiming] = useState(playingTime / time.programDuration * 100);

  useEffect(() => {
    setTiming(playingTime / time.programDuration * 100);
  }, [playingTime, time])

  return (
    <View style={st.timeBox}>
      <View style={icons.expBox}>
        <Text style={[texts.md, { paddingHorizontal: 6 }]}>시작</Text>
        <Text style={[texts.mdBold, icons.expTimeBox]}>
          {time.startTime.format('HH:mm')}
        </Text>
      </View>
      <View style={st.fullTimeBar}
        onLayout={event => {
          setBarlength(event.nativeEvent.layout.width)
        }}
      >
        <View style={[st.currentTimeBar, { width: `${timing}%`, maxWidth: barLength }]} />
      </View>
      <View style={icons.expBox}>
        <Text style={[texts.md, { paddingHorizontal: 6 }]}>종료</Text>
        <Text style={[texts.mdBold, icons.expTimeBox]}>
          {time.endTime.format('HH:mm')}
        </Text>
      </View>
    </View>
  )
};

const st = StyleSheet.create({
  timeBox: { flexDirection: 'row', marginHorizontal: 9, marginVertical: 6, },
  fullTimeBar: {
    flex: 1,
    backgroundColor: '#d3d3d3', height: 6,
    alignSelf: 'center'
  },
  currentTimeBar: {
    backgroundColor: 'tomato', height: 6,
    borderTopRightRadius: 3, borderBottomRightRadius: 3,
  },
})

export default TimeManager;