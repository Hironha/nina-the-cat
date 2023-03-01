import { type Track } from 'discord-player';
import {
	bold,
	Colors,
	EmbedBuilder,
	type CacheType,
	type APIEmbedField,
	type ChatInputCommandInteraction,
} from 'discord.js';

import { intoChunk } from '@utils/chunk';
import { type DiscordClient } from '@utils/discord-client';
import { MessageHandler, type MessageHandlerOptions } from '@utils/message-handler';

type Options = {};

export class SkipTrackHandler extends MessageHandler {
	constructor(options?: MessageHandlerOptions<Options>) {
		super(options?.method);
	}

	async handle(
		interaction: ChatInputCommandInteraction<CacheType>,
		client: DiscordClient<boolean>
	): Promise<void> {
		if (!interaction.isRepliable() || !client.player || !interaction.guild) {
			return super.handle(interaction, client);
		}

		const queue = client.player.getQueue(interaction.guild.id);
		if (!queue || !queue.playing) return super.handle(interaction, client);

		const skipIndex = this.getSkipAmount(interaction) - 1;
		if (skipIndex === 0) {
			const currentTrack = queue.current;
			if (!queue.skip()) {
				return super.reply(interaction, { content: 'I failed to skip the current song, sorry' });
			}
			return super.reply(interaction, { embeds: this.buildEmbedMessage([currentTrack]) });
		}

		const skipTo = skipIndex >= queue.tracks.length - 1 ? queue.tracks.length - 1 : skipIndex;
		const skippedTracks = [queue.current].concat(queue.tracks.slice(0, skipTo));
		queue.skipTo(skipTo);
		await super.reply(interaction, { embeds: this.buildEmbedMessage(skippedTracks) });
	}

	private getSkipAmount(interaction: ChatInputCommandInteraction): number {
		const amount = interaction.options.getInteger('amount');
		if (amount === null || amount < 1 || !Number.isInteger(amount)) return 1;
		return amount;
	}

	private buildEmbedMessage(skippedTracks: Track[]) {
		const trackFields: APIEmbedField[] = skippedTracks.map((track, index) => ({
			name: `${index + 1}.`,
			value: bold(track.title),
			inline: false,
		}));

		const embedMessages = intoChunk(trackFields, 20).map((chunk, index) => {
			let embed = new EmbedBuilder().setColor(Colors.Blue).setFields(chunk);
			if (index !== 0) return embed;
			return embed.setTitle('🐱 | Skipped Songs');
		});

		return embedMessages;
	}
}
