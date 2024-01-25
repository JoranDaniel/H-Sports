// src/components/CompareFood.js
import React from 'react';

const CompareFood = ({ foods }) => {
  return (
    <div>
      <h2>Compare Foods</h2>
      <ul>
        {foods.map((food) => (
          <p key={food.fdcId}>
            <strong>{food.description}</strong>
            <ul>
          
              {/* Add more nutritional information as needed */}
            </ul>
          </p>
        ))}
      </ul>
    </div>
  );
};

export default CompareFood;
