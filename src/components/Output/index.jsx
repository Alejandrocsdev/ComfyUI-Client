import '@cubone/react-file-manager/dist/style.css';
import S from './style.module.css';
import { useState, useEffect, useCallback } from 'react';
import { FileManager } from '@cubone/react-file-manager';
import { axiosPrivate } from '../../api';

const PREFIX = 'comfyui/output/';
const PERMISSIONS = { create: false, upload: false, rename: false, delete: false, download: false, copy: false, move: false };

// Recursively fetch all levels using the delimiter-based list endpoint.
// Each call gets one level; subfolders are fetched in parallel.
const fetchLevel = async (prefix) => {
  const { data } = await axiosPrivate.get('/api/s3/list', { params: { prefix } });
  const { files = [], folders = [] } = data;

  const fileItems = files.map((f) => ({
    name: f.name,
    isDirectory: false,
    path: '/' + f.key.replace(PREFIX, ''),
    updatedAt: f.lastModified ? new Date(f.lastModified).toISOString() : undefined,
    size: f.size,
  }));

  const folderItems = folders.map((f) => ({
    name: f.name,
    isDirectory: true,
    path: '/' + f.key.replace(PREFIX, '').replace(/\/$/, ''),
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
        <FileManager
          files={files}
          isLoading={isLoading}
          permissions={PERMISSIONS}
          primaryColor="hsl(245, 75%, 65%)"
          fontFamily="Inter, sans-serif"
          height="100%"
          onRefresh={fetchFiles}
          onError={(err) => console.error('[Output]', err)}
        />
      </div>
    </div>
  );
};

export default Output;
