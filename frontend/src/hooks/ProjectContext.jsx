import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../utils/api';

const ProjectsContext = createContext();


export const useProjects = () => useContext(ProjectsContext);


export const ProjectsProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    axios.get(`${API_BASE_URL}/project/all-projects`)
      .then(res => {
        setProjects(res.data.data.projects);
      })
      .catch(err => {
        console.error("Error fetching projects:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  
  const refreshProjects = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/project/all-projects`);
      setProjects(res.data.data.projects);
    } catch (error) {
      console.error("Failed to refresh projects:", error);
    }
  };

  return (
    <ProjectsContext.Provider value={{ projects, loading, refreshProjects }}>
      {children}
    </ProjectsContext.Provider>
  );
};
