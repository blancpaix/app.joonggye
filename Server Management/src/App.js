import React from 'react';
import { useSelector } from 'react-redux';

import Layout from '../components/Layout';
import Signin from '../components/Signin';
import SearchProgram from '../components/SearchProgram';

import Broadcasting from '../components/Broadcasting';
import ChatRoomList from '../components/ChatRoomList';
import ProgramManagement from '../components/ProgramManagement';
import NoticeMaker from '../components/NoticeMaker';
import WeeklyScheduleLoader from '../components/WeeklyScheduleLoader';
import DeleteProgram from '../components/DeleteProgram';

const App = () => {
  const { session } = useSelector(state => state.program);
  return (
    <>
      {session
        ? (
          <Layout>
            <ProgramManagement />
            <SearchProgram />
            <ProgramManagement />
            <WeeklyScheduleLoader />
            <NoticeMaker />
            <DeleteProgram />
            <Broadcasting />
            <ChatRoomList />
          </Layout>
        )
        : (
          <>
            <Signin />
            <SearchProgram />
          </>
        )
      }

    </>
  )
};

export default App;