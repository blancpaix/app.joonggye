import React, { useCallback, useState } from 'react';
import { Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { VERIFY_PHONE_REQ, CONFIRM_VERIFY_PHONE_REQ, RESET_VERIFIED } from '../reducers/service';
import { DROP_OUT_REQ, } from '../reducers/session';

import { Button, Input, Overlay } from 'react-native-elements';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

import { RGX_PHONENUMBER } from './Constants';
import { buttons, inputs, layouts, overlays, texts } from '../components/StyleSheetMain';
import useInput from '../hooks/useInput';

const VerifyPhone = ({ isNew }) => {
  const dispatch = useDispatch();
  const {
    verifyPhoneLoad, verifyPhoneErr, verifier,
    confirmVerifyPhoneLoad, confirmVerifyPhoneErr,
  } = useSelector(state => state.service);

  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneNumberErr, setPhoneNumberErr] = useState(null);
  const [smsAlert, setSmsAlert] = useState(false);
  const [verifyCode, onChangeVerifyCode] = useInput('');


  const clearPhoneNumber = useCallback(() => {
    setPhoneNumber('');
  });

  const onChangePhoneNumber = useCallback(e => {
    setPhoneNumber(e);
    if (e.match(RGX_PHONENUMBER)) {
      setPhoneNumberErr(null);
    } else {
      setPhoneNumberErr('- 없이 전화번호를 입력해주세요.')
    }
  }, [])

  const toggleSmsAlert = useCallback(() => {
    setSmsAlert(!smsAlert)
  }, [smsAlert]);

  const verifyPhone = useCallback(() => {
    if (!phoneNumber) return;
    dispatch({
      type: VERIFY_PHONE_REQ,
      data: phoneNumber
    });
    setSmsAlert(false);
  }, [phoneNumber]);

  const confirmVerify = useCallback(() => {
    if (isNew) {
      dispatch({
        type: CONFIRM_VERIFY_PHONE_REQ,
        data: { verifier, verifyCode, }
      });
    } else {
      dispatch({
        type: DROP_OUT_REQ
      })
      dispatch({
        type: RESET_VERIFIED
      })
    }
  }, [verifier, verifyCode])

  if (verifier) {
    return (
      <View style={layouts.centerContent}>
        <Input onChangeText={onChangeVerifyCode}
          disabled={!verifier}
          placeholder="인증 번호"
          value={verifyCode}
          autoCorrect={false} autoCapitalize="none" keyboardType="phone-pad"
          inputStyle={inputs.inputStyle}
          containerStyle={inputs.containerStyle}
          maxLength={7}
          errorMessage={confirmVerifyPhoneErr}
        />
        <Button title="확인" disabled={!verifier} onPress={confirmVerify}
          buttonStyle={buttons.stretch}
          titleStyle={buttons.mdText}
          loading={confirmVerifyPhoneLoad}
        />
      </View>
    )
  }
  return (
    <View style={layouts.centerContent}>
      {!isNew && <Text style={[texts.md, { paddingBottom: 9, color: 'red' }]}>
        회원탈퇴를 위한 인증입니다.
      </Text>}
      <Text style={texts.md}>
        본인의 휴대전화번호를 입력해주세요.
      </Text>
      <Input onChangeText={onChangePhoneNumber}
        placeholder="전화번호"
        value={phoneNumber}
        autoCorrect={false} autoCapitalize="none" keyboardType="phone-pad"
        inputStyle={inputs.inputStyle}
        maxLength={13}
        leftIcon={<FontAwesome5 name="mobile-alt" size={21} color="black" />}
        leftIconContainerStyle={inputs.iconContainer}
        rightIcon={phoneNumber
          ? <FontAwesome5 name="times" size={18} color="black" onPress={clearPhoneNumber} />
          : null
        }
        rightIconContainerStyle={inputs.iconContainer}
        errorMessage={verifyPhoneErr || phoneNumberErr}
      />
      <Button title="다음" onPress={toggleSmsAlert}
        disabled={!phoneNumber || phoneNumberErr}
        buttonStyle={buttons.stretch}
        titleStyle={buttons.mdText}
        loading={verifyPhoneLoad}
      />

      <Overlay isVisible={smsAlert}
        onBackdropPress={toggleSmsAlert}
        overlayStyle={overlays.centerOverlay}
      >
        <View style={{ padding: 9 }}>
          <Text style={texts.exlCenter}>+82 {phoneNumber}</Text>
          <Text style={[texts.md, { marginHorizontal: 6, }]}>
            위의 전화번호로 SMS를 통해 6자리 인증번호를 보내드립니다.
          </Text>
          <Text style={[texts.md, { color: 'grey' }]}>
            * SMS 비용이 발생합니다.
          </Text>

          <View style={{ flexDirection: 'row', marginTop: 54, }}>
            <Button title="취소" onPress={toggleSmsAlert}
              containerStyle={overlays.pressButtonContainer}
              buttonStyle={[overlays.pressButton, { backgroundColor: 'grey' }]}
              titleStyle={overlays.pressButtonTitle}
            />
            <Button title="요청"
              onPress={verifyPhone}
              containerStyle={overlays.pressButtonContainer}
              buttonStyle={overlays.pressButton}
              titleStyle={overlays.pressButtonTitle}
            />
          </View>
        </View>
      </Overlay>
    </View>
  )
};

export default VerifyPhone;