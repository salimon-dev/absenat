import s from './EmptyState.module.css';

interface Props {
  icon: string;
  label: string;
  sub: string;
}

export function EmptyState({ icon, label, sub }: Props) {
  return (
    <div className={s.wrapper}>
      <div className={s.icon}>{icon}</div>
      <p className={s.label}>{label}</p>
      <p className={s.sub}>{sub}</p>
    </div>
  );
}
