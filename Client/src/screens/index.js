import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CHECK_SESSION_REQ } from '../reducers/session';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer'
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import SplashScreen from 'react-native-splash-screen';

import OnAirMain from './OnAirMain';
import OnAirMainDrawer from './OnAirMainDrawer'
import OnAirRoom from './OnAirRoom';
import OnAirChat from './OnAirChat';
import OnAirChatDrawer from './OnAirChatDrawer';
import ScheduleMain from './ScheduleMain';
import MyInfoMain from './MyInfoMain';
import MyInfoContents from './MyInfoContents';
import MyInfoContentsViewer from './MyInfoContentsViewer';
import AuthMain from './AuthMain';
import AuthVerify from './AuthVerify';

const Tab = createBottomTabNavigator();

const OnAir = createStackNavigator();
const Schedule = createStackNavigator();
const MyInfo = createStackNavigator();
const Auth = createStackNavigator();

const Main = createDrawerNavigator();
const Chat = createDrawerNavigator();

const OnAirStack = () => (
  <OnAir.Navigator>
    <OnAir.Screen name="OnAirMain" component={MainDrawer} options={{ headerShown: false }} />
    <OnAir.Screen name="OnAirRoom" component={OnAirRoom}
      options={{ headerShown: false }}
    />
    <OnAir.Screen name="OnAirChat" component={ChatDrawer}
      options={{ headerShown: false }}
    />
  </OnAir.Navigator>
);
const MainDrawer = () => (
  <Main.Navigator
    drawerPosition="right"
    drawerContent={props => <OnAirMainDrawer {...props} />}
  >
    <Main.Screen name="OnAirMainDrawer" component={OnAirMain} />
  </Main.Navigator>
);
const ChatDrawer = () => {
  return (
    <Chat.Navigator
      drawerPosition="right"
      drawerStyle={{ width: '60%' }}
      drawerContent={props => <OnAirChatDrawer {...props} />}
    >
      <Chat.Screen name="onAirChat" component={OnAirChat} />
    </Chat.Navigator>
  )
};

const ScheduleStack = () => (
  <Schedule.Navigator>
    <Schedule.Screen name="ScheduleMain" component={ScheduleMain}
      options={{ headerShown: false }}
    />
  </Schedule.Navigator>
);
const MyInfoStack = () => (
  <MyInfo.Navigator>
    <MyInfo.Screen name="MyInfoMain" component={MyInfoMain}
      options={{ headerShown: false }}
    />
    <MyInfo.Screen name="MyInfoContents" component={MyInfoContents}
      options={({ route }) => { return { title: route.params.title } }}
    />
    <MyInfo.Screen name="MyInfoContentsViewer" component={MyInfoContentsViewer}
      options={({ route }) => { return { title: route.params.title } }}
    />
  </MyInfo.Navigator>
);

const App = () => {
  const dispatch = useDispatch();
  const { sessionInfo, checkSessionErr } = useSelector(state => state.session);

  const setTabBarVisible = route => {
    const routeName = getFocusedRouteNameFromRoute(route);
    const hideOnScreens = ['OnAirChat'];
    if (hideOnScreens.indexOf(routeName) > -1) return false;
    return true;
  };

  useEffect(() => {
    SplashScreen.hide();
  }, [checkSessionErr])

  useEffect(() => {
    dispatch({
      type: CHECK_SESSION_REQ,
    });
  }, []);

  if (sessionInfo) {
    return (
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            if (route.name === '중계') {
              iconName = focused ? 'comment-dots' : 'comment'
            } else if (route.name === '편성표') {
              iconName = focused ? 'list-alt' : 'list-alt'
            } else if (route.name === '내 정보') {
              iconName = focused ? 'grin-tongue' : 'grin';
            }

            return <FontAwesome5 suppressHighlighting name={iconName} size={size} color={color} />
          }
        })}
        tabBarOptions={{
          activeTintColor: 'tomato',
          inactiveTintColor: 'gray',
          labelPosition: 'below-icon',
          keyboardHidesTabBar: true,
          style: {
            position: 'absolute',
          }
        }}
      >
        <Tab.Screen name="중계" component={OnAirStack}
          options={({ route }) => ({ tabBarVisible: setTabBarVisible(route) })}
        />
        <Tab.Screen name="편성표" component={ScheduleStack} />
        <Tab.Screen name="내 정보" component={MyInfoStack} />
      </Tab.Navigator>
    )
  }
  return (
    <Auth.Navigator>
      <Auth.Screen name="AuthMain" component={AuthMain} options={{ headerShown: false }} />
      <Auth.Screen name="AuthVerify" component={AuthVerify} options={{ headerShown: false }} />
    </Auth.Navigator>
  )
}

export default App;