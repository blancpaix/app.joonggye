import React from 'react';
import { Text, View } from 'react-native';

import { tables, texts } from '../StyleSheetMain';

const NoticeListHeader = () => (
  <View style={tables.tableHeader}>
    <Text style={[texts.mdBoldCenter, { width: 50, color: 'grey' }]}>분류</Text>
    <Text style={[texts.mdBoldCenter, { flex: 1, color: 'grey' }]}>제목</Text>
    <Text style={[texts.mdBoldCenter, { width: 87, color: 'grey' }]}>날짜</Text>
  </View>
);

export default NoticeListHeader;