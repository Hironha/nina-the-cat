import { PlayerSearchResult, QueryType, type Queue, type Player } from 'discord-player';
import {
	GuildMember,
	type Guild,
	type User,
	type VoiceBasedChannel,
	type InteractionReplyOptions,
	type TextBasedChannel,
} from 'discord.js';

import { left, right, type Either } from '@utils/flow';
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
			const { guild, user, query, voiceChannel, textChannel } = interactionProperties.value;

			await interaction.deferReply();

			const searchResult = await this.searchSong(player, query, user);
			if (searchResult.isLeft()) {
				interaction.followUp(searchResult.value);
				return;
			}

			const queue = this.queueSong(player, guild, textChannel);
			if (queue.isLeft()) {
				interaction.followUp(queue.value);
				return;
			}

			if (!queue.value.connection) {
				await queue.value.connect(voiceChannel).catch(() => {
					player?.deleteQueue(guild.id);
					interaction.followUp({ content: 'Could not join your voice channel!' });
				});
			}

			await interaction.followUp({
				content: `⏱ | Loading your ${searchResult.value.playlist ? 'playlist' : 'track'}...`,
			});

			queue.value.addTracks(searchResult.value.tracks);

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

		const { channel } = member.value.voice;
		if (channel) return right(channel);

		const errMsg = 'You are not in a voice channel!';
		return left({ content: errMsg, ephemeral: true });
	}

	private getInteractionTextChannel(
		interaction: ChatInputCommandInteraction
	): Either<InteractionReplyOptions, TextBasedChannel> {
		if (interaction.channel) return right(interaction.channel);

		const errMsg = 'Text channel not defined!';
		return left({ content: errMsg, ephemeral: true });
	}

	private getInteractionProperties(
		interaction: ChatInputCommandInteraction
	): Either<InteractionReplyOptions, InteractionProperties> {
		const guild = this.getInteractionGuild(interaction);
		if (guild.isLeft()) return guild;

		const query = this.getInteractionQuery(interaction);
		if (query.isLeft()) return query;

		const voiceChannel = this.getInteractionVoiceChannel(interaction);
		if (voiceChannel.isLeft()) return voiceChannel;

		const textChannel = this.getInteractionTextChannel(interaction);
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

		if (!result || !result.tracks.length) {
			const errMsg = 'No results were found!';
			return left({ content: errMsg });
		}

		return right(result);
	}

	private queueSong(
		player: Player,
		guild: Guild,
		textChannel: TextBasedChannel
	): Either<InteractionReplyOptions, Queue<TextBasedChannel>> {
		try {
			const queue = player.createQueue(guild, {
				ytdlOptions: {
					quality: 'highest',
					filter: 'audioonly',
					highWaterMark: 1 << 30,
					dlChunkSize: 0,
				},
				metadata: textChannel,
			});

			return right(queue);
		} catch (err) {
			console.error(err);
			return left({ content: 'Something went wrong when I tried to create the queue!' });
		}
	}
}

export default new Play().build();
