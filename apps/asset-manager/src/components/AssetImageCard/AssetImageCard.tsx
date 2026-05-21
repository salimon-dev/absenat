import s from './AssetImageCard.module.css';

interface Props {
  name: string;
  onClick: (name: string) => void;
  src: string;
}

export function AssetImageCard({ name, onClick, src }: Props) {
  return (
    <button className={s.card} onClick={() => onClick(name)} type="button">
      <div className={s.preview}>
        <img className={s.image} src={src} alt={name} />
      </div>
      <span className={s.filename} title={name}>{name}</span>
    </button>
  );
}
