// Module CSS
import S from './style.module.css';
// Libraries
import { useEffect, useState } from 'react';
// Components
import Icon from '../Icon';
import InlineLoader from '../Loaders/InlineLoader';
// API
import { api, axiosPublic } from '../../api';
// Utilities
import { cssVar } from '../../utils';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const Status = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showLog, setShowLog] = useState(false);
  const [log, setLog] = useState([]);

  // ====================================================
  // 1. Check ComfyUI status on mount and every 5 seconds
  // ====================================================
  useEffect(() => {
    checkComfyui();
    const interval = setInterval(checkComfyui, 5000);
    return () => clearInterval(interval);
  }, []);

  const checkComfyui = async () => {
    if (loading) return;
    await api(axiosPublic.get('/api/comfyui/server'), {
      onSuccess: (data) => setStatus(data.status),
      onError: () => setStatus('inactive'),
    });
  };

  // ====================================================
  // 2. Fetch logs when log panel is opened
  // ====================================================
  useEffect(() => {
    if (showLog) fetchLog();
  }, [showLog]);

  const fetchLog = async () => {
    await api(axiosPublic.get('/api/comfyui/server/log'), {
      onSuccess: (data) => {
        const lines = data.log ? data.log.split('\n') : [];
        setLog(lines);
      },
    });
  };

  const formatLogLine = (line) => {
    return line.replace(/^(\w{3} \d{2} \d{2}:\d{2}:\d{2})\s+.*?:\s?/, '$1: ');
  };

  // ====================================================
  // 3. Handle start/stop actions
  // ====================================================
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

  // ====================================================
  // 4. Render Action Button
  // ====================================================
  const renderActionButton = () => {
    if (loading) {
      return <InlineLoader size={4} color={cssVar('--text-primary')} />;
    }
    return status === 'active' ? 'Stop' : 'Start';
  };

  // ====================================================
  // 5. Skip render while status is loading
  // ====================================================
  if (!status) return null;

  return (
    <div className={S.card}>
      {/* Light */}
      <div className={`${S.light} ${status === 'active' ? S.on : S.off}`}></div>

      {/* Action Button */}
      <button
        className={`${S.action} ${status === 'active' ? S.stop : S.start}`}
        onClick={status === 'active' ? handleStop : handleStart}
        disabled={loading}
      >
        {renderActionButton()}
      </button>

      {/* Log Button */}
      <button className={S.log} onClick={() => setShowLog(true)}>
        Log
      </button>

      {/* Log Panel */}
      {showLog && (
        <div className={S.logPanel}>
          <div className={S.logHeader}>
            <span className={S.logTitle}>ComfyUI Logs</span>
            <button className={S.logClose} onClick={() => setShowLog(false)}>
              <Icon style={S.xMark} icon="faCircleXmark" />
            </button>
          </div>

          <div className={S.logContent}>
            {log.map((line, index) => (
              <div key={index}>{formatLogLine(line)}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Status;
