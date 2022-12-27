import glob from 'glob';
import { promisify } from 'util';
import { type Player } from 'discord-player';

import { getSRCPath } from '@utils/path';
import { type PlayerEvent } from './player-event';

export class PlayerEventUtils {
	private constructor() {}

	static async load() {
		const globPromise = promisify(glob);
		const directoryFiles = `${getSRCPath()}/player-events/*{.js,.ts}`;

		const playerEventFiles = await globPromise(directoryFiles);

		const playerEventPromises: Promise<PlayerEvent>[] = playerEventFiles.map(async file => {
			const importedFile = await import(file);
			return importedFile.default;
		});

		return await Promise.all(playerEventPromises);
	}

	static attach(player: Player, events: PlayerEvent[]): Player {
		events.forEach(event => {
			if (event.once) {
				player.once(event.name, (...args: any[]) => event.execute(...args));
			} else {
				player.on(event.name, (...args: any[]) => event.execute(...args));
			}
		});

		return player;
	}
}
