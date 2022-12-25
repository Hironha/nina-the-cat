import * as dotenv from 'dotenv';
import { GatewayIntentBits } from 'discord.js';
import { Player, type Queue } from 'discord-player';

import { EventUtils } from '@utils/event';
import { DiscordClient } from '@utils/discord-client';

dotenv.config();

const token = process.env.DISCORD_BOT_TOKEN as string;

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

async function main() {
	const client = new DiscordClient({
		intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
	});

	const events = await EventUtils.load();

	events.forEach(event => {
		if (event.once) {
			client.once(event.name, (...args) => event.execute(...args, client.commands));
		} else {
			client.on(event.name, (...args) => event.execute(...args, client.commands));
		}
	});

	client.login(token);

	const player = buildPlayer(client);
}

main();
