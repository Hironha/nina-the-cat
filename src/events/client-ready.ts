import { ClientEvents, Events } from 'discord.js';
import { CommandUtils } from '@utils/command';
import { Environment } from '@utils/environment';

import { type Event } from '@utils/event';
import { type DiscordClient } from '@utils/discord-client';

class ClientReady implements Event {
	public once = true;
	public name: keyof ClientEvents = Events.ClientReady;

	async execute(client: DiscordClient): Promise<void> {
		client.commands = await CommandUtils.load();

		if (Environment.getPublishCommands()) {
			await CommandUtils.publish(client.commands);
		}

		console.log('Ready to serve you, nya!');
	}
}

export default new ClientReady();
