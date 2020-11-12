import React, { useEffect } from 'react';
import './App.scss';
import ReactJson from 'react-json-view';
import mauiA from './config/MauiA.json';
import { generateTemplate, loadSchema } from './validator/Validator';

function App(): JSX.Element {
  
  const initValidater = async () => {
    await loadSchema();
    console.log(generateTemplate([ "assets", "splines"]));
  }

  useEffect(() => {
    initValidater();
  },[]);


  return (
    <div className="App">
      <div className="json-view">
          <ReactJson src={mauiA} />
      </div>
    </div>
  );
}

export default App;
