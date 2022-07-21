import React, { useCallback, useEffect, useState } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { UPDATE_PROFILE_REQ, UPDATE_PROFILE_RESET } from '../../reducers/session';

import { Avatar, Divider, Input, Button, Overlay } from 'react-native-elements';
import ImagePicker from 'react-native-image-crop-picker';
import dayjs from 'dayjs';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

import { ProfileUrlMaker, RGX_DISPLAYNAME, RGX_BLANK } from '../Constants';
import { buttons, inputs, layouts, overlays, texts } from '../StyleSheetMain'

const ProfileEditor = ({ navi }) => {
  const dispatch = useDispatch();
  const { sessionInfo: { user }, updateProfileLoad, updateProfileDone } = useSelector(state => state.session);

  const [displayName, setDisplayName] = useState('');
  const [displayNameErr, setDisplayNameErr] = useState(null);
  const [photoOverlay, setPhotoOverlay] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  useEffect(() => {
    if (updateProfileDone) {
      navi.pop();
      dispatch({
        type: UPDATE_PROFILE_RESET
      })
    }
  }, [updateProfileDone]);

  const onTypeDisplayName = useCallback((e) => {
    setDisplayNameErr(null);
    setDisplayName(e);
    if (e.length < 2) setDisplayNameErr('두글자 이상 사용해주세요');
    if (e.length > 15) setDisplayNameErr('15자 이내로 사용해주세요');
    if (e.match(RGX_BLANK)) setDisplayNameErr('공백은 사용할 수 없습니다.');
    if (!e.match(RGX_DISPLAYNAME)) setDisplayNameErr('한글이나 영어를 사용해주세요');
  }, [displayName]);

  const pickProfileImage = useCallback(() => {
    ImagePicker.openPicker({
      width: 128,
      height: 128,
      cropping: true,
      compressImageQuality: 0.84,
      forceJpg: true,
    })
      .then(img => {
        setSelectedPhoto(img);
      })
      .catch((err) => {
        setSelectedPhoto(null);
      })
      .finally(() => {
        setPhotoOverlay(false);
      });
  }, []);

  const togglePhotoOverlay = useCallback(() => {
    setPhotoOverlay(!photoOverlay);
  }, [photoOverlay])

  const deleteImage = useCallback(() => {
    setSelectedPhoto(null);
  }, []);

  const updateProfile = useCallback(() => {
    dispatch({
      type: UPDATE_PROFILE_REQ,
      data: {
        displayName,
        phoneNumber: user.phoneNumber,
        img: selectedPhoto
      }
    })
  }, [displayName, selectedPhoto]);

  return (
    <View style={[layouts.flexContent, { justifyContent: 'space-between' }]}>
      <View>
        <View style={st.infoBox}>
          {selectedPhoto
            ? (<Avatar size="xlarge" rounded
              title={user.displayName[0]}
              containerStyle={{ backgroundColor: '#d2d2d2', }}
              source={{ uri: selectedPhoto.path }}
            />)
            : (<Avatar size="xlarge" rounded
              title={user.displayName[0]}
              containerStyle={{ backgroundColor: '#d2d2d2', }}
              source={user.photoURL && { uri: ProfileUrlMaker(user.photoURL) }}
            />
            )
          }
          <Button type="solid" icon={<FontAwesome5 name="camera" size={22} color="tomato" />}
            containerStyle={[buttons.xlRound, { bottom: 15, left: 120, }]}
            buttonStyle={st.whiteButton}
            onPress={togglePhotoOverlay}
            raised
          />
        </View>
        <Text style={texts.lgCenter}>
          0{user.phoneNumber.substr(3, 2)}-{user.phoneNumber.substr(5, 4)}-{user.phoneNumber.substr(9, 4)}
        </Text>
        <Text style={[texts.mdCenter, { color: 'grey' }]}>
          {dayjs(user.metadata.creationTime).format('YYYY.MM.DD.')} 가입
        </Text>
        <Input value={displayName} onChangeText={onTypeDisplayName}
          placeholder={user.displayName}
          maxLength={15}
          errorMessage={displayNameErr}
          label={"닉네임"}
          containerStyle={[inputs.containerStyle, { paddingHorizontal: 21, }]}
          inputStyle={{ paddingBottom: 3, }}
        />
      </View>

      <Button title="확인" containerStyle={{ bottom: 0, width: '100%', }}
        buttonStyle={st.stetchButton}
        titleStyle={buttons.mdText}
        disabled={!displayName && !selectedPhoto || displayNameErr}
        onPress={updateProfile}
        loading={updateProfileLoad}
      />

      <Overlay isVisible={photoOverlay}
        animationType="fade"
        onBackdropPress={togglePhotoOverlay}
        overlayStyle={overlays.bottomOverlay}
      >
        <Button type="clear" title="이미지 선택" onPress={pickProfileImage} />
        <Divider />
        <Button type="clear" title="이미지 삭제" onPress={deleteImage} />
        <Divider />
        <Button type="clear" title="취소" titleStyle={{ color: 'red' }} onPress={togglePhotoOverlay} />
      </Overlay>
    </View>
  )
};

const st = StyleSheet.create({
  infoBox: {
    alignSelf: 'center',
    padding: 9,
    marginTop: 12, marginBottom: 6,
  },
  whiteButton: {
    borderRadius: 21, backgroundColor: 'white'
  },
  stetchButton: { backgroundColor: 'tomato', height: 50 },
})

export default ProfileEditor;