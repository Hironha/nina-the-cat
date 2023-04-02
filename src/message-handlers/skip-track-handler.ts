import { Player, type Track } from 'discord-player';
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
		if (!interaction.isRepliable() || !interaction.guild) {
			return super.handle(interaction, client);
		}

		const player = Player.singleton(client);
		const queue = player.nodes.get(interaction.guild.id);

		if (!queue || !queue.node.isPlaying() || !queue.currentTrack) {
			return super.handle(interaction, client);
		}

		const skipIndex = this.getSkipAmount(interaction) - 1;
		if (skipIndex === 0) {
			if (!queue.node.skip()) {
				return super.reply(interaction, { content: 'I failed to skip the current song, sorry' });
			}
			return super.reply(interaction, { embeds: this.buildEmbedMessage([queue.currentTrack]) });
		}

		const skipTo = skipIndex >= queue.tracks.size - 1 ? queue.tracks.size - 1 : skipIndex;

		const skippedTracks = [queue.currentTrack].concat(queue.tracks.map(t => t).slice(0, skipTo));
		queue.node.skipTo(skipTo);
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
