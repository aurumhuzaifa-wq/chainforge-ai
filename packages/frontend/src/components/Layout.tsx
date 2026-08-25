export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-900">
      {/* Sidebar */}
      <div className="w-64 bg-gray-950 border-r border-gray-800 overflow-y-auto">
        <div className="p-4">
          <h1 className="text-xl font-bold text-white mb-8">⛓️ ChainForge</h1>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {children}
      </div>
    </div>
  );
};
