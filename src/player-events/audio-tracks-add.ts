import { bold, Colors, EmbedBuilder, type TextBasedChannel, type APIEmbedField } from 'discord.js';
import { GuildQueueEvent, type GuildQueue, type Track } from 'discord-player';

import { intoChunk } from '@utils/chunk';
import { type PlayerEvent } from '@utils/player-event';

const mapTracksToEmbedFields = (tracks: Track[]): APIEmbedField[] => {
	return tracks.map((track, index) => ({
		name: `${index + 1}.`,
		value: bold(track.title),
		inline: false,
	}));
};

const buildMessage = (tracks: Track[]): EmbedBuilder[] => {
	return intoChunk(mapTracksToEmbedFields(tracks), 20).map((chunk, index) => {
		const embed = new EmbedBuilder().setColor(Colors.Blue).setFields(chunk);
		if (index !== 0) return embed;
		return embed.setTitle('🐱 | Added Songs').setDescription('All songs added to queue');
	});
};

const execute = async (queue: GuildQueue<TextBasedChannel>, tracks: Track[]): Promise<void> => {
	const { metadata: textChannel } = queue;
	await textChannel.send({ embeds: buildMessage(tracks) });
};

export const audioTracksAdd: PlayerEvent = {
	name: GuildQueueEvent.audioTracksAdd,
	execute,
};
