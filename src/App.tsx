import React  from 'react';
import './App.scss';
import { JsonConfigurator } from './views/JsonConfigurator/JsonConfigurator';

function App(): JSX.Element {
  return (
    <div className="App">
      <JsonConfigurator />
    </div>
  );
}

export default App;
