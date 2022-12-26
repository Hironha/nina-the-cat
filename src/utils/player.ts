import { Colors, bold, EmbedBuilder } from 'discord.js';
import { Player } from 'discord-player';
import { DiscordClient } from './discord-client';

import { intoChunk } from './chunk';
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
				`▶ | Started playing: ${bold(track.title)} in ${bold(queue.connection.channel.name)}!`
			);
		});

		player.on('tracksAdd', (queue, tracks) => {
			if (!queue.metadata) return;
			const channel = queue.metadata as TextBasedChannel;

			const trackFields = tracks.map((track, index) => ({
				name: `${index + 1}.`,
				value: bold(track.title),
				inline: false,
			}));

			const embedMessages = intoChunk(trackFields, 20).map((chunk, index) => {
				let embed = new EmbedBuilder().setColor(Colors.Blue).setFields(chunk);
				if (index !== 0) return embed;
				return embed.setTitle('Queue').setDescription('All songs added to queue');
			});

			channel.send({ embeds: embedMessages });
		});

		player.on('trackAdd', (queue, track) => {
			if (!queue.metadata) return;
			const channel = queue.metadata as TextBasedChannel;

			channel.send(`🎶 | Track ${bold(track.title)} queued!`);
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
