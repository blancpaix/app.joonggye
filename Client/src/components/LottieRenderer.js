import React, { useEffect, useState } from 'react';
import { View } from 'react-native';

import LottieView from 'lottie-react-native';
import * as Animatable from 'react-native-animatable';

import { fadeInBottom, lotties } from './StyleSheetMain';

const LottieRenderer = ({ type }) => {
  const [source, setSource] = useState(require('../images/Lottie_loadingSpinner.json'));
  const [msg1, setMsg1] = useState(null);
  const [msg2, setMsg2] = useState(null);
  const [msg1Style, setMsg1Style] = useState(null);
  const [msg2Style, setMsg2Style] = useState(null);

  useEffect(() => {
    switch (type) {
      case 'loading':
        setSource(require('../images/Lottie_loadingSpinner.json'));
        setMsg1('불러오는');
        setMsg2('중입니다...');
        break;
      case 'empty':
        setSource(require('../images/Lottie_emptiFile.json'));
        setMsg1('불러오기에');
        setMsg2('실패하였습니다...');
        break;
      case 'noneData':
        setSource(require('../images/Lottie_emptiFile.json'));
        setMsg1('데이터가');
        setMsg2('없어요....ㅠ');
        break;
      case 'retry':
        setSource(require('../images/Lottie_tryAgain.json'));
        break;
      case 'emptyRoom':
        setSource(require('../images/Lottie_refresh.json'));
        setMsg1('채팅방 불러오기에 실패했습니다.');
        setMsg2('화면을 끌어내려 새로고침 하세요.');
        setMsg1Style(lotties.font18);
        setMsg2Style(lotties.fontBold18);
        break;
      default:
        return;
    }
  }, [type])

  return (
    <View style={lotties.lottieBox}>
      <LottieView source={source}
        style={lotties.default}
        autoPlay autoSize={true} loop={false}
      />
      {msg1 &&
        <Animatable.Text delay={600} duration={600} animation={fadeInBottom}
          style={msg1Style ? msg1Style : lotties.fontBold21}>
          {msg1}
        </Animatable.Text>
      }
      {msg2 &&
        <Animatable.Text delay={700} duration={700} animation={fadeInBottom}
          style={msg2Style ? msg2Style : lotties.fontBold21}>
          {msg2}
        </Animatable.Text>
      }
    </View>
  )
};

export default LottieRenderer;