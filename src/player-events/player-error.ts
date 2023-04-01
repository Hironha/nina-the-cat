import { type TextBasedChannel } from 'discord.js';
import { GuildQueueEvent, type GuildQueue } from 'discord-player';
import { type PlayerEvent } from '@utils/player-event';

const execute = async (queue: GuildQueue<TextBasedChannel>, error: Error): Promise<void> => {
	console.error(`[${queue.guild.name}] Error emitted from the connection: ${error.message}`);
};

export const playerErrorEvent: PlayerEvent = {
	name: GuildQueueEvent.playerError,
	execute,
};
