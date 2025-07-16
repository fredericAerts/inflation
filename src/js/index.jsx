import { createRoot } from 'react-dom/client';

import './index.styl';

import App from '@App/App';

const container = document.getElementById('js-app');
const root = createRoot(container);
root.render(<App />);