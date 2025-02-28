const LayoutSkeleton = () => {
  return (
    <div className="min-h-screen bg-gray-50">
        {/* Fake sidebar */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
          <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gradient-to-b from-sky-700 to-sky-900 px-6 pb-4 shadow-lg animate-pulse">
            <div className="flex h-16 shrink-0 items-center space-x-3">
              <div className="bg-white p-1.5 rounded-md shadow-md w-10 h-10"></div>
              <div className="bg-sky-600 h-6 w-40 rounded-md"></div>
            </div>
            <div className="flex-1 space-y-4 py-4">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="h-10 bg-sky-800 rounded-md w-full"></div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Main content area */}
        <div className="lg:pl-72">
          {/* Fake header */}
          <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
            <div className="lg:hidden h-10 w-10 bg-gray-200 rounded-md animate-pulse"></div>
            <div className="flex justify-between items-center w-full">
              <div className="h-8 w-40 bg-gray-200 rounded-md animate-pulse"></div>
              <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse"></div>
            </div>
          </div>
          
          {/* Fake content */}
          <main className="pb-16 md:pb-0">
            <div className="px-2 md:px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
              </div>
            </div>
          </main>
        </div>
        
        {/* Fake mobile bottom nav */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-3 px-4 lg:hidden">
          <div className="flex justify-around">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-6 w-6 bg-gray-200 rounded-md animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
  )
}

export default LayoutSkeleton