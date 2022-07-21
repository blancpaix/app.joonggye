import React, { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { DELETE_PROGRAM_DATA_REQ } from '../reducers/program';

const DeleteProgram = () => {
  const dispatch = useDispatch();
  const [term, setTerm] = useState('');

  const onTypeTerm = useCallback(e => {
    setTerm(e.target.value);
  }, []);

  const onPressDelete = useCallback(() => {
    dispatch({
      type: DELETE_PROGRAM_DATA_REQ,
      data: term.trim(),
    })
  }, [term])


  return (
    <>
      <h4>삭제할 프로그램 (UID)</h4>
      <input onChange={onTypeTerm} value={term} />
      <button onClick={onPressDelete}>DELETE Program</button>
      <br />

    </>
  )
};

export default DeleteProgram;