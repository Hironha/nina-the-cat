import { Colors, InteractionReplyOptions } from 'discord.js';
import { EmbedBuilder } from '@discordjs/builders';

import { left, right, type Either } from '@utils/flow';
import { type DiscordClient } from '@utils/discord-client';
import { PlayerInteractionUtils } from '@utils/player-interaction';
import { Command, type ChatInputCommandInteraction } from '@utils/command';

class Clear extends Command {
	constructor() {
		super();
		this.setName('clear').setDescription('Clear all songs in queue');
	}

	async execute(interaction: ChatInputCommandInteraction, client: DiscordClient) {
		if (!interaction.isRepliable() || !client.player) return;

		const interactionValidation = this.validateInteraction(interaction);
		if (interactionValidation.isLeft()) return void interaction.reply(interactionValidation.value);

		const guild = PlayerInteractionUtils.getGuild(interaction);
		if (guild.isLeft()) return void interaction.reply(guild.value);

		const queue = PlayerInteractionUtils.getPlayerQueue(client.player, guild.value.id);
		if (queue.isLeft()) return void interaction.reply(queue.value);

		queue.value.clear();

		interaction.reply({ embeds: [this.buildClearEmbedMessage()] });
	}

	private buildClearEmbedMessage() {
		return new EmbedBuilder()
			.setColor(Colors.Blue)
			.setTitle('🐱 | Clear')
			.setDescription('Queue is now empty');
	}

	private validateInteraction(
		interaction: ChatInputCommandInteraction
	): Either<InteractionReplyOptions, true> {
		if (!PlayerInteractionUtils.isFromGuildMember(interaction)) {
			return left({
				content: "You're not allowed to use this command",
				ephemeral: true,
			});
		}

		if (!PlayerInteractionUtils.isFromListener(interaction)) {
			return left({
				content: "You're not in the same voice channel as me",
				ephemeral: true,
			});
		}

		return right<true>(true);
	}
}

export default new Clear();
