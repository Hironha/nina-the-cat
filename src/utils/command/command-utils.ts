import glob from 'glob';
import { promisify } from 'util';
import { REST, Routes, type Collection } from 'discord.js';

import { getSRCPath } from '@utils/path';
import { Environment } from '@utils/environment';
import { Command } from './command';

export type Commands = Collection<string, Command>;

function isCommand(data: unknown): data is Command {
	if (typeof data === 'object' && data !== null) {
		return 'execute' in data;
	}
	return false;
}
export class CommandUtils {
	static async publish(commands: Collection<string, Command>): Promise<void> {
		const guildId = Environment.getGuildId();
		const clientId = Environment.getClientId();
		const token = Environment.getDiscordBotToken();

		if (!token) throw new Error('DISCORD_BOT_TOKEN not declared in environment');
		if (!clientId) throw new Error('CLIENT_ID not declared in environment');

		const rest = new REST({ version: '10' }).setToken(token);
		const body = commands.map(command => command.toJSON());

		let data: any = null;
		if (guildId) {
			data = await rest
				.put(Routes.applicationGuildCommands(clientId, guildId), { body })
				.catch(console.error);
		} else {
			data = await rest.put(Routes.applicationCommands(clientId), { body }).catch(console.error);
		}

		console.log(`Successfully reloaded ${data?.length} application (/) commands.`);
	}
}
