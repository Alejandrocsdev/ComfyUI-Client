// CSS Module
import S from './style.module.css';
// Libraries
import BeatLoader from 'react-spinners/BeatLoader';

// https://www.davidhu.io/react-spinners
// default: size = 15, margin = 2, color = '#000000', loading = true, css = {}, speed = 1
const InlineLoader = ({ size, margin, color, loading, css, speed }) => {
  return (
    <div className={S.loader}>
      <BeatLoader
        size={size}
        margin={margin}
        color={color}
        loading={loading}
        cssOverride={css}
        speedMultiplier={speed}
      />
    </div>
  );
};

export default InlineLoader;
