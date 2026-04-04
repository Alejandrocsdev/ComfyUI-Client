// Module CSS
import S from './style.module.css';
// Components
import Status from '../../Status';

const Header = () => {
  return (
    <header className={S.header}>
      {/* Left */}
      <div className={S.left}></div>
      {/* Right */}
      <div className={S.right}>
        <Status />
      </div>
    </header>
  );
};

export default Header;
