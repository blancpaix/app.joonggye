import React, { useRef, useState } from 'react';
import { FlatList, SafeAreaView, View } from 'react-native';
import { useSelector } from 'react-redux';

import { Button } from 'react-native-elements';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

import { buttons } from '../components/StyleSheetMain';
import HeaderBox from '../components/OnAirChat/HeaderBox';
import AggroBox from '../components/OnAirChat/AggroBox';
import SenderBox from '../components/OnAirChat/SenderBox';
import MsgBox from '../components/OnAirChat/MsgBox';

const OnAirChat = ({ navigation }) => {
  const { sessionInfo: { user } } = useSelector(state => state.session);
  const { chats, aggros, chatRoomInfo: { roomId }, blockingUsers } = useSelector(state => state.chat);
  const [endReached, setEndReached] = useState(true);
  const [endMover, setEndMover] = useState(false);

  const flatList = useRef();

  const goToEnd = () => {
    flatList.current.scrollToEnd({ animated: true });
  }
  const scrollHadler = (s) => {
    if (s.nativeEvent.contentSize.height - 20 <= s.nativeEvent.layoutMeasurement.height + s.nativeEvent.contentOffset.y) {
      setEndReached(true);
      setEndMover(false);
    } else if (s.nativeEvent.contentSize.height - s.nativeEvent.contentOffset.y > 1.8 * s.nativeEvent.layoutMeasurement.height) {
      setEndReached(false);
      setEndMover(true);
    }
  }
  const chatAddedHandler = () => {
    if (endReached) flatList.current.scrollToEnd({ animated: true });
  };

  return (
    <SafeAreaView style={{ flex: 1 }} >
      <HeaderBox navi={navigation} />
      <View style={{ flex: 1 }}>
        <FlatList
          style={{ paddingHorizontal: 6 }}
          onContentSizeChange={chatAddedHandler}
          data={chats}
          ref={flatList}
          keyExtractor={(i, v) => String('c-' + v)}
          onScroll={scrollHadler}
          renderItem={({ item }) => {
            return <MsgBox chat={item} />
          }}
        />
        <View style={{ position: 'absolute', width: '100%', }}>
          {aggros &&
            aggros.map((item, v) => {
              if (blockingUsers[item.userUID]) return;
              return <AggroBox data={item} session={user} key={item.aggroUID} />
            })
          }
        </View>

        {endMover
          &&
          <Button
            type="clear" onPress={goToEnd}
            icon={<FontAwesome5 name="angle-double-down" size={28} color="tomato" />}
            containerStyle={buttons.xlRoundContainer}
            buttonStyle={buttons.xlRoundButton}
          />
        }
      </View>

      <SenderBox roomId={roomId} session={user} />
    </SafeAreaView>
  )
};

export default OnAirChat;