import React from 'react';
import { View, } from 'react-native';

import LottieView from 'lottie-react-native';
import { Button } from 'react-native-elements';

import { buttons, layouts } from '../components/StyleSheetMain';
import HeaderLogo from '../components/HeaderLogo';

const AuthMain = ({ navigation }) => {

  return (
    <View style={layouts.flexContentPadding9}>
      <HeaderLogo />
      <View>
        <LottieView source={require('../images/Lottie_chitChat.json')} style={{ width: '100%' }}
          autoPlay autoSize={true} resizeMode="center" loop={true} />
      </View>
      <View style={{ alignItems: 'center' }}>
        <Button
          buttonStyle={buttons.xlEllipse}
          titleStyle={buttons.xlText}
          title="시작하기"
          onPress={() => navigation.navigate('AuthVerify')} />
      </View>
    </View>
  )
};

export default AuthMain;