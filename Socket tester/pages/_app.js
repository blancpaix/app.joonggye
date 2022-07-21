import React from 'react';
import 'antd/dist/antd.css';

import wrapper from '../store/configureStore';

const App = ({ Component }) => (
  <>
    <Component />
  </>
);

export default wrapper.withRedux(App)
// export default App;