// Module CSS
import S from './style.module.css';
// Libraries
// Components
// Custom Functions
import { api, axiosPublic } from '../../api';

const Home = () => {
  // const submit = async () => {
  //   await api(axiosPublic.post('/api/auth/login', { turnstileToken: token }), {
  //     onSuccess: (data) => {
  //       console.log(data);
  //     },
  //   });
  // };

  return (
    <div className={S.main}>
      <h1>Home Page</h1>
    </div>
  );
};

export default Home;
