import React from 'react';
import { Text, View } from 'react-native';

import { msgs } from '../StyleSheetMain';

// chat: { type, roomUID, msg, userUID, displayName, aggroUId, photoURL, up, down};
const MsgBox = ({ chat }) => {
  switch (chat.type) {
    case 'N':
      return (
        <View style={msgs.msgBox}>
          <Text style={msgs.displayName}>
            {chat.displayName}
          </Text>
          <View style={{ flexDirection: 'row' }}>
            <View style={msgs.msgBubble} />
            <Text style={msgs.msgText}>
              {chat.msg}
            </Text>
          </View>
        </View>
      )
    case 'A':
      return (
        <View style={msgs.aggroBox}>
          <Text style={msgs.aggroDisplayName}>
            {chat.displayName}
          </Text>
          <Text style={msgs.aggroText}>
            {chat.msg}
          </Text>
        </View>
      )
    case 'AP':
      return (
        <View style={[msgs.aggroBox, { borderColor: 'purple' }]}>
          <Text style={[msgs.aggroDisplayName, { backgroundColor: 'purple' }]}>
            {chat.displayName}
          </Text>
          <Text style={msgs.aggroText}>
            {chat.msg}
          </Text>
        </View>
      )
    case 'Nmine':
      return (
        <View style={msgs.mineBox}>
          <View style={msgs.mineBubble} />
          <Text style={msgs.mineText}>
            {chat.msg}
          </Text>
        </View >
      )
    case 'join':
      return <Text style={msgs.systemText}>
        {chat.displayName} 중계 참가
      </Text>
    case 'leave':
      return <Text style={msgs.systemText}>
        {chat.displayName} 중계 나감
      </Text>

    default:
      return <></>
  }
};

export default MsgBox;