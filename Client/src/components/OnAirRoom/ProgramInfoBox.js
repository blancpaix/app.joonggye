import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { DECREASE_FAV, INCREASE_FAV, LOAD_FAV_COUNT_REQ } from '../../reducers/program';
import {
  ADD_FAVORITE_PROGRAM_REQ, DELETE_FAVORITE_PROGRAM_REQ, RESET_FAVORITE_PROGRAM,
} from '../../reducers/session';

import * as Animatable from 'react-native-animatable';
import { Button } from 'react-native-elements';
import FastImage from 'react-native-fast-image';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import shortNumber from 'short-number';

import { broadcastorImgSelector, ImageUrlMaker } from '../Constants';
import { fadeInBottom, buttons, icons, layouts, texts } from '../../components/StyleSheetMain';

const ProgramInfoBox = ({ data, navi }) => {
  const dispatch = useDispatch();
  const { sessionInfo: { user } } = useSelector(state => state.session);
  const { loadFavCntHit } = useSelector(state => state.program);
  const { myFavorites, addFavProgramHit, deleteFavProgramHit } = useSelector(state => state.session);

  const [imageWidth, setImageWidth] = useState(0);
  const [isFavorite, setIsFavorite] = useState(myFavorites.find(el => el.id === data.programUID));

  useEffect(() => {
    if (!loadFavCntHit) {
      dispatch({ type: LOAD_FAV_COUNT_REQ, data: data.programUID })
      return;
    } else {
      if (addFavProgramHit) {
        setIsFavorite(true);
        dispatch({
          type: INCREASE_FAV
        });
      }
      if (deleteFavProgramHit) {
        setIsFavorite(false);
        dispatch({
          type: DECREASE_FAV
        });
      }
      dispatch({
        type: RESET_FAVORITE_PROGRAM
      });
    }
  }, [addFavProgramHit, deleteFavProgramHit, loadFavCntHit]);

  const onPressFavorite = useCallback((programUID, broadcastor, title) => {
    if (!loadFavCntHit) return;
    if (isFavorite) {
      dispatch({
        type: DELETE_FAVORITE_PROGRAM_REQ,
        data: { userUID: user.uid, programUID }
      })
    } else {
      dispatch({
        type: ADD_FAVORITE_PROGRAM_REQ,
        data: { userUID: user.uid, programUID, titleBroad: title + '_' + broadcastor }
      })
    }
  }, [user, isFavorite, loadFavCntHit]);

  return (
    <>
      <View style={layouts.header}>
        <Button onPress={() => navi.pop()}
          icon={(<FontAwesome5 name="chevron-left" size={16} />)}
          type="clear"
        />

        <View style={[buttons.smEllipse, { backgroundColor: 'white' }]}>
          <TouchableOpacity onPress={() => onPressFavorite(data.programUID, data.broadcastor, data.title)}
            activeOpacity={0.8}
            disabled={!loadFavCntHit}>
            {
              isFavorite
                ? <FontAwesome5 name="heart" size={24} color="tomato" solid />
                : <FontAwesome5 name="heart" size={24} color="grey" />
            }
          </TouchableOpacity>
          <Text style={[texts.mdCenter, { paddingLeft: 9 }]}>
            {shortNumber(data.likes ? data.likes : 0)}
          </Text>
        </View>

      </View>

      <View style={{ flexDirection: 'row' }} >
        <View style={st.imageBox}
          onLayout={event => setImageWidth(event.nativeEvent.layout.width - 12)}
        >
          <FastImage
            style={[st.image, { height: imageWidth * 5 / 4, }]}
            source={data.img ? { uri: ImageUrlMaker(data.img) } : broadcastorImgSelector(data.broadcastor)}
            resizeMode={FastImage.resizeMode.cover}
          />
        </View>

        <View style={st.infoBox}>
          <View>
            <View style={st.headerBox}>
              <Text style={[texts.lgBoldCenter, { paddingHorizontal: 9, }]}>
                {data.broadcastor}
              </Text>
              <Text style={icons.limitText}>{data.limit}</Text>
            </View>

            <Text style={[texts.lgBoldLeft, { marginBottom: 3, }]}>
              {data.title}
            </Text>
            <Animatable.Text duration={400} delay={650} animation={fadeInBottom}
              style={texts.mdBold}>
              {data.subTitle1}
            </Animatable.Text>

            <Animatable.Text duration={400} delay={800} animation={fadeInBottom}
              style={texts.md}>
              {data.subTitle2}
            </Animatable.Text>
          </View>

          <View style={{ flexDirection: 'row', }}>
            {data.re && <Text style={icons.infoIconText}>재방송</Text>}
            {data.special && <Text style={icons.infoIconText}>스페셜</Text>}
          </View>
        </View>
      </View>
    </>
  )
};

const st = StyleSheet.create({
  imageBox: {
    flex: 1,
    padding: 6,
    backgroundColor: '#f8f8f8', borderRadius: 18,
    marginTop: 9,
    marginLeft: 9,
  },
  image: {
    width: '100%', borderRadius: 15,
  },
  infoBox: {
    flex: 2, justifyContent: 'space-between', margin: 9, marginBottom: 0, padding: 9,
    backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: 9,
  },

  headerBox: {
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

});

export default ProgramInfoBox;