import { useState } from 'react';
import axios from 'axios';

interface WelcomeScreenProps {
  onProjectSelected: (projectId: string) => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onProjectSelected }) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'smart_contract',
    framework: 'hardhat',
    language: 'solidity',
    network: 'local'
  });

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/projects', formData);
      onProjectSelected(response.data.id);
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-900 to-gray-950">
      <div className="text-center max-w-2xl">
        <h1 className="text-5xl font-bold text-white mb-4">⛓️ ChainForge AI</h1>
        <p className="text-xl text-gray-400 mb-12">
          AI-powered Blockchain Development IDE
        </p>
        
        {!showForm ? (
          <button
            onClick={() => setShowForm(true)}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Create Blockchain Project
          </button>
        ) : (
          <form onSubmit={handleCreateProject} className="bg-gray-800 p-8 rounded-lg">
            <div className="mb-4">
              <label className="block text-left text-gray-300 mb-2">Project Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-gray-700 text-white px-4 py-2 rounded border border-gray-600"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-left text-gray-300 mb-2">Project Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full bg-gray-700 text-white px-4 py-2 rounded border border-gray-600"
              >
                <option value="smart_contract">Smart Contract</option>
                <option value="token">Token</option>
                <option value="nft">NFT</option>
                <option value="defi">DeFi</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Create Project
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
