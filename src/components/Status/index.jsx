// Module CSS
import S from './style.module.css';
// Libraries
import { useEffect, useState } from 'react';
// Components
import InlineLoader from '../Loaders/InlineLoader';
// API
import { api, axiosPublic } from '../../api';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const Status = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const checkComfyui = async () => {
    if (loading) return;

    await api(axiosPublic.get('/api/comfyui/server'), {
      onSuccess: (data) => setStatus(data.status),
      onError: () => setStatus('inactive'),
    });
  };

  const handleStart = async () => {
    setLoading(true);

    await Promise.all([
      api(axiosPublic.post('/api/comfyui/server/start'), {
        onSuccess: () => setStatus('active'),
        onError: () => setStatus('inactive'),
      }),
      delay(500),
    ]);

    setLoading(false);
  };

  const handleStop = async () => {
    setLoading(true);

    await Promise.all([
      api(axiosPublic.post('/api/comfyui/server/stop'), {
        onSuccess: () => setStatus('inactive'),
        onError: () => setStatus('active'),
      }),
      delay(500),
    ]);

    setLoading(false);
  };

  // Polling every 5 seconds to check if ComfyUI is active
  useEffect(() => {
    checkComfyui();
    const interval = setInterval(checkComfyui, 5000);
    return () => clearInterval(interval);
  }, []);

  const actionText = status === 'active' ? 'Stop' : 'Start';

  if (!status) return null;

  return (
    <div className={S.right}>
      <div className={S.card}>
        <div className={S.status}>
          <div
            className={`${S.light} ${status === 'active' ? S.on : S.off}`}
          ></div>
          <div className={S.text}>
            {status === 'active' ? 'Active' : 'Inactive'}
          </div>
        </div>
        <div className={S.control}>
          <button
            className={`${S.action} ${status === 'active' ? S.stop : S.start}`}
            onClick={status === 'active' ? handleStop : handleStart}
            disabled={loading}
          >
            {loading ? <InlineLoader size={4} /> : actionText}
          </button>
          <button className={S.log}>Log</button>
        </div>
      </div>
    </div>
  );
};

export default Status;
