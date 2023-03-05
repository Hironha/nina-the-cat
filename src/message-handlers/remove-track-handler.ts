import {
	bold,
	Colors,
	EmbedBuilder,
	type CacheType,
	type ChatInputCommandInteraction,
} from 'discord.js';
import { type Queue, type Track } from 'discord-player';

import { type DiscordClient } from '@utils/discord-client';
import { MessageHandler, type MessageHandlerOptions } from '@utils/message-handler';

type Options = {};

export class RemoveTrackHandler extends MessageHandler {
	constructor(options?: MessageHandlerOptions<Options>) {
		super(options?.method);
	}

	async handle(
		interaction: ChatInputCommandInteraction<CacheType>,
		client: DiscordClient<boolean>
	): Promise<void> {
		if (!interaction.isRepliable() || !interaction.guild || !client.player) {
			return super.handle(interaction, client);
		}

		const queue = client.player.getQueue(interaction.guild.id);
		if (!queue) return super.handle(interaction, client);

		const trackIndicator = interaction.options.getInteger('song');
		const trackIndex = trackIndicator ? trackIndicator - 1 : null;
		if (trackIndex === null || !this.validateTrackIndex(trackIndex)) {
			return super.reply(interaction, { content: '😿 | Invalid song!' });
		}

		const removedTrack = queue.remove(trackIndex);
		return super.reply(interaction, { embeds: this.buildEmbedMessage(removedTrack) });
	}

	private validateTrackIndex(index: number): boolean {
		return Number.isInteger(index) && index > 0;
	}

	private buildEmbedMessage(removedTrack: Track): EmbedBuilder[] {
		const removedTrackMessage = new EmbedBuilder()
			.setColor(Colors.Blue)
			.setTitle('🐱 | Remove')
			.setDescription(`I removed the track ${bold(removedTrack.title)} from the queue`);

		return [removedTrackMessage];
	}
}
