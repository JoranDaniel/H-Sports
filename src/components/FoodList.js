// src/components/FoodList.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FoodList = ({ apiKey }) => {
  const [foods, setFoods] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFoods, setSelectedFoods] = useState([]);
  const [hiddenFoods, setHiddenFoods] = useState([]);
  const [visibleNutrients, setVisibleNutrients] = useState(5);
  const [selectedForComparison, setSelectedForComparison] = useState([]);
  const [differences, setDifferences] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('https://api.nal.usda.gov/fdc/v1/foods/search', {
          params: {
            api_key: apiKey,
            query: searchQuery,
          },
        });

        const foodList = response.data.foods;
        setFoods(foodList);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [apiKey, searchQuery]);

  const handleFoodClick = async (fdcId) => {
    try {
      const response = await axios.get(`https://api.nal.usda.gov/fdc/v1/food/${fdcId}`, {
        params: {
          api_key: apiKey,
        },
      });

      const selectedFoodData = response.data;
      setSelectedFoods((prevSelected) => {
        if (prevSelected.length < 2 && !prevSelected.find((food) => food.fdcId === fdcId)) {
          return [...prevSelected, selectedFoodData];
        }
        return prevSelected;
      });

      setVisibleNutrients(5);
    } catch (error) {
      console.error('Error fetching food details:', error);
    }
  };

  const toggleNutritionalContent = (fdcId) => {
    setHiddenFoods((prevHiddenFoods) => {
      if (prevHiddenFoods.includes(fdcId)) {
        return prevHiddenFoods.filter((id) => id !== fdcId);
      } else {
        return [...prevHiddenFoods, fdcId];
      }
    });
  };

  const isFoodHidden = (fdcId) => hiddenFoods.includes(fdcId);

  const handleNutrientScroll = (direction) => {
    if (selectedFoods.length > 0 && selectedFoods[0].foodNutrients) {
      const totalNutrients = selectedFoods[0].foodNutrients.length;
      const maxVisibleNutrients = Math.min(totalNutrients, 10);

      if (direction === 'next') {
        setVisibleNutrients((prevVisible) =>
          prevVisible + 5 <= totalNutrients ? prevVisible + 5 : maxVisibleNutrients
        );
      } else if (direction === 'prev') {
        setVisibleNutrients((prevVisible) =>
          prevVisible - 5 >= 5 ? prevVisible - 5 : maxVisibleNutrients
        );
      }
    }
  };

  const addToComparison = (fdcId) => {
    setSelectedForComparison((prevSelected) => {
      if (!prevSelected.includes(fdcId)) {
        return [...prevSelected, fdcId];
      }
      return prevSelected;
    });
  };

  const removeFromComparison = (fdcId) => {
    setSelectedForComparison((prevSelected) => prevSelected.filter((id) => id !== fdcId));
  };

  const clearComparison = () => {
    setSelectedForComparison([]);
    setDifferences([]);
  };

  const isInComparison = (fdcId) => selectedForComparison.includes(fdcId);

  const compareFoods = () => {
    if (selectedForComparison.length > 1) {
      const comparedData = selectedForComparison.map((fdcId) => {
        const selectedFood = foods.find((food) => food.fdcId === fdcId);
        return {
          fdcId,
          description: selectedFood.description,
          nutrients: selectedFood.foodNutrients.map((nutrient) => ({
            nutrientId: nutrient.nutrientId,
            nutrientName: nutrient.nutrientName,
            value: nutrient.value,
          })),
        };
      });
  
      console.log('Compared Data:', comparedData);
  
      // Calculate differences
      const calculatedDifferences = [];
      for (let i = 0; i < comparedData[0].nutrients.length; i++) {
        const nutrientId = comparedData[0].nutrients[i].nutrientId;
        const nutrientName = comparedData[0].nutrients[i].nutrientName;
        const values = comparedData.map((food) => {
          const nutrient = food.nutrients.find((n) => n.nutrientId === nutrientId);
          console.log('Nutrient:', nutrient);
          return nutrient.value;
        });
        const hasDifference = values.some((value, index, array) => value !== array[0]);
  
        if (hasDifference) {
          calculatedDifferences.push({
            nutrientId,
            nutrientName,
            values,
          });
        }
      }
  
      setDifferences(calculatedDifferences);
    } else {
      console.log('Select at least two foods for comparison.');
    }
  };
  
  return (
    <div style={{ textAlign: 'center', maxWidth: '1200px', margin: 'auto' }}>
      <h2 style={{ marginBottom: '20px', color: '#333' }}>Food List with Nutritional Content</h2>

      <input
        type="text"
        placeholder="Search for foods..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{
          marginBottom: '20px',
          padding: '10px',
          width: '100%',
          boxSizing: 'border-box',
        }}
      />

      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
        {foods.map((food) => (
          <div
            key={food.fdcId}
            style={{
              margin: '10px',
              padding: '20px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              width: '300px', // Adjusted width
              textAlign: 'center',
              background: '#fff',
              boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
              transition: 'box-shadow 0.3s ease',
              cursor: 'pointer',
            }}
            onClick={() => handleFoodClick(food.fdcId)}
          >
            <div style={{ marginBottom: '10px' }}>
              <strong style={{ color: '#333' }}>{food.description}</strong>
            </div>
            {!isFoodHidden(food.fdcId) && (
              <>
                <div style={{ color: '#666', fontSize: '14px', marginBottom: '10px' }}>
                  Nutritional Content:
                </div>
                <ul
                  style={{
                    listStyle: 'none',
                    padding: '0',
                    maxHeight: '100px',
                    overflow: 'hidden',
                    transition: 'max-height 0.5s ease',
                  }}
                >
                  {food.foodNutrients.slice(0, visibleNutrients).map((nutrient) => (
                    <li
                      key={nutrient.nutrientId}
                      style={{ marginBottom: '5px', color: '#555', fontSize: '12px' }}
                    >
                      {nutrient.nutrientName}: {nutrient.value} {nutrient.unitName}
                    </li>
                  ))}
                </ul>
                {food.foodNutrients.length > 5 && (
                  <div style={{ marginTop: '10px' }}>
                    <button
                      onClick={() => handleNutrientScroll('prev')}
                      style={{ marginRight: '5px', fontSize: '12px' }}
                    >
                      Prev
                    </button>
                    <button
                      onClick={() => handleNutrientScroll('next')}
                      style={{ fontSize: '12px' }}
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
            <button
              onClick={() => toggleNutritionalContent(food.fdcId)}
              style={{
                marginTop: '10px',
                padding: '8px',
                background: '#4CAF50',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'background 0.3s ease',
              }}
            >
              {isFoodHidden(food.fdcId)
                ? 'Show Nutritional Content'
                : 'Hide Nutritional Content'}
            </button>

            <div style={{ marginTop: '10px' }}>
              {isInComparison(food.fdcId) ? (
                <button onClick={() => removeFromComparison(food.fdcId)}>Remove from Comparison</button>
              ) : (
                <button onClick={() => addToComparison(food.fdcId)}>Add to Comparison</button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '20px', marginBottom: '20px' }}>
        <h3 style={{ color: '#333' }}>Selected for Comparison:</h3>
        <ul style={{ listStyle: 'none', padding: '0' }}>
          {selectedForComparison.map((fdcId) => (
            <li key={fdcId}>
              {fdcId} {/* Display some information about the selected food item */}
              <button onClick={() => removeFromComparison(fdcId)}>Remove</button>
            </li>
          ))}
        </ul>
        {selectedForComparison.length > 1 && (
          <button onClick={compareFoods} style={{ fontSize: '16px', marginTop: '10px' }}>
            Compare Selected Foods
          </button>
        )}
        {selectedForComparison.length > 0 && (
          <button onClick={clearComparison} style={{ fontSize: '14px', marginTop: '10px' }}>
            Clear Comparison
          </button>
        )}

        {differences.length > 0 && (
          <div style={{ marginTop: '20px' }}>
            <h3 style={{ color: '#333' }}>Nutrient Differences:</h3>
            <ul style={{ listStyle: 'none', padding: '0' }}>
              {differences.map((difference) => (
                <li key={difference.nutrientId}>
                  {difference.nutrientName}: {difference.values.join(' | ')}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default FoodList;
