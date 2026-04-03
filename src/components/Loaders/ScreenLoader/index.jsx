// Module CSS
import S from './style.module.css';
// Libraries
import HashLoader from 'react-spinners/HashLoader';
// Utilities
import { cssVar } from '../../../utils';

// https://www.davidhu.io/react-spinners
// default: size = 50, color = '#000000', loading = true, css = {}, speed = 1
const Loader = ({ size, color, loading, css, speed }) => {
  return (
    <div className={S.loader}>
      <HashLoader
        size={size}
        color={color || cssVar('--text-primary')}
        loading={loading}
        cssOverride={css}
        speedMultiplier={speed}
      />
    </div>
  );
};

export default Loader;
