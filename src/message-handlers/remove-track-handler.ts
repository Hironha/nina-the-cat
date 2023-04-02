import {
	bold,
	Colors,
	EmbedBuilder,
	type CacheType,
	type ChatInputCommandInteraction,
} from 'discord.js';
import { Player, type Track } from 'discord-player';

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
		if (!interaction.isRepliable() || !interaction.guild) {
			return super.handle(interaction, client);
		}

		const player = Player.singleton(client);
		const queue = player.nodes.get(interaction.guild.id);
		if (!queue) return super.handle(interaction, client);

		const trackIndicator = interaction.options.getInteger('song');
		const trackIndex = trackIndicator ? trackIndicator - 1 : 0;
		const removedTrack = queue.node.remove(trackIndex);

		if (trackIndex === null || !removedTrack) {
			return super.reply(interaction, { content: '😿 | Invalid song!' });
		}

		return super.reply(interaction, { embeds: this.buildEmbedMessage(removedTrack) });
	}

	private buildEmbedMessage(removedTrack: Track): EmbedBuilder[] {
		const removedTrackMessage = new EmbedBuilder()
			.setColor(Colors.Blue)
			.setTitle('🐱 | Remove')
			.setDescription(`I removed the track ${bold(removedTrack.title)} from the queue`);

		return [removedTrackMessage];
	}
}
