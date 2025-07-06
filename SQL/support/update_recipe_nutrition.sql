-- Update Recipe Nutritional Information
-- This script updates the existing recipes with more realistic and varied nutritional data

USE nutrichef;

-- Update recipes with more realistic nutritional data
UPDATE `Recipes` SET `NutritionInfoJSON` = '{
  "notes": "Nutritional values are estimates based on typical ingredient values",
  "success": true,
  "nutrition": {
    "calories": {"unit": "kcal", "amount": 380},
    "protein": {"unit": "g", "amount": 14},
    "carbohydrates": {"unit": "g", "amount": 65},
    "fat": {"unit": "g", "amount": 8},
    "fiber": {"unit": "g", "amount": 4},
    "sugar": {"unit": "g", "amount": 3},
    "sodium": {"unit": "mg", "amount": 450}
  },
  "per_serving": true
}' WHERE `RecipeID` = 1; -- Classic Tomato Basil Pasta

UPDATE `Recipes` SET `NutritionInfoJSON` = '{
  "notes": "Nutritional values are estimates based on typical ingredient values",
  "success": true,
  "nutrition": {
    "calories": {"unit": "kcal", "amount": 420},
    "protein": {"unit": "g", "amount": 35},
    "carbohydrates": {"unit": "g", "amount": 25},
    "fat": {"unit": "g", "amount": 18},
    "fiber": {"unit": "g", "amount": 6},
    "sugar": {"unit": "g", "amount": 8},
    "sodium": {"unit": "mg", "amount": 850}
  },
  "per_serving": true
}' WHERE `RecipeID` = 2; -- Quick Chicken Stir-Fry

UPDATE `Recipes` SET `NutritionInfoJSON` = '{
  "notes": "Nutritional values are estimates based on typical ingredient values",
  "success": true,
  "nutrition": {
    "calories": {"unit": "kcal", "amount": 280},
    "protein": {"unit": "g", "amount": 8},
    "carbohydrates": {"unit": "g", "amount": 15},
    "fat": {"unit": "g", "amount": 22},
    "fiber": {"unit": "g", "amount": 3},
    "sugar": {"unit": "g", "amount": 4},
    "sodium": {"unit": "mg", "amount": 600}
  },
  "per_serving": true
}' WHERE `RecipeID` = 3; -- Creamy Mushroom Soup

UPDATE `Recipes` SET `NutritionInfoJSON` = '{
  "notes": "Nutritional values are estimates based on typical ingredient values",
  "success": true,
  "nutrition": {
    "calories": {"unit": "kcal", "amount": 320},
    "protein": {"unit": "g", "amount": 18},
    "carbohydrates": {"unit": "g", "amount": 45},
    "fat": {"unit": "g", "amount": 12},
    "fiber": {"unit": "g", "amount": 12},
    "sugar": {"unit": "g", "amount": 8},
    "sodium": {"unit": "mg", "amount": 380}
  },
  "per_serving": true
}' WHERE `RecipeID` = 4; -- Lentil Salad with Roasted Vegetables

UPDATE `Recipes` SET `NutritionInfoJSON` = '{
  "notes": "Nutritional values are estimates based on typical ingredient values",
  "success": true,
  "nutrition": {
    "calories": {"unit": "kcal", "amount": 580},
    "protein": {"unit": "g", "amount": 28},
    "carbohydrates": {"unit": "g", "amount": 65},
    "fat": {"unit": "g", "amount": 24},
    "fiber": {"unit": "g", "amount": 3},
    "sugar": {"unit": "g", "amount": 2},
    "sodium": {"unit": "mg", "amount": 520}
  },
  "per_serving": true
}' WHERE `RecipeID` = 5; -- Garlic Butter Shrimp Scampi with Linguine

UPDATE `Recipes` SET `NutritionInfoJSON` = '{
  "notes": "Nutritional values are estimates based on typical ingredient values",
  "success": true,
  "nutrition": {
    "calories": {"unit": "kcal", "amount": 320},
    "protein": {"unit": "g", "amount": 18},
    "carbohydrates": {"unit": "g", "amount": 25},
    "fat": {"unit": "g", "amount": 18},
    "fiber": {"unit": "g", "amount": 2},
    "sugar": {"unit": "g", "amount": 3},
    "sodium": {"unit": "mg", "amount": 480}
  },
  "per_serving": true
}' WHERE `RecipeID` = 6; -- Fluffy Scrambled Eggs with Toast

UPDATE `Recipes` SET `NutritionInfoJSON` = '{
  "notes": "Nutritional values are estimates based on typical ingredient values",
  "success": true,
  "nutrition": {
    "calories": {"unit": "kcal", "amount": 280},
    "protein": {"unit": "g", "amount": 12},
    "carbohydrates": {"unit": "g", "amount": 35},
    "fat": {"unit": "g", "amount": 12},
    "fiber": {"unit": "g", "amount": 8},
    "sugar": {"unit": "g", "amount": 2},
    "sodium": {"unit": "mg", "amount": 420}
  },
  "per_serving": true
}' WHERE `RecipeID` = 7; -- Black Bean Burgers

UPDATE `Recipes` SET `NutritionInfoJSON` = '{
  "notes": "Nutritional values are estimates based on typical ingredient values",
  "success": true,
  "nutrition": {
    "calories": {"unit": "kcal", "amount": 450},
    "protein": {"unit": "g", "amount": 32},
    "carbohydrates": {"unit": "g", "amount": 35},
    "fat": {"unit": "g", "amount": 22},
    "fiber": {"unit": "g", "amount": 6},
    "sugar": {"unit": "g", "amount": 8},
    "sodium": {"unit": "mg", "amount": 680}
  },
  "per_serving": true
}' WHERE `RecipeID` = 8; -- Simple Roasted Chicken Thighs with Root Vegetables

UPDATE `Recipes` SET `NutritionInfoJSON` = '{
  "notes": "Nutritional values are estimates based on typical ingredient values",
  "success": true,
  "nutrition": {
    "calories": {"unit": "kcal", "amount": 180},
    "protein": {"unit": "g", "amount": 8},
    "carbohydrates": {"unit": "g", "amount": 6},
    "fat": {"unit": "g", "amount": 14},
    "fiber": {"unit": "g", "amount": 2},
    "sugar": {"unit": "g", "amount": 4},
    "sodium": {"unit": "mg", "amount": 320}
  },
  "per_serving": true
}' WHERE `RecipeID` = 9; -- Caprese Salad

UPDATE `Recipes` SET `NutritionInfoJSON` = '{
  "notes": "Nutritional values are estimates based on typical ingredient values",
  "success": true,
  "nutrition": {
    "calories": {"unit": "kcal", "amount": 220},
    "protein": {"unit": "g", "amount": 8},
    "carbohydrates": {"unit": "g", "amount": 35},
    "fat": {"unit": "g", "amount": 6},
    "fiber": {"unit": "g", "amount": 4},
    "sugar": {"unit": "g", "amount": 25},
    "sodium": {"unit": "mg", "amount": 45}
  },
  "per_serving": true
}' WHERE `RecipeID` = 10; -- Berry Smoothie

UPDATE `Recipes` SET `NutritionInfoJSON` = '{
  "notes": "Nutritional values are estimates based on typical ingredient values",
  "success": true,
  "nutrition": {
    "calories": {"unit": "kcal", "amount": 380},
    "protein": {"unit": "g", "amount": 42},
    "carbohydrates": {"unit": "g", "amount": 8},
    "fat": {"unit": "g", "amount": 20},
    "fiber": {"unit": "g", "amount": 3},
    "sugar": {"unit": "g", "amount": 2},
    "sodium": {"unit": "mg", "amount": 480}
  },
  "per_serving": true
}' WHERE `RecipeID` = 11; -- Sheet Pan Lemon Herb Salmon and Asparagus

UPDATE `Recipes` SET `NutritionInfoJSON` = '{
  "notes": "Nutritional values are estimates based on typical ingredient values",
  "success": true,
  "nutrition": {
    "calories": {"unit": "kcal", "amount": 280},
    "protein": {"unit": "g", "amount": 35},
    "carbohydrates": {"unit": "g", "amount": 12},
    "fat": {"unit": "g", "amount": 12},
    "fiber": {"unit": "g", "amount": 4},
    "sugar": {"unit": "g", "amount": 6},
    "sodium": {"unit": "mg", "amount": 520}
  },
  "per_serving": true
}' WHERE `RecipeID` = 12; -- Chicken and Vegetable Skewers

UPDATE `Recipes` SET `NutritionInfoJSON` = '{
  "notes": "Nutritional values are estimates based on typical ingredient values",
  "success": true,
  "nutrition": {
    "calories": {"unit": "kcal", "amount": 320},
    "protein": {"unit": "g", "amount": 18},
    "carbohydrates": {"unit": "g", "amount": 8},
    "fat": {"unit": "g", "amount": 24},
    "fiber": {"unit": "g", "amount": 0},
    "sugar": {"unit": "g", "amount": 2},
    "sodium": {"unit": "mg", "amount": 420}
  },
  "per_serving": true
}' WHERE `RecipeID` = 13; -- Simple Cheese Omelette

UPDATE `Recipes` SET `NutritionInfoJSON` = '{
  "notes": "Nutritional values are estimates based on typical ingredient values",
  "success": true,
  "nutrition": {
    "calories": {"unit": "kcal", "amount": 380},
    "protein": {"unit": "g", "amount": 12},
    "carbohydrates": {"unit": "g", "amount": 55},
    "fat": {"unit": "g", "amount": 14},
    "fiber": {"unit": "g", "amount": 3},
    "sugar": {"unit": "g", "amount": 4},
    "sodium": {"unit": "mg", "amount": 680}
  },
  "per_serving": true
}' WHERE `RecipeID` = 14; -- Veggie Fried Rice

UPDATE `Recipes` SET `NutritionInfoJSON` = '{
  "notes": "Nutritional values are estimates based on typical ingredient values",
  "success": true,
  "nutrition": {
    "calories": {"unit": "kcal", "amount": 160},
    "protein": {"unit": "g", "amount": 2},
    "carbohydrates": {"unit": "g", "amount": 8},
    "fat": {"unit": "g", "amount": 14},
    "fiber": {"unit": "g", "amount": 6},
    "sugar": {"unit": "g", "amount": 1},
    "sodium": {"unit": "mg", "amount": 180}
  },
  "per_serving": true
}' WHERE `RecipeID` = 15; -- Simple Guacamole

UPDATE `Recipes` SET `NutritionInfoJSON` = '{
  "notes": "Nutritional values are estimates based on typical ingredient values",
  "success": true,
  "nutrition": {
    "calories": {"unit": "kcal", "amount": 280},
    "protein": {"unit": "g", "amount": 4},
    "carbohydrates": {"unit": "g", "amount": 45},
    "fat": {"unit": "g", "amount": 12},
    "fiber": {"unit": "g", "amount": 2},
    "sugar": {"unit": "g", "amount": 28},
    "sodium": {"unit": "mg", "amount": 180}
  },
  "per_serving": true
}' WHERE `RecipeID` = 16; -- Microwave Mug Cake

UPDATE `Recipes` SET `NutritionInfoJSON` = '{
  "notes": "Nutritional values are estimates based on typical ingredient values",
  "success": true,
  "nutrition": {
    "calories": {"unit": "kcal", "amount": 220},
    "protein": {"unit": "g", "amount": 6},
    "carbohydrates": {"unit": "g", "amount": 25},
    "fat": {"unit": "g", "amount": 12},
    "fiber": {"unit": "g", "amount": 4},
    "sugar": {"unit": "g", "amount": 8},
    "sodium": {"unit": "mg", "amount": 680}
  },
  "per_serving": true
}' WHERE `RecipeID` = 17; -- Classic Tomato Soup

UPDATE `Recipes` SET `NutritionInfoJSON` = '{
  "notes": "Nutritional values are estimates based on typical ingredient values",
  "success": true,
  "nutrition": {
    "calories": {"unit": "kcal", "amount": 420},
    "protein": {"unit": "g", "amount": 38},
    "carbohydrates": {"unit": "g", "amount": 8},
    "fat": {"unit": "g", "amount": 26},
    "fiber": {"unit": "g", "amount": 0},
    "sugar": {"unit": "g", "amount": 0},
    "sodium": {"unit": "mg", "amount": 580}
  },
  "per_serving": true
}' WHERE `RecipeID` = 18; -- Pan-Seared Pork Chops

UPDATE `Recipes` SET `NutritionInfoJSON` = '{
  "notes": "Nutritional values are estimates based on typical ingredient values",
  "success": true,
  "nutrition": {
    "calories": {"unit": "kcal", "amount": 180},
    "protein": {"unit": "g", "amount": 6},
    "carbohydrates": {"unit": "g", "amount": 25},
    "fat": {"unit": "g", "amount": 8},
    "fiber": {"unit": "g", "amount": 8},
    "sugar": {"unit": "g", "amount": 12},
    "sodium": {"unit": "mg", "amount": 45}
  },
  "per_serving": true
}' WHERE `RecipeID` = 19; -- Berry Chia Pudding

UPDATE `Recipes` SET `NutritionInfoJSON` = '{
  "notes": "Nutritional values are estimates based on typical ingredient values",
  "success": true,
  "nutrition": {
    "calories": {"unit": "kcal", "amount": 380},
    "protein": {"unit": "g", "amount": 16},
    "carbohydrates": {"unit": "g", "amount": 35},
    "fat": {"unit": "g", "amount": 20},
    "fiber": {"unit": "g", "amount": 2},
    "sugar": {"unit": "g", "amount": 4},
    "sodium": {"unit": "mg", "amount": 680}
  },
  "per_serving": true
}' WHERE `RecipeID` = 20; -- Classic Grilled Cheese Sandwich

UPDATE `Recipes` SET `NutritionInfoJSON` = '{
  "notes": "Nutritional values are estimates based on typical ingredient values",
  "success": true,
  "nutrition": {
    "calories": {"unit": "kcal", "amount": 120},
    "protein": {"unit": "g", "amount": 6},
    "carbohydrates": {"unit": "g", "amount": 18},
    "fat": {"unit": "g", "amount": 4},
    "fiber": {"unit": "g", "amount": 5},
    "sugar": {"unit": "g", "amount": 3},
    "sodium": {"unit": "mg", "amount": 280}
  },
  "per_serving": true
}' WHERE `RecipeID` = 21; -- Speedy Black Bean and Corn Salsa

UPDATE `Recipes` SET `NutritionInfoJSON` = '{
  "notes": "Nutritional values are estimates based on typical ingredient values",
  "success": true,
  "nutrition": {
    "calories": {"unit": "kcal", "amount": 420},
    "protein": {"unit": "g", "amount": 12},
    "carbohydrates": {"unit": "g", "amount": 65},
    "fat": {"unit": "g", "amount": 16},
    "fiber": {"unit": "g", "amount": 3},
    "sugar": {"unit": "g", "amount": 2},
    "sodium": {"unit": "mg", "amount": 680}
  },
  "per_serving": true
}' WHERE `RecipeID` = 22; -- Creamy Mushroom Risotto

COMMIT; 