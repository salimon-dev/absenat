export enum MapModuleTypeEnum {
  Top = 'top',
  Bottom = 'bottom',
  Left = 'left',
  Right = 'right',
  TopLeft = 'top-left',
  TopRight = 'top-right',
  BottomRight = 'bottom-right',
  Center = 'center',
  Raft = 'raft',
}
export type MapModuleType = `${MapModuleTypeEnum}`;

export type MapModule = {
  id: string;
  name: string;
  tiles: string[];
  entities: { id: string; row: number; col: number }[];
  type: MapModuleType;
};
