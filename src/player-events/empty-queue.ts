import { Colors, EmbedBuilder, type TextBasedChannel } from 'discord.js';
import { type GuildQueue } from 'discord-player';

const buildMessage = (): EmbedBuilder[] => {
	const message = new EmbedBuilder()
		.setColor(Colors.Blue)
		.setTitle('😽 | Finished')
		.setDescription('I finished playing all songs that were in queue!');

	return [message];
};

export const emptyQueueEvent = async (queue: GuildQueue<TextBasedChannel>): Promise<void> => {
	const { metadata: textChannel } = queue;
	await textChannel.send({ embeds: buildMessage() });

	if (!queue.deleted) {
		queue.delete();
	}
};
