import axios from 'axios';
import React, { FormEvent } from 'react'
import { IFile } from '../../interfaces/client';

interface DownloadListItemProps {
  file: IFile;
  index: number;
  getFiles: (userId?: string) => Promise<void>;
}

const DownloadListItem = ({ file, index, getFiles }: DownloadListItemProps) => {
  const downloadFileHandler = async (file: string, name: string) => {
    const res = await fetch(`/api/download/${file}`);
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const deleteFile = async (e: FormEvent, file: any) => {
		e.stopPropagation();
		await axios
			.post('/api/delete/', { file })
			.catch(async (err) => {
				console.error(err);
			});
      getFiles();
	};

  return (
    <div
      onClick={() => downloadFileHandler(file.url, file.name)}
      className='hover:bg-primary hover:text-white flex flex-row gap-2 px-8 py-2 cursor-pointer relative w-full select-none'
    >
      <span className='mr-2 font-semibold'>{index + 1}</span>
      <div className='text-left flex flex-1'>{file.name + ' - ' + file.date + ' - ' + file.sizeInMB}</div>
      <button
        onClick={(e) => deleteFile(e, file.url)}
        className='px-2 py-1 bg-red-300 text-black font-bold text-xs sm:text-base hover:bg-red-200 rounded-sm'
      >
        Delete
      </button>
    </div>
  )
}

export default DownloadListItem