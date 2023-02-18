import { Colors, EmbedBuilder, type TextBasedChannel } from 'discord.js';
import { type PlayerEvents, type Queue } from 'discord-player';
import { type PlayerEvent } from '@utils/player-event';

class VoiceChannelEmpty implements PlayerEvent {
	public once = false;
	public name: keyof PlayerEvents = 'channelEmpty';

	async execute(queue: Queue<TextBasedChannel>): Promise<void> {
		if (!queue.metadata) return;
		const channel = queue.metadata;

		const embedMessage = new EmbedBuilder()
			.setColor(Colors.Blue)
			.setTitle('😿 | Alone')
			.setDescription("Nobody is in the voice channel with me, so I'm leaving...");

		await channel.send({ embeds: [embedMessage] });

		if (!queue.destroyed) {
			queue.destroy(true);
		}
	}
}

export default new VoiceChannelEmpty();
