import { type Client } from 'discord.js';
import { CommandUtils } from '@utils/command';
import { Environment } from '@utils/environment';

import { DiscordClient } from '@utils/discord-client';

export const clientReadyEvent = async (client: Client<true>): Promise<void> => {
	if (!DiscordClient.isDiscordClient(client)) return;

	client.commands = await CommandUtils.load();

	if (Environment.getPublishCommands()) {
		await CommandUtils.publish(client.commands);
	}

	console.log('Ready to serve you, nya!');
};
