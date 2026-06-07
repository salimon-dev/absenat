import { describe, expect, it } from 'vitest';
import { ResourceType } from '../../utils/resources';
import { WorldEntityKind } from '../world/types';
import { getResourceNodeContent, getResourceNodeDefinition } from './resource-node-definitions';

describe('resource node definitions', () => {
  it('maps mushroom variants to their resource drops', () => {
    expect(getResourceNodeContent(WorldEntityKind.Mushroom, 0)).toEqual([
      { name: ResourceType.RedMushroom, count: 1 }
    ]);
    expect(getResourceNodeContent(WorldEntityKind.Mushroom, 1)).toEqual([
      { name: ResourceType.BlueMushroom, count: 1 }
    ]);
    expect(getResourceNodeContent(WorldEntityKind.Mushroom, 2)).toEqual([
      { name: ResourceType.GreenMushroom, count: 1 }
    ]);
  });

  it('keeps every configured node variant count positive', () => {
    const kinds = Object.values(WorldEntityKind);
    expect(kinds.every(kind => getResourceNodeDefinition(kind).variantCount > 0)).toBe(true);
  });
});
