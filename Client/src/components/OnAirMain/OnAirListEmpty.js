import React, { useCallback } from 'react';
import { Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { LOAD_SCHEDULE_REQ } from '../../reducers/program';

import { Button } from 'react-native-elements';

import { overlays, texts } from '../StyleSheetMain';
import LottieRenderer from '../LottieRenderer';

const OnAirListEmpty = () => {
  const dispatch = useDispatch();
  const { loadScheduleErr } = useSelector(state => state.program);

  const onPressReload = useCallback(() => {
    dispatch({
      type: LOAD_SCHEDULE_REQ,
    });
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: 'white', padding: 15, borderRadius: 21, }}>
      {loadScheduleErr
        ?
        <>
          <Text style={[texts.mdCenter, { color: 'tomato' }]}>{loadScheduleErr}</Text>
          <LottieRenderer type="retry" />
          <Button
            onPress={onPressReload}
            title="새로고침"
            containerStyle={overlays.pressButtonContainer}
            buttonStyle={[overlays.pressButton, { backgroundColor: 'grey' }]}
            titleStyle={overlays.pressButtonTitle}
          />
        </>
        :
        <LottieRenderer type="loading" />
      }
    </View>
  )
};

export default OnAirListEmpty;