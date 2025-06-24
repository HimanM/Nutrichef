export const dummyRecipes = [
    {
        id: 'recipe-1',
        name: 'Classic Pancakes',
        imagePlaceholder: 'https://via.placeholder.com/250x150/FFC0CB/000000?Text=Pancakes', // Pink placeholder
        shortDescription: 'Fluffy pancakes, a breakfast favorite.',
        allergens: ['gluten', 'dairy', 'egg'],
        ingredients: [
            { name: 'All-purpose flour', quantity: '1 1/2 cups' },
            { name: 'Baking powder', quantity: '3 1/2 tsp' },
            { name: 'Salt', quantity: '1 tsp' },
            { name: 'White sugar', quantity: '1 tbsp' },
            { name: 'Milk', quantity: '1 1/4 cups' },
            { name: 'Egg', quantity: '1' },
            { name: 'Melted butter', quantity: '3 tbsp' },
        ],
        instructions: "1. In a large bowl, sift together the flour, baking powder, salt and sugar. Make a well in the center and pour in the milk, egg and melted butter; mix until smooth. \n2. Heat a lightly oiled griddle or frying pan over medium high heat. Pour or scoop the batter onto the griddle, using approximately 1/4 cup for each pancake. Brown on both sides and serve hot."
    },
    {
        id: 'recipe-2',
        name: 'Simple Pasta Salad',
        imagePlaceholder: 'https://via.placeholder.com/250x150/ADD8E6/000000?Text=PastaSalad', // Light blue
        shortDescription: 'A quick and refreshing pasta salad.',
        allergens: ['gluten'],
        ingredients: [
            { name: 'Pasta', quantity: '200g' },
            { name: 'Cherry tomatoes', quantity: '1 cup, halved' },
            { name: 'Cucumber', quantity: '1/2, diced' },
            { name: 'Olive oil', quantity: '2 tbsp' },
            { name: 'Lemon juice', quantity: '1 tbsp' },
            { name: 'Salt', quantity: 'to taste'},
            { name: 'Pepper', quantity: 'to taste'}
        ],
        instructions: "1. Cook pasta according to package directions. Drain and rinse with cold water. \n2. In a large bowl, combine pasta, tomatoes, and cucumber. \n3. Drizzle with olive oil and lemon juice. Season with salt and pepper. Toss to coat. Serve chilled."
    },
    {
        id: 'recipe-3',
        name: 'Avocado Toast',
        imagePlaceholder: 'https://via.placeholder.com/250x150/90EE90/000000?Text=AvocadoToast', // Light green
        shortDescription: 'Healthy and easy avocado toast.',
        allergens: ['gluten'],
        ingredients: [
            { name: 'Bread slice', quantity: '1' },
            { name: 'Avocado', quantity: '1/2, ripe' },
            { name: 'Salt', quantity: 'pinch' },
            { name: 'Red pepper flakes', quantity: 'optional pinch' },
        ],
        instructions: "1. Toast bread to desired crispiness. \n2. Mash avocado in a small bowl. \n3. Spread mashed avocado on toast. \n4. Sprinkle with salt and red pepper flakes if desired."
    },
    {
        id: 'recipe-4',
        name: 'Chicken Quesadilla',
        imagePlaceholder: 'https://via.placeholder.com/250x150/FFA07A/000000?Text=Quesadilla', // Light salmon
        shortDescription: 'Cheesy and satisfying chicken quesadillas.',
        allergens: ['dairy', 'gluten'],
        ingredients: [
            { name: 'Cooked chicken', quantity: '1/2 cup, shredded' },
            { name: 'Flour tortillas', quantity: '2' },
            { name: 'Shredded cheese (cheddar or Monterey Jack)', quantity: '1/2 cup' },
            { name: 'Olive oil or butter', quantity: '1 tsp' },
            { name: 'Optional: Salsa, Sour cream', quantity: 'for serving'}
        ],
        instructions: "1. Heat oil or butter in a skillet over medium heat. \n2. Place one tortilla in the skillet. Sprinkle half the cheese over it. Top with shredded chicken and then the remaining cheese. \n3. Place the other tortilla on top. \n4. Cook for 2-3 minutes per side, until golden brown and cheese is melted. \n5. Cut into wedges and serve with salsa or sour cream if desired."
    }
];

// Keeping other dummy data, but it's not used in this specific subtask
export const dummyUsers = [
    {
        id: 1,
        username: 'testuser1',
        email: 'testuser1@example.com',
        dietaryPreferences: ['Vegetarian'],
        allergies: ['Peanuts']
    }
];

export const dummyMealPlan = [
    { date: '2024-07-29', mealType: 'Breakfast', recipeId: null, customEntry: 'Oatmeal' },
    { date: '2024-07-29', mealType: 'Lunch', recipeId: 'recipe-1', customEntry: null }, // Updated to use new ID format if linking
    { date: '2024-07-29', mealType: 'Dinner', recipeId: 'recipe-2', customEntry: null }, // Updated to use new ID format
];

export const dummyShoppingList = [
    { id: 1, ingredientName: 'All-purpose flour', quantity: '1 1/2 cups', obtained: false },
    { id: 2, ingredientName: 'Egg', quantity: '1', obtained: true },
    { id: 3, ingredientName: 'Pasta', quantity: '200g', obtained: false },
];
