import { Events, type Interaction, type ClientEvents } from 'discord.js';

import { type Event } from '@utils/event';
import { type Commands } from '@utils/command';

class InteractionCreate implements Event {
	public once = false;
	public name: keyof ClientEvents = Events.InteractionCreate;

	async execute(interaction: Interaction, commands: Commands): Promise<void> {
		if (!interaction.isChatInputCommand()) return;

		const command = commands.get(interaction.commandName);

		if (command) {
			command.execute(interaction, commands);
		} else {
			console.log(`Command ${interaction.commandName} not found`);
		}
	}
}

export default new InteractionCreate();
