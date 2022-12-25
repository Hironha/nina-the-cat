import glob from 'glob';
import { promisify } from 'util';

import { type DiscordClient } from '@utils/discord-client';
import { type Event } from './event';

export class EventUtils {
	static async load(): Promise<Event[]> {
		const globPromise = promisify(glob);
		const directoryFiles = `${process.cwd().replace(/\\/g, '/')}/src/events/*{.js,.ts}`;
		const eventFiles = await globPromise(directoryFiles);

		const eventPromises: Promise<Event>[] = eventFiles.map(async file => {
			const importedFile = await import(file);
			return importedFile.default;
		});

		return await Promise.all(eventPromises);
	}

	static attach(client: DiscordClient, events: Event[]): DiscordClient {
		events.forEach(event => {
			if (event.once) {
				client.once(event.name, (...args) => event.execute(...args, client.commands));
			} else {
				client.on(event.name, (...args) => event.execute(...args, client.commands));
			}
		});

		return client;
	}
}
