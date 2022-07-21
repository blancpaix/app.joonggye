import React, { useCallback } from 'react';
import { FlatList, Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { DELETE_FAVORITE_PROGRAM_REQ } from '../../reducers/session';

import dayjs from 'dayjs';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

import { layouts, texts } from '../StyleSheetMain';
import LottieRenderer from '../LottieRenderer';

const Favorites = () => {
  const dispatch = useDispatch();
  const { sessionInfo: { user }, myFavorites } = useSelector(state => state.session);

  const deleteFavorite = useCallback((programUID) => {
    dispatch({
      type: DELETE_FAVORITE_PROGRAM_REQ,
      data: { userUID: user.uid, programUID, }
    });
  }, [user])

  return (
    <View style={layouts.flexContent}>
      <FlatList
        contentContainerStyle={{ padding: 15 }}
        data={myFavorites}
        keyExtractor={item => item.id}
        ListEmptyComponent={<LottieRenderer type="noneData" />}
        renderItem={({ item }) => {

          return (
            <View style={layouts.contentListBgWhite}>
              <View style={{ padding: 3 }}>
                <View style={{ flexDirection: 'row', }}>
                  <Text style={[texts.lgBoldCenter, { color: 'grey', }]}>
                    {item.titleBroad.split("_")[1]}
                  </Text>
                  <Text style={[texts.mdBold, { paddingLeft: 9, }]}>
                    {item.titleBroad.split("_")[0]}
                  </Text>
                </View>
                <Text style={[texts.sm, { color: 'grey', }]}>
                  {dayjs(item.createdAt).format('YYYY-MM-DD')}
                </Text>
              </View>
              <FontAwesome5 name="trash-alt" size={20} style={{ alignSelf: 'center', padding: 6 }}
                onPress={() => deleteFavorite(item.id)}
              />
            </View>
          )
        }}
      />
    </View>
  )
};

export default Favorites;
