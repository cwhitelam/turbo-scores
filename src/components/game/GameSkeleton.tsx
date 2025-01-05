import React from 'react';

export function GameSkeleton() {
  return (
    <div className="rounded-xl overflow-hidden shadow-lg bg-gray-800/50 backdrop-blur-sm border border-white/10 animate-pulse">
      {/* Header */}
      <div className="h-10 bg-black/30" />
      
      {/* Teams Container */}
      <div className="flex">
        {/* Away Team */}
        <div className="flex-1 border-r border-gray-900/50 p-4">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-700 rounded-full mb-3" />
            <div className="h-5 w-32 bg-gray-700 rounded mb-2" />
            <div className="h-4 w-20 bg-gray-700 rounded mb-2" />
            <div className="h-8 w-16 bg-gray-700 rounded" />
          </div>
        </div>
        
        {/* Home Team */}
        <div className="flex-1 p-4">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-700 rounded-full mb-3" />
            <div className="h-5 w-32 bg-gray-700 rounded mb-2" />
            <div className="h-4 w-20 bg-gray-700 rounded mb-2" />
            <div className="h-8 w-16 bg-gray-700 rounded" />
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="h-10 bg-black/30" />
    </div>
  );
}