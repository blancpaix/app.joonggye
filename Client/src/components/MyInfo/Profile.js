import React from 'react';
import { Text, View } from 'react-native';

import dayjs from 'dayjs';
import { Avatar } from 'react-native-elements';

import { ProfileUrlMaker } from '../Constants';
import { icons, texts } from '../StyleSheetMain';

const Profile = ({ session }) => {

  return (
    <View style={{ padding: 15 }}>
      <View style={{ flexDirection: 'row', }}>
        <Avatar
          size={96}
          rounded
          title={session?.user.displayName[0]}
          overlayContainerStyle={icons.avatarOverlayContainer}
          source={session.user.photoURL && { uri: ProfileUrlMaker(session.user.photoURL) }}
        />
        <View style={{ flex: 1, paddingHorizontal: 9, paddingTop: 9, }}>
          <Text style={texts.lg}>
            {session.user?.displayName}
          </Text>
          <Text style={[texts.md, { color: 'grey' }]}>
            {dayjs(session.user.metadata.creationTime).format('YYYY. MM. DD.')}
          </Text>
        </View>
      </View >
    </View>
  )
};

export default Profile;