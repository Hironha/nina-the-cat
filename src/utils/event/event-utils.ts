import glob from 'glob';
import { promisify } from 'util';
import { getSRCPath } from '@utils/path';

import { type DiscordClient } from '@utils/discord-client';
import { type Event } from './event';

export class EventUtils {
	private constructor() {}

	static async loadEvents(): Promise<Event[]> {
		const globPromise = promisify(glob);
		const directoryFiles = `${getSRCPath()}/events/*{.js,.ts}`;

		const eventFiles = await globPromise(directoryFiles);

		const eventPromises: Promise<Event>[] = eventFiles.map(async file => {
			const importedFile = await import(file);
			return importedFile.default;
		});

		return await Promise.all(eventPromises);
	}

	static attach(client: DiscordClient, events: Event[]): DiscordClient {
		const createEventExecuter = (event: Event, client: DiscordClient) => {
			return (...args: any[]) => event.execute(...args, client).catch(err => console.error(err));
		};

		events.forEach(event => {
			if (event.once) {
				client.once(event.name, createEventExecuter(event, client));
			} else {
				client.on(event.name, createEventExecuter(event, client));
			}
		});

		return client;
	}
}
