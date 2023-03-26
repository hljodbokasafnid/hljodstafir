export interface ISocketMessage {
	message: string;
	delivered: string;
	highlight: false | 'warning' | 'error';
}

export interface IOptions {
	language: string;
	ignoreAside: boolean;
	adjustment: number; // number (int)
	parentHighlighting: boolean;
	longerAudio: boolean;
	inputType?: 'daisy' | 'pdf';
	skipPageNumbering: boolean;
	multipleHeaders: boolean;
}