export interface IFile {
	name: string;
	date: string;
	size: number;
	sizeInMB: string;
	url: string;
}

export interface IFetchProps {
	data: {
		files: IFile[];
		logs: IFile[];
	}
}
