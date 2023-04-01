import { Events, type Interaction, type ClientEvents } from 'discord.js';

import { type Event } from '@utils/event';
import { type DiscordClient } from '@utils/discord-client';

export class InteractionCreate implements Event {
	public once = false;
	public name: keyof ClientEvents = Events.InteractionCreate;

	async execute(interaction: Interaction, client: DiscordClient): Promise<void> {
		if (!interaction.isChatInputCommand()) return;

		const command = client.commands.get(interaction.commandName);
		if (command) {
			await command.execute(interaction, client).catch(err => console.error(err));
		} else {
			console.log(`Command ${interaction.commandName} not found`);
		}
	}
}
