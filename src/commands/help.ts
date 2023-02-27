import { HelpHandler } from '@message-handlers/help-handler';
import { Command, type ChatInputCommandInteraction } from '@utils/command';
import { type DiscordClient } from '@utils/discord-client';

class Help extends Command {
	constructor() {
		super();
		this.setName('help').setDescription('List all available commands');
	}

	async execute(interaction: ChatInputCommandInteraction, client: DiscordClient): Promise<void> {
		if (interaction.isRepliable()) {
			await interaction.deferReply();
		}

		await new HelpHandler({ method: 'edit-reply' }).handle(interaction, client);
	}
}

export default new Help();
