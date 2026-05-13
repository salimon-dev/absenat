import s from './Header.module.css';

export function Header() {
  return (
    <header className={s.header}>
      <span className={s.logo}>
        asset<span className={s.logoAccent}> manager</span>
      </span>
    </header>
  );
}
