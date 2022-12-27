import { Colors } from 'discord.js';
import { EmbedBuilder } from '@discordjs/builders';

import { type DiscordClient } from '@utils/discord-client';
import { PlayerInteractionUtils } from '@utils/player-interaction';
import { Command, type ChatInputCommandInteraction } from '@utils/command';

class Clear extends Command {
	constructor() {
		super();
		this.setName('clear').setDescription(
			'Stop playing the current song and clear all songs in queue'
		);
	}

	async execute(interaction: ChatInputCommandInteraction, client: DiscordClient) {
		if (!interaction.isRepliable() || !client.player) return;

		const guild = PlayerInteractionUtils.getGuild(interaction);
		if (guild.isLeft()) {
			return void interaction.reply(guild.value);
		}

		if (!PlayerInteractionUtils.isFromGuildMember(interaction)) {
			return void interaction.reply({ content: "You're not allowed to use this command" });
		}

		const queue = PlayerInteractionUtils.getPlayerQueue(client.player, guild.value.id);
		if (queue.isLeft()) {
			return void interaction.reply(queue.value);
		}

		queue.value.clear();
		queue.value.skip();

		interaction.reply({ embeds: [this.buildClearEmbedMessage()] });
	}

	private buildClearEmbedMessage() {
		return new EmbedBuilder()
			.setColor(Colors.Blue)
			.setTitle('🐱 | Clear')
			.setDescription('Cleaned current song and songs in queue');
	}
}

export default new Clear();
