import { PlayerSearchResult, QueryType, type Queue, type Player } from 'discord-player';
import {
	GuildMember,
	type Guild,
	type User,
	type VoiceBasedChannel,
	type InteractionReplyOptions,
} from 'discord.js';

import { left, right, type Either } from '@utils/flow';
import { Command, type CacheType, type ChatInputCommandInteraction } from '@utils/command';
import { type DiscordClient } from '@utils/discord-client';

type InteractionProperties = {
	user: User;
	guild: Guild;
	query: string;
	channel: VoiceBasedChannel;
};

class Play extends Command {
	constructor() {
		super();
	}

	async execute<Cached extends CacheType = CacheType>(
		interaction: ChatInputCommandInteraction<Cached>,
		client: DiscordClient
	) {
		try {
			if (!interaction.isRepliable() || !client.player) return;

			const interactionProperties = this.getInteractionProperties(interaction);
			if (interactionProperties.isLeft()) {
				interaction.reply(interactionProperties.value);
				return;
			}

			const { player } = client;
			const { guild, user, query, channel } = interactionProperties.value;

			await interaction.deferReply();

			const searchResult = await this.searchSong(player, query, user);
			if (searchResult.isLeft()) {
				interaction.followUp(searchResult.value);
				return;
			}

			const queue = await this.queueSong(player, guild, channel);
			if (queue.isLeft()) {
				interaction.followUp(queue.value);
				return;
			}

			if (!queue.value.connection) {
				await queue.value.connect(channel).catch(() => {
					player?.deleteQueue(guild.id);
					interaction.followUp({ content: 'Could not join your voice channel!' });
				});
			}

			await interaction.followUp({
				content: `⏱ | Loading your ${searchResult.value.playlist ? 'playlist' : 'track'}...`,
			});

			if (searchResult.value.playlist) {
				queue.value.addTracks(searchResult.value.tracks);
			} else {
				queue.value.addTrack(searchResult.value.tracks[0]);
			}

			if (!queue.value.playing) {
				await queue.value.play().catch(err => console.error(err));
			}
		} catch (err) {
			console.error(err);
			interaction.followUp({
				content: 'There was an err trying to execute that command: ' + (err as Error).message,
			});
		}
	}

	build() {
		this.setName('play')
			.setDescription('Play a song in your voice channel')
			.addStringOption(option =>
				option.setName('query').setDescription('The song you want to play').setRequired(true)
			);
		return this;
	}

	private getInteractionMember(
		interaction: ChatInputCommandInteraction
	): Either<InteractionReplyOptions, GuildMember> {
		if (interaction.member instanceof GuildMember) return right(interaction.member);

		const errMsg = 'User is not a guild member!';
		return left({ content: errMsg, ephemeral: true });
	}

	private getInteractionGuild(
		interaction: ChatInputCommandInteraction
	): Either<InteractionReplyOptions, Guild> {
		if (interaction.guild) return right(interaction.guild);

		const errMsg = 'You should be in a guild to use my services!';
		return left({ content: errMsg, ephemeral: true });
	}

	private getInteractionQuery(
		interaction: ChatInputCommandInteraction
	): Either<InteractionReplyOptions, string> {
		const query = interaction.options.getString('query');
		if (query) return right(query);

		const errMsg = 'You need to inform me the song!';
		return left({ content: errMsg, ephemeral: true });
	}

	private getInteractionVoiceChannel(
		interaction: ChatInputCommandInteraction
	): Either<InteractionReplyOptions, VoiceBasedChannel> {
		const member = this.getInteractionMember(interaction);
		if (member.isLeft()) return member;

		const channel = member.value.voice.channel;
		if (channel) return right(channel);

		const errMsg = 'You are not in a voice channel!';
		return left({ content: errMsg, ephemeral: true });
	}

	private getInteractionProperties(
		interaction: ChatInputCommandInteraction
	): Either<InteractionReplyOptions, InteractionProperties> {
		const guild = this.getInteractionGuild(interaction);
		if (guild.isLeft()) return guild;

		const query = this.getInteractionQuery(interaction);
		if (query.isLeft()) return query;

		const channel = this.getInteractionVoiceChannel(interaction);
		if (channel.isLeft()) return channel;

		return right({
			user: interaction.user,
			guild: guild.value,
			query: query.value,
			channel: channel.value,
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

		if (!result || !result.tracks.length) {
			const errMsg = 'No results were found!';
			return left({ content: errMsg });
		}

		return right(result);
	}

	private async queueSong(
		player: Player,
		guild: Guild,
		channel: VoiceBasedChannel
	): Promise<Either<InteractionReplyOptions, Queue<VoiceBasedChannel>>> {
		try {
			const queue = await player.createQueue(guild, {
				ytdlOptions: {
					quality: 'highest',
					filter: 'audioonly',
					highWaterMark: 1 << 30,
					dlChunkSize: 0,
				},
				metadata: channel,
			});

			return right(queue);
		} catch (err) {
			console.error(err);
			return left({ content: 'Something went wrong when I tried to create the queue!' });
		}
	}
}

export default new Play().build();
