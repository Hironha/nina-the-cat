import { bold, Colors, EmbedBuilder, type TextBasedChannel } from 'discord.js';
import { type GuildQueue, type Track } from 'discord-player';

const buildMessage = (trackTitle: string, channelName: string): EmbedBuilder[] => {
	const message = new EmbedBuilder()
		.setColor(Colors.Blue)
		.setTitle('🐱 | Playing Now')
		.setDescription(`▶ | Started playing ${bold(trackTitle)} in ${bold(channelName)}!`);

	return [message];
};

export const playerStartEvent = async (
	queue: GuildQueue<TextBasedChannel>,
	track: Track
): Promise<void> => {
	if (!queue.channel) return;

	const { metadata: textChannel, channel: voiceChannel } = queue;
	await textChannel.send({ embeds: buildMessage(track.title, voiceChannel.name) });
};
