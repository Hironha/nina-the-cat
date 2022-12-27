import { Colors, EmbedBuilder, type TextBasedChannel } from 'discord.js';
import { type PlayerEvents, type Queue } from 'discord-player';
import { type PlayerEvent } from '@utils/player-event';

class QueueEnd implements PlayerEvent {
	public once = false;
	public name: keyof PlayerEvents = 'queueEnd';

	async execute(queue: Queue<TextBasedChannel>): Promise<void> {
		if (!queue.metadata) return;
		const channel = queue.metadata;

		const embedMessage = new EmbedBuilder()
			.setColor(Colors.Blue)
			.setTitle('😽 | Finished')
			.setDescription('I finished playing all songs that were in queue!');

		channel.send({ embeds: [embedMessage] });
	}
}

export default new QueueEnd();
