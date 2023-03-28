import express, { Request, Response } from 'express';
import next from 'next';
import multer from 'multer';
import fs from 'fs';
import ascanius, { killProcess } from './controllers/ascanius';
import http from 'http';
import dayjs from 'dayjs';
import { initIO } from './controllers/socket';
import { Socket, Server } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import { v5 as uuidv5 } from 'uuid';
import { IOptions } from '../interfaces';
import { CronJob } from 'cron';

const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();
const port = process.env.PORT || 3000;
const ignoreUploadFolderNames = ['temp'];

(async () => {
	try {
		const timeRegex = /[\.\-\:]/g;
		await nextApp.prepare();
		const app = express();
		app.use(express.json({ limit: '1gb' }));
		app.use(express.urlencoded({ extended: true, limit: '1gb' }));
		const server = http.createServer(app);
		const io: Server = initIO(server);

		const { uploadPath, tempPath, tempLogsPath, outputPath, logsPath } = {
			uploadPath: './public/uploads',
			tempPath: './public/uploads/temp',
			tempLogsPath: './public/uploads/temp/logs',
			outputPath: './public/output',
			logsPath: './public/logs',
		};
		const folders = [uploadPath, tempPath, tempLogsPath, outputPath, logsPath];
		for (const folder of folders) {
			if (!fs.existsSync(folder)) {
				fs.mkdirSync(folder);
			}
		}

		const upload = multer({
			storage: multer.diskStorage({
				destination: uploadPath,
				filename: (req, file, cb) => {
					cb(null, `${dayjs().toISOString().replaceAll(timeRegex, '_')}_remove-timestamp_${file.originalname}`);
				},
			}),
			limits: { fileSize: 1024 ** 3 },
		});

		const uploadFiles = upload.array('files');

		app.post('/api/upload', uploadFiles, async (req, res) => {
			const filenames = fs.readdirSync(uploadPath);
			// ignore upload folder names
			const filteredFilenames = filenames.filter((filename) => !ignoreUploadFolderNames.includes(filename));
			// sort files by upload time
			const sortedFilenames = filteredFilenames.sort((a, b) => {
				const aTime: any = dayjs(a.split('_remove-timestamp_')[0]);
				const bTime: any = dayjs(b.split('_remove-timestamp_')[0]);
				return aTime.isAfter(bTime) ? 1 : -1;
			});
			const files = sortedFilenames.map((file) => file);
			// sends back files in sorted order to client so clients file is on top of the list
			res.status(200).json({ data: files });
		});

		// download file
		app.get('/api/download/:location/:userId/:file', async (req, res) => {
			const file = req.params.file;
			const location = req.params.location;
			const userId = req.params.userId;
			res.download(`./public/${location}/${userId}/${file}`);
			res.status(200);
		});

		app.post('/api/delete', async (req, res) => {
			const file = req.body.file;
			try {
				fs.unlinkSync(`./public/${file}`);
				res.status(200).json({ success: true, message: 'File deleted' });
			} catch (error) {
				console.error('File not found');
				res.status(500).json({ success: false, message: 'File not found' });
			}
		});

		io.on('connection', async (socket: Socket) => {
			const userId = 'user';
			await socket.join(userId);
			socket.emit('user-connected', userId);
			console.log('user connected');
			
			socket.on('ascanius', (fileName: string, options: IOptions) => {
				ascanius(fileName, userId, io, options);
			});

			socket.on('kill', (data) => {
				killProcess();
				socket.emit('killed-process');
				console.log('killed process');
			});

			socket.on('disconnect', (data) => {
				socket.emit('user-disconnect');
				console.log('user disconnected');
			});

			socket.on('closed', (data) => {
				socket.emit('user forcefully closed the connection');
				console.log('user closed');
			});
		});

		app.all('*', (req: Request, res: Response) => {
			return handle(req, res);
		});

		const deleteTempFiles = (keepTempFilesFor: number) => {
			try {
				const ignoreFolder = [tempPath];
				const uploads = fs.readdirSync(uploadPath);
				const tempLogs = fs.readdirSync(tempLogsPath);
				// prepend path to files
				const uploadsWithPath = uploads.map((file) => `${uploadPath}/${file}`);
				const tempLogsWithPath = tempLogs.map((file) => `${tempLogsPath}/${file}`);
				const files24h = [...uploadsWithPath, ...tempLogsWithPath];
				// filter out files that are in ignore folder
				const filteredFiles = files24h.filter((file) => !ignoreFolder.includes(file));
				for (const file of filteredFiles) {
					// check if file/folder is older than 24 hours if so delete it
					const stats = fs.statSync(file);
					const fileAge = dayjs(stats.birthtime);
					const now = dayjs();
					const diff = now.diff(fileAge, 'hour');
					if (diff > keepTempFilesFor) {
						if (stats.isDirectory()) {
							fs.rmdirSync(file, { recursive: true });
						} else {
							fs.unlinkSync(`${file}`);
						}
					}
				}
			} catch (error) {
				console.error(error);
			}
		};

		const deleteExpiredFiles = (expiresInDays: number) => {
			try {
				const outputUserFolders = fs.readdirSync(outputPath);
				const logsUserFolders = fs.readdirSync(logsPath);
				const outputUserFoldersWithPath = outputUserFolders.map((userFolder) => `${outputPath}/${userFolder}`);
				const logsUserFoldersWithPath = logsUserFolders.map((userFolder) => `${logsPath}/${userFolder}`);
				const userFolders = [...outputUserFoldersWithPath, ...logsUserFoldersWithPath];
				for (const userFolder of userFolders) {
					// check if file is older than 7 days if so delete it
					const files = fs.readdirSync(`${userFolder}`);
					for (const file of files) {
						const stats = fs.statSync(`${userFolder}/${file}`);
						const fileAge = dayjs(stats.birthtime);
						const now = dayjs();
						const diff = now.diff(fileAge, 'day');
						if (diff > expiresInDays) {
							fs.unlinkSync(`${userFolder}/${file}`);
						}
					}
				}
			} catch (error) {
				console.error(error);
			}
		};

		// Deletes temp files every 24 hours
		const tempCleanCron = new CronJob('* * * * *', () => {
			const keepTempFilesFor = 24;
			deleteTempFiles(keepTempFilesFor);
		});

		// Deletes expired output/logs files every 24 hours
		const outputCleanCron = new CronJob('* * * * *', () => {
			const expiresInDays = 30; // expires every 30 days
			deleteExpiredFiles(expiresInDays);
		});

		if (!tempCleanCron.running) {
			tempCleanCron.start();
		}
		if (!outputCleanCron.running) {
			outputCleanCron.start();
		}

		server.listen(port, (err?: Error) => {
			if (err) throw err;
			console.log(
				`> Ready on http://localhost:${port} - env ${process.env.NODE_ENV ? process.env.NODE_ENV : 'development'}`
			);
		});
	} catch (e) {
		console.error(e);
		process.exit(1);
	}
})();
