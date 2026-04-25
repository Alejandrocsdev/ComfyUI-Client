import S from './style.module.css';
import { useState, useEffect, useCallback } from 'react';
import { Filemanager, WillowDark } from '@svar-ui/react-filemanager';
import '@svar-ui/react-filemanager/all.css';
import { axiosPrivate } from '../../api';

const PREFIX = 'comfyui/output/';

const downloadFile = async (id) => {
  const key = PREFIX + id.replace(/^\//, '');
  const filename = id.split('/').pop();
  const { data } = await axiosPrivate.get('/api/s3/download', {
    params: { key },
    responseType: 'blob',
  });
  const url = URL.createObjectURL(data);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Defined outside the component so the reference is stable across renders.
// SVAR calls init(api) once on mount; registering the intercept once is enough.
const initFileManager = (api) => {
  api.intercept('download-file', async ({ id }) => {
    let ids = [id];
    try {
      const panels = api.getState('panels');
      const panelIdx = api.getState('activePanel') ?? 0;
      const selected = (panels?.[panelIdx]?.selected ?? []).filter(
        (fid) => api.getFile(fid)?.type === 'file'
      );
      if (selected.length > 0) ids = selected;
    } catch (_) {
      // fall back to the single triggered id
    }
    try {
      for (const fileId of ids) await downloadFile(fileId);
    } catch (err) {
      console.error('[Output download]', err);
    }
    return false; // prevent any default SVAR behaviour
  });
};

const fetchLevel = async (prefix) => {
  const { data } = await axiosPrivate.get('/api/s3/list', { params: { prefix } });
  const { files = [], folders = [] } = data;

  const fileItems = files.map((f) => ({
    id: '/' + f.key.replace(PREFIX, ''),
    type: 'file',
    size: f.size,
    date: f.lastModified ? new Date(f.lastModified) : new Date(),
  }));

  const folderItems = folders.map((f) => ({
    id: '/' + f.key.replace(PREFIX, '').replace(/\/$/, ''),
    type: 'folder',
    size: 0,
    date: new Date(),
  }));

  const nested = await Promise.all(folders.map((f) => fetchLevel(f.key)));

  return [...folderItems, ...fileItems, ...nested.flat()];
};

const Output = ({ onClose }) => {
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchFiles = useCallback(async () => {
    setIsLoading(true);
    try {
      const items = await fetchLevel(PREFIX);
      setFiles(items);
    } catch (err) {
      console.error('[Output]', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  return (
    <div className={S.overlay} onClick={onClose}>
      <div className={S.panel} onClick={(e) => e.stopPropagation()}>
        <WillowDark>
          <Filemanager data={files} readonly={true} init={initFileManager} />
        </WillowDark>
      </div>
    </div>
  );
};

export default Output;
