import React from 'react';
import { useSelector } from 'react-redux';

const ChatRoomList = () => {
  const { chatRooms } = useSelector(state => state.program);

  return (
    <>
      <h3>채팅방 목록</h3>

      {!!chatRooms.length
        && chatRooms.map(el => {
          console.log('map ? el', el);
          return (

            <div style={{ background: "#dfdfdf", flexDirection: 'row', margin: 4 }} key={el.roomId}>
              <div style={{ display: 'flex', alignContent: 'center', alignItems: 'center', height: 35 }}>
                {el.roomId}
                <br />
                {el.title} - {el.count}/{el.max} - {el.createdBy}  상태: {el.state}
              </div>
            </div>
          )
        })}
    </>
  )
};

export default ChatRoomList;