import React, { useState } from 'react';

interface FareCalculatorProps {
  memberCount: number;
  onCalculate?: (total: number, perPerson: number) => void;
}

const FareCalculator: React.FC<FareCalculatorProps> = ({ memberCount, onCalculate }) => {
  const [fareAmount, setFareAmount] = useState('');
  const [result, setResult] = useState<{ total: number; perPerson: number } | null>(null);

  const calculateFare = () => {
    if (!fareAmount || isNaN(Number(fareAmount))) return;
    
    const total = parseFloat(fareAmount);
    const perPerson = total / memberCount;
    
    setResult({
      total,
      perPerson
    });
    
    if (onCalculate) {
      onCalculate(total, perPerson);
    }
  };

  const resetCalculator = () => {
    setFareAmount('');
    setResult(null);
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Fare Calculator</h3>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="fareAmount" className="block text-sm font-medium text-gray-700">
            Total Fare Amount (₹)
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">₹</span>
            </div>
            <input
              type="number"
              name="fareAmount"
              id="fareAmount"
              value={fareAmount}
              onChange={(e) => setFareAmount(e.target.value)}
              className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 py-2 sm:text-sm border-gray-300 rounded-md"
              placeholder="0.00"
            />
          </div>
        </div>
        
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex justify-between">
            <span className="text-sm font-medium text-blue-800">Split among {memberCount} members:</span>
            <span className="text-sm font-medium text-blue-800">
              ₹{result ? result.perPerson.toFixed(2) : '0.00'} each
            </span>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={calculateFare}
            disabled={!fareAmount || isNaN(Number(fareAmount))}
            className="flex-1 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            Calculate
          </button>
          
          <button
            onClick={resetCalculator}
            className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Reset
          </button>
        </div>
        
        {result && (
          <div className="mt-4 p-4 bg-green-50 rounded-lg">
            <div className="text-center">
              <p className="text-sm text-green-800">
                Total fare: <span className="font-medium">₹{result.total.toFixed(2)}</span>
              </p>
              <p className="text-sm text-green-800">
                Each person owes: <span className="font-medium">₹{result.perPerson.toFixed(2)}</span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FareCalculator;