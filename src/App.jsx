// CSS
import './assets/css/fonts.css';
import './assets/css/global.css';
// Libraries
import { BrowserRouter, Routes, Route } from 'react-router-dom';
// Custom Functions
import useLoader from './hooks/useLoader';
// Components
import Error from './components/Error';
import Layout from './components/Layout';
import ScreenLoader from './components/Loaders/ScreenLoader';
// Public Pages
import Home from './pages/Home';
import RunPod from './pages/RunPod';

const App = () => {
  const { loading, error } = useLoader();
  if (loading) return <ScreenLoader />;
  if (error) return <Error />;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<RunPod />} />
          <Route path="home" element={<Home />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
