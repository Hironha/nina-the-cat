import glob from 'glob';
import * as dotenv from 'dotenv'
import { promisify } from 'util';
import { Collection, GatewayIntentBits } from 'discord.js';
import { Player, type Queue } from 'discord-player';

import { DiscordClient } from '@utils/discord-client';
import { type Command } from '@utils/command';

dotenv.config()

const client = new DiscordClient({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
});

client.login(process.env.DISCORD_BOT_TOKEN)

client.once('ready', async () => {
	const commands = new Collection<string, Command>();
	const importedCommands = await loadCommands();
	importedCommands.forEach(command => commands.set(command.name, command));
	client.commands = commands;

	console.log("Ready to serve you!!!")
});

const player = buildPlayer(client);

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

function buildPlayer(client: DiscordClient) {
	const player = new Player(client);

	player.on('error', (queue, error) => {
		console.log(`[${queue.guild.name}] Error emitted from the queue: ${error.message}`);
	});

	player.on('connectionError', (queue, error) => {
		console.log(`[${queue.guild.name}] Error emitted from the connection: ${error.message}`);
	});

	player.on('trackStart', (queue: Queue<any>, track) => {
		queue.metadata.send(
			`▶ | Started playing: **${track.title}** in **${queue.connection.channel.name}**!`
		);
	});

	player.on('trackAdd', (queue: Queue<any>, track) => {
		queue.metadata.send(`🎶 | Track **${track.title}** queued!`);
	});

	player.on('botDisconnect', (queue: Queue<any>) => {
		queue.metadata.send('❌ | I was manually disconnected from the voice channel, clearing queue!');
	});

	player.on('channelEmpty', (queue: Queue<any>) => {
		queue.metadata.send('❌ | Nobody is in the voice channel, leaving...');
	});

	player.on('queueEnd', (queue: Queue<any>) => {
		queue.metadata.send('✅ | Queue finished!');
	});

	return player;
}
