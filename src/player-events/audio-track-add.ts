import { bold, Colors, EmbedBuilder, type TextBasedChannel } from 'discord.js';
import { GuildQueueEvent, type GuildQueue, type Track } from 'discord-player';
import { PlayerEvent } from '@utils/player-event';

const buildMessage = (trackTitle: string): EmbedBuilder[] => {
	const message = new EmbedBuilder()
		.setColor(Colors.Blue)
		.setTitle('🐱 | Add Track')
		.setDescription(`Track ${bold(trackTitle)} queued!`);

	return [message];
};

const execute = async (queue: GuildQueue<TextBasedChannel>, track: Track): Promise<void> => {
	const { metadata: textChannel } = queue;
	await textChannel.send({ embeds: buildMessage(track.title) });
};

export const audioTrackAddEvent: PlayerEvent = {
	name: GuildQueueEvent.audioTrackAdd,
	execute,
};
