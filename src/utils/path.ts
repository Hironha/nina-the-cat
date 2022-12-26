export function getSRCPath(): string {
	let srcPath = '';
	const dirPath = process.cwd();
	const isDevelopment = process.env.ENVIRONMENT === 'development';

	if (isDevelopment) {
		srcPath = `${dirPath}/src`;
	} else {
		srcPath = `${dirPath}/dist/src`;
	}
	return srcPath.replace(/\\/g, '/');
}
