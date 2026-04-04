// Module CSS
import S from './style.module.css';
// Libraries
import { useEffect, useState } from 'react';
// Components
import InlineLoader from '../Loaders/InlineLoader';
// API
import { api, axiosPublic } from '../../api';
// Utilities
import { cssVar } from '../../utils';

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

  useEffect(() => {
    checkComfyui();
    const interval = setInterval(checkComfyui, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleStart = async () => {
    if (loading) return;
    setLoading(true);
    let isSuccess = false;
    api(axiosPublic.post('/api/comfyui/server/start'), {
      onSuccess: () => (isSuccess = true),
    });
    await delay(800);
    setLoading(false);
    isSuccess ? setStatus('active') : setStatus('inactive');
  };

  const handleStop = async () => {
    if (loading) return;
    setLoading(true);
    let isSuccess = false;
    api(axiosPublic.post('/api/comfyui/server/stop'), {
      onSuccess: () => (isSuccess = true),
    });
    await delay(800);
    setLoading(false);
    isSuccess ? setStatus('inactive') : setStatus('active');
  };

  if (!status) return null;

	const actionText = status === 'active' ? 'Stop' : 'Start';

  return (
    <div className={S.right}>
      <div className={S.card}>
        <div
          className={`${S.light} ${status === 'active' ? S.on : S.off}`}
        ></div>
        <button
          className={`${S.action} ${status === 'active' ? S.stop : S.start}`}
          onClick={status === 'active' ? handleStop : handleStart}
          disabled={loading}
        >
          {loading ? (
            <InlineLoader size={4} color={cssVar('--text-primary')} />
          ) : (
            actionText
          )}
        </button>
        <button className={S.log}>Log</button>
      </div>
    </div>
  );
};

export default Status;
