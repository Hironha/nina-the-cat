import { Colors, EmbedBuilder, type TextBasedChannel } from 'discord.js';
import { type PlayerEvent } from '@utils/player-event';
import { type PlayerEvents, type Queue } from 'discord-player';

class BotDisconnect implements PlayerEvent {
	public once = false;
	public name: keyof PlayerEvents = 'botDisconnect';

	async execute(queue: Queue<TextBasedChannel>): Promise<void> {
		if (!queue.metadata) return;
		const channel = queue.metadata;

		queue.destroy();

		const embedMessage = new EmbedBuilder()
			.setColor(Colors.Blue)
			.setTitle('😿 | Disconnect')
			.setDescription('I was disconnected from the voice channel, clearing queue!');

		channel.send({ embeds: [embedMessage] });
	}
}

export default new BotDisconnect();
