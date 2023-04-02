import { type Interaction } from 'discord.js';

import { DiscordClient } from '@utils/discord-client';

export const interactionCreateEvent = async (
	interaction: Interaction,
	client: DiscordClient
): Promise<void> => {
	if (!interaction.isChatInputCommand()) return;

	const command = client.commands.get(interaction.commandName);
	if (command) {
		await command.execute(interaction, client).catch(err => console.error(err));
	} else {
		console.log(`Command ${interaction.commandName} not found`);
	}
};
