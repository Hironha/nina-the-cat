import { EmbedBuilder, bold, italic } from 'discord.js';
import { Command, type Commands, type ChatInputCommandInteraction } from '@utils/command';
import { type DiscordClient } from '@utils/discord-client';

class Help extends Command {
	constructor() {
		super();
	}

	async execute(interaction: ChatInputCommandInteraction, client: DiscordClient) {
		if (!interaction.isRepliable()) return;

		const embedMessage = this.buildEmbedMessage(client.commands);
		interaction.reply({ embeds: [embedMessage] });
	}

	build() {
		return this.setName('help').setDescription("List all available commands");
	}

	private buildEmbedMessage(commands: Commands) {
		const availableCommands = commands.map(command => ({
			name: italic(bold(`/${command.name}`)),
			value: command.description,
			inline: false,
		}));

		return new EmbedBuilder()
			.setColor('#4c8bf5')
			.setTitle('Available Commands')
			.setDescription('Here are the available commands, nya.')
			.setFields(availableCommands);
	}
}

export default new Help().build();
