import React from 'react';

const defaultAllergies = [
  { id: '1', name: 'Peanuts' },
  { id: '2', name: 'Dairy' },
  { id: '3', name: 'Gluten' },
  { id: '4', name: 'Shellfish' },
  { id: '5', name: 'Soy' },
];

const AllergyInfo = ({ allergies = defaultAllergies }) => {
  if (!allergies || allergies.length === 0) {
    return (
      <p className="text-sm text-gray-500 mt-2">
        No allergen information available.
      </p>
    );
  }

  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  };

  return (
    <div className="mt-3">
      <h3 className="text-sm font-semibold text-gray-700 mb-1">
        Allergens:
      </h3>
      <div className="flex flex-wrap gap-1">
        {allergies.map(allergen => (
          <span
            key={allergen.id || allergen.name}
            className="px-2.5 py-0.5 h-7 inline-flex items-center bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full border border-yellow-400 m-0.5"
          >
            {capitalizeFirstLetter(allergen.name)}
          </span>
        ))}
      </div>
    </div>
  );
};

export default AllergyInfo;
