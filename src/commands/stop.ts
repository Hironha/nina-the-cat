import { Colors, EmbedBuilder, type InteractionReplyOptions } from 'discord.js';

import { left, right, type Either } from '@utils/flow';
import { type DiscordClient } from '@utils/discord-client';
import { PlayerInteractionUtils } from '@utils/player-interaction';
import { Command, type ChatInputCommandInteraction } from '@utils/command';

class Stop extends Command {
	constructor() {
		super();
		this.setName('stop')
			.setDescription("Stop playing the song and clears the song's queue")
			.setDevOnly();
	}

	async execute(interaction: ChatInputCommandInteraction, client: DiscordClient): Promise<void> {
		if (!interaction.isRepliable() || !client.player) return;

		const validation = this.validateInteraction(interaction);
		if (validation.isLeft()) return void interaction.reply(validation.value);

		const guild = PlayerInteractionUtils.getGuild(interaction);
		if (guild.isLeft()) return void interaction.reply(guild.value);

		const queue = PlayerInteractionUtils.getPlayerQueue(client.player, guild.value.id);
		if (queue.isLeft()) return void interaction.reply(queue.value);

		if (!queue.value.playing) {
			return void interaction.reply({ content: "I'm not playing songs right now!" });
		}

		queue.value.clear();
		queue.value.stop();

		interaction.reply({ embeds: [this.buildStopMessage()] });
	}

	private validateInteraction(
		interaction: ChatInputCommandInteraction
	): Either<InteractionReplyOptions, null> {
		if (!PlayerInteractionUtils.isFromListener(interaction)) {
			return left({ content: "You're not in the same voice channel as me, dummy" });
		}

		return right(null);
	}

	private buildStopMessage() {
		return new EmbedBuilder()
			.setColor(Colors.Blue)
			.setTitle('🐱 | Stop')
			.setDescription('I stopped playing the song and cleared the queue');
	}
}

export default new Stop();
