import React from 'react';
import { HiOutlineExclamation } from 'react-icons/hi';

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
    <div className="mt-4">
      <div className="flex items-center mb-2">
        <HiOutlineExclamation className="w-4 h-4 text-amber-500 mr-2" />
        <h3 className="text-sm font-semibold text-gray-700">
          Allergens
        </h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {allergies.map(allergen => (
          <span
            key={allergen.id || allergen.name}
            className="px-3 py-1 inline-flex items-center bg-amber-50 text-amber-700 text-xs font-medium rounded-full border border-amber-200 transition-colors hover:bg-amber-100"
          >
            {capitalizeFirstLetter(allergen.name)}
          </span>
        ))}
      </div>
    </div>
  );
};

export default AllergyInfo;
