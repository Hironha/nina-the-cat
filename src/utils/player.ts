import { Player, type Queue } from 'discord-player';
import { DiscordClient } from './discord-client';

import { type TextBasedChannel } from 'discord.js';

export class PlayerUtils {
	static attach(client: DiscordClient, player: Player) {
		client.player = player;
	}

	static build(client: DiscordClient) {
		const player = new Player(client);

		player.on('error', (queue, error) => {
			console.log(`[${queue.guild.name}] Error emitted from the queue: ${error.message}`);
		});

		player.on('connectionError', (queue, error) => {
			console.log(`[${queue.guild.name}] Error emitted from the connection: ${error.message}`);
		});

		player.on('trackStart', (queue, track) => {
			if (!queue.metadata) return;
			const channel = queue.metadata as TextBasedChannel;

			channel.send(
				`▶ | Started playing: **${track.title}** in **${queue.connection.channel.name}**!`
			);
		});

		player.on('trackAdd', (queue, track) => {
			if (!queue.metadata) return;
			const channel = queue.metadata as TextBasedChannel;

			channel.send(`🎶 | Track **${track.title}** queued!`);
		});

		player.on('botDisconnect', queue => {
			if (!queue.metadata) return;
			const channel = queue.metadata as TextBasedChannel;

			channel.send('❌ | I was manually disconnected from the voice channel, clearing queue!');
		});

		player.on('channelEmpty', queue => {
			if (!queue.metadata) return;
			const channel = queue.metadata as TextBasedChannel;

			channel.send('❌ | Nobody is in the voice channel, leaving...');
		});

		player.on('queueEnd', queue => {
			if (!queue.metadata) return;
			const channel = queue.metadata as TextBasedChannel;

			channel.send('✅ | Queue finished!');
		});

		return player;
	}
}
