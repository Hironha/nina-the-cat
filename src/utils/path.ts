import { Environment } from './environment';

export function getSRCPath(): string {
	let srcPath = '';
	const dirPath = process.cwd();

	if (Environment.isDevelopment()) {
		srcPath = `${dirPath}/src`;
	} else {
		srcPath = `${dirPath}/dist/src`;
	}
	return srcPath.replace(/\\/g, '/');
}
