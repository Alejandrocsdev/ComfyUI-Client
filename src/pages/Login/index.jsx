// Module CSS
import S from './style.module.css';
// Libraries
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
// Context
import { useAuth } from '../../context/AuthContext';
// Utilities
import { serverUrl } from '../../utils';
// Assets
import googleLogo from '../../assets/img/google.png';

const Login = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isUnauthorized = searchParams.get('error') === 'unauthorized';

  useEffect(() => {
    if (user) navigate('/', { replace: true });
  }, [user, navigate]);

  const handleGoogleSignIn = () => {
    window.location.href = `${serverUrl}/api/auth/google`;
  };

  return (
    <div className={S.page}>
      <div className={S.card}>
        {/* Logo */}
        <div className={S.logo}>
          <span className={S.logoAi}>AI</span>
          <div className={S.logoDivider} />
          <span className={S.logoOfm}>OFM</span>
        </div>

        <p className={S.subtitle}>Sign in to continue</p>

        {/* Error: email not on allowlist */}
        {isUnauthorized && (
          <p className={S.error}>This Google account is not authorized.</p>
        )}

        {/* Google Sign-In Button */}
        <button className={S.googleBtn} onClick={handleGoogleSignIn}>
          <img className={S.googleIcon} src={googleLogo} alt="Google" />
          Sign in with Google
        </button>
      </div>
    </div>
  );
};

export default Login;
