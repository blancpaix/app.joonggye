import React, { useCallback, useEffect, useState, useRef, } from 'react';
import { Animated, Text, StyleSheet, View, } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { SOCKET_CONNECT_CANCEL, SOCKET_CONNECT_INIT } from '../reducers/chat';
import { LOAD_SCHEDULE_REQ } from '../reducers/program';

import LottieView from 'lottie-react-native';
import { Overlay, Button } from 'react-native-elements';
import LinearGradient from 'react-native-linear-gradient';
import SplashScreen from 'react-native-splash-screen';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

import { ImageUrlMaker } from '../components/Constants';
import { width, height, ITEM_SIZE, ITEM_SPACER, buttons, overlays, lotties, texts } from '../components/StyleSheetMain';
import HeaderLogo from '../components/HeaderLogo';
import OnAirList from '../components/OnAirMain/OnAirList';
import OnAirListEmpty from '../components/OnAirMain/OnAirListEmpty';

const Backdrop = ({ broadcasting, scrollX }) => (
  <View style={StyleSheet.absoluteFillObject}>
    {broadcasting.map((info, index) => {
      const inputRange = [(index - 1.5) * ITEM_SIZE, (index - 1.0) * ITEM_SIZE];
      const opacity = scrollX.interpolate({
        inputRange,
        outputRange: [0, 1,]
      });

      return (
        <Animated.Image
          blurRadius={1.2}
          key={`image-${index}`}
          source={info.img ? { uri: ImageUrlMaker(info.img) } : require('../images/defaultImg1024.png')}
          resizeMode="cover"
          style={[StyleSheet.absoluteFillObject, { opacity, height, width }]}
        />
      )
    })}
    <LinearGradient
      colors={['transparent', '#0d0d0d']}
      style={{
        width,
        height: height * 0.24,
        position: 'absolute',
        bottom: 0
      }}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    />
  </View>
);

const OnAirMain = ({ navigation }) => {
  const dispatch = useDispatch();
  const scrollX = useRef(new Animated.Value(0)).current;
  const { broadcasting } = useSelector(state => state.program);
  const { socketConnLoad, socketConnHit, socketConnErr } = useSelector(state => state.chat);
  const [overlayActive, setOverlayActive] = useState(false);

  useEffect(() => {
    SplashScreen.hide();
    dispatch({
      type: LOAD_SCHEDULE_REQ
    })
  }, []);

  useEffect(() => {
    if (socketConnLoad) {
      setOverlayActive(true);
    }
  }, [socketConnLoad]);

  useEffect(() => {
    if (socketConnHit) {
      setOverlayActive(false);
      navigation.navigate('OnAirRoom')
    }
  }, [socketConnHit]);

  const onPressConnCancel = useCallback(() => {
    dispatch({
      type: SOCKET_CONNECT_CANCEL
    });
    setOverlayActive(false);
    dispatch({
      type: SOCKET_CONNECT_INIT,
    });

  }, []);

  return (
    <View style={{ flex: 1 }}>
      <Backdrop broadcasting={broadcasting} scrollX={scrollX} />
      <Animated.FlatList
        horizontal
        data={broadcasting}
        keyExtractor={el => 'AirList-' + el.scheduleId}
        snapToAlignment="start"
        bounces={true}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        renderItem={({ item, index }) => {
          if (item.title === '') return <View style={{ width: ITEM_SPACER, }} />
          const inputRange = [(index - 2) * ITEM_SIZE, (index - 1) * ITEM_SIZE, index * ITEM_SIZE];
          const translateY = scrollX.interpolate({
            inputRange,
            outputRange: [170, 50, 170],
            extrapolate: 'clamp',
          });

          return <OnAirList navi={navigation} info={item} translateY={translateY} />
        }}
      />
      <HeaderLogo />
      <Button
        icon={<FontAwesome5 name="search" size={18} color="black" />}
        onPress={() => navigation.openDrawer()}
        type="clear"
        containerStyle={[buttons.mdRound, { position: 'absolute', right: 12, top: 12 }]}
      />
      {!broadcasting.length && (
        <View style={{ position: 'absolute', width: 300, height: 360, top: '18%', alignSelf: 'center', }}>
          <OnAirListEmpty />
        </View>
      )}
      <Overlay overlayStyle={overlays.centerOverlay}
        isVisible={overlayActive}
        onPress={() => setOverlayActive(false)}>
        <View style={lotties.default}>
          {socketConnErr
            ? <Text style={[texts.mdBoldCenter, { color: 'grey', flex: 1, }]} >
              {socketConnErr}
            </Text>
            : <LottieView source={require('../images/Lottie_loadingSpinner.json')}
              autoPlay autoSize style={lotties.default} />
          }
        </View>
        <View style={{ flexDirection: 'row' }} >
          <Button title="취소" onPress={onPressConnCancel}
            containerStyle={[overlays.pressButtonContainer, { alignItems: 'center' }]}
            buttonStyle={[overlays.pressButton, { width: 150, backgroundColor: 'grey' }]}
            titleStyle={overlays.pressButtonTitle}
          />
        </View>
      </Overlay>
    </View >
  )
};

export default OnAirMain;
