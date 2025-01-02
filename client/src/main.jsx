import React from 'react';
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { store, persistor } from './redux/store.js';
import { PersistGate } from 'redux-persist/integration/react';
import './index.css'
import App from './App.jsx'

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
    <PersistGate persistor={persistor}>
      <Provider store={store}>
        <App />
      </Provider>
    </PersistGate>
);
