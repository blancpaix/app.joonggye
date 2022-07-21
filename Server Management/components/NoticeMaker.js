import React, { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { UPLOAD_NOTICE_REQ } from '../reducers/program';

const NoticeMaker = () => {
  const dispatch = useDispatch();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [img, setImg] = useState(null);

  const onTypeTitle = useCallback((e) => {
    setTitle(e.target.value);
  },[]);

  const onTypeContent = useCallback((e) => {
    setContent(e.target.value);
  }, []);

  const onSubmitNotice = useCallback((e) => {
    e.preventDefault();
    console.log('이거를 누르네?', title, content, img);
    dispatch({
      type: UPLOAD_NOTICE_REQ,
      data: {title, content, img}
    }, [ title, content, img])
    
  }, [title, content]);

  const onDeleteNotice = useCallback((e) => {
    e.preventDefault();
    setTitle('');
    setContent('');
    setImg(null);
    
  }, []);


  return (
    <div>
      <p>이거는 뭐니?</p>
      <form>
        <span>제목</span>
        <input type="text" onChange={onTypeTitle} value={title} />
        <br />
        <span>내용</span>
        <textarea  onChange={onTypeContent} value={content} />
        <br />
        <input type="file" />
        <br />

        <button type="submit" onClick={onSubmitNotice}>Submit</button>
        <button type="button" onClick={onDeleteNotice} >Cancel</button>
      </form>
    </div>
  )
};

export default NoticeMaker;