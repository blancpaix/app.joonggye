import React, { useEffect, useState } from 'react';
import { Text, View, ScrollView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { LOAD_TERMS_REQ } from '../../reducers/service';

import { TermPathMaker } from '../Constants';

const Terms = () => {
  const dispatch = useDispatch();
  const [parsedTerms, setParsedTerms] = useState('');
  const { termsPath } = useSelector(state => state.service);

  useEffect(() => {
    if (termsPath) {
      fetch(TermPathMaker(termsPath))
        .then(res => res.text())
        .then(text => setParsedTerms(text));
    } else {
      dispatch({
        type: LOAD_TERMS_REQ
      });
    }
  }, [termsPath])

  return (
    <ScrollView>
      <View style={{ padding: 9 }}>
        <Text>{parsedTerms}</Text>
      </View>
    </ScrollView>
  )
};

export default Terms;