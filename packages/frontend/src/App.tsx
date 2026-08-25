import { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { WelcomeScreen } from './components/WelcomeScreen';
import { ProjectEditor } from './components/ProjectEditor';
import { useProjectStore } from './store/projectStore';
import axios from 'axios';

function App() {
  const [currentProject, setCurrentProject] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { projects, setProjects } = useProjectStore();

  useEffect(() => {
    // Fetch projects on mount
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await axios.get('/api/projects');
      setProjects(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-white text-xl">Loading ChainForge AI...</div>
      </div>
    );
  }

  if (projects.length === 0 || !currentProject) {
    return <WelcomeScreen onProjectSelected={setCurrentProject} />;
  }

  return (
    <Layout>
      <ProjectEditor projectId={currentProject} />
    </Layout>
  );
}

export default App;
