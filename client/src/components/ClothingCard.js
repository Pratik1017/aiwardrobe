import React from 'react';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';

const ClothingCard = ({ clothing, onDelete, onEdit, onDonate }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition">
      <div className="relative h-64 bg-gray-200 overflow-hidden">
        <img
          src={clothing.imageUrl}
          alt={clothing.name}
          className="w-full h-full object-cover hover:scale-105 transition duration-300"
          crossOrigin="anonymous"
        />
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-semibold text-dark mb-2">{clothing.name}</h3>
        
        <div className="grid grid-cols-2 gap-2 mb-3 text-sm text-gray-600">
          <p><span className="font-medium">Type:</span> {clothing.type}</p>
          <p><span className="font-medium">Color:</span> {clothing.color}</p>
          <p><span className="font-medium">Category:</span> {clothing.category}</p>
          <p><span className="font-medium">Size:</span> {clothing.size}</p>
        </div>

        {clothing.brand && (
          <p className="text-sm text-gray-500 mb-2"><span className="font-medium">Brand:</span> {clothing.brand}</p>
        )}

        {clothing.description && (
          <p className="text-sm text-gray-600 mb-3">{clothing.description}</p>
        )}

        {clothing.tags && clothing.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {clothing.tags.map((tag, index) => (
              <span key={index} className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full text-xs">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex gap-2 border-t pt-3">
          <button
            onClick={() => onEdit(clothing)}
            className="flex-1 flex items-center justify-center gap-1 bg-primary text-white py-2 rounded-lg hover:bg-indigo-700 transition text-xs"
          >
            <FiEdit2 size={14} />
            Edit
          </button>
          <button
            onClick={() => onDonate && onDonate(clothing)}
            className="flex-1 flex items-center justify-center gap-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition text-xs"
          >
            Donate
          </button>
          <button
            onClick={() => onDelete(clothing._id)}
            className="flex-1 flex items-center justify-center gap-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition text-xs"
          >
            <FiTrash2 size={14} />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClothingCard;
