import React from 'react';
import { StyleSheet, ScrollView, Text, View, } from 'react-native';
import { useSelector } from 'react-redux';

import dayjs from 'dayjs';

import { noticeTypeMaker } from '../components/Constants';
import { icons, layouts, texts } from '../components/StyleSheetMain';

const MyInfoContentsViewer = () => {
  const { selectedNotice } = useSelector(state => state.service);

  return (
    <ScrollView>
      <View style={layouts.listBoxNoneHeight}>
        <View style={layouts.flexRow}>
          <Text style={[icons.infoIconText, st.marginH12]}>
            {noticeTypeMaker(selectedNotice.type)}
          </Text>
          <Text style={texts.mdBoldLeft}>{selectedNotice.title}</Text>
        </View>
      </View>
      <Text style={[texts.md, { textAlign: 'right', color: 'grey', marginHorizontal: 12, }]}>
        {dayjs(selectedNotice.createdAt).format('YYYY-MM-DD')}
      </Text>
      <View style={layouts.listBox}>
        <View style={{ margin: 12 }}>
          <Text style={texts.mdBoldLeft}>{selectedNotice.content}</Text>
        </View>
      </View>
    </ScrollView>
  )
};

const st = StyleSheet.create({
  marginH12: {
    marginHorizontal: 12,
  },
})

export default MyInfoContentsViewer;