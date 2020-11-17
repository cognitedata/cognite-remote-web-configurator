import React, { useEffect } from 'react';
import './App.scss';
import { JsonConfigurator } from './views/JsonConfigurator/JsonConfigurator';
import { generateTemplate, loadSchema } from './validator/Validator';

function App(): JSX.Element {
  
  const initValidater = async () => {
    await loadSchema();
    console.log(generateTemplate([{isArray: false, val: "coordinates"}]));
  }

  useEffect(() => {
    initValidater();
  },[]);


  return (
    <div className="App">
      <JsonConfigurator />
    </div>
  );
}

export default App;
