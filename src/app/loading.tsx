const Loading = () => {
  return (
    <main className="pb-16 md:pb-0">
      <div className="px-2 md:px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
        </div>
      </div>
    </main>
  )
}

export default Loading