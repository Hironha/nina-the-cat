import glob from 'glob';
import { promisify } from 'util';
import { Collection, GatewayIntentBits } from 'discord.js';

import { DiscordClient } from '@utils/discord-client';
import { type Command } from '@utils/command';

async function loadCommands(): Promise<Command[]> {
	const globPromise = promisify(glob);
	const directoryFiles = `${__dirname}/commands/*{.js,.ts}`.replace(/\\/g, '/');
	const commandFiles = await globPromise(directoryFiles).catch(err => {
		console.error({ err });
		return [];
	});
	const commandPromises: Promise<Command>[] = commandFiles.map(async file => await import(file));
	return await Promise.all(commandPromises);
}

async function main() {
	const client = new DiscordClient({ intents: [GatewayIntentBits.Guilds] });

	client.once('ready', async () => {
		const commands = new Collection<string, Command>();
		const importedCommands = await loadCommands();
		importedCommands.forEach(command => commands.set(command.name, command));
		client.commands = commands;
	});
}

main();
