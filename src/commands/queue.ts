import { intoChunk } from '@utils/chunk';
import { left, right, type Either } from '@utils/flow';
import { PlayerInteractionUtils } from '@utils/player-interaction';
import { Command, type ChatInputCommandInteraction } from '@utils/command';

import { type Player, Queue as PlayerQueue } from 'discord-player';
import {
	bold,
	Colors,
	EmbedBuilder,
	type Guild,
	type APIEmbedField,
	type InteractionReplyOptions,
} from 'discord.js';
import { type DiscordClient } from '@utils/discord-client';

type InteractionProperties = {
	guild: Guild;
};

class Queue extends Command {
	constructor() {
		super();
		this.setName('queue').setDescription('View the queue of current songs!');
	}

	async execute(interaction: ChatInputCommandInteraction, client: DiscordClient) {
		if (!interaction.isRepliable() || !client.player) return;

		const interactionProperties = this.getInteractionProperties(interaction);
		if (interactionProperties.isLeft()) {
			return void interaction.reply(interactionProperties.value);
		}

		const { player } = client;
		const { guild } = interactionProperties.value;

		const queue = this.getQueue(player, guild.id);
		if (queue.isLeft()) {
			return void interaction.reply(queue.value);
		}

		const queueEmbedMessage = this.buildQueueEmbedMessage(queue.value);
		interaction.reply({ embeds: queueEmbedMessage }).catch(err => console.error(err));
	}

	private getInteractionProperties(
		interaction: ChatInputCommandInteraction
	): Either<InteractionReplyOptions, InteractionProperties> {
		const guild = PlayerInteractionUtils.getGuild(interaction);
		if (guild.isLeft()) return guild;

		return right({ guild: guild.value });
	}

	private getQueue(player: Player, queueId: string) {
		const queue = player.getQueue(queueId);
		if (!queue) return left({ content: '😿 | There are no songs in queue!' });

		return right(queue);
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
