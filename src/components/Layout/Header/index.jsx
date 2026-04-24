// Module CSS
import S from './style.module.css';
// Context
import { useAuth } from '../../../context/AuthContext';
// Components
// import Status from '../../Status';

const Header = () => {
  const { user, logout } = useAuth();

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
        {user && (
          <>
            <span className={S.userName}>{user.name}</span>
            <button className={S.logoutBtn} onClick={logout}>Sign out</button>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
