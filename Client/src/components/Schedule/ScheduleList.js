import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { icons, tables, texts } from '../StyleSheetMain';
import LottieRenderer from '../LottieRenderer';
import ScheduleListHeader from '../Schedule/ScheduleListHeader';

const ScheduleList = ({ table }) => {
  if (!table.length) {
    return <LottieRenderer type="empty" />
  } else {
    return (
      <>
        <ScheduleListHeader />
        {table.map((el, index) => (
          <View style={tables.listContainer} key={'Sch-' + index}>
            <Text style={[texts.mdBoldCenter, st.timeBox]}>{el.sTime.substring(0, 5)}</Text>
            <View style={{ flex: 1, }}>
              <View style={{ flexDirection: 'row' }}>
                <Text style={texts.mdBoldLeft}>{el.title}</Text>
                {el.re && <Text style={[icons.infoIconText, { marginLeft: 9 }]}>재</Text>}
              </View>
              {el.subTitle1 ? <Text style={{ fontSize: 14, }}>{el.subTitle1}</Text> : null}
              {el.subTitle2 ? <Text style={{ fontSize: 14, }}>{el.subTitle2}</Text> : null}
            </View>

            <View style={st.etcBox}>
              <Text style={[icons.limitText, { marginBottom: 3, }]}>{el.limit}</Text>
              <Text style={icons.infoIconText}>{el.genre}</Text>
            </View>
          </View >
        ))}
      </>
    )
  }
};

const st = StyleSheet.create({
  timeBox: {
    marginHorizontal: 6,
    width: 42,
  },
  etcBox: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 72,
  }
});

export default ScheduleList;