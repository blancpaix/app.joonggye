import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { LOAD_BROADCASTING_PROGRAM_REQ, LOAD_CHAT_ROOMS_REQ } from '../reducers/program';

const ProgramManagement = () => {
  const dispatch = useDispatch();
  const { broadcastingPrograms } = useSelector(state => state.program);

  const onPressLoadBroadcasting = useCallback(() => {
    dispatch({
      type: LOAD_BROADCASTING_PROGRAM_REQ
    })
  }, []);

  const onPressLoadChatRooms = useCallback((data) => {
    dispatch({
      type: LOAD_CHAT_ROOMS_REQ,
      data,
    });
  }, [])

  return (
    <>
      <h3>방송중인 프로그램</h3>
      <button onClick={onPressLoadBroadcasting}>LOAD BROADCASTING PROGRAM</button>

      {!!broadcastingPrograms && (
        broadcastingPrograms.map(el => {

          return (
            <div style={{ background: "#f2f2f2", flexDirection: 'row', margin: 0 }} key={el.scheduleUID}>
              <div style={{ display: 'flex', alignContent: 'center', alignItems: 'center', height: 25 }}>
                <p>{el.scheduleUID} : </p>
                <p>{el.broadcastor} - {el.title}</p>
                <br />
                <button onClick={() => onPressLoadChatRooms(el.scheduleUID)}>LOAD CHAT ROOMS</button>
              </div>

            </div>
          )
        })
      )
      }
    </>
  )
};

export default ProgramManagement;