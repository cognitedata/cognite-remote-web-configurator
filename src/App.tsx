import React from 'react';
import './App.scss';
import ReactJson from 'react-json-view';
import mauiA from './config/MauiA.json';

function App(): JSX.Element {
  return (
    <div className="App">
      <div className="json-view">
          <ReactJson src={mauiA} />
      </div>
    </div>
  );
}

export default App;
