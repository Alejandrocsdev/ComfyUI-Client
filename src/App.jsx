// CSS
import './assets/css/fonts.css';
import './assets/css/global.css';
// Libraries
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
// Custom Functions
import useLoader from './hooks/useLoader';
// Context
import { AuthProvider, useAuth } from './context/AuthContext';
// Components
import Error from './components/Error';
import Layout from './components/Layout';
import ScreenLoader from './components/Loaders/ScreenLoader';
// Pages
import Login from './pages/Login';
import Home from './pages/Home';
import RunPod from './pages/RunPod';

const ProtectedRoute = () => {
  const { user } = useAuth();
  if (user === undefined) return <ScreenLoader />;
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
};

const App = () => {
  const { loading, error } = useLoader();
  if (loading) return <ScreenLoader />;
  if (error) return <Error />;

  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Layout />}>
              <Route index element={<RunPod />} />
              <Route path="home" element={<Home />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
