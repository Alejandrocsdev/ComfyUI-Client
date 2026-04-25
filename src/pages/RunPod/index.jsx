// Module CSS
import S from './style.module.css';
// Libraries
import { useEffect, useState } from 'react';
// API
import { api, axiosPrivate } from '../../api';
// Components
import InlineLoader from '../../components/Loaders/InlineLoader';
import Icon from '../../components/Icon';
// Utilities
import { cssVar, serverUrl } from '../../utils';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const RunPod = () => {
  const [pods, setPods] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [reachability, setReachability] = useState({ comfyui: false, jupyter: false });
  const [actionError, setActionError] = useState(null);
  const [balance, setBalance] = useState(null);

  useEffect(() => {
    const es = new EventSource(`${serverUrl}/api/runpod/pods/stream`, { withCredentials: true });
    es.onmessage = (e) => {
      const { pods, reachability } = JSON.parse(e.data);
      setPods(pods);
      setReachability(reachability);
      if (pods.length > 1) {
        setActionError('Only one pod is allowed. Terminate extras to restore ComfyUI access');
      }
    };
    return () => es.close();
  }, []);

  useEffect(() => {
    const fetchBalance = () => {
      api(axiosPrivate.get('/api/runpod/balance'), {
        onSuccess: (data) => setBalance(data.data.myself.clientBalance),
      });
    };
    fetchBalance();
    const interval = setInterval(fetchBalance, 60_000);
    return () => clearInterval(interval);
  }, []);

  // One-time fetch after mutations for immediate UI feedback
  const fetchPods = async () => {
    await api(axiosPrivate.get('/api/runpod/pods'), {
      onSuccess: (data) => setPods(data),
      onError: () => setPods([]),
    });
  };

  const handleCreate = async () => {
    if (actionLoading) return;
    setActionLoading('create');
    setActionError(null);
    await api(axiosPrivate.post('/api/runpod/pods'), {
      onSuccess: () => fetchPods(),
      onError: (error) => {
        if (error.response?.status === 503) {
          const raw = error.response?.data?.message ?? '';
          const after = raw.includes(':') ? raw.split(':').slice(1).join(':').trim() : raw.trim();
          const msg = (after.charAt(0).toUpperCase() + after.slice(1));
          setActionError(msg || 'Pod creation failed');
        } else {
          setActionError('Pod creation failed');
        }
      },
    });
    await delay(500);
    setActionLoading(null);
  };

  const handleTerminate = async (podId) => {
    if (actionLoading) return;
    setActionLoading(podId);
    setActionError(null);
    await api(axiosPrivate.delete(`/api/runpod/pods/${podId}`), {
      onSuccess: () => fetchPods(),
      onError: () => setActionError('Failed to terminate pod.'),
    });
    await delay(500);
    setActionLoading(null);
  };

  const podCount = pods?.length ?? null;
  const isActive = podCount !== null && podCount > 0;
  const lightClass = pods === null ? S.idle : isActive ? S.on : S.off;

  return (
    <div className={S.container}>
      <div className={S.card}>
        {/* Title bar */}
        <div className={S.titleBar}>
          <div className={`${S.light} ${lightClass}`} />
          <h2 className={S.title}>RunPod ComfyUI</h2>
          <div className={S.balance}>
            {balance === null ? (
              <InlineLoader size={3} color={cssVar('--active-green')} />
            ) : (
              <span className={`${S.balanceAmount} ${balance <= 0 ? S.balanceDanger : balance <= 5 ? S.balanceWarning : ''}`}>
                ${balance.toFixed(2)}
              </span>
            )}
          </div>
        </div>

        <div className={S.divider} />

        {/* Action area */}
        {pods !== null && (
          <div className={S.actions}>
            {actionError && <p className={S.warning}>{actionError}</p>}

            {podCount === 0 && (
              <button
                className={`${S.btn} ${S.create}`}
                onClick={handleCreate}
                disabled={!!actionLoading}
              >
                {actionLoading === 'create' ? (
                  <InlineLoader size={4} color={cssVar('--text-primary')} />
                ) : (
                  'Create'
                )}
              </button>
            )}

            {podCount === 1 && (
              <>
                <div className={S.podItem}>
                  <div className={S.podInfo}>
                    <span className={S.podName}>{pods[0].name}</span>
                    <span className={S.podId}>{pods[0].id}</span>
                  </div>
                  <div className={S.podLinks}>
                    {reachability.comfyui ? (
                      <a
                        className={S.podLink}
                        href={`https://${pods[0].id}-8188.proxy.runpod.net`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        ComfyUI
                      </a>
                    ) : (
                      <div className={S.podLinkLoader}>
                        <InlineLoader size={3} color={cssVar('--accent-primary')} />
                      </div>
                    )}
                    {reachability.jupyter ? (
                      <a
                        className={`${S.podLink} ${S.podLinkJupyter}`}
                        href={`https://${pods[0].id}-8888.proxy.runpod.net`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Jupyter
                      </a>
                    ) : (
                      <div className={S.podLinkLoader}>
                        <InlineLoader size={3} color={cssVar('--text-tertiary')} />
                      </div>
                    )}
                  </div>
                </div>
                <button
                  className={`${S.btn} ${S.terminate}`}
                  onClick={() => handleTerminate(pods[0].id)}
                  disabled={!!actionLoading}
                >
                  {actionLoading === pods[0].id ? (
                    <InlineLoader size={4} color={cssVar('--text-primary')} />
                  ) : (
                    'Terminate'
                  )}
                </button>
              </>
            )}

            {podCount > 1 && (
              <>
                <ul className={S.podList}>
                  {pods.map((pod) => (
                    <li key={pod.id} className={S.podItem}>
                      <div className={S.podInfo}>
                        <span className={S.podName}>{pod.name}</span>
                        <span className={S.podId}>{pod.id}</span>
                      </div>
                      <button
                        className={S.podTerminate}
                        onClick={() => handleTerminate(pod.id)}
                        disabled={!!actionLoading}
                      >
                        {actionLoading === pod.id ? (
                          <InlineLoader size={3} color={cssVar('--error-red')} />
                        ) : (
                          <Icon icon="faXmark" />
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RunPod;
