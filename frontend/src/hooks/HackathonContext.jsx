import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../utils/api';

const HackathonsContext = createContext();

export const useHackathons = () => useContext(HackathonsContext);

export const HackathonsProvider = ({ children }) => {
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/hackathon/all-hackathons`)
      .then(res => {setHackathons(res.data.data.hackathons)})
      .finally(() =>{setLoading(false)});
  }, []);

  const refreshHackathons = async () => {
    const res = await axios.get(`${API_BASE_URL}/hackathon/all-hackathons`);
    setHackathons(res.data.data);
  };

  return (
    <HackathonsContext.Provider value={{ hackathons, loading, refreshHackathons }}>
      {children}
    </HackathonsContext.Provider>
  );
};
