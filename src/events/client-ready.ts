import { ClientEvents, Events } from 'discord.js';
import { CommandUtils } from '@utils/command';

import { type Event } from '@utils/event';
import { type DiscordClient } from '@utils/discord-client';

class ClientReady implements Event {
	public once = true;
	public name: keyof ClientEvents = Events.ClientReady;

	async execute(client: DiscordClient): Promise<void> {
		const commands = await CommandUtils.loadCommands();
		client.commands = CommandUtils.collect(commands);

		if (process.env.PUBLISH_COMMANDS === 'true') {
			await CommandUtils.publish(commands);
		}

		console.log('Ready to serve you, nya!');
	}
}

export default new ClientReady();
