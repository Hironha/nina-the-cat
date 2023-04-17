import { type TextBasedChannel, BaseChannel } from 'discord.js';
import { type GuildQueue } from 'discord-player';

type EventHandler<T = unknown> = (queue: GuildQueue<T>, ...args: any) => Promise<void>;

const log = (eventName: string) => {
	console.log(`${eventName} executed at ${new Date().toISOString()}`);
};

export const createHandler = (handler: EventHandler<TextBasedChannel>): EventHandler<unknown> => {
	return async (queue, ...args) => {
		if (queue.metadata instanceof BaseChannel) {
			log(handler.name);
			handler(queue as GuildQueue<TextBasedChannel>, ...args).catch(console.error);
		}
	};
};
