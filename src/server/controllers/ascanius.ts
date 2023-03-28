import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import { Server } from 'socket.io';
import { IOptions, ISocketMessage } from '../../interfaces';

let mainProcess: null | ChildProcessWithoutNullStreams = null;

const ascanius = async (fileName: string, userId: string, io: Server, options: IOptions) => {
	try {
		const spawnArgs = [
			'main.py',
			fileName,
			options.language,
			options.ignoreAside.toString(),
			options.adjustment.toString(),
			options.parentHighlighting.toString(),
			userId,
		]
		if (options?.inputType) {
			spawnArgs.push(options.inputType);
			spawnArgs.push(options.skipPageNumbering?.toString());
			spawnArgs.push(options.multipleHeaders?.toString())
		}
		mainProcess = spawn('python', spawnArgs);
		// process spawn with utf 8 encoding
		mainProcess.stdout.setEncoding('utf8');
		mainProcess.stdout.on('data', (data: string) => {
			const hasError = data.toString().toLowerCase().includes('error');
			const hasWarning = data.toString().toLowerCase().includes('warning');
			const done = data.toString().toLowerCase().includes('done');
			if (done) {
				const doneMessage: ISocketMessage = {
					message: 'Finished Processing',
					delivered: new Date().toString(),
					highlight: false,
				};
				io.to(userId).emit('ascanius-done', doneMessage);
			} else {
				const message: ISocketMessage = {
					message: data.toString(),
					delivered: new Date().toISOString(),
					highlight: hasError ? 'error' : hasWarning ? 'warning' : false,
				};
				io.to(userId).emit('ascanius-relay', message);
			}
		});
		mainProcess.stderr.setEncoding('utf8');
		mainProcess.stderr.on('data', (data) => {
			// Errors also get relayed, in case of crashes
			const message: ISocketMessage = {
				message: data.toString(),
				delivered: new Date().toISOString(),
				highlight: 'error',
			};
			io.to(userId).emit('ascanius-error', message);
		});
	} catch (error) {
		console.error(error);
	}
};

export const killProcess = () => {
	if (mainProcess) {
		mainProcess.kill();
		mainProcess = null;
	}
	// Should probably delete the temp/uploaded files after killing the process?
};

export default ascanius;
