import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useDispatch, useSelector, } from 'react-redux';
import { ADD_BLOCKED_USER, DEL_BLOCKED_USER, MERGE_BLOCKED_USERS } from '../reducers/chat';
import { ADD_BLOCK_USER, DELETE_BLOCK_USER } from '../reducers/session';

import dayjs from 'dayjs';
import { debounce } from 'lodash';
import { Avatar, ListItem, Input } from 'react-native-elements';
import { DrawerContentScrollView } from '@react-navigation/drawer'
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

import { ProfileUrlMaker } from '../components/Constants';
import { icons, inputs, layouts, texts } from '../components/StyleSheetMain';

const ejectBlockedUser = (chatRoomUsers, blockedUsers) => {
  let blockedUserList = [];
  chatRoomUsers.map(el => {
    if (Object.prototype.hasOwnProperty.call(blockedUsers, el.userUID)) {
      blockedUserList.push(el.userUID);
    }
  });

  return blockedUserList;
};

const OnAirChatDrawer = () => {
  const dispatch = useDispatch();
  const { sessionInfo: { user }, blockedUsers } = useSelector(state => state.session);
  const { pickedProgram } = useSelector(state => state.program);
  const { chatRoomUsers, blockingUsers } = useSelector(state => state.chat);

  const [searchName, setSearchName] = useState('');
  const [searchNameErr, setSearchNameErr] = useState(null);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [initBlockUser, setInitBlockUser] = useState(false);

  useEffect(() => {
    if (searchName && !filteredUsers.length) {
      setSearchNameErr('일치하는 중계자가 없습니다.')
    }
  }, [filteredUsers, searchName]);

  useEffect(() => {
    if (chatRoomUsers.length && !initBlockUser) {
      const blockers = ejectBlockedUser(chatRoomUsers, blockedUsers);
      if (blockers) {
        dispatch({    // to chat reducer
          type: MERGE_BLOCKED_USERS,
          data: blockers,
        })
        setInitBlockUser(true);
      };
    }
  }, [chatRoomUsers, blockingUsers]);


  const searchByName = useCallback((searchTerm) => {
    setSearchNameErr(null);
    if (!searchTerm.length) {
      setFilteredUsers([]);
    } else {
      setFilteredUsers(chatRoomUsers.filter(el => el.displayName.indexOf(searchTerm) !== -1));
    }
  }, [chatRoomUsers]);

  const delayedSearch = useCallback(debounce(e => searchByName(e), 400), []);
  const onSearchRoom = useCallback(e => {
    setSearchName(e);
    delayedSearch(e);
  }, []);

  const clearSearchName = useCallback(() => {
    setSearchName('');
    setFilteredUsers([]);
    setSearchNameErr(null);
  }, []);

  const onPressAddBlockUser = useCallback((userUID) => {
    dispatch({
      type: ADD_BLOCK_USER,
      data: userUID,
    });
    dispatch({
      type: ADD_BLOCKED_USER,
      data: userUID,
    })
  }, []);

  const onPressClearBlockUser = useCallback((userUID) => {
    dispatch({
      type: DELETE_BLOCK_USER,
      data: userUID,
    });
    dispatch({
      type: DEL_BLOCKED_USER,
      data: userUID,
    });
  }, []);

  return (
    <DrawerContentScrollView >
      <View style={st.drawerHeader} >
        <Text style={[texts.lgBoldCenter, st.broadcastorBox]}>
          {pickedProgram.broadcastor}
        </Text>

        <View style={st.expTab}>
          <Text style={[texts.mdCenter, { paddingHorizontal: 6 }]}>종료</Text>
          <Text style={[texts.mdBold, icons.expTimeBox]}>
            {dayjs(pickedProgram.endAt.toDate()).format('HH:mm')}
          </Text>
        </View>
      </View>

      <Text style={[texts.mdCenter, { paddingVertical: 12, }]}>
        {pickedProgram.title}
      </Text>

      <View style={layouts.subTitleHeader}>
        <Text style={[texts.md, { color: 'tomato', paddingHorizontal: 6, }]}>
          {chatRoomUsers.length}
        </Text>
        <Text style={texts.md}>
          명 중계 중
        </Text>
      </View>

      <ListItem key={user.uid} bottomDivider containerStyle={{ padding: 6, backgroundColor: '#fafafa' }}>
        <Avatar rounded size="medium"
          overlayContainerStyle={icons.avatarOverlayContainer}
          source={user.photoURL && { uri: ProfileUrlMaker(user.photoURL) }}
          title={user.displayName[0]}
        />
        <ListItem.Content>
          <ListItem.Title style={texts.mdBold}>{user.displayName}</ListItem.Title>
          <ListItem.Subtitle style={[texts.smBold, { color: 'grey' }]}>나</ListItem.Subtitle>
        </ListItem.Content>
      </ListItem>

      <Input value={searchName} onChangeText={onSearchRoom}
        placeholder="검색"
        inputStyle={inputs.inputStyle}
        leftIcon={<FontAwesome5 name="search" size={16} color="tomato" />}
        leftIconContainerStyle={inputs.iconContainer}
        rightIcon={searchName ? <FontAwesome5 name="times" size={18} color="black" onPress={clearSearchName} /> : null}
        rightIconContainerStyle={inputs.iconContainer}
        containerStyle={inputs.containerStyle}
        errorMessage={searchNameErr}
        errorStyle={{ color: 'tomato' }}
      />

      {filteredUsers.length && !filteredUsers.find(el => el.userUID === user.uid)
        ? (
          filteredUsers.map((item) => {
            if (item.userUID === user.uid) return;
            if (Object.prototype.hasOwnProperty.call(blockingUsers, item.userUID)) {
              return (
                <ListItem key={item.userUID}
                  bottomDivider
                  containerStyle={st.userPadder}
                  onPress={() => onPressClearBlockUser(item.userUID)}>

                  <Avatar rounded
                    source={item.photoURL && { uri: ProfileUrlMaker(item.photoURL) }}
                    title={item.displayName[0]}
                    avatarStyle={st.blockedAvatar}
                  />

                  <ListItem.Content>
                    <ListItem.Title style={texts.md}>
                      {item.displayName}
                    </ListItem.Title>
                    <ListItem.Subtitle style={[texts.sm, { color: 'grey' }]}>
                      수신 차단
                    </ListItem.Subtitle>
                  </ListItem.Content>
                  <FontAwesome5 name="volume-mute" size={18} color="grey" />
                </ListItem>
              )
            } else {
              return (
                <ListItem key={item.userUID}
                  bottomDivider
                  containerStyle={st.userPadder}
                  onPress={() => onPressAddBlockUser(item.userUID)}>

                  <Avatar rounded
                    overlayContainerStyle={icons.avatarOverlayContainer}
                    source={{ uri: ProfileUrlMaker(item.photoURL) }}
                    title={item.displayName[0]}
                  />
                  <ListItem.Content>
                    <ListItem.Title style={texts.md}>
                      {item.displayName}
                    </ListItem.Title>
                  </ListItem.Content>
                </ListItem>
              )
            }
          })
        )
        : (
          chatRoomUsers.map((item) => {
            if (item.userUID === user.uid) return;

            if (Object.prototype.hasOwnProperty.call(blockingUsers, item.userUID)) {
              return (
                <ListItem key={item.userUID}
                  bottomDivider
                  containerStyle={st.userPadder}
                  onPress={() => onPressClearBlockUser(item.userUID)}>
                  <Avatar rounded
                    overlayContainerStyle={icons.avatarOverlayContainer}
                    source={item.photoURL && { uri: ProfileUrlMaker(item.photoURL) }}
                    title={item.displayName[0]}
                    avatarStyle={st.blockedAvatar}
                  />
                  <ListItem.Content>
                    <ListItem.Title style={texts.md}>
                      {item.displayName}
                    </ListItem.Title>
                    <ListItem.Subtitle style={[texts.sm, { color: 'grey' }]}>
                      수신 차단
                    </ListItem.Subtitle>
                  </ListItem.Content>
                  <FontAwesome5 name="volume-mute" size={18} color="grey" />
                </ListItem>
              )
            } else {
              return (
                <ListItem key={item.userUID}
                  bottomDivider
                  containerStyle={st.userPadder}
                  onPress={() => onPressAddBlockUser(item.userUID)}
                >
                  <Avatar rounded
                    overlayContainerStyle={icons.avatarOverlayContainer}
                    source={item.photoURL && { uri: ProfileUrlMaker(item.photoURL) }}
                    title={item.displayName[0]}
                  />
                  <ListItem.Content>
                    <ListItem.Title style={texts.md}>
                      {item.displayName}
                    </ListItem.Title>
                  </ListItem.Content>
                </ListItem>
              )
            }
          })
        )
      }
    </DrawerContentScrollView>
  )
};

const st = StyleSheet.create({
  broadcastorBox: {
    backgroundColor: 'white',
    flex: 1, marginRight: 3,
    borderTopLeftRadius: 9, borderTopRightRadius: 9,
    paddingVertical: 3
  },
  drawerHeader: {
    flexDirection: 'row', backgroundColor: 'grey', marginTop: -4
  },
  userPadder: {
    padding: 7.5,
  },
  blockedAvatar: {
    backgroundColor: 'rgba(0,0,0, 0.42)'
  },
  expTab: {
    flexDirection: 'row',
    backgroundColor: '#d2d2d2',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderTopLeftRadius: 9,
    borderTopRightRadius: 9,
  },
})

export default OnAirChatDrawer;