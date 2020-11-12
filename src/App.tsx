import React, { useEffect } from 'react';
import './App.scss';
import ReactJson from 'react-json-view';
import mauiA from './config/MauiA.json';
import { generateTemplate, loadSchema } from './validator/Validator';
import { RefType } from './enum/RefType.enum';

function App(): JSX.Element {
  
  const initValidater = async () => {
    await loadSchema();
    console.log(generateTemplate([ {refType: RefType.Object, val: "simulations"}]));
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
