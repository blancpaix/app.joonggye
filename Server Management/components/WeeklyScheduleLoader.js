import React, { useCallback, useState, } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { LOAD_WEEKLYSCHEDULE_REQ } from '../reducers/program';

import dayjs from 'dayjs';

const WeeklyScheduleLoader = () => {
  const dispatch = useDispatch();
  const { weeklySchedules } = useSelector(state => state.program)
  const [term, setTerm] = useState('');

  const onTypeTerm = useCallback(e => {
    setTerm(e.target.value);
  }, []);

  const onPressSearch = useCallback(() => {
    dispatch({
      type: LOAD_WEEKLYSCHEDULE_REQ,
      data: term,
    });
  }, [term])


  return (
    <>
      <h4>WeeklySchedules 검색 (방송사명)</h4>
      <input onChange={onTypeTerm} value={term} />
      <button onClick={onPressSearch}>Search Program</button>

      <br />
      {weeklySchedules && weeklySchedules.map(el => {

        return (
          <div style={{ display: 'inline' }}>
            <p></p>
            <p>{dayjs(el.startAt.toDate()).format('YYYY-MM-DD HH:mm')}</p>
            <p>{el.title} || {el.scheduleUID}</p>
          </div>
        )
      })}
    </>
  )
};

export default WeeklyScheduleLoader;

