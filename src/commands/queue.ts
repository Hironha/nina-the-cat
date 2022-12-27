import { intoChunk } from '@utils/chunk';
import { right, type Either } from '@utils/flow';
import { PlayerInteractionUtils } from '@utils/player-interaction';
import { Command, type ChatInputCommandInteraction } from '@utils/command';

import { type Queue as PlayerQueue } from 'discord-player';
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
		this.setName('queue').setDescription('View the queue of current songs');
	}

	async execute(interaction: ChatInputCommandInteraction, client: DiscordClient): Promise<void> {
		if (!interaction.isRepliable() || !client.player) return;

		if (!PlayerInteractionUtils.isFromGuildMember(interaction)) {
			return void interaction.reply({ content: "You're not a guild member!", ephemeral: true });
		}

		const interactionProperties = this.getInteractionProperties(interaction);
		if (interactionProperties.isLeft()) {
			return void interaction.reply(interactionProperties.value);
		}

		const { player } = client;
		const { guild } = interactionProperties.value;

		const queue = PlayerInteractionUtils.getPlayerQueue(player, guild.id);
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
