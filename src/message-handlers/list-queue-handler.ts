import {
	bold,
	Colors,
	EmbedBuilder,
	type ChatInputCommandInteraction,
	type CacheType,
	type APIEmbedField,
} from 'discord.js';
import { Player, type GuildQueue } from 'discord-player';

import { intoChunk } from '@utils/chunk';
import { type DiscordClient } from '@utils/discord-client';
import { MessageHandler, type MessageHandlerOptions } from '@utils/message-handler';

type Options = {};

export class ListQueueHandler extends MessageHandler {
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

		if (!queue) {
			return super.handle(interaction, client);
		}

		return await super.reply(interaction, { embeds: this.buildEmbedMessage(queue) });
	}

	private buildEmbedMessage(queue: GuildQueue): EmbedBuilder[] {
		const trackFields: APIEmbedField[] = queue.tracks.map((track, index) => ({
			name: `${index + 1}.`,
			value: bold(track.title),
			inline: false,
		}));

		if (queue.node.isPlaying() && queue.currentTrack) {
			trackFields.unshift({
				name: '🎶 Current Song',
				value: bold(queue.currentTrack.title),
				inline: false,
			});
		}

		const embedMessages = intoChunk(trackFields, 20).map((chunk, index) => {
			const embed = new EmbedBuilder().setColor(Colors.Blue).setFields(chunk);
			if (index !== 0) return embed;
			return embed.setTitle('🐱 | Songs in Queue');
		});

		return embedMessages;
	}
}
