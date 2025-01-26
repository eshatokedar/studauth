import path from 'path';
import { useNavigate } from 'react-router-dom';
import { SvgColor } from 'src/components/svg-color';
import { getAuth, signOut } from 'firebase/auth';

// ----------------------------------------------------------------------

const icon = (name: string) => (
  <SvgColor width="100%" height="100%" src={`/assets/icons/navbar/${name}.svg`} />
);

const handleLogout = () => {
  const auth = getAuth();
  signOut(auth)
    .then(() => {
      console.log('User logged out');
      sessionStorage.clear();
      alert('You have been logged out');
      window.location.href = '/log-in';
    })
    .catch((error) => {
      console.error('Error logging out: ', error);
    });
};

export const navData = [
  {
    title: 'Students',
    path: '/',
    icon: icon('ic-user'),
  },     
  {
    title: 'Log out',
    icon: icon('ic-lock'),
    path: '/log-in',
  },
];
