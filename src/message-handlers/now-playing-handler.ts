import { Player, type Track } from 'discord-player';
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
		if (interaction.isRepliable() && interaction.guild) {
			const player = Player.singleton(client);
			const queue = player.nodes.get(interaction.guild.id);

			if (queue?.node.isPlaying() && queue.currentTrack) {
				return await super.reply(interaction, {
					embeds: this.buildEmbedMessage(queue.currentTrack),
				});
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

		const message = new EmbedBuilder()
			.setColor(Colors.Blue)
			.setTitle('🐱 | Now Playing')
			.setDescription(
				`I'm currently playing the song ${bold(track.title)} by ${bold(track.author)}`
			)
			.addFields(duration);

		if (track.requestedBy) {
			const requestedBy: APIEmbedField = {
				name: 'Requested By',
				value: track.requestedBy.username,
				inline: false,
			};
			message.addFields(requestedBy);
		}

		return [message];
	}
}
