import { EmbedBuilder, Colors, type InteractionReplyOptions, type Guild } from 'discord.js';

import { right, type Either } from '@utils/flow';
import { type DiscordClient } from '@utils/discord-client';
import { PlayerInteractionUtils } from '@utils/player-interaction';
import { Command, type ChatInputCommandInteraction } from '@utils/command';

type InteractionProperties = {
	guild: Guild;
};

class Shuffle extends Command {
	constructor() {
		super();
		this.setName('shuffle').setDescription('Shuffle all songs in queue');
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

		await interaction.deferReply();

		const { player } = client;
		const { guild } = interactionProperties.value;

		const queue = PlayerInteractionUtils.getPlayerQueue(player, guild.id);
		if (queue.isLeft()) {
			return void interaction.editReply(queue.value);
		}

		if (!queue.value.shuffle()) {
			return void interaction.editReply({ content: "It wasn't possible to shuffle the queue" });
		}

		interaction.editReply({ embeds: [this.buildShuffleEmbedMessage()] });
	}

	private buildShuffleEmbedMessage() {
		return new EmbedBuilder()
			.setColor(Colors.Blue)
			.setTitle('Shuffle')
			.setDescription('All songs in queue were shuffled');
	}

	private getInteractionProperties(
		interaction: ChatInputCommandInteraction
	): Either<InteractionReplyOptions, InteractionProperties> {
		const guild = PlayerInteractionUtils.getGuild(interaction);
		if (guild.isLeft()) return guild;

		return right({ guild: guild.value });
	}
}

export default new Shuffle();
