import { PlayerSearchResult, QueryType, type Queue, type Player } from 'discord-player';
import {
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
	}

	async execute<Cached extends CacheType = CacheType>(
		interaction: ChatInputCommandInteraction<Cached>,
		client: DiscordClient
	): Promise<void> {
		try {
			if (!interaction.isRepliable() || !client.player) return;

			const interactionProperties = this.getInteractionProperties(interaction);
			if (interactionProperties.isLeft()) {
				return void interaction.reply(interactionProperties.value);
			}

			const { player } = client;
			const { guild, user, query, voiceChannel, textChannel } = interactionProperties.value;

			await interaction.deferReply();

			const searchResult = await this.searchSong(player, query, user);
			if (searchResult.isLeft()) {
				return void interaction.followUp(searchResult.value);
			}

			const queue = this.queueSong(player, guild, textChannel);
			if (queue.isLeft()) {
				return void interaction.followUp(queue.value);
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
				content: 'There was an error trying to execute that command: ' + (err as Error).message,
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

	private getInteractionQuery(
		interaction: ChatInputCommandInteraction
	): Either<InteractionReplyOptions, string> {
		const query = interaction.options.getString('query');
		if (query) return right(query);

		return left({ content: 'You need to inform me the song!', ephemeral: true });
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

		if (!result || !result.tracks.length) {
			return left({ content: 'No results were found!' });
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
