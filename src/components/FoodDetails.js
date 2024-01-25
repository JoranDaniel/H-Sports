// src/components/FoodDetails.js
import React from 'react';

const FoodDetails = ({ food }) => {
  return (
    <div>
      <h2>Food Details</h2>
      <strong>{food.description}</strong>
      <ul>
        

        {/* Add more nutritional information as needed */}
      </ul>
    </div>
  );
};

export default FoodDetails;
