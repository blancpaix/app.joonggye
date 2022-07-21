import React from 'react';

import LottieView from 'lottie-react-native';

const ListEndLoader = () => (
  <LottieView style={{ width: 240, alignSelf: 'center', }}
    source={require('../../images/Lottie_loadingBar.json')}
    autoPlay autoSize loop={true}
  />
);

export default ListEndLoader;