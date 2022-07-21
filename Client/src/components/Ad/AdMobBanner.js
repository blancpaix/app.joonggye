import React, { useEffect } from 'react';
import { View } from 'react-native';

import { ads } from '../StyleSheetMain';

import admob, { MaxAdContentRating, BannerAd, BannerAdSize } from '@react-native-firebase/admob';

const adUnitSelector = (type) => {
  switch (type) {
    case 'aggro':
      return 'ca-app-pub-5890627303088068/9071915592';
    case 'myInfo':
      return 'ca-app-pub-5890627303088068/2506507241';
    case 'schedule':
      return 'ca-app-pub-5890627303088068/2859034496';
    default:
      return 'ca-app-pub-5890627303088068/2859034496';
  }
}

const adMobBanner = ({ type }) => {
  useEffect(() => {
    admob()
      .setRequestConfiguration({
        maxAdContentRating: MaxAdContentRating.PG,
        tagForChildDirectedTreatment: false,
        tagForUnderAgeOfConsent: false,
      })
  }, []);

  return (
    <View style={ads.stretchBanner}>
      <BannerAd unitId={adUnitSelector(type)}
        size={BannerAdSize.SMART_BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: true, }}
      />
    </View>
  )
};

export default adMobBanner;