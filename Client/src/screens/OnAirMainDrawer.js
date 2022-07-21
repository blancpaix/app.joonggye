import React, { useState, useCallback } from 'react';
import { Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RESET_REQUESTED, SOCKET_CONNECT_REQ } from '../reducers/chat';
import { CLEAR_SEARCH_PROGRAM, PICKED_PROGRAM, SEARCH_PROGRAM_PICK, SEARCH_PROGRAM_REQ } from '../reducers/program';

import LottieView from 'lottie-react-native';
import * as Animatable from 'react-native-animatable';
import { Divider, ListItem, Overlay, SearchBar } from 'react-native-elements';
import { DrawerContentScrollView, } from '@react-navigation/drawer'
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

import { fadeInBottom, texts, layouts, overlays } from '../components/StyleSheetMain';
import ProgramInfoOverlay from '../components/OnAirMain/ProgramInfoOverlay';

const OnAirMainDrawer = ({ navigation }) => {
  const dispatch = useDispatch();
  const { searchInOnair, searchPrograms } = useSelector(st => st.program);
  const { sessionInfo: { user } } = useSelector(state => state.session);
  const { nsp } = useSelector(state => state.chat);
  const [programName, setProgramName] = useState('');
  const [errorTerm, setErrorTerm] = useState(null);
  const [overlayActive, setOverlayActive] = useState(false);

  const onSearchByTitle = useCallback(e => {
    setProgramName(e);
    if (e.length < 2 || e.length > 16) {
      setErrorTerm('두글자 이상 입력해주세요')
      return;
    }
    setErrorTerm(null);
    if (!e.length) {
      dispatch({
        type: CLEAR_SEARCH_PROGRAM
      })
      return;
    }
    dispatch({
      type: SEARCH_PROGRAM_REQ,
      data: e,
    });
  }, []);

  const toggleOverlay = useCallback(programUID => {
    if (overlayActive) {
      setOverlayActive(false);
    } else {
      dispatch({
        type: SEARCH_PROGRAM_PICK,
        data: programUID,
      });
      setOverlayActive(true);
    }
  }, [overlayActive]);

  const onPressPushRoom = useCallback((info) => {
    if (nsp === info.scheduleId) {
      dispatch({
        type: RESET_REQUESTED,
      });
      navigation.navigate('OnAirRoom');
    } else {
      dispatch({
        type: PICKED_PROGRAM,
        data: info.scheduleId,
      });
      const { uid, displayName, photoURL } = user;
      dispatch({
        type: SOCKET_CONNECT_REQ,
        data: {
          namespace: info.scheduleId,
          userUID: uid,
          displayName, photoURL
        },
      });
    }
  }, [user, nsp]);

  return (
    <>
      <SearchBar value={programName} onChangeText={onSearchByTitle}
        lightTheme
        placeholder="검색"
        round
      />
      <View>
        {!!errorTerm && <Animatable.Text
          duration={500} animation={fadeInBottom} delay={300}
          style={{
            position: 'absolute',
            top: 18,
            alignSelf: 'center',
            textAlign: 'center', textAlignVertical: 'center',
            fontSize: 18, fontWeight: 'bold', color: 'white',
            paddingHorizontal: 21, paddingVertical: 2, borderRadius: 9,
            backgroundColor: 'tomato',
          }}>
          {errorTerm}
        </Animatable.Text>}
      </View>

      <DrawerContentScrollView>
        {(programName.length < 2 && !searchInOnair.length && !searchPrograms.length)
          &&
          <View style={{ alignItems: 'center' }}>
            <LottieView source={require('../images/Lottie_search.json')} style={{ width: '80%' }} autoPlay autoSize={true} resizeMode="center" loop={false} />
            <Animatable.Text delay={600} duration={600} animation={fadeInBottom} style={[texts.animateText, { fontSize: 21 }]}>찾고 싶은</Animatable.Text>
            <Animatable.Text delay={750} duration={750} animation={fadeInBottom} style={[texts.animateText, { fontSize: 24 }]}>프로그램을</Animatable.Text>
            <Animatable.Text delay={900} duration={900} animation={fadeInBottom} style={[texts.animateText, { fontSize: 27 }]}>검색해보세요</Animatable.Text>
          </View>
        }
        {(programName.length > 1 && !searchInOnair.length && !searchPrograms.length)
          &&
          <View style={{ alignItems: 'center' }}>
            <LottieView source={require('../images/Lottie_emptiFile.json')} style={{ width: '80%' }} autoPlay autoSize={true} loop={false} />
            <Animatable.Text delay={600} duration={600} animation={fadeInBottom} style={[texts.animateText, { fontSize: 21 }]}>일치하는</Animatable.Text>
            <Animatable.Text delay={700} duration={700} animation={fadeInBottom} style={[texts.animateText, { fontSize: 24 }]}>프로그램이</Animatable.Text>
            <Animatable.Text delay={800} duration={800} animation={fadeInBottom} style={[texts.animateText, { fontSize: 30 }]}>없어요...ㅠ</Animatable.Text>
          </View>
        }

        {(!!programName.length && !!searchInOnair.length)
          &&
          <>
            <View style={layouts.subTitleHeader} >
              <FontAwesome5 name="play" size={16} color="tomato" />
              <Text style={[texts.mdBoldCenter, { paddingHorizontal: 12, }]}>중계 중</Text>
            </View>
            <Divider />
            {
              searchInOnair.map((item) => (
                <ListItem key={`Broadcasting` + item.scheduleId}
                  onPress={() => onPressPushRoom(item)}
                  bottomDivider
                >
                  <ListItem.Content>
                    <ListItem.Title>
                      {item.title}
                    </ListItem.Title>
                    {(item.subTitle1 || item.subTitle2) && <ListItem.Subtitle>
                      {item.subTitle1} {item.subTitle2}
                    </ListItem.Subtitle>}
                    <ListItem.Subtitle>
                      {item.broadcastor} / {item.limit}
                    </ListItem.Subtitle>
                  </ListItem.Content>
                  <ListItem.Chevron />
                </ListItem>
              ))
            }
          </>
        }
        {(!!programName.length && !!searchPrograms.length)
          &&
          <>
            <View style={layouts.subTitleHeader} >
              <FontAwesome5 name="info-circle" size={21} color="grey" />
              <Text style={[texts.mdBoldCenter, { paddingHorizontal: 12, }]}>프로그램</Text>
            </View>
            <Divider />
            {
              searchPrograms.map((item, i) => (
                <ListItem key={`SearchProgram` + item.programUID}
                  onPress={() => toggleOverlay(item.programUID)}
                  bottomDivider
                >
                  <ListItem.Content>
                    <ListItem.Title>
                      {item.title}
                    </ListItem.Title>
                    <ListItem.Subtitle>
                      {item.broadcastor} / {item.limit}
                    </ListItem.Subtitle>
                  </ListItem.Content>
                </ListItem>
              ))
            }
          </>
        }
      </DrawerContentScrollView>

      <Overlay isVisible={overlayActive}
        onBackdropPress={() => toggleOverlay()}
        overlayStyle={[overlays.centerOverlay, { padding: 0, backgroundColor: 'transparent' }]}
      >
        <ProgramInfoOverlay user={user} />
      </Overlay>
    </>
  )
}

export default OnAirMainDrawer;