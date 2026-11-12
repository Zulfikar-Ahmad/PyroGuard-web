import React from 'react';

export const SkeletonLoader: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse max-w-7xl mx-auto">
      {/* Banner Skeleton */}
      <div className="h-24 w-full rounded-2xl glass-card bg-slate-200/50 dark:bg-slate-800/50" />

      {/* Sensor Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-40 rounded-2xl glass-card bg-slate-200/50 dark:bg-slate-800/50 p-5 flex flex-col justify-between">
            <div className="flex justify-between items-center">
              <div className="h-4 w-24 bg-slate-300 dark:bg-slate-700 rounded-lg" />
              <div className="h-8 w-8 bg-slate-300 dark:bg-slate-700 rounded-xl" />
            </div>
            <div className="h-8 w-32 bg-slate-300 dark:bg-slate-700 rounded-lg" />
            <div className="h-2 w-full bg-slate-300 dark:bg-slate-700 rounded-full" />
          </div>
        ))}
      </div>

      {/* Chart Skeleton */}
      <div className="h-72 w-full rounded-2xl glass-card bg-slate-200/50 dark:bg-slate-800/50 p-6" />
    </div>
  );
};
