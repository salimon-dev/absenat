import { useNavigate, useLocation } from 'react-router-dom';
import s from './Sidebar.module.css';

const TABS = [
  { path: 'assets', label: 'Assets' },
  { path: 'entities', label: 'Entities' },
  { path: 'map-modules', label: 'Map Modules' },
];

export function Sidebar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const activeRoot = pathname.split('/')[1];

  return (
    <nav className={s.sidebar}>
      {TABS.map(({ path, label }) => (
        <button
          key={path}
          className={`${s.tab} ${activeRoot === path ? s.active : ''}`}
          onClick={() => navigate(`/${path}`)}
        >
          {label}
        </button>
      ))}
    </nav>
  );
}
