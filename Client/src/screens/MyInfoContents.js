import React from 'react';

import Notice from '../components/MyInfo/Notice';
import Favorites from '../components/MyInfo/Favorites';
import Aggros from '../components/MyInfo/Aggros';
import Settings from '../components/MyInfo/Settings';
import ProfileEditor from '../components/MyInfo/ProfileEditor';
import Terms from '../components/MyInfo/Terms';

const MyInfoValues = ({ navigation, route }) => {
  switch (route.params.title) {
    case '공지사항':
      return <Notice navi={navigation} />
    case '좋아하는 프로그램':
      return <Favorites />
    case '어그로':
      return <Aggros />
    case '설정':
      return <Settings navi={navigation} />
    case '프로필 편집':
      return <ProfileEditor navi={navigation} route={route.params} />
    case '개인정보 처리 방침':
      return <Terms />
    default:
      return <></>
  }

};

export default MyInfoValues;