import { Colors, EmbedBuilder, type TextBasedChannel } from 'discord.js';
import { type GuildQueue } from 'discord-player';

const buildMessage = (): EmbedBuilder[] => {
	const message = new EmbedBuilder()
		.setColor(Colors.Blue)
		.setTitle('😿 | Lonely')
		.setDescription("Nobody is in the voice channel with me, so I'm leaving...");

	return [message];
};

export const emptyChannelEvent = async (queue: GuildQueue<TextBasedChannel>): Promise<void> => {
	const { metadata: textChannel } = queue;
	await textChannel.send({ embeds: buildMessage() });

	if (!queue.deleted) {
		queue.delete();
	}
};
