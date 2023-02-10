import {
	QueryType,
	type PlayerSearchResult,
	type Player,
	type PlayerOptions,
} from 'discord-player';
import {
	bold,
	Colors,
	EmbedBuilder,
	type Guild,
	type User,
	type VoiceBasedChannel,
	type InteractionReplyOptions,
	type TextBasedChannel,
} from 'discord.js';

import { left, right, type Either } from '@utils/flow';
import { PlayerInteractionUtils } from '@utils/player-interaction';
import { Command, type CacheType, type ChatInputCommandInteraction } from '@utils/command';
import { type DiscordClient } from '@utils/discord-client';

type InteractionProperties = {
	user: User;
	guild: Guild;
	query: string;
	textChannel: TextBasedChannel;
	voiceChannel: VoiceBasedChannel;
};

class Play extends Command {
	constructor() {
		super();
		this.setName('play')
			.setDescription('Play a song in your voice channel')
			.addStringOption(option =>
				option.setName('query').setDescription('The song you want to play').setRequired(true)
			);
	}

	async execute<Cached extends CacheType = CacheType>(
		interaction: ChatInputCommandInteraction<Cached>,
		client: DiscordClient
	): Promise<void> {
		if (!interaction.isRepliable() || !client.player) return;

		const interactionProperties = this.getInteractionProperties(interaction);
		if (interactionProperties.isLeft()) return void interaction.reply(interactionProperties.value);

		const { player } = client;
		const { guild, user, query, voiceChannel, textChannel } = interactionProperties.value;

		const playerQueue = player.getQueue(guild);
		if (playerQueue?.connection && playerQueue.connection.channel.id !== voiceChannel.id) {
			return void interaction.reply({
				content: "You're not in the same voice channel as me!",
				ephemeral: true,
			});
		}

		await interaction.deferReply();
		await interaction.followUp({ embeds: [this.buildLoadingMessage()] });

		const searchResult = await this.searchSong(player, query, user);
		if (searchResult.isLeft()) return void interaction.followUp(searchResult.value);

		const queue = player.createQueue(guild, this.createPlayerOptions(textChannel));

		if (!queue.connection) {
			if (voiceChannel.joinable) {
				await queue.connect(voiceChannel).catch(() => {
					player?.deleteQueue(guild.id);
					return interaction.followUp({ content: 'Could not join your voice channel!' });
				});
			} else {
				player?.deleteQueue(guild.id);
				return void interaction.followUp({
					content: `I can't join the voice channel ${bold(voiceChannel.name)}`,
				});
			}
		}

		if (searchResult.value.playlist) {
			queue.addTracks(searchResult.value.tracks);
		} else {
			queue.addTrack(searchResult.value.tracks[0]);
		}

		if (!queue.playing) await queue.play().catch(err => console.error(err));
	}

	private buildLoadingMessage() {
		return new EmbedBuilder()
			.setColor(Colors.Blue)
			.setTitle('🐱 | Loading')
			.setDescription("Wait a moment, I'm loading the track");
	}

	private getInteractionQuery(
		interaction: ChatInputCommandInteraction
	): Either<InteractionReplyOptions, string> {
		const query = interaction.options.getString('query');
		if (query) return right(query);

		return left({ content: 'You need to specify the song you want me to play!', ephemeral: true });
	}

	private getInteractionProperties(
		interaction: ChatInputCommandInteraction
	): Either<InteractionReplyOptions, InteractionProperties> {
		const guild = PlayerInteractionUtils.getGuild(interaction);
		if (guild.isLeft()) return guild;

		const query = this.getInteractionQuery(interaction);
		if (query.isLeft()) return query;

		const voiceChannel = PlayerInteractionUtils.getVoiceChannel(interaction);
		if (voiceChannel.isLeft()) return voiceChannel;

		const textChannel = PlayerInteractionUtils.getTextChannel(interaction);
		if (textChannel.isLeft()) return textChannel;

		return right({
			user: interaction.user,
			guild: guild.value,
			query: query.value,
			voiceChannel: voiceChannel.value,
			textChannel: textChannel.value,
		});
	}

	private async searchSong(
		player: Player,
		song: string,
		user: User
	): Promise<Either<InteractionReplyOptions, PlayerSearchResult>> {
		const result = await player
			.search(song, { requestedBy: user, searchEngine: QueryType.AUTO })
			.catch(() => {});

		if (!result || !result.tracks.length) return left({ content: '😿 | No results were found!' });
		return right(result);
	}

	private createPlayerOptions(
		textChannel: TextBasedChannel
	): PlayerOptions & { metadata: TextBasedChannel } {
		return {
			ytdlOptions: {
				quality: 'highest',
				filter: 'audioonly',
				highWaterMark: 10_000_000,
				dlChunkSize: 256,
			},
			metadata: textChannel,
		};
	}
}

export default new Play();
