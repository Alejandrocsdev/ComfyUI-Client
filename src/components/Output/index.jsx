import S from './style.module.css';
import { useState, useEffect, useCallback } from 'react';
import { Filemanager, WillowDark } from '@svar-ui/react-filemanager';
import "@svar-ui/react-filemanager/all.css";
import { axiosPrivate } from '../../api';

const PREFIX = 'comfyui/output/';

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
          <Filemanager data={files} readonly={true} />
        </WillowDark>
      </div>
    </div>
  );
};

export default Output;
