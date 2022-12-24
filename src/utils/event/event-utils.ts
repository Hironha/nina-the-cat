import glob from 'glob';
import { promisify } from 'util';

import { type Event } from './event';

export class EventUtils {
	static async load() {
		const globPromise = promisify(glob);
		const directoryFiles = `${process.cwd().replace(/\\/g, '/')}/src/events/*{.js,.ts}`;
		const eventFiles = await globPromise(directoryFiles);

		const eventPromises: Promise<Event>[] = eventFiles.map(async file => {
			const importedFile = await import(file);
			return importedFile.default;
		});

		return await Promise.all(eventPromises);
	}
}
