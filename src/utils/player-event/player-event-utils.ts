import { Player } from 'discord-player';
import { type PlayerEvent } from './player-event';

export class PlayerEventUtils {
	private constructor() {}

	static attach(player: Player, events: PlayerEvent[]): Player {
		const createEventExecuter = (event: PlayerEvent): ((...args: any[]) => Promise<void>) => {
			return async (...args: any[]) => {
				return event.execute(...args).catch(err => console.error(err));
			};
		};

		events.forEach(event => {
			if (event.once) {
				player.once(event.name, createEventExecuter(event));
			} else {
				player.on(event.name, createEventExecuter(event));
			}
		});

		return player;
	}
}
