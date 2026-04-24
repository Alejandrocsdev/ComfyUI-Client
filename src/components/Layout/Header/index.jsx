// Module CSS
import S from './style.module.css';
// Components
// import Status from '../../Status';

const Header = () => {
  return (
    <header className={S.header}>
      {/* Left */}
      <div className={S.left}>
        <div className={S.logo}>
          <span className={S.logoAi}>AI</span>
          <div className={S.logoDivider} />
          <span className={S.logoOfm}>OFM</span>
        </div>
      </div>
      {/* Right */}
      <div className={S.right}>
      </div>
    </header>
  );
};

export default Header;
