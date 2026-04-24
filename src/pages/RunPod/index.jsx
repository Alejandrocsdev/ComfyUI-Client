// Module CSS
import S from './style.module.css';
// Libraries
import { useEffect, useState } from 'react';
// API
import { api, axiosPublic } from '../../api';
// Components
import InlineLoader from '../../components/Loaders/InlineLoader';
// Utilities
import { cssVar } from '../../utils';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const RunPod = () => {
  const [status, setStatus] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const checkStatus = async () => {
    await api(axiosPublic.get('/api/runpod'), {
      onSuccess: (data) => setStatus(data.status),
      onError: () => setStatus('inactive'),
    });
  };

  const handleAction = async (action) => {
    if (actionLoading) return;
    setActionLoading(action);
    await api(axiosPublic.post(`/api/runpod/${action}`), {
      onSuccess: () => checkStatus(),
    });
    await delay(500);
    setActionLoading(null);
  };

  const isActive = status === 'active' || status === 'running';

  return (
    <div className={S.container}>
      <div className={S.card}>
        {/* Title bar */}
        <div className={S.titleBar}>
          <div className={`${S.light} ${status === null ? S.idle : isActive ? S.on : S.off}`} />
          <h2 className={S.title}>RunPod ComfyUI</h2>
        </div>

        <p className={S.statusText}>
          {status === null ? 'Checking...' : isActive ? 'Running' : 'Stopped'}
        </p>

        <div className={S.divider} />

        {/* Action button */}
        {status !== null && (
          <div className={S.actions}>
            {isActive ? (
              <button
                className={`${S.btn} ${S.terminate}`}
                onClick={() => handleAction('terminate')}
                disabled={!!actionLoading}
              >
                {actionLoading === 'terminate' ? (
                  <InlineLoader size={4} color={cssVar('--text-primary')} />
                ) : (
                  'Terminate'
                )}
              </button>
            ) : (
              <button
                className={`${S.btn} ${S.create}`}
                onClick={() => handleAction('create')}
                disabled={!!actionLoading}
              >
                {actionLoading === 'create' ? (
                  <InlineLoader size={4} color={cssVar('--text-primary')} />
                ) : (
                  'Create'
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RunPod;
