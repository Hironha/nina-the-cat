import { Guild, GuildMember, UserResolvable } from 'discord.js';
import { Player, QueryType } from 'discord-player';

import { Command, type CacheType, type ChatInputCommandInteraction } from '@utils/command';
import { type DiscordClient } from '@utils/discord-client';

class Play extends Command {
	constructor() {
		super();
	}

	async execute<Cached extends CacheType = CacheType>(
		interaction: ChatInputCommandInteraction<Cached>,
		client: DiscordClient
	) {
		try {
			if (!interaction.isRepliable() || !client.player || !interaction.guild) return;

			const member = this.getInteractionMember(interaction);

			if (!member?.voice.channel) {
				interaction.reply({ content: 'You are not in a voice channel!', ephemeral: true });
				return;
			}

			await interaction.deferReply();

			const query = interaction.options.getString('query');
			if (!query) {
				interaction.reply({ content: 'You need to inform the song!', ephemeral: true });
				return;
			}
			const searchResult = await this.searchSong(client.player, query, interaction.user);

			if (!searchResult || !searchResult.tracks.length) {
				interaction.followUp({ content: 'No results were found!' });
				return;
			}

			const queue = await this.queueSong(interaction, client.player);
			if (!queue) {
				interaction.followUp({ content: 'Was not possible to queue the requested song!' });
				return;
			}

			try {
				if (!queue.connection) await queue.connect(member.voice.channel);
			} catch {
				if (interaction.guildId) client.player.deleteQueue(interaction.guildId);
				interaction.followUp({ content: 'Could not join your voice channel!' });
			}

			await interaction.followUp({
				content: `⏱ | Loading your ${searchResult.playlist ? 'playlist' : 'track'}...`,
			});

			if (searchResult.playlist) queue.addTracks(searchResult.tracks);
			else queue.addTrack(searchResult.tracks[0]);
			if (!queue.playing) await queue.play();
		} catch (err) {
			console.log(err);
			interaction.followUp({
				content: 'There was an err trying to execute that command: ' + (err as Error).message,
			});
		}
	}

	build() {
		this.setName('play')
			.setDescription('Play a song in your voice channel!')
			.addStringOption(option =>
				option.setName('query').setDescription('The song you want to play').setRequired(true)
			);
		return this;
	}

	private getInteractionMember(interaction: ChatInputCommandInteraction) {
		if (interaction.member instanceof GuildMember) return interaction.member;
		return undefined;
	}

	private async searchSong(player: Player, song: string, user: UserResolvable) {
		return await player
			.search(song, { requestedBy: user, searchEngine: QueryType.AUTO })
			.catch(() => {});
	}

	private async queueSong(interaction: ChatInputCommandInteraction, player: Player) {
		if (!interaction.guild) return undefined;
		return await player.createQueue(interaction.guild, {
			ytdlOptions: {
				quality: 'highest',
				filter: 'audioonly',
				highWaterMark: 1 << 30,
				dlChunkSize: 0,
			},
			metadata: interaction.channel,
		});
	}
}

export default new Play().build();
