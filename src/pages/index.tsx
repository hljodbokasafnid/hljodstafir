import { useEffect, useState } from 'react';
import { getFiles, getLogs, getAppVersion } from './api/files';
import axios from 'axios';
import nProgress from 'nprogress';
import { io, Socket } from 'socket.io-client';
import { ISocketMessage } from '../interfaces';
import Messages from '../components/Messages';
import { IFetchProps, IFile } from '../interfaces/client';
import Container from '../components/Container';
import { GetServerSidePropsContext } from 'next';
import DownloadListItem from '../components/lists/DownloadListItem';
import Uploader from '../components/Uploader';
import SwitchButton from '../components/buttons/SwitchButton';

const socket: Socket = io('/', { autoConnect: false });

interface IProps {
	mapFiles: IFile[];
	mapLogs: IFile[];
	appVersion: string;
}

const IndexPage = ({ mapFiles, mapLogs, appVersion }: IProps) => {
	const [uploaded, setUploaded] = useState<boolean>(false);
	const [uploading, setUploading] = useState<boolean>(false);
	const [error, setError] = useState<string>();
	const [files, setFiles] = useState<IFile[]>(mapFiles);
	const [logs, setLogs] = useState<IFile[]>(mapLogs);
	const [messages, setMessages] = useState<ISocketMessage[]>([]);
	const [canCloseMessages, setCanCloseMessages] = useState<boolean>(false);
	const [connected, setConnected] = useState<boolean>(false);
	const [showing, setShowing] = useState<string>('files');
	const [languageCode, setLanguageCode] = useState<string>('isl');
	const [ignoreAside, setIgnoreAside] = useState<boolean>(false);
	const [adjusting, setAdjusting] = useState<boolean>(false);
	const [parentHighlighting, setParentHighlighting] = useState<boolean>(false);
	const [inputType, setInputType] = useState<'daisy' | 'pdf' | undefined>(undefined);
	const [adjustment, setAdjustment] = useState<number>(125);
	const [skipPageNumbering, setSkipPageNumbering] = useState<boolean>(false);
	const [multipleHeaders, setMultipleHeaders] = useState<boolean>(false);
	// const [longerAudio, setLongerAudio] = useState<boolean>(false);
	const [loading, setLoading] = useState<boolean>(true);

	const connectUser = async () => {
		if (!connected) {
			socket.connect();
			setConnected(true);
		}
		return socket;
	};

	const setupSockets = async () => {
		socket.on('ascanius-done', async (message: ISocketMessage) => {
			setCanCloseMessages(true);
			setMessages((messages) => [...messages, message]);
			getFiles();
		});
		socket.on('ascanius-error', (message: ISocketMessage) => {
			setCanCloseMessages(true);
			setUploaded(false);
			setError(message.message);
			setMessages((messages) => [...messages, message]);
			getFiles();
		});
		socket.on('ascanius-relay', (message: ISocketMessage) => {
			setMessages((messages) => [...messages, message]);
		});
		socket.on('killed-process', async (message: ISocketMessage) => {
			setCanCloseMessages(true);
			setUploaded(false);
			setError('Process killed');
			setMessages((messages) => [...messages, message]);
			getFiles();
		});
	};

	const getFiles = async () => {
		const fetchFiles: IFetchProps = await axios.get('/api/files');
		if (fetchFiles?.data) {
			setFiles(fetchFiles.data.files);
			setLogs(fetchFiles.data.logs);
		}
	};

	useEffect(() => {
		connectUser();
		if (!files) {
			getFiles();
		}
		setupSockets();
		setLoading(false);
		return () => {
			socket.off('ascanius-done');
			socket.off('ascanius-error');
			socket.off('ascanius-relay');
			socket.off('user-connected');
		};
	}, [messages, files]);

	const onFileUpload = async (formData: FormData) => {
		nProgress.configure({ showSpinner: true });
		nProgress.start();
		setUploading(true);

		const config = {
			headers: {
				'Content-Type': 'multipart/form-data',
			},
			onUploadProgress: (progressEvent: any) => {
				const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
			},
		};

		const res = await axios.post('/api/upload', formData, config);

		if (res.status === 200) {
			setUploaded(true);
			setUploading(false);
			setError(undefined);
			try {
				const fileName = res.data.data[0].split('.')[0];
				const fileExtension = res.data.data[0].split('.')[1];
				socket.emit('ascanius', fileName, {
					language: languageCode,
					ignoreAside,
					adjustment: adjusting ? adjustment : 0,
					parentHighlighting,
					inputType,
					skipPageNumbering,
					multipleHeaders
				});
			} catch (error) {
				console.error(error);
				setUploaded(false);
				setUploading(false);
				setError('Error handling file');
			}
			nProgress.done();
		} else {
			setError(res.data.message);
			setUploading(false);
		}
	};

	const stopProcess = () => {
		socket.emit('kill-process');
	};

	const onShowClick = (show: string) => {
		setShowing(show);
	};

	const handleCloseFeed = () => {
		setCanCloseMessages(false);
		setMessages([]);
	};

	if (loading) {
		return <></>;
	}

	return (
		<Container>
			<main className='bg-stone-400 relative h-full flex flex-col mb-auto min-h-[calc(100vh-5rem)]'>
				<div className='absolute font-light text-xs text-stone-700 p-2 right-0 select-none pointer-events-none'>
					{appVersion && 'v' + appVersion}
				</div>
				<div className='flex h-full place-content-center justify-center'>
					{messages.length === 0 && (
						<Uploader
							handleFileUpload={onFileUpload}
							setLanguageCode={setLanguageCode}
							setIgnoreAside={setIgnoreAside}
							setAdjusting={setAdjusting}
							setAdjustment={setAdjustment}
							setParentHighlighting={setParentHighlighting}
							setInputType={setInputType}
							adjustment={adjustment}
							adjusting={adjusting}
							ignoreAside={ignoreAside}
							parentHighlighting={parentHighlighting}
							skipPageNumbering={skipPageNumbering}
							setSkipPageNumbering={setSkipPageNumbering}
							multipleHeaders={multipleHeaders}
							setMultipleHeaders={setMultipleHeaders}
							uploading={uploading}
						/>
					)}
					<Messages
						messages={messages}
						canCloseMessages={canCloseMessages}
						handleCloseFeed={handleCloseFeed}
						stopProcess={stopProcess}
					/>
				</div>
				<div className='bg-stone-300 flex flex-col flex-1 h-full'>
					<div className='flex justify-center my-2'>
						<SwitchButton
							handleClick={onShowClick}
							showing={showing}
							switchTo={'files'}
							title={'Files'}
							rounded='left'
						/>
						<SwitchButton
							handleClick={onShowClick}
							showing={showing}
							switchTo={'logs'}
							title={'Logs'}
							rounded='right'
						/>
					</div>
					{showing === 'files' &&
						files &&
						files.map((file: IFile, index: number) => (
							<DownloadListItem key={index} index={index} file={file} getFiles={getFiles} />
						))}
					{showing === 'logs' &&
						logs &&
						logs.map((file: IFile, index: number) => (
							<DownloadListItem key={index} index={index} file={file} getFiles={getFiles} />
						))}
				</div>
			</main>
		</Container>
	);
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
	const { mapFiles } = await getFiles();
	const { mapLogs } = await getLogs();
	const appVersion = await getAppVersion();
	return {
		props: { mapFiles, mapLogs, appVersion },
	};
}

export default IndexPage;
