// src/App.js
import React from 'react';
import FoodList from './components/FoodList';

const App = () => {
  const apiKey = 'AEDjuhZ3DfJ2SxMZgxTc0OGcE891jgiNhsDZteIF';

  return (
    <div>
      
      <FoodList apiKey={apiKey} />
    </div>
  );
};

export default App;
