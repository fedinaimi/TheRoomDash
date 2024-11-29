import React from 'react';
import { FaEye, FaPlus } from 'react-icons/fa';

const ScenarioTable = ({ scenarios, onSelectScenario, onAddSlot }) => {
  return (
    <div>
      <h3 className="text-xl font-bold mb-4">Scenarios</h3>
      <table className="min-w-full bg-white border border-gray-300 rounded-lg">
        <thead>
          <tr>
            <th className="px-4 py-2 border">Scenario Name</th>
            <th className="px-4 py-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {scenarios.map((scenario) => (
            <tr key={scenario._id} className="hover:bg-gray-100 transition duration-200">
              <td className="px-4 py-2 border">{scenario.name}</td>
              <td className="px-4 py-2 border flex space-x-2">
                <button
                  onClick={() => onSelectScenario(scenario)}
                  className="bg-blue-500 text-white px-2 py-1 rounded-md hover:bg-blue-600"
                >
                  <FaEye /> Details
                </button>
                <button
                  onClick={onAddSlot}
                  className="bg-green-500 text-white px-2 py-1 rounded-md hover:bg-green-600"
                >
                  <FaPlus /> Add Slot
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ScenarioTable;
