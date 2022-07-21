import React, { useCallback, useEffect } from 'react';
import { FlatList, Text, View, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { LOAD_AGGROS_REQ } from '../../reducers/service';

import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import dayjs from 'dayjs';

import { layouts, texts } from '../StyleSheetMain';
import ListEndLoader from './ListEndLoader';
import LottieRenderer from '../LottieRenderer';

const Aggros = () => {
  const dispatch = useDispatch();
  const { sessionInfo: { user } } = useSelector(state => state.session);
  const { loadAggrosLoad, myAggros, aggrosEndReach } = useSelector(state => state.service);

  useEffect(() => {
    if (myAggros.length > 0) return;
    loadAggros();
  }, [myAggros]);

  const loadAggros = useCallback(() => {
    dispatch({
      type: LOAD_AGGROS_REQ,
      data: user.uid,
    })
  });

  return (
    <View style={layouts.flexContent}>
      <FlatList
        contentContainerStyle={{ padding: 15 }}
        data={myAggros}
        keyExtractor={item => item.id}
        ListEmptyComponent={<LottieRenderer type="noneData" />}
        renderItem={({ item }) => {

          return (
            <View style={[layouts.contentListBgWhite, { flexDirection: 'column' }]}>
              <View style={st.headerBox}>
                <Text style={[texts.lgBold, { paddingHorizontal: 3, }]}>
                  {item.titleBroad.split("_")[1]}
                </Text>

                <View style={layouts.flexRow}>
                  <View style={[st.iconBox, { marginRight: 9, borderColor: '#3949ab' }]}>
                    <FontAwesome5 name="thumbs-up" size={15} color={'#3949ab'} style={{ alignSelf: 'center' }} />
                    <Text style={[texts.mdBoldRight, { color: '#3949ab', flex: 1 }]}>
                      {item.up}
                    </Text>
                  </View>

                  <View style={st.iconBox}>
                    <FontAwesome5 name="thumbs-down" size={15} color={'red'} style={{ alignSelf: 'center' }} />
                    <Text style={[texts.mdBoldRight, { color: 'red', flex: 1 }]}>
                      {item.down}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={[st.headerBox, { padding: 0 }]}>
                <Text style={[texts.mdBold, { paddingLeft: 6 }]}>
                  {item.titleBroad.split("_")[0]}
                </Text>
                <Text style={st.sendTimeText}>
                  {dayjs(item.createdAt).format('YYYY-MM-DD HH:MM')}
                </Text>
              </View>

              <Text style={[texts.mdBoldCenter, { marginTop: 6, marginBottom: 3, }]}>
                {item.msg}
              </Text>
            </View>
          )
        }}
        ListFooterComponent={loadAggrosLoad && <ListEndLoader />}
        onEndReached={!aggrosEndReach && loadAggros}
      />
    </View >
  )
};

const st = StyleSheet.create({
  headerBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 3,
  },
  iconBox: {
    borderColor: 'red',
    flexDirection: 'row',
    borderWidth: 2, borderRadius: 6,
    paddingHorizontal: 6, paddingVertical: 1.5,
    minWidth: 70,
  },
  sendTimeText: {
    color: 'grey',
    textAlignVertical: 'center',
    fontSize: 14,
  },
});

export default Aggros;