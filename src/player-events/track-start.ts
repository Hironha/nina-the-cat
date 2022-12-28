import { bold, Colors, EmbedBuilder, type TextBasedChannel } from 'discord.js';
import { type PlayerEvents, type Queue, type Track } from 'discord-player';

import { type PlayerEvent } from '@utils/player-event';

class TrackStart implements PlayerEvent {
	public once = false;
	public name: keyof PlayerEvents = 'trackStart';

	async execute(queue: Queue<TextBasedChannel>, track: Track): Promise<void> {
		if (!queue.metadata) return;
		const channel = queue.metadata;

		const message = new EmbedBuilder()
			.setColor(Colors.Blue)
			.setTitle('🐱 | Playing Now')
			.setDescription(
				`▶ | Started playing ${bold(track.title)} in ${bold(queue.connection.channel.name)}!`
			);
		channel.send({ embeds: [message] });
	}
}

export default new TrackStart();
