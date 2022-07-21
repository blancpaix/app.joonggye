import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { ADD_FAVORITE_PROGRAM_REQ, DELETE_FAVORITE_PROGRAM_REQ, RESET_FAVORITE_PROGRAM } from '../../reducers/session';

import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import FastImage from 'react-native-fast-image';

import { broadcastorImgSelector } from '../Constants';
import { buttons, icons, ITEM_SIZE, SPACEING, texts } from '../StyleSheetMain';

const dayChanger = ['일', '월', ' 화', '수', '목', '금', '토'];

const ProgramInfoOverlay = ({ user }) => {
  const dispatch = useDispatch();
  const { myFavorites, addFavProgramHit, deleteFavProgramHit } = useSelector(state => state.session);
  const { pickedSearchProgram } = useSelector(state => state.program);
  const [isFavorite, setIsFavorite] = useState(myFavorites.find(el => el.id === pickedSearchProgram.programUID));

  useEffect(() => {
    if (addFavProgramHit) {
      setIsFavorite(true);
      dispatch({
        type: RESET_FAVORITE_PROGRAM
      });
    }
    if (deleteFavProgramHit) {
      setIsFavorite(false);
      dispatch({
        type: RESET_FAVORITE_PROGRAM
      });
    }
  }, [addFavProgramHit, deleteFavProgramHit])

  const onPressFavorite = useCallback(() => {
    if (isFavorite) {
      dispatch({
        type: DELETE_FAVORITE_PROGRAM_REQ,
        data: { userUID: user.uid, programUID: pickedSearchProgram.programUID },
      })
    } else {
      dispatch({
        type: ADD_FAVORITE_PROGRAM_REQ,
        data: {
          userUID: user.uid,
          programUID: pickedSearchProgram.programUID,
          titleBroad: pickedSearchProgram.title + '_' + pickedSearchProgram.broadcastor
        },
      })
    }
  }, [isFavorite])

  return (
    <View style={{
      width: ITEM_SIZE,
      shadowColor: '#000', shadowOpacity: 0.5,
      shadowOffset: { width: 0, height: 0 }, shadowRadius: 20,
    }}>
      <View style={{
        padding: SPACEING * 2, alignItems: 'center',
        backgroundColor: '#f8f8f8', borderRadius: 24,
      }}>
        <View style={{ width: '100%' }}>
          <FastImage style={st.postImage}
            source={pickedSearchProgram.img
              ? { uri: ImageUrlMaker(pickedSearchProgram.img) }
              : broadcastorImgSelector(pickedSearchProgram.broadcastor)
            }
            resizeMode={FastImage.resizeMode.cover}
          />
          <View style={st.headerBox}>
            <Text style={[texts.lgBoldCenter, texts.broadcastorBox]}>
              {pickedSearchProgram.broadcastor}
            </Text>
            <Text style={icons.limitText}>
              {pickedSearchProgram.limit}
            </Text>
          </View>

          <View style={{
            width: '100%', position: 'absolute', bottom: 9, paddingHorizontal: 9,
            flexDirection: 'row', justifyContent: 'space-between',
          }}>
            <View style={[buttons.smEllipse, { backgroundColor: 'white', alignSelf: 'flex-end' }]}>
              <TouchableOpacity
                onPress={() => onPressFavorite()}
                activeOpacity={0.8}>
                {isFavorite
                  ? <FontAwesome5 name="heart" size={24} color='tomato' solid />
                  : <FontAwesome5 name="heart" size={24} color="grey" />
                }
              </TouchableOpacity>
            </View>
            <View>
              {Object.entries(pickedSearchProgram.airTime).map(el => (
                <View style={[icons.expBox, { marginTop: 3 }]} key={`day-${el[0]}`}>
                  <Text style={[texts.md, { paddingHorizontal: 6 }]}>
                    {dayChanger[el[0]]}
                  </Text>
                  <Text style={[texts.mdBold, icons.expTimeBox]}>
                    {el[1]}
                  </Text>
                </View>
              ))}
            </View>

          </View>
        </View>
        <View style={{ alignItems: 'center', paddingBottom: 18, }}>
          <Text style={[texts.mdBoldCenter, { marginVertical: 9 }]}>
            {pickedSearchProgram.title}
          </Text>
          <View style={{ flexDirection: 'row' }}>
            <Text style={icons.infoIconText}>
              {pickedSearchProgram.genre}
            </Text>
          </View>
        </View>
      </View>
    </View>
  )
};

const st = StyleSheet.create({
  postImage: {
    width: '100%',
    height: ITEM_SIZE * 1.16,
    borderRadius: 18,
  },
  headerBox: {
    position: 'absolute',
    top: 0,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 9,
  },
})

export default ProgramInfoOverlay;