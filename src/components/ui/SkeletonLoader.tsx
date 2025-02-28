import React from 'react';
import { usePathname } from 'next/navigation';

interface SkeletonProps {
  className?: string;
}

export const Skeleton = ({ className = '' }: SkeletonProps) => {
  return (
    <div className={`animate-pulse bg-gray-200 rounded-md ${className}`}></div>
  );
};

const DashboardSkeleton = () => (
  <div className="w-full space-y-6 py-4">
    {/* Stats row */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-white rounded-xl shadow-sm p-4 flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      ))}
    </div>
    
    {/* Main content area */}
    <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
      <div className="flex justify-between items-center">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-9 w-32" />
      </div>
      
      <div className="space-y-4 pt-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
            <div className="flex items-center space-x-3">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="space-y-1">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <Skeleton className="h-8 w-24" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

const ServicesSkeleton = () => (
  <div className="w-full space-y-6 py-4">
    {/* Header */}
    <div className="text-center space-y-2 mb-6">
      <Skeleton className="h-8 w-64 mx-auto" />
      <Skeleton className="h-4 w-96 mx-auto" />
    </div>
    
    {/* Search and filter */}
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        <Skeleton className="h-10 w-full md:w-2/3" />
        <Skeleton className="h-10 w-full md:w-1/3" />
      </div>
    </div>
    
    {/* Category pills */}
    <div className="flex flex-wrap gap-2 mb-6">
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} className="h-8 w-20 rounded-full" />
      ))}
    </div>
    
    {/* Services grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <div className="p-5">
            <div className="flex items-start gap-4">
              <Skeleton className="h-12 w-12 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            </div>
          </div>
          <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-4" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

const ServiceDetailSkeleton = () => (
  <div className="w-full space-y-6 py-4">
    {/* Back button and title */}
    <div className="flex items-center space-x-4 mb-6">
      <Skeleton className="h-8 w-8 rounded-full" />
      <Skeleton className="h-8 w-64" />
    </div>
    
    {/* Main content */}
    <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-16 w-16 rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-7 w-64" />
        </div>
      </div>
      
      <div className="space-y-3 pt-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      
      {/* Form fields */}
      <div className="space-y-4 pt-6 border-t border-gray-100">
        <Skeleton className="h-7 w-48" />
        
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-12 w-full" />
          </div>
        ))}
        
        <div className="pt-4">
          <Skeleton className="h-12 w-full md:w-48" />
        </div>
      </div>
    </div>
  </div>
);

const DefaultSkeleton = () => (
  <div className="w-full space-y-6 py-4">
    {/* Page header skeleton */}
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-6 w-24" />
      </div>
      <Skeleton className="h-8 w-24" />
    </div>
    
    {/* Content area skeleton */}
    <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
      <Skeleton className="h-8 w-3/4" />
      <div className="space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex items-center space-x-3">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <Skeleton className="h-6 w-24" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

const SkeletonLoader = () => {
  const pathname = usePathname();
  
  // Determine which skeleton to show based on the current path
  if (pathname === '/' || pathname === '/dashboard') {
    return <DashboardSkeleton />;
  }
  
  if (pathname === '/services') {
    return <ServicesSkeleton />;
  }
  
  if (pathname.startsWith('/services/') && pathname !== '/services') {
    return <ServiceDetailSkeleton />;
  }
  
  return <DefaultSkeleton />;
};

export default SkeletonLoader; 