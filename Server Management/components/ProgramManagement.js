import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { LOAD_NON_IMG_PROGRAM_REQ, } from '../reducers/program';

import DragDropFile from './DragDropFile';

const ProgramManagement = () => {
  const dispatch = useDispatch();
  const { loadedNoneImgPrograms } = useSelector(state => state.program);

  const onPressLoadNoneImgProgram = useCallback(() => {
    dispatch({
      type: LOAD_NON_IMG_PROGRAM_REQ
    })
  }, []);

  return (
    <>
      <button onClick={onPressLoadNoneImgProgram}>LOAD PROGRAMS-none Img</button>

      {!!loadedNoneImgPrograms && (
        loadedNoneImgPrograms.map(el => {

          return (
            <div style={{ background: "yellow", flexDirection: 'row', margin: 0 }} key={el.programUID}>
              <div style={{ display: 'flex', alignContent: 'center', alignItems: 'center', height: 25 }}>
                <p>{el.broadcastor}  :  </p>
                <a target="_blank" href={'https://search.naver.com/search.naver?where=nexearch&sm=top_hty&fbm=1&ie=utf8&query=' + el.broadcastor + " " + el.title}> 네이버 검색</a>
              </div>
              <p style={{ margin: 0 }}>{el.title}</p>
              <p style={{ margin: 0 }}>{el.programUID} : {el.img}</p>
              <DragDropFile programUID={el.programUID} />
            </div>
          )
        })
      )
      }
    </>
  )
};

export default ProgramManagement;