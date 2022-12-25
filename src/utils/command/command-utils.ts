import glob from 'glob';
import { promisify } from 'util';
import { Collection, REST, Routes } from 'discord.js';

import { getSRCPath } from '@utils/path';
import { type Command } from './command';

export type Commands = Collection<string, Command>;
export class CommandUtils {
	static async load() {
		const globPromise = promisify(glob);
		const directoryFiles = `${getSRCPath()}/commands/*{.js,.ts}`;
		const commandFiles = await globPromise(directoryFiles);

		const commandPromises: Promise<Command>[] = commandFiles.map(async file => {
			const importedFile = await import(file);
			return importedFile.default;
		});

		return await Promise.all(commandPromises);
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

		const data: any = await rest
			.put(Routes.applicationGuildCommands(clientId, guildId), {
				body: commands.map(command => command.toJSON()),
			})
			.catch(err => console.error(err));

		console.log(`Successfully reloaded ${data?.length} application (/) commands.`);
	}
}
