import React from 'react';
import { View, Image } from 'react-native';

const HeaderLogo = () => (
  <View style={{ position: 'absolute', left: 8, top: 8, width: 104, height: 28, }}>
    <Image
      source={require('../images/headerLogo_sm.png')}
      style={{ height: '100%', width: '100%' }}
      resizeMode="cover"
    />
  </View>
);

export default HeaderLogo;