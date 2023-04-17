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
import { QueryType, Player, GuildNodeCreateOptions } from 'discord-player';

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

		const player = Player.singleton(client);
		const { guild, channel: textChannel, member } = interaction;
		const { channel: voiceChannel } = member.voice;
		const query = interaction.options.getString('query');
		if (!voiceChannel || !query) {
			return super.handle(interaction, client);
		}

		const queue =
			player.nodes.get(guild.id) ??
			player.nodes.create(guild, this.createPlayerOptions(textChannel));

		if (!queue.connection) {
			if (!voiceChannel.joinable) {
				player.nodes.delete(guild.id);
				await interaction.followUp({
					content: `I can't join the voice channel ${bold(voiceChannel.name)}`,
				});
				return;
			}
			const connectionSuccess = await queue.connect(voiceChannel).catch(() => null);
			if (!connectionSuccess) {
				await interaction.followUp({ content: 'Could not join your voice channel!' });
				return;
			}
		}

		await interaction.followUp({ embeds: this.buildLoadingMessage() });

		const searchResult = await player.search(query, {
			requestedBy: member,
			searchEngine: QueryType.AUTO,
		});

		if (searchResult.playlist) {
			queue.addTrack(searchResult.tracks);
		} else {
			queue.addTrack(searchResult.tracks[0]);
		}

		if (!queue.node.isPlaying()) {
			await queue.node.play()
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
	): GuildNodeCreateOptions<TextBasedChannel> {
		return {
			metadata: textChannel,
			leaveOnEmpty: true,
			skipOnNoStream: true,
			disableHistory: true,
		};
	}
}
