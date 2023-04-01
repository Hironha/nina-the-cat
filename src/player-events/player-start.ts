import { bold, Colors, EmbedBuilder, type TextBasedChannel } from 'discord.js';
import { GuildQueueEvent, type GuildQueue, type Track } from 'discord-player';
import { type PlayerEvent } from '@utils/player-event';

const buildMessage = (trackTitle: string, channelName: string): EmbedBuilder[] => {
	const message = new EmbedBuilder()
		.setColor(Colors.Blue)
		.setTitle('🐱 | Playing Now')
		.setDescription(`▶ | Started playing ${bold(trackTitle)} in ${bold(channelName)}!`);

	return [message];
};

const execute = async (queue: GuildQueue<TextBasedChannel>, track: Track): Promise<void> => {
	if (!queue.channel) return;

	const { metadata: textChannel, channel: voiceChannel } = queue;
	await textChannel.send({ embeds: buildMessage(track.title, voiceChannel.name) });
};

export const emptyQueueEvent: PlayerEvent = {
	name: GuildQueueEvent.emptyQueue,
	execute,
};
