import { bold, Colors, EmbedBuilder, type InteractionReplyOptions } from 'discord.js';
import { type Track } from 'discord-player';

import { right, left, type Either } from '@utils/flow';
import { type DiscordClient } from '@utils/discord-client';
import { PlayerInteractionUtils } from '@utils/player-interaction';
import { Command, type ChatInputCommandInteraction } from '@utils/command';

class Remove extends Command {
	constructor() {
		super();
		this.setName('remove')
			.setDescription('Removes the selected song from queue')
			.addIntegerOption(option =>
				option
					.setName('song')
					.setDescription('Inform the index of the selected song in queue')
					.setRequired(true)
			);
	}

	async execute(interaction: ChatInputCommandInteraction, client: DiscordClient) {
		if (!interaction.isRepliable() || !client.player) return;

		const guild = PlayerInteractionUtils.getGuild(interaction);
		if (guild.isLeft()) return void interaction.reply(guild.value);

		if (!PlayerInteractionUtils.isFromGuildMember(interaction)) {
			return void interaction.reply({
				content: "😾 | You're not allowed to remove songs from queue",
				ephemeral: true,
			});
		}

		const trackIndex = this.getTrackIndex(interaction);
		if (trackIndex.isLeft()) return void interaction.reply(trackIndex.value);

		const { player } = client;
		const queue = PlayerInteractionUtils.getPlayerQueue(player, guild.value.id);
		if (queue.isLeft()) return void interaction.reply(queue.value);

		const removedTrack = queue.value.remove(trackIndex.value);
		const removedTrackMessage = this.buildRemoveMessage(removedTrack);

		interaction.reply({ embeds: [removedTrackMessage] });
	}

	private buildRemoveMessage(removedTrack: Track) {
		return new EmbedBuilder()
			.setColor(Colors.Blue)
			.setTitle('😺 | Removed Track')
			.setDescription(`You removed the track ${bold(removedTrack.title)} from the queue`);
	}

	private getTrackIndex(
		interaction: ChatInputCommandInteraction
	): Either<InteractionReplyOptions, number> {
		const trackIndex = interaction.options.getInteger('song');
		if (trackIndex === null || !Number.isInteger(trackIndex) || trackIndex < 1) {
			return left({ content: '😿 | Invalid song!', ephemeral: true });
		}

		return right(trackIndex - 1);
	}
}

export default new Remove();
