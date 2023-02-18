import {
	bold,
	Colors,
	EmbedBuilder,
	type ChatInputCommandInteraction,
	type CacheType,
	type APIEmbedField,
} from 'discord.js';
import { type Queue } from 'discord-player';

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
		if (interaction.isRepliable() && interaction.guild && client.player) {
			const queue = client.player.getQueue(interaction.guild.id);
			if (queue) {
				return await super.reply(interaction, { embeds: this.buildEmbedMessage(queue) });
			}
		}

		await super.handle(interaction, client);
	}

	private buildEmbedMessage(queue: Queue): EmbedBuilder[] {
		const trackFields: APIEmbedField[] = queue.tracks.map((track, index) => ({
			name: `${index + 1}.`,
			value: bold(track.title),
			inline: false,
		}));

		if (queue.playing && queue.current) {
			trackFields.unshift({
				name: '🎶 Current Song',
				value: bold(queue.current.title),
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
