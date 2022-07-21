import React, { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { SIGN_IN_REQ } from '../reducers/program';

const Signin = () => {
  const dispatch = useDispatch();
  const [id, setId] = useState('');
  const [pw, setPw] = useState('');

  const onChangeId = useCallback((e) => {
    setId(e.target.value);
  }, []);

  const onchangePw = useCallback(e => {
    setPw(e.target.value);
  }, []);

  const onClickSubmit = useCallback(e => {
    e.preventDefault();
    const data = { id, pw };
    dispatch({
      type: SIGN_IN_REQ,
      data
    })
  }, [id, pw]);


  return (
    <>
      <h3>JG 2021 msys</h3>
      <input onChange={onChangeId} />
      <input type="password" onChange={onchangePw} />
      <button onClick={onClickSubmit}>READY</button>
    </>
  )
};

export default Signin;