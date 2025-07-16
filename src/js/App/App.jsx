import React, { useEffect } from 'react';
import { setViewHeight } from '@services/utils.service';

import './app.styl';

function App() {
  useEffect(() => {
    setViewHeight();
    window.addEventListener('resize', setViewHeight);
    return () => window.removeEventListener('resize', setViewHeight);
  }, []);

  return (
    <div className="app">
      <div className="app__banner">
      </div>
      <div className="app__body">
        <img src="/img/icons/egg.svg" />  
      </div>
    </div>
  );
}

export default App;