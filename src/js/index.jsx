import { Provider } from 'react-redux';
import { createRoot } from 'react-dom/client';

import './index.styl';

import App from '@App/App';
import AsyncState from '@App/AsyncState/AsyncState';

import store from './index.store';

const container = document.getElementById('js-app');
const root = createRoot(container);
root.render(
  <Provider store={store}>
    <App />
    <AsyncState />
  </Provider>
);