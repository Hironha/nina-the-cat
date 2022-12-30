import glob from 'glob';
import { promisify } from 'util';
import { Collection, REST, Routes } from 'discord.js';

import { getSRCPath } from '@utils/path';
import { Command } from './command';

export type Commands = Collection<string, Command>;

function isCommand(data: unknown): data is Command {
	if (typeof data === 'object' && data !== null) {
		return 'execute' in data;
	}
	return false;
}
export class CommandUtils {
	static async load() {
		const globPromise = promisify(glob);
		const directoryFiles = `${getSRCPath()}/commands/*{.js,.ts}`;
		const commandFiles = await globPromise(directoryFiles);

		const commandPromises = commandFiles.map(async file => {
			const importedFile = await import(file);
			const command: unknown = importedFile.default;
			if (!isCommand(command)) return null;
			return command.isDevOnly() ? command : null;
		});

		const commands = await Promise.all(commandPromises);

		return commands.filter((command): command is Command => Boolean(command));
	}

	static collect(commands: Command[]) {
		const collection = new Collection<string, Command>();

		commands.forEach(command => collection.set(command.name, command));

		return collection;
	}

	static async publish(commands: Command[]) {
		const guildId = process.env.GUILD_ID as string;
		const clientId = process.env.CLIENT_ID as string;
		const token = process.env.DISCORD_BOT_TOKEN as string;

		const rest = new REST({ version: '10' }).setToken(token);

		const body = commands.map(command => command.toJSON());

		let data: any = null;

		if (guildId) {
			data = await rest
				.put(Routes.applicationGuildCommands(clientId, guildId), { body })
				.catch(err => console.error(err));
		} else {
			data = await rest
				.put(Routes.applicationCommands(clientId), { body })
				.catch(err => console.error(err));
		}

		console.log(`Successfully reloaded ${data?.length} application (/) commands.`);
	}
}
