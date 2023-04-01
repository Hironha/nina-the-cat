import { Colors, EmbedBuilder, type TextBasedChannel } from 'discord.js';
import { type PlayerEvent } from '@utils/player-event';
import { GuildQueueEvent, GuildQueue } from 'discord-player';

const buildMessage = (): EmbedBuilder[] => {
	const message = new EmbedBuilder()
		.setColor(Colors.Blue)
		.setTitle('😿 | Disconnect')
		.setDescription('I was disconnected from the voice channel, clearing queue!');

	return [message];
};

const execute = async (queue: GuildQueue<TextBasedChannel>): Promise<void> => {
	const { metadata: textChannel } = queue;
	await textChannel.send({ embeds: buildMessage() });
	queue.delete();
};

export const disconnectEvent: PlayerEvent = {
	name: GuildQueueEvent.disconnect,
	execute,
};
