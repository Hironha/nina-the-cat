import { bold, Colors, EmbedBuilder, type TextBasedChannel } from 'discord.js';
import { type GuildQueue, type Track } from 'discord-player';

const buildMessage = (trackTitle: string): EmbedBuilder[] => {
	const message = new EmbedBuilder()
		.setColor(Colors.Blue)
		.setTitle('🐱 | Add Track')
		.setDescription(`Track ${bold(trackTitle)} queued!`);

	return [message];
};

export const audioTrackAddEvent = async (
	queue: GuildQueue<TextBasedChannel>,
	track: Track
): Promise<void> => {
	const { metadata: textChannel } = queue;
	await textChannel.send({ embeds: buildMessage(track.title) });
};
