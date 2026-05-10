export enum WObjectTypeEnum {
  Tree = 'tree',
  Mushroom = 'mushroom',
  Ore = 'ore',
  Tool = 'too',
  Tile = 'tile'
}
export type WObjectType = `${WObjectTypeEnum}`;
export abstract class WObject {
  public type: WObjectType;
  constructor(type: WObjectType) {
    this.type = type;
  }
  abstract draw(x: number, y: number): Promise<void>;
  abstract destory(): Promise<void>;
}
