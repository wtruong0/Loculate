import React from 'react';

const Popup: React.FC = () => {
  return (
    <div className="w-80 p-4">
      <h1 className="text-xl font-bold mb-4">LocuLate</h1>
      <div className="space-y-4">
        {/* Home location input will go here */}
        <div className="border p-2 rounded">
          <label className="block text-sm font-medium mb-1">Home Location</label>
          <input
            type="text"
            placeholder="Enter your home address"
            className="w-full p-2 border rounded"
          />
        </div>
        
        {/* Travel time display will go here */}
        <div className="border p-2 rounded">
          <h2 className="text-lg font-semibold mb-2">Travel Time</h2>
          <p className="text-gray-600">Select an address on any webpage to see travel time</p>
        </div>
      </div>
    </div>
  );
};

export default Popup; 