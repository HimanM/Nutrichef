import React from 'react';
import { AiOutlineLoading } from 'react-icons/ai';

const FloatingLoader = ({ text = "Parsing recipe, please wait..." }) => {

  return (
    <div
      className="fixed bottom-4 left-4 flex items-center bg-black bg-opacity-75 text-white px-4 py-2 rounded-lg shadow-lg z-50"
      style={{ paddingLeft: '18px', paddingRight: '18px' }}
    >
      <AiOutlineLoading className="animate-spin h-[22px] w-[22px] text-white mr-3" />
      <p className="text-base">{text}</p>
    </div>
  );
};

export default FloatingLoader;
