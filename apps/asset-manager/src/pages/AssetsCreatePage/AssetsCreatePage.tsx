import { AssetSaveWorkspace } from '../../components/AssetSaveWorkspace/AssetSaveWorkspace';
import { AssetSavePageMode } from '../../components/AssetSaveWorkspace/types';

export default function AssetsCreatePage() {
  return <AssetSaveWorkspace mode={AssetSavePageMode.Create} />;
}
