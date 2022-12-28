import { bold, Colors, EmbedBuilder, type TextBasedChannel } from 'discord.js';
import { PlayerEvent } from '@utils/player-event';
import { PlayerEvents, type Queue, type Track } from 'discord-player';

class TrackAdd implements PlayerEvent {
	public name: keyof PlayerEvents = 'trackAdd';
	public once = false;

	async execute(queue: Queue<TextBasedChannel>, track: Track): Promise<void> {
		if (!queue.metadata) return;
		const channel = queue.metadata;

		const embedMessage = new EmbedBuilder()
			.setColor(Colors.Blue)
			.setTitle('🐱 | Add Track')
			.setDescription(`Track ${bold(track.title)} queued!`);

		channel.send({ embeds: [embedMessage] });
	}
}

export default new TrackAdd();
