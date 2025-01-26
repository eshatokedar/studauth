import path from 'path';
import { useNavigate } from 'react-router-dom';
import { SvgColor } from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name: string) => (
  <SvgColor width="100%" height="100%" src={`/assets/icons/navbar/${name}.svg`} />
);

const handleLogout = () => {
  console.log('User logged out');
  sessionStorage.clear();
  alert('You have been logged out');
  window.location.href = '/log-in';
};

export const navData = [
  {
    title: 'Students',
    path: '/',
    icon: icon('ic-user'),
  },
  {
    title: 'Log in',
    path: '/log-in',
    icon: icon('ic-lock'),
  },      
  {
    title: 'Log out',
    icon: icon('ic-logout'),
    path: '/',
    action: handleLogout,
  },
];
