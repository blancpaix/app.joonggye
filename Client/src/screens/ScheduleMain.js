import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, ScrollView, StyleSheet, } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { LOAD_AIR_TABLE_REQ } from '../reducers/program';

import dayjs from 'dayjs';
import { } from 'dayjs/locale/ko';
dayjs.locale('ko');
import { Button, ButtonGroup } from 'react-native-elements';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

import { layouts, texts } from '../components/StyleSheetMain';
import AdMobBanner from '../components/Ad/AdMobBanner';
import LottieRenderer from '../components/LottieRenderer';
import ScheduleList from '../components/Schedule/ScheduleList';

const selectBoxButtons = ['지상파', '종합편성'];
const buttonArray = [
  ['KBS1', 'KBS2', 'MBC', 'SBS', 'EBS1', 'EBS2'],
  ['TV조선', 'JTBC', 'MBN', '채널A'],
];

const ScheduleMain = () => {
  const dispatch = useDispatch();
  const { airTable, loadAirTableLoad, loadAirTableHit } = useSelector(st => st.program);

  const [nowDate, setNowDate] = useState(dayjs());
  const [manipulateDate, setManipulateDate] = useState(dayjs());

  const [selectIndex, setSelectIndex] = useState(0);
  const [selectedSet, setSelectedSet] = useState(buttonArray[0]);
  const [pickedBroad, setPickedBroad] = useState('KBS1');

  useEffect(() => {
    if (!airTable.length && !loadAirTableLoad && !loadAirTableHit) {
      dispatch({
        type: LOAD_AIR_TABLE_REQ,
        data: nowDate.format('YYYY-MM-DD') + '@' + pickedBroad,
      })
    };
  }, [pickedBroad]);


  const onPressPrevDay = useCallback(() => {
    setManipulateDate(manipulateDate.subtract(1, 'day'));
  }, []);

  const onPressNextDay = useCallback(() => {
    setManipulateDate(manipulateDate.add(1, 'day'));
  }, [])

  const onPressButtonGroup = useCallback((e) => {
    setSelectIndex(e);
    setSelectedSet(buttonArray[e]);
  }, []);

  const onPressBroadcastor = useCallback((broadcastor) => {
    dispatch({
      type: LOAD_AIR_TABLE_REQ,
      data: manipulateDate.format('YYYY-MM-DD') + '@' + broadcastor,
    });
    setPickedBroad(broadcastor);
  }, [manipulateDate]);

  return (
    <ScrollView style={layouts.flexContent}>
      <View style={st.header} >
        <Button type="clear" onPress={onPressPrevDay}
          icon={<FontAwesome5 name="chevron-left" size={18}
            color={manipulateDate.isBefore(nowDate, 'date') ? '#d2d2d2' : 'black'} />}
          buttonStyle={{ paddingHorizontal: 12, }}
          disabled={manipulateDate.isBefore(nowDate, 'date') ? true : false}
        />
        <Text style={texts.mdBoldCenter}>
          {manipulateDate.format('M월 D일 dddd')}
        </Text>
        <Button type="clear" onPress={onPressNextDay}
          icon={<FontAwesome5 name="chevron-right" size={18}
            color={manipulateDate.isAfter(nowDate, 'date') ? '#d2d2d2' : 'black'} />}
          buttonStyle={{ paddingHorizontal: 12, }}
          disabled={manipulateDate.isAfter(nowDate, 'date') ? true : false}
        />
      </View>

      <ButtonGroup
        buttons={selectBoxButtons} selectedIndex={selectIndex}
        selectedButtonStyle={st.selectedButton}
        containerStyle={st.buttonContainer}
        innerBorderStyle={{ width: 0 }}
        onPress={onPressButtonGroup}
        activeOpacity={0}
      />

      <FlatList
        contentContainerStyle={{ paddingHorizontal: 9 }}
        horizontal
        showsHorizontalScrollIndicator={false}
        data={selectedSet}
        keyExtractor={(item) => String(`${item}`)}
        renderItem={({ item }) => (
          <Button title={item} onPress={() => onPressBroadcastor(item)}
            titleStyle={item === pickedBroad ? [st.broadcastorText, { color: 'white' }] : st.broadcastorText}
            buttonStyle={[
              item === pickedBroad
                ? { backgroundColor: 'tomato' }
                : { backgroundColor: '#d2d2d2' },
              st.brodcastorButton
            ]} />
        )}
        style={{ paddingVertical: 3, }}
      />

      <AdMobBanner type='schedule' />

      <View style={[layouts.listBox, { marginBottom: 15 }]}>
        {loadAirTableLoad
          ? <LottieRenderer type="loading" />
          : <ScheduleList table={airTable} />
        }
      </View>
    </ScrollView >
  )
};

const st = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: 'space-between',
    paddingHorizontal: 3, paddingTop: 3,
  },
  buttonContainer: {
    borderRadius: 24, borderColor: 'tomato'
  },
  selectedButton: {
    borderRadius: 24, backgroundColor: 'tomato',
  },
  broadcastorText: {
    fontSize: 15, marginVertical: -4.5, color: 'grey'
  },
  brodcastorButton: {
    marginHorizontal: 4.5,
    borderRadius: 15,
    paddingHorizontal: 15,
  },
})

export default ScheduleMain;