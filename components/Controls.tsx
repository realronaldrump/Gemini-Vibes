
import React, { useState } from 'react';
import type { Vehicle } from '../types';

interface ControlsProps {
  vehicles: Vehicle[];
  selectedImei: string;
  setSelectedImei: (imei: string) => void;
  onFetchTrips: (imei: string, startDate: string, endDate: string) => void;
  isLoading: boolean;
  onLogout: () => void;
}

const Controls: React.FC<ControlsProps> = ({
  vehicles,
  selectedImei,
  setSelectedImei,
  onFetchTrips,
  isLoading,
  onLogout
}) => {
  const today = new Date().toISOString().split('T')[0];
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  const [startDate, setStartDate] = useState(oneWeekAgo);
  const [endDate, setEndDate] = useState(today);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedImei) {
      const startDateTime = new Date(startDate).toISOString();
      const endDateTime = new Date(`${endDate}T23:59:59.999Z`).toISOString();
      onFetchTrips(selectedImei, startDateTime, endDateTime);
    }
  };

  return (
    <aside className="w-80 h-full bg-gray-800 p-6 flex flex-col shadow-2xl z-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-cyan-400">Neon Trails</h1>
         <button 
            onClick={onLogout}
            className="text-gray-400 hover:text-white transition-colors"
            title="Logout"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="flex flex-col flex-grow">
        <div className="space-y-6 flex-grow">
          <div>
            <label htmlFor="vehicle" className="block text-sm font-medium text-gray-300 mb-2">
              Vehicle
            </label>
            <select
              id="vehicle"
              value={selectedImei}
              onChange={(e) => setSelectedImei(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-600 bg-gray-700 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm rounded-md"
              disabled={vehicles.length === 0}
            >
              {vehicles.length > 0 ? (
                vehicles.map((v) => (
                  <option key={v.imei} value={v.imei}>
                    {v.nickName || `${v.model.year} ${v.model.make} ${v.model.name}`}
                  </option>
                ))
              ) : (
                <option>Loading vehicles...</option>
              )}
            </select>
          </div>
          <div>
            <label htmlFor="start-date" className="block text-sm font-medium text-gray-300 mb-2">
              Start Date
            </label>
            <input
              type="date"
              id="start-date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1 block w-full pl-3 pr-2 py-2 text-base border-gray-600 bg-gray-700 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm rounded-md"
            />
          </div>
          <div>
            <label htmlFor="end-date" className="block text-sm font-medium text-gray-300 mb-2">
              End Date
            </label>
            <input
              type="date"
              id="end-date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate}
              max={today}
              className="mt-1 block w-full pl-3 pr-2 py-2 text-base border-gray-600 bg-gray-700 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm rounded-md"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !selectedImei}
          className="w-full flex justify-center py-3 px-4 mt-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Loading...' : 'Show Trips'}
        </button>
      </form>
    </aside>
  );
};

export default Controls;
