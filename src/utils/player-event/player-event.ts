import { type PlayerEvents } from 'discord-player';

export interface PlayerEvent {
	readonly name: keyof PlayerEvents;
	readonly once: boolean;
	execute(...args: any[]): Promise<void>;
}
