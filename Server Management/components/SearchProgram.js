import React, { useCallback, useState, } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { SEARCH_PROGRAM_REQ } from '../reducers/program';

import { ProgramImgMaker } from '../src/firebaseFn';
import DragDropFile from './DragDropFile';

const SearchProgram = () => {
  const dispatch = useDispatch();
  const { searchPrograms } = useSelector(state => state.program)
  const [term, setTerm] = useState('');

  const onPressTerm = useCallback(e => {
    console.log('target Value?', e.target.value)
    setTerm(e.target.value);
  }, []);

  const onPressSearch = useCallback(() => {
    dispatch({
      type: SEARCH_PROGRAM_REQ,
      data: term,
    });
  }, [term])


  return (
    <>
      <h4>프로그램 검색</h4>
      <input onChange={onPressTerm} value={term} />
      <button onClick={onPressSearch}>Search Program</button>

      <br />
      {searchPrograms && searchPrograms.map(el => {

        return (
          <div style={{ display: 'inline' }}>
            <img src={el.img ? ProgramImgMaker(el.img) : null} style={{ height: 180, width: 120 }} />
            <p>{el.broadcastor} {el.title} {el.programUID} {el.genre}</p>
            <p>IMG : {el.img}</p>
            {!el.img && (
              <DragDropFile programUID={el.programUID} />
            )}
          </div>
        )
      })}
    </>
  )
};

export default SearchProgram;

// 생활의 달인