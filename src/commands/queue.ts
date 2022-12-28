import { type Queue as PlayerQueue } from 'discord-player';
import { bold, Colors, EmbedBuilder, type APIEmbedField } from 'discord.js';

import { intoChunk } from '@utils/chunk';
import { type DiscordClient } from '@utils/discord-client';
import { PlayerInteractionUtils } from '@utils/player-interaction';
import { Command, type ChatInputCommandInteraction } from '@utils/command';

class Queue extends Command {
	constructor() {
		super();
		this.setName('queue').setDescription('View the queue of current songs');
	}

	async execute(interaction: ChatInputCommandInteraction, client: DiscordClient): Promise<void> {
		if (!interaction.isRepliable() || !client.player) return;

		if (!PlayerInteractionUtils.isFromGuildMember(interaction)) {
			return void interaction.reply({ content: "You're not a guild member!", ephemeral: true });
		}

		const guild = PlayerInteractionUtils.getGuild(interaction);
		if (guild.isLeft()) return void interaction.reply(guild.value);

		const { player } = client;

		const queue = PlayerInteractionUtils.getPlayerQueue(player, guild.value.id);
		if (queue.isLeft()) {
			return void interaction.reply(queue.value);
		}

		const queueEmbedMessage = this.buildQueueEmbedMessage(queue.value);
		interaction.reply({ embeds: queueEmbedMessage }).catch(err => console.error(err));
	}

	private buildQueueEmbedMessage(queue: PlayerQueue) {
		const trackFields: APIEmbedField[] = queue.tracks.map((track, index) => ({
			name: `${index + 1}.`,
			value: bold(track.title),
			inline: false,
		}));

		if (queue.playing && queue.current) {
			trackFields.unshift({
				name: '🎶 Current Song',
				value: bold(queue.current.title),
				inline: false,
			});
		}

		const embedMessages = intoChunk(trackFields, 20).map((chunk, index) => {
			let embed = new EmbedBuilder().setColor(Colors.Blue).setFields(chunk);
			if (index !== 0) return embed;
			return embed.setTitle('🐱 | Songs in Queue');
		});

		return embedMessages;
	}
}

export default new Queue();
