// Libraries
import { useState, useEffect } from 'react';
// Custome Functions
import { api, axiosPublic } from '../api';

const useLoader = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 5;
    const retryInterval = 2000;

    let interval = undefined;

    const checkServer = async () => {
      await api(axiosPublic.get('/'), {
        onSuccess: () => {
          setLoading(false);
          clearInterval(interval);
          return;
        },
      });

      retryCount++;

      if (retryCount >= maxRetries) {
        setLoading(false);
        setError(true);
        clearInterval(interval);
      }
    };

    // Perform the first check immediately on mount
    checkServer(); // (0 + 1)
    // Then repeat the check every retryInterval milliseconds
    interval = setInterval(checkServer, retryInterval); // (1 ~ 9 + 1)

    return () => clearInterval(interval);
  }, []);

  return { loading, error };
};

export default useLoader;
