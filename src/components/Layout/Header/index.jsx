// Module CSS
import S from './style.module.css';
// Libraries
import { useState } from 'react';
// Context
import { useAuth } from '../../../context/AuthContext';
import { usePod } from '../../../context/PodContext';
// Components
import Output from '../../Output';

const Header = () => {
  const { user, logout } = useAuth();
  const { pods } = usePod();
  const [outputOpen, setOutputOpen] = useState(false);

  const hasOnePod = pods?.length === 1;

  return (
    <>
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
          {hasOnePod && (
            <button className={S.outputBtn} onClick={() => setOutputOpen(true)}>
              Output
            </button>
          )}
          {user && (
            <>
              <span className={S.userName}>{user.name}</span>
              <button className={S.logoutBtn} onClick={logout}>Sign out</button>
            </>
          )}
        </div>
      </header>

      {outputOpen && <Output onClose={() => setOutputOpen(false)} />}
    </>
  );
};

export default Header;
