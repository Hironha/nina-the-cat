import {
	bold,
	Colors,
	EmbedBuilder,
	type Guild,
	type GuildMember,
	type InteractionReplyOptions,
	type ChatInputCommandInteraction,
	type APIEmbedField,
} from 'discord.js';
import { type Track, type Player, Queue } from 'discord-player';
import { type DiscordClient } from '@utils/discord-client';

import { Command } from '@utils/command';
import { intoChunk } from '@utils/chunk';
import { left, right, type Either } from '@utils/flow';
import { PlayerInteractionUtils } from '@utils/player-interaction';

type InteractionProperties = {
	member: GuildMember;
	guild: Guild;
	amount: number;
};

class Skip extends Command {
	constructor() {
		super();
		this.setName('skip')
			.setDescription('Skip current song!')
			.addIntegerOption(option =>
				option.setName('amount').setDescription('Amount of songs to skip').setRequired(false)
			);
	}

	async execute(interaction: ChatInputCommandInteraction, client: DiscordClient): Promise<void> {
		if (!interaction.isRepliable() || !client.player) return;

		const interactionProperties = this.getInteractionProperties(interaction);
		if (interactionProperties.isLeft()) {
			return void interaction.reply(interactionProperties.value);
		}

		const { player } = client;
		const { guild, member, amount: skipAmount } = interactionProperties.value;

		const isGuildMember = this.isGuildMember(member, guild);
		if (isGuildMember.isLeft()) {
			return void interaction.reply(isGuildMember.value);
		}

		await interaction.deferReply();

		const queue = this.getQueue(player, guild.id);
		if (queue.isLeft()) {
			return void interaction.reply(queue.value);
		}

		const skippedTracks = this.skipTrack(queue.value, skipAmount);
		if (skippedTracks.isLeft()) {
			return void interaction.reply(skippedTracks.value);
		}

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

	private skipTrack(queue: Queue, amount: number): Either<InteractionReplyOptions, Track[]> {
		if (!queue.playing) return left({ content: '😿 | No music is being played!' });

		const trackIndex = amount - 1;
		const lastTrackIndex = queue.tracks.length - 1;
		const skipTo = trackIndex >= lastTrackIndex ? lastTrackIndex : trackIndex;
		const skippedTracks = [queue.current].concat(queue.tracks.slice(0, skipTo));

		queue.skipTo(skipTo);

		return right(skippedTracks);
	}

	private getQueue(player: Player, queueId: string): Either<InteractionReplyOptions, Queue> {
		const queue = player.getQueue(queueId);
		if (!queue) return left({ content: '😿 | No music is being played!' });

		return right(queue);
	}

	private isGuildMember(member: GuildMember, guild: Guild): Either<InteractionReplyOptions, null> {
		if (member.guild.id === guild.id) return right(null);

		return left({ content: "You're not a guild member!", ephemeral: true });
	}

	private getSkipAmount(interaction: ChatInputCommandInteraction): number {
		const amount = interaction.options.getInteger('amount');
		return amount ?? 0;
	}

	private getInteractionProperties(
		interaction: ChatInputCommandInteraction
	): Either<InteractionReplyOptions, InteractionProperties> {
		const member = PlayerInteractionUtils.getMember(interaction);
		if (member.isLeft()) return member;

		const guild = PlayerInteractionUtils.getGuild(interaction);
		if (guild.isLeft()) return guild;

		const amount = this.getSkipAmount(interaction);

		return right({ member: member.value, guild: guild.value, amount });
	}
}

export default new Skip();
