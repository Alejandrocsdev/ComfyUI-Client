// Libraries
import { Outlet } from 'react-router-dom';
// Components
import Header from './Header';

const Layout = () => {
  return (
    <>
      <Header />
      <Outlet />
    </>
  );
};

export default Layout;
