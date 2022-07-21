import React, { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RESET_VERIFIED } from '../reducers/service';
import { UPDATE_SESSION, UPDATE_PROFILE_ERR, LOAD_FAVORITES_REQ } from '../reducers/session';

import { Button, Input, CheckBox, Overlay } from 'react-native-elements';

import { RGX_BLANK, RGX_DISPLAYNAME } from '../components/Constants';
import { buttons, inputs, layouts, overlays, texts, } from '../components/StyleSheetMain';
import { FB_updateProfile } from '../firebaseFn';
import Terms from '../components/MyInfo/Terms';
import VerifyPhone from '../components/VerifyPhone';

const AuthVerify = () => {
  const dispatch = useDispatch();
  const { verified } = useSelector(state => state.service);
  const [isNewUser, setIsNewUser] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [displayNameError, setDisplayNameError] = useState(null);
  const [checkTerm, setCheckTerm] = useState(false);
  const [activateOverlay, setActivateOverlay] = useState(false);

  useEffect(() => {
    if (verified) {
      if (!verified.user.displayName) {
        setIsNewUser(true);
      } else {
        dispatch({
          type: UPDATE_SESSION,
          data: verified,
        });
        dispatch({
          type: RESET_VERIFIED
        })
        dispatch({
          type: LOAD_FAVORITES_REQ,
          data: verified.user.uid,
        })
      }
    }
  }, [verified])

  const onTypeDisplayName = useCallback((e) => {
    setDisplayNameError(null);
    setDisplayName(e);
    if (e.length < 2) setDisplayNameError('두글자 이상 사용해주세요');
    if (e.length > 15) setDisplayNameError('15자 이내로 사용해주세요');
    if (e.match(RGX_BLANK)) setDisplayNameError('공백은 사용할 수 없습니다.');
    if (!e.match(RGX_DISPLAYNAME)) setDisplayNameError('한글이나 영어를 입력해주세요');
  }, []);

  const onPressTermAgree = useCallback(() => {
    setCheckTerm(true);
    setActivateOverlay(false);
  }, []);

  const onPressTermDisagree = useCallback(() => {
    setCheckTerm(false);
    setActivateOverlay(false);
  }, [])

  const onPressActivateTerms = useCallback(() => {
    setActivateOverlay(!activateOverlay);
  }, [activateOverlay]);

  const updateProfile = useCallback(async () => {
    if (displayNameError) return;
    const updateResult = await FB_updateProfile({ displayName });
    if (updateResult.displayName) {
      dispatch({
        type: UPDATE_SESSION,
        data: { user: updateResult },
      });
      dispatch({
        type: RESET_VERIFIED
      });
    } else {
      dispatch({
        type: UPDATE_PROFILE_ERR,
        error: '업데이트에 실패히였습니다.',
      })
    }
  }, [displayName, displayNameError]);

  if (isNewUser) {
    return (
      <View style={layouts.centerContent}>
        <Input onChangeText={onTypeDisplayName}
          placeholder="닉네임" value={displayName}
          autoCorrect={false} autoCapitalize="none"
          inputStyle={inputs.inputStyle}
          containerStyle={inputs.containerStyle}
          maxLength={15}

          errorMessage={displayNameError}
        />
        <CheckBox
          title="서비스 이용 동의"
          checked={checkTerm}
          checkedColor="tomato"
          onPress={onPressActivateTerms}
        />
        <Button title="회원가입"
          onPress={updateProfile}
          disabled={!verified || !displayName || displayNameError || !checkTerm}
          buttonStyle={buttons.stretch}
          titleStyle={buttons.mdText}
        />
        <Overlay overlayStyle={overlays.termsOverlay}
          isVisible={activateOverlay}
          onBackdropPress={onPressActivateTerms}
        >
          <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between' }}>
            <Button title="취소" type="clear"
              onPress={onPressTermDisagree}
              titleStyle={[texts.mdBold, { color: 'cornflowerblue' }]}
            />
            <Button title="동의" type="Clear"
              onPress={onPressTermAgree}
              titleStyle={[texts.mdBold, { color: 'cornflowerblue' }]}
            />
          </View>
          <Terms />
        </Overlay>
      </View>
    )
  }

  return (
    <VerifyPhone isNew={true} />
  )
};

export default AuthVerify;