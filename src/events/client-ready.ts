import { type Collection, type Client, REST, Routes } from 'discord.js';

import { type Command } from '@utils/command';
import { Environment } from '@utils/environment';
import { DiscordClient } from '@utils/discord-client';
import { Clear, Help, NowPlaying, Play, Queue, Remove, Shuffle, Skip, Stop } from '@commands/index';

const publishCommands = async (commands: Collection<string, Command>): Promise<void> => {
	const guildId = Environment.getGuildId();
	const clientId = Environment.getClientId();
	const token = Environment.getDiscordBotToken();

	if (!token) {
		throw new Error('DISCORD_BOT_TOKEN not declared in environment');
	} else if (!clientId) {
		throw new Error('CLIENT_ID not declared in environment');
	}

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
};

export const clientReadyEvent = async (client: Client<true>): Promise<void> => {
	if (!DiscordClient.isDiscordClient(client)) return;

	client.commands = [
		new Clear(),
		new Help(),
		new NowPlaying(),
		new Play(),
		new Queue(),
		new Remove(),
		new Shuffle(),
		new Skip(),
		new Stop(),
	];

	if (Environment.getPublishCommands()) {
		await publishCommands(client.commands);
	}

	console.log('Ready to serve you, nya!');
};
