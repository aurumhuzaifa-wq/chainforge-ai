interface ProjectEditorProps {
  projectId: string;
}

export const ProjectEditor: React.FC<ProjectEditorProps> = ({ projectId }) => {
  return (
    <div className="flex-1 flex flex-col">
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <h2 className="text-lg font-semibold text-white">Project: {projectId}</h2>
      </div>
      
      <div className="flex-1 flex">
        {/* Editor placeholder */}
        <div className="flex-1 bg-gray-900 p-4">
          <p className="text-gray-400">Monaco Editor will be loaded here</p>
        </div>
        
        {/* AI Agent panel placeholder */}
        <div className="w-96 bg-gray-800 border-l border-gray-700 p-4 overflow-y-auto">
          <h3 className="text-white font-semibold mb-4">🤖 AI Agent</h3>
          <p className="text-gray-400 text-sm">Chat with AI assistant will appear here</p>
        </div>
      </div>
    </div>
  );
};
