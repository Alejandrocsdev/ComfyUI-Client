// CSS
import './assets/css/global.css';
// Libraries
import { BrowserRouter, Routes, Route } from 'react-router-dom';
// Custom Functions
import useLoader from './hooks/useLoader';
// Components
import Error from './components/Error';
import ScreenLoader from './components/Loaders/ScreenLoader';
// Public Pages
import Home from './pages/Home';

const App = () => {
  const { loading, error } = useLoader();
  if (loading) return <ScreenLoader loading={loading} />;
  if (error) return <Error />;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
