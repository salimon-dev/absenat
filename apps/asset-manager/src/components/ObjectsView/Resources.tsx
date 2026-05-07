import s from './Resources.module.css';

interface TileData {
  id: string;
  url: string;
  x: number;
  y: number;
}

interface ResourcesProps {
  tiles: TileData[];
  isProcessing: boolean;
  onDeleteTile: (id: string) => void;
  onSelectTile: (tile: TileData) => void;
}

export function Resources({ tiles, isProcessing, onDeleteTile, onSelectTile }: ResourcesProps) {
  return (
    <div className={s.container}>
      <div className={s.header}>
        <h2 className={s.title}>Resources</h2>
        <div className={s.stats}>{tiles.length} tiles</div>
      </div>
      
      <div className={s.content}>
        {isProcessing && (
          <div className={s.loading}>
            <div className={s.spinner}></div>
            <p>Slicing image...</p>
          </div>
        )}

        <div className={s.grid}>
          {tiles.map((tile) => (
            <div
              key={tile.id}
              className={s.tile}
              onClick={() => onSelectTile(tile)}
              onContextMenu={(e) => {
                e.preventDefault();
                onDeleteTile(tile.id);
              }}
              title="Click to select, Right click to delete"
            >
              <img src={tile.url} alt={`Tile ${tile.x},${tile.y}`} />
              <div className={s.tileInfo}>
                {tile.x}, {tile.y}
              </div>
            </div>
          ))}
        </div>
        
        {tiles.length === 0 && !isProcessing && (
          <div className={s.empty}>Upload a sprite sheet to see tiles</div>
        )}
      </div>
    </div>
  );
}
