// CSS Module
import S from './style.module.css';
// Libraries
import { useState } from 'react';
// Components
import Icon from '../Icon';
import InlineLoader from '../Loaders/InlineLoader';

const Error = () => {
  const [loading, setLoading] = useState(false);

  const handleRetry = () => {
    setLoading(true);
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  return (
    <div className={S.background}>
      <div className={S.card}>
        <Icon style={S.xMark} icon="faCircleXmark" />

        <h2 className={S.title}>Something went wrong</h2>

        <p className={S.message}>
          We couldn't connect to the server. Please refresh the page or try
          again later.
        </p>

        <button className={S.button} disabled={loading} onClick={handleRetry}>
          {loading ? <InlineLoader size={10} /> : 'Try Again'}
        </button>
      </div>
    </div>
  );
};

export default Error;
