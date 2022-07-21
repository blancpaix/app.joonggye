import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, View, FlatList, Alert } from 'react-native';
import { useDispatch, useSelector, } from 'react-redux';
import { CHAT_MINE, CLEAR_AGGRO_ERR } from '../../reducers/chat';

import { Button } from 'react-native-elements';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

import { layouts } from '../StyleSheetMain';
import useInput from '../../hooks/useInput';
import { sendMsg } from '../../socket/createSocketChannel';

const SenderBox = ({ roomId, session }) => {
  const dispatch = useDispatch();
  const { pickedProgram: { title, broadcastor } } = useSelector(state => state.program);
  const { aggroErr } = useSelector(state => state.chat);

  const [itemViewerActive, setItemViewerActive] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [term, onChangeTerm, setTerm] = useInput('');

  useEffect(() => {
    if (aggroErr) {
      Alert.alert(aggroErr, '', [{
        text: '확인',
        onPress: () => dispatch({
          type: CLEAR_AGGRO_ERR
        })
      }])
    }
  }, [aggroErr])

  const onPressSend = useCallback(() => {
    const trimmedMsg = term.trim();
    if (!trimmedMsg) return;
    setTerm('');

    const data = {
      roomId: roomId,
      msg: trimmedMsg,
      userUID: session.uid,
    };
    switch (selectedItem) {
      case 'A':
        data.type = 'A',
          data.displayName = session.displayName;
        data.titleBroad = title + '_' + broadcastor;
        setSelectedItem(null);
        break;
      default:
        data.type = 'N';
        break;
    }
    sendMsg(data);

    data.type = data.type + 'mine';
    dispatch({
      type: CHAT_MINE,
      data,
    });
  }, [term, selectedItem, title, broadcastor]);

  const toggleItemViewer = useCallback(() => {
    setItemViewerActive(!itemViewerActive);
  }, [itemViewerActive]);

  const onPressItem = useCallback((itemName) => {
    setSelectedItem(itemName);
    setItemViewerActive(false);
  }, [selectedItem]);

  const onPressCancel = useCallback(() => {
    setSelectedItem(null);
    setItemViewerActive(false);
  }, [])

  const items = [
    {
      title: "어그로",
      sign: 'A',
      color: 'red',
      onPressBtn: (a) => onPressItem(a),
    },
  ];

  const iconMaker = () => {
    switch (selectedItem) {
      case 'A':
        return (<Text style={st.buttonText}>A</Text>);
      default:
        return (<Text style={st.buttonText}>N</Text>)
    }
  };
  const buttonMaker = () => {
    switch (selectedItem) {
      case 'A':
        return ({ backgroundColor: 'red' })
      default:
        return ({ backgroundColor: 'grey', })
    }
  };

  return (
    <>
      {itemViewerActive
        &&
        <FlatList
          style={st.itemViewerBox}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps={'always'}
          data={items}
          keyExtractor={el => el.title}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => {

            return (
              <View style={{ margin: 6, width: 120, }}>
                {selectedItem === item.sign
                  ? <Button
                    title="취소"
                    onPress={() => onPressCancel()}
                    containerStyle={st.itemContainer}
                    titleStyle={st.itemTitle}
                    buttonStyle={st.itemButton}
                  />
                  : <Button
                    title={item.title}
                    onPress={() => item.onPressBtn(item.sign)}
                    containerStyle={st.itemContainer}
                    titleStyle={st.itemTitle}
                    buttonStyle={[st.itemButton, { backgroundColor: item.color, }]}
                  />
                }
              </View>
            )
          }}
        />
      }

      <View style={layouts.senderBox} >
        <Button type="clear"
          icon={iconMaker()}
          buttonStyle={[{ borderRadius: 9, paddingHorizontal: 12, }, buttonMaker()]}
          containerStyle={st.buttonAlignment}
          onPress={toggleItemViewer}
        />
        <TextInput style={st.msgInput}
          autoFocus={true} autoCorrect={false} maxLength={128} multiline
          value={term} onChangeText={onChangeTerm}
        />
        <Button type="solid" icon={<FontAwesome5 name="arrow-up" size={18} color={term ? 'tomato' : 'grey'} />}
          buttonStyle={st.sendButton}
          containerStyle={st.buttonAlignment}
          onPress={onPressSend} disabled={term ? false : true}
        />
      </View>
    </>
  )
};

const st = StyleSheet.create({
  itemViewerBox: {
    position: 'absolute',
    bottom: 50,
    backgroundColor: 'rgba(252,252,252,0.9)',
    width: '100%'
  },
  itemTitle: {
    fontSize: 21,
    fontWeight: 'bold',
  },
  itemContainer: {
    margin: 3,
  },
  itemButton: {
    backgroundColor: 'grey',
    borderRadius: 9
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 21,
    margin: -4,
    color: 'white',
  },
  msgInput: {
    fontSize: 15,
    maxHeight: 75,
    flex: 1,
    backgroundColor: 'white',
    borderWidth: 0.6, borderColor: 'grey',
    paddingVertical: -6, paddingHorizontal: 9,
    marginHorizontal: 6, borderRadius: 15,
  },
  sendButton: {
    backgroundColor: '#cacaca',
    borderRadius: 9,
    paddingHorizontal: 9,
  },
  buttonAlignment: {
    justifyContent: 'flex-end',
  }
});

export default SenderBox;