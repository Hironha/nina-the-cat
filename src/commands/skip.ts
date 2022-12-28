import {
	bold,
	Colors,
	EmbedBuilder,
	type InteractionReplyOptions,
	type ChatInputCommandInteraction,
	type APIEmbedField,
} from 'discord.js';
import { type Track, Queue } from 'discord-player';
import { type DiscordClient } from '@utils/discord-client';

import { Command } from '@utils/command';
import { intoChunk } from '@utils/chunk';
import { right, type Either } from '@utils/flow';
import { PlayerInteractionUtils } from '@utils/player-interaction';

class Skip extends Command {
	constructor() {
		super();
		this.setName('skip')
			.setDescription('Skip a certain amount of songs (defaults to skip current song)')
			.addIntegerOption(option =>
				option.setName('amount').setDescription('Amount of songs to skip').setRequired(false)
			);
	}

	async execute(interaction: ChatInputCommandInteraction, client: DiscordClient): Promise<void> {
		if (!interaction.isRepliable() || !client.player) return;

		if (!PlayerInteractionUtils.isFromGuildMember(interaction)) {
			return void interaction.reply({ content: "You're not a guild member!", ephemeral: true });
		}

		const { player } = client;
		const guild = PlayerInteractionUtils.getGuild(interaction);
		if (guild.isLeft()) return void interaction.reply(guild.value);

		const skipAmount = this.getSkipAmount(interaction);

		await interaction.deferReply();

		const queue = PlayerInteractionUtils.getPlayerQueue(player, guild.value.id);
		if (queue.isLeft()) return void interaction.editReply(queue.value);

		if (!queue.value.playing) {
			return void interaction.editReply({ content: '😿 | No music is being played!' });
		}

		const skippedTracks = this.skipTracks(queue.value, skipAmount);
		if (skippedTracks.isLeft()) return void interaction.editReply(skippedTracks.value);

		const message = this.buildSkippedTracksMessage(skippedTracks.value);

		interaction.followUp({ embeds: message }).catch(err => console.error(err));
	}

	private buildSkippedTracksMessage(skippedTracks: Track[]) {
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

	private skipTracks(queue: Queue, amount: number): Either<InteractionReplyOptions, Track[]> {
		if (queue.tracks.length === 0) {
			const currentTrack = queue.current;
			queue.skip();
			return right([currentTrack]);
		}

		const trackIndex = amount - 1;
		const lastTrackIndex = queue.tracks.length - 1;
		const skipTo = trackIndex >= lastTrackIndex ? lastTrackIndex : trackIndex;

		const skippedTracks = [queue.current].concat(queue.tracks.slice(0, skipTo));
		queue.skipTo(skipTo);
		return right(skippedTracks);
	}

	private getSkipAmount(interaction: ChatInputCommandInteraction): number {
		const amount = interaction.options.getInteger('amount');
		if (amount === null || amount < 1 || !Number.isInteger(amount)) return 1;
		return amount;
	}
}

export default new Skip();
