import { Navigate, useParams } from 'react-router-dom';
import { AssetSaveWorkspace } from '../../components/AssetSaveWorkspace/AssetSaveWorkspace';
import { AssetSavePageMode } from '../../components/AssetSaveWorkspace/types';

export default function AssetsEditPage() {
  const { filename } = useParams();
  if (!filename) return <Navigate to="/assets" replace />;

  return (
    <AssetSaveWorkspace
      editFilename={filename}
      mode={AssetSavePageMode.Edit}
    />
  );
}
