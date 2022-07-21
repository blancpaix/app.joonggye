import React, { useCallback, useEffect } from 'react';
import { Text, View, FlatList, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { LOAD_NOTICES_REQ, PICKED_NOTICE } from '../../reducers/service';

import dayjs from 'dayjs';

import { noticeTypeMaker } from '../Constants';
import { icons, layouts, tables, texts, } from '../StyleSheetMain';

import LottieRenderer from '../LottieRenderer';
import NoticeListHeader from './NoticeListHeader';
import ListEndLoader from './ListEndLoader';

const Notice = ({ navi }) => {
  const dispatch = useDispatch();
  const { notices, loadNoticeLoad } = useSelector(state => state.service);

  useEffect(() => {
    if (notices.length > 0) return;
    dispatch({
      type: LOAD_NOTICES_REQ,
    });
  }, [notices]);

  const onPressNotice = useCallback(data => {
    dispatch({
      type: PICKED_NOTICE,
      data
    })
    navi.navigate('MyInfoContentsViewer', { title: '공지사항' })
  }, []);

  return (
    <View style={layouts.flexContent}>
      <FlatList
        contentContainerStyle={layouts.listBox}
        data={notices}
        keyExtractor={el => el.id}
        ListEmptyComponent={<LottieRenderer type="noneData" />}
        ListHeaderComponent={<NoticeListHeader />}
        renderItem={({ item }) => {

          return (
            <TouchableOpacity
              style={tables.listContainer}
              onPress={() => onPressNotice(item.id)}
            >
              <Text style={[icons.infoIconText, { width: 40 }]}>
                {noticeTypeMaker(item.type)}
              </Text>
              <Text style={[texts.md, { flex: 1, paddingHorizontal: 6 }]}>
                {item.title}
              </Text>
              <Text style={[texts.md, { fontSize: 14, width: 81, color: 'grey' }]}>
                {dayjs(item.createdAt).format('YYYY-MM-DD')}
              </Text>
            </TouchableOpacity>
          )
        }}
        ListFooterComponent={loadNoticeLoad && <ListEndLoader />}
      />
    </View>
  )
};

export default Notice;