import { type Track } from 'discord-player';
import {
	type ChatInputCommandInteraction,
	type CacheType,
	type APIEmbedField,
	EmbedBuilder,
	bold,
	Colors,
} from 'discord.js';

import { DiscordClient } from '@utils/discord-client';
import { MessageHandler, type MessageHandlerOptions } from '@utils/message-handler';

type Options = {};

export class NowPlayingHandler extends MessageHandler {
	constructor(options?: MessageHandlerOptions<Options>) {
		super(options?.method);
	}

	async handle(
		interaction: ChatInputCommandInteraction<CacheType>,
		client: DiscordClient<boolean>
	): Promise<void> {
		if (interaction.isRepliable() && interaction.guild && client.player) {
			const queue = client.player.getQueue(interaction.guild.id);
			if (queue?.playing) {
				return await super.reply(interaction, { embeds: this.buildEmbedMessage(queue.current) });
			}
		}

		super.handle(interaction, client);
	}

	private buildEmbedMessage(track: Track): EmbedBuilder[] {
		const duration: APIEmbedField = {
			name: 'Duration',
			value: `00:00 - ${track.duration.padStart(5, '0')}`,
			inline: false,
		};

		const requestedBy: APIEmbedField = {
			name: 'Requested By',
			value: track.requestedBy.username,
			inline: false,
		};

		const message = new EmbedBuilder()
			.setColor(Colors.Blue)
			.setTitle('🐱 | Now Playing')
			.setDescription(
				`I'm currently playing the song ${bold(track.title)} by ${bold(track.author)}`
			)
			.addFields([duration, requestedBy]);

		return [message];
	}
}
