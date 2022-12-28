import { bold, Colors, EmbedBuilder, type TextBasedChannel, type APIEmbedField } from 'discord.js';
import { type PlayerEvents, type Queue, type Track } from 'discord-player';

import { intoChunk } from '@utils/chunk';
import { type PlayerEvent } from '@utils/player-event';

class TracksAdd implements PlayerEvent {
	public name: keyof PlayerEvents = 'tracksAdd';
	public once = false;

	async execute(queue: Queue<TextBasedChannel>, tracks: Track[]): Promise<void> {
		if (!queue.metadata) return;
		const channel = queue.metadata;

		const trackFields = this.toApiEmbedFields(tracks);

		const embedMessages = intoChunk(trackFields, 20).map((chunk, index) => {
			let embed = new EmbedBuilder().setColor(Colors.Blue).setFields(chunk);
			if (index !== 0) return embed;
			return embed.setTitle('🐱 | Added Songs').setDescription('All songs added to queue');
		});

		channel.send({ embeds: embedMessages });
	}

	private toApiEmbedFields(tracks: Track[]): APIEmbedField[] {
		return tracks.map((track, index) => ({
			name: `${index + 1}.`,
			value: bold(track.title),
			inline: false,
		}));
	}
}

export default new TracksAdd();
