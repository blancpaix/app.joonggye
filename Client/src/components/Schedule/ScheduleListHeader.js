import React from 'react';
import { Text, View } from 'react-native';

import { tables, texts } from '../StyleSheetMain';

const ScheduleListHeader = () => {
  return (
    <View style={tables.tableHeader}>
      <Text style={[texts.mdBoldCenter, { width: 58, color: 'grey' }]}>시간</Text>
      <Text style={[texts.mdBoldCenter, { flex: 1, color: 'grey' }]}>프로그램</Text>
      <Text style={[texts.mdBoldCenter, { width: 72, color: 'grey' }]}>기타</Text>
    </View>
  )
};

export default ScheduleListHeader;