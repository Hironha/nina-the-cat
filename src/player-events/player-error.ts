import { type TextBasedChannel } from 'discord.js';
import { type GuildQueue } from 'discord-player';

export const playerErrorEvent = async (
	queue: GuildQueue<TextBasedChannel>,
	error: Error
): Promise<void> => {
	console.error(`[${queue.guild.name}] Error emitted from the connection: ${error.message}`);
};
