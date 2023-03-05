import {
	bold,
	Colors,
	EmbedBuilder,
	type Guild,
	type CacheType,
	type GuildMember,
	type TextBasedChannel,
	type ChatInputCommandInteraction,
} from 'discord.js';
import { QueryType, type PlayerOptions } from 'discord-player';

import { isMember } from '@utils/interaction-guards';
import { DiscordClient } from '@utils/discord-client';
import { MessageHandler, type MessageHandlerOptions } from '@utils/message-handler';

type Options = {};

interface ValidInteraction extends ChatInputCommandInteraction<CacheType> {
	guild: Guild;
	channel: TextBasedChannel;
	member: GuildMember;
}

export class PlayTrackHandler extends MessageHandler {
	constructor(options?: MessageHandlerOptions<Options>) {
		super(options?.method);
	}

	async handle(
		interaction: ChatInputCommandInteraction<CacheType>,
		client: DiscordClient<boolean>
	): Promise<void> {
		if (!this.isValidInteraction(interaction)) {
			return super.handle(interaction, client);
		}

		const { player } = client;
		const { guild, channel: textChannel, member } = interaction;
		const { channel: voiceChannel } = member.voice;
		const query = interaction.options.getString('query');
		if (!voiceChannel || !player || !query) {
			return super.handle(interaction, client);
		}

		const curQueue = player.getQueue(guild.id);
		const queue = curQueue ?? player.createQueue(guild, this.createPlayerOptions(textChannel));

		if (!queue.connection) {
			if (!voiceChannel.joinable) {
				player.deleteQueue(guild.id);
				return void interaction.followUp({
					content: `I can't join the voice channel ${bold(voiceChannel.name)}`,
				});
			}

			const connectionSuccess = await queue
				.connect(voiceChannel)
				.then(() => true)
				.catch(() => false);
			if (!connectionSuccess) {
				return void interaction.followUp({ content: 'Could not join your voice channel!' });
			}
		}

		await interaction.followUp({ embeds: this.buildLoadingMessage() });

		const searchResult = await player.search(query, {
			requestedBy: member,
			searchEngine: QueryType.AUTO,
		});

		if (searchResult.playlist) queue.addTracks(searchResult.tracks);
		else queue.addTrack(searchResult.tracks[0]);

		if (!queue.playing) {
			await queue.play().catch(console.error);
		}
	}

	private isValidInteraction(
		interaction: ChatInputCommandInteraction<CacheType>
	): interaction is ValidInteraction {
		const isRepliable = interaction.isRepliable();
		const hasGuild = 'guild' in interaction;
		const hasTextChannel = 'channel' in interaction;

		return isMember(interaction.member) && isRepliable && hasGuild && hasTextChannel;
	}

	private buildLoadingMessage(): EmbedBuilder[] {
		const message = new EmbedBuilder()
			.setColor(Colors.Blue)
			.setTitle('🐱 | Loading')
			.setDescription("Wait a moment, I'm loading the track");

		return [message];
	}

	private createPlayerOptions(
		textChannel: TextBasedChannel
	): PlayerOptions & { metadata: TextBasedChannel } {
		return {
			ytdlOptions: {
				quality: 'highestaudio',
				filter: 'audioonly',
				highWaterMark: 2 ** 16,
				dlChunkSize: 0,
			},
			leaveOnEmpty: true,
			metadata: textChannel,
		};
	}
}
