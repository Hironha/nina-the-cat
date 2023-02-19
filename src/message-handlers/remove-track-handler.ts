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

		const removableTrackPosition = this.getRemovableTrackPosition(interaction, queue);

		if (!removableTrackPosition) {
			return super.reply(interaction, { content: '😿 | Invalid song!' });
		}

		const removedTrack = queue.remove(removableTrackPosition);
		return super.reply(interaction, { embeds: this.buildEmbedMessage(removedTrack) });
	}

	private getRemovableTrackPosition(
		interaction: ChatInputCommandInteraction<CacheType>,
		queue: Queue
	): number | null {
		const trackIndex = interaction.options.getInteger('song');
		if (trackIndex === null || !Number.isInteger(trackIndex) || trackIndex < 1) {
			return null;
		}
		const trackPosition = queue.getTrackPosition(trackIndex);
		return trackPosition < 0 ? null : trackPosition;
	}

	private buildEmbedMessage(removedTrack: Track): EmbedBuilder[] {
		const removedTrackMessage = new EmbedBuilder()
			.setColor(Colors.Blue)
			.setTitle('🐱 | Remove')
			.setDescription(`I removed the track ${bold(removedTrack.title)} from the queue`);

		return [removedTrackMessage];
	}
}
