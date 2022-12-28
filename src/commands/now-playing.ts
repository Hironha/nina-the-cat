import { EmbedBuilder, Colors, bold } from 'discord.js';
import { type Track } from 'discord-player';
import { type DiscordClient } from '@utils/discord-client';

import { Command, type ChatInputCommandInteraction } from '@utils/command';
import { PlayerInteractionUtils } from '@utils/player-interaction';

class NowPlaying extends Command {
	constructor() {
		super();
		this.setName('nowplaying').setDescription('Show information about the playing song');
	}

	async execute(interaction: ChatInputCommandInteraction, client: DiscordClient) {
		if (!interaction.isRepliable() || !client.player) return;

		const guild = PlayerInteractionUtils.getGuild(interaction);
		if (guild.isLeft()) return void interaction.reply(guild.value);

		const queue = PlayerInteractionUtils.getPlayerQueue(client.player, guild.value.id);
		if (queue.isLeft()) return void interaction.reply(queue.value);

		const currentTrack = queue.value.playing ? queue.value.current : undefined;
		if (!currentTrack) return void interaction.reply({ content: "😿 | I'm not playing any song" });

		interaction.reply({ embeds: [this.buildCurrentTrackMessage(currentTrack)] });
	}

	private buildCurrentTrackMessage(track: Track) {
		return new EmbedBuilder()
			.setColor(Colors.Blue)
			.setTitle('🐱 | Now Playing')
			.setDescription(
				`I'm currently playing the song ${bold(track.title)} by ${bold(track.author)}`
			);
	}
}

export default new NowPlaying();
