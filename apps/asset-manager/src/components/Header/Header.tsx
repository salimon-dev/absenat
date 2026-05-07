import { useAtom } from 'jotai';
import { activeViewAtom, View, type ViewType } from '../../store';
import s from './Header.module.css';

const VIEWS: ViewType[] = [View.Tiles, View.Objects, View.MapEditor];

export function Header() {
  const [activeView, setActiveView] = useAtom(activeViewAtom);

  return (
    <header className={s.header}>
      <span className={s.logo}>asset<span className={s.logoAccent}>manager</span></span>
      <nav className={s.nav}>
        {VIEWS.map((view) => (
          <button
            key={view}
            className={s.navBtn}
            onClick={() => setActiveView(view)}
            aria-current={activeView === view ? 'page' : undefined}
          >
            {view}
          </button>
        ))}
      </nav>
    </header>
  );
}
