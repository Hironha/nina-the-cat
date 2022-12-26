import { Events, type Interaction, type ClientEvents } from 'discord.js';

import { type Event } from '@utils/event';
import { type DiscordClient } from '@utils/discord-client';

class InteractionCreate implements Event {
	public once = false;
	public name: keyof ClientEvents = Events.InteractionCreate;

	async execute(interaction: Interaction, client: DiscordClient): Promise<void> {
		if (!interaction.isChatInputCommand()) return;

		const command = client.commands.get(interaction.commandName);
		try {
			if (command) {
				command.execute(interaction, client);
			} else {
				console.log(`Command ${interaction.commandName} not found`);
			}
		} catch (err) {
			console.error(err);
		}
	}
}

export default new InteractionCreate();
