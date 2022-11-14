import React from 'react';
import { DragAndDropProvider } from 'react-use-drag-and-drop';
import ReactDOM from 'react-dom';

import { Home } from './Home';


ReactDOM.render(
  <React.StrictMode>
    <DragAndDropProvider>
      <Home />
    </DragAndDropProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
