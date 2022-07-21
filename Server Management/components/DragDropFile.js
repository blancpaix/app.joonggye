import React, { useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { useDispatch } from 'react-redux';
import { UPLOAD_IMG_REQ } from '../reducers/program';

const DragDropFile = ({ programUID }) => {
  const dispatch = useDispatch();
  const { acceptedFiles, getRootProps, getInputProps, isDragActive, } = useDropzone();

  const files = acceptedFiles.map(file => {
    return (
      <li key={file.path}>
        {file.path} - {file.size} bytes
      </li>
    )
  });

  useEffect(() => {
    if (acceptedFiles.length > 0) {
      dispatch({
        type: UPLOAD_IMG_REQ,
        data: { programUID, file: acceptedFiles[0] }
      })
    }
  }, [acceptedFiles, programUID])


  return (
    <section className="container" style={{ background: '#d0d0d0', margin: 0, padding: 0 }}>
      <div {...getRootProps({ className: 'dropZone' })} >
        <input {...getInputProps()} />
        {
          isDragActive ?
            <p>Drop 놓아보거라</p> :
            <p>Drag 끌어오거라</p>
        }
      </div>
      <aside>
        <h4>files</h4>
        <ul>{files}</ul>
      </aside>
    </section>
  )
};

export default DragDropFile;