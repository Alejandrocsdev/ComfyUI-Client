import { createContext, useContext, useEffect, useState } from 'react';
import { api, axiosPrivate } from '../api';
import { serverUrl } from '../utils';

const PodContext = createContext(null);

export const PodProvider = ({ children }) => {
  const [pods, setPods] = useState(null);
  const [reachability, setReachability] = useState({ comfyui: false, jupyter: false });

  useEffect(() => {
    const es = new EventSource(`${serverUrl}/api/runpod/pods/stream`, { withCredentials: true });
    es.onmessage = (e) => {
      const { pods, reachability } = JSON.parse(e.data);
      setPods(pods);
      setReachability(reachability);
    };
    return () => es.close();
  }, []);

  const refreshPods = async () => {
    await api(axiosPrivate.get('/api/runpod/pods'), {
      onSuccess: (data) => setPods(data),
      onError: () => setPods([]),
    });
  };

  const resetReachability = () => setReachability({ comfyui: false, jupyter: false });

  return (
    <PodContext.Provider value={{ pods, reachability, refreshPods, resetReachability }}>
      {children}
    </PodContext.Provider>
  );
};

export const usePod = () => useContext(PodContext);
