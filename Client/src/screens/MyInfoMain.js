import React, { useCallback } from 'react';
import { View, } from 'react-native';
import { useSelector } from 'react-redux';

import { ListItem, } from 'react-native-elements';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

import AdMobBanner from '../components/Ad/AdMobBanner';
import Profile from '../components/MyInfo/Profile';

const MyInfoMain = ({ navigation }) => {
  const { sessionInfo } = useSelector(st => st.session);

  const menuList = [
    {
      icon: 'exclamation-circle',
      color: 'grey',
      title: '공지사항',
      onPress: () => onPressToList('공지사항'),
    }, {
      icon: "user",
      color: 'grey',
      title: '프로필 편집',
      onPress: () => onPressToList('프로필 편집'),
    }, {
      icon: 'heart',
      color: 'grey',
      title: '좋아하는 프로그램',
      onPress: () => onPressToList('좋아하는 프로그램'),
    }, {
      icon: 'receipt',
      color: 'grey',
      title: '어그로 내역',
      onPress: () => onPressToList('어그로'),
    }, {
      icon: 'cog',
      color: 'grey',
      title: '설정',
      onPress: () => onPressToList('설정'),
    },
  ];

  const onPressToList = useCallback((title) => {
    navigation.navigate('MyInfoContents', { title, });
  }, []);

  return (
    <View>
      <Profile session={sessionInfo} navi={navigation} />
      <AdMobBanner type='myInfo' />

      {menuList.map((item, i) => (
        <ListItem key={i} bottomDivider onPress={item.onPress}>
          <FontAwesome5 name={item.icon} size={24} color={item.color} solid />
          <ListItem.Content>
            <ListItem.Title>{item.title}</ListItem.Title>
          </ListItem.Content>
          <ListItem.Chevron />
        </ListItem>
      ))}
    </View>
  )
};

export default MyInfoMain;