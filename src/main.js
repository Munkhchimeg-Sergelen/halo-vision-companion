import React from 'react';
import ReactDOM from 'react-dom/client';
import SimpleApp from './SimpleApp.jsx';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  React.createElement(React.StrictMode, null,
    React.createElement(SimpleApp, null)
  )
);
