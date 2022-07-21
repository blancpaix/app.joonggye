import { useState, useCallback } from 'react';

const UseInput = (initialValue = '') => {
  const [value, setValue] = useState(initialValue);
  const handler = useCallback((e) => {
    setValue(e);
  }, []);

  return [value, handler, setValue];
}

export default UseInput;
