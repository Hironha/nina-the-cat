import { Colors, EmbedBuilder, type TextBasedChannel } from 'discord.js';
import { GuildQueueEvent, type GuildQueue } from 'discord-player';
import { type PlayerEvent } from '@utils/player-event';

const buildMessage = (): EmbedBuilder[] => {
	const message = new EmbedBuilder()
		.setColor(Colors.Blue)
		.setTitle('😽 | Finished')
		.setDescription('I finished playing all songs that were in queue!');

	return [message];
};

const execute = async (queue: GuildQueue<TextBasedChannel>): Promise<void> => {
	const { metadata: textChannel } = queue;
	await textChannel.send({ embeds: buildMessage() });
	queue.delete();
};

export const emptyQueueEvent: PlayerEvent = {
	name: GuildQueueEvent.emptyQueue,
	execute,
};
