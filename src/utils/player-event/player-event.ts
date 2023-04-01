import { type GuildQueueEvent } from 'discord-player';

export type PlayerEvent = {
	readonly name: GuildQueueEvent;
	execute(...args: any[]): Promise<void>;
};
