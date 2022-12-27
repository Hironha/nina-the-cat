import { type ClientEvents } from 'discord.js';

export interface Event {
	readonly name: keyof ClientEvents;
	readonly once: boolean;
	execute(...args: any[]): Promise<void>;
}
