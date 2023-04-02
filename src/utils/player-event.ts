import { type TextBasedChannel, BaseChannel } from 'discord.js';
import { type GuildQueue } from 'discord-player';

type EventHandler<T = unknown> = (queue: GuildQueue<T>, ...args: any) => Promise<void>;

export const createHandler = (handler: EventHandler<TextBasedChannel>): EventHandler<unknown> => {
	return async (queue, ...args) => {
		if (queue.metadata instanceof BaseChannel) {
			handler(queue as GuildQueue<TextBasedChannel>, ...args);
		}
	};
};
