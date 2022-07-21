import React, { useCallback, useState } from 'react';
import { View } from 'react-native';
import { useDispatch } from 'react-redux';
import { SIGNOUT_FB_REQ } from '../../reducers/session';

import { ListItem, Overlay } from 'react-native-elements';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

import { overlays } from '../StyleSheetMain';
import VerifyPhone from '../VerifyPhone';
import Terms from './Terms';

const Settings = () => {
  const dispatch = useDispatch();
  const [selection, setSelection] = useState(null);
  const [activateOverlay, setActivateOverlay] = useState(false);

  const settingList = [
    {
      icon: 'sign-out-alt',
      color: 'grey',
      title: '로그아웃',
      onPress: () => onPressSignout(),
    },
    {
      icon: 'book',
      color: 'grey',
      title: '이용 약관',
      onPress: () => onPressActivateTerms(),
    },
    {
      icon: 'user-times',
      color: 'grey',
      title: '회원 탈퇴',
      onPress: () => onPressDropout(),
    },
  ];

  const onPressSignout = useCallback(() => {
    dispatch({
      type: SIGNOUT_FB_REQ,
    })
  }, []);

  const onPressActivateTerms = useCallback(() => {
    setActivateOverlay(!activateOverlay);
  }, [activateOverlay]);

  const onPressDropout = useCallback(() => {
    setSelection('dropout')
  }, []);

  switch (selection) {
    case 'dropout':
      return (<VerifyPhone isNew={false} />);
    default:
      return (
        <View style={{ flex: 1, justifyContent: 'space-between', marginBottom: 50 }}>
          <View>
            {settingList.map((item, i) => (
              <ListItem key={i}
                onPress={item.onPress}
                bottomDivider
              >
                <FontAwesome5 name={item.icon} size={24} color={item.color} />
                <ListItem.Content>
                  <ListItem.Title>{item.title}</ListItem.Title>
                </ListItem.Content>
                <ListItem.Chevron />
              </ListItem>
            ))}
          </View>
          <Overlay overlayStyle={overlays.termsOverlay}
            isVisible={activateOverlay}
            onBackdropPress={onPressActivateTerms}
          >
            <FontAwesome5 style={{ alignSelf: 'flex-end' }}
              name="times" size={24} color="black"
              onPress={onPressActivateTerms}
            />
            <Terms />
          </Overlay>
        </View>
      )
  }
};

export default Settings;