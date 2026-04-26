// Module CSS
import S from './style.module.css';
// Libraries
import { useEffect, useState } from 'react';
// FontAwesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleDown } from '@fortawesome/free-solid-svg-icons';
// API
import { api, axiosPrivate } from '../../api';
// Context
import { usePod } from '../../context/PodContext';
// Components
import InlineLoader from '../../components/Loaders/InlineLoader';
import Icon from '../../components/Icon';
// Utilities
import { cssVar } from '../../utils';

const MODEL_TYPES = [
  'audio_encoders', 'checkpoints', 'clip', 'clip_vision', 'configs',
  'controlnet', 'diffusers', 'diffusion_models', 'embeddings',
  'frame_interpolation', 'gligen', 'hypernetworks', 'latent_upscale_models',
  'loras', 'model_patches', 'photomaker', 'style_models', 'text_encoders',
  'unet', 'upscale_models', 'vae', 'vae_approx',
];

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const RunPod = () => {
  const { pods, reachability, refreshPods, resetReachability } = usePod();
  const [actionLoading, setActionLoading] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [balance, setBalance] = useState(null);

  const [modelType, setModelType] = useState('');
  const [modelUrl, setModelUrl] = useState('');
  const [customNodeUrl, setCustomNodeUrl] = useState('');

  useEffect(() => {
    if (pods !== null && pods.length > 1) {
      setActionError('Only one pod is allowed. Terminate extras to restore ComfyUI access');
    }
  }, [pods]);

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

  const handleCreate = async () => {
    if (actionLoading) return;
    setActionLoading('create');
    setActionError(null);
    await api(axiosPrivate.post('/api/runpod/pods'), {
      onSuccess: () => refreshPods(),
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

  const handleRestart = async (podId) => {
    if (actionLoading) return;
    setActionLoading('restart');
    setActionError(null);
    api(axiosPrivate.post(`/api/runpod/pods/${podId}`));
    await delay(3000);
    resetReachability();
    setActionLoading(null);
  };

  const handleTerminate = async (podId) => {
    if (actionLoading) return;
    setActionLoading(podId);
    setActionError(null);
    await api(axiosPrivate.delete(`/api/runpod/pods/${podId}`), {
      onSuccess: () => refreshPods(),
      onError: () => setActionError('Failed to terminate pod.'),
    });
    await delay(500);
    setActionLoading(null);
  };

  const handleModelDownload = async () => {
    if (!modelType || !modelUrl.trim() || actionLoading) return;
    setActionLoading('model');
    setActionError(null);
    await api(
      axiosPrivate.post('/api/runpod/ssh/exec', {
        command: `nohup bash -c "cd /workspace/comfyui/models/${modelType} && wget -q ${modelUrl.trim()}" > /dev/null 2>&1 &`,
      }),
      {
        onSuccess: () => setModelUrl(''),
        onError: () => setActionError('Model download failed'),
      }
    );
    setActionLoading(null);
  };

  const handleCustomNodeInstall = async () => {
    if (!customNodeUrl.trim() || actionLoading) return;
    setActionLoading('customNode');
    setActionError(null);
    const url = customNodeUrl.trim();
    const repoName = url.replace(/\.git$/, '').split('/').pop();
    const command = `cd /workspace/comfyui/custom_nodes && git clone ${url} && cd ${repoName} && pip install -r requirements.txt -q`;
    await api(
      axiosPrivate.post('/api/runpod/ssh/exec', { command }),
      {
        onSuccess: () => setCustomNodeUrl(''),
        onError: () => setActionError('Custom node installation failed'),
      }
    );
    setActionLoading(null);
  };

  const podCount = pods?.length ?? null;
  const isActive = podCount !== null && podCount > 0;
  const lightClass = pods === null ? S.idle : isActive ? S.on : S.off;

  return (
    <div className={S.container}>
      {/* Card 1 — Pod management */}
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
                  {pods[0].createdAt && (
                    <span className={S.podCreatedAt}>
                      {pods[0].createdAt.split('.')[0].trim()}
                    </span>
                  )}
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
                <div className={S.btnRow}>
                  <button
                    className={`${S.btn} ${S.restart}`}
                    onClick={() => handleRestart(pods[0].id)}
                    disabled={!!actionLoading}
                  >
                    {actionLoading === 'restart' ? (
                      <InlineLoader size={4} color={cssVar('--accent-primary')} />
                    ) : (
                      'Restart'
                    )}
                  </button>
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
                </div>
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

      {/* Card 2 — Downloads (only when pod is running) */}
      {podCount === 1 && (
        <div className={S.card}>
          {/* Model row */}
          <div className={S.downloadRow}>
            <span className={S.rowLabel}>Model</span>
            <select
              className={S.typeSelect}
              value={modelType}
              onChange={(e) => setModelType(e.target.value)}
            >
              <option value="" disabled>Type</option>
              {MODEL_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <input
              className={S.urlInput}
              value={modelUrl}
              onChange={(e) => setModelUrl(e.target.value)}
              placeholder="URL"
            />
            <button
              className={S.downloadBtn}
              onClick={handleModelDownload}
              disabled={!modelType || !modelUrl.trim() || !!actionLoading}
            >
              {actionLoading === 'model' ? (
                <InlineLoader size={3} color={cssVar('--accent-primary')} />
              ) : (
                <FontAwesomeIcon icon={faCircleDown} />
              )}
            </button>
          </div>

          <div className={S.divider} />

          {/* Custom Node row */}
          <div className={S.downloadRow}>
            <span className={S.rowLabel}>Custom Node</span>
            <input
              className={S.urlInput}
              value={customNodeUrl}
              onChange={(e) => setCustomNodeUrl(e.target.value)}
              placeholder="URL"
            />
            <button
              className={S.downloadBtn}
              onClick={handleCustomNodeInstall}
              disabled={!customNodeUrl.trim() || !!actionLoading}
            >
              {actionLoading === 'customNode' ? (
                <InlineLoader size={3} color={cssVar('--accent-primary')} />
              ) : (
                <FontAwesomeIcon icon={faCircleDown} />
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RunPod;
