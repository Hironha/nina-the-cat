import { type ChatInputCommandInteraction, type CacheType, EmbedBuilder, Colors } from 'discord.js';
import { type DiscordClient } from '@utils/discord-client';
import { PlayerInteractionUtils } from '@utils/player-interaction';
import { MessageHandler, type MessageHandlerOptions } from '@utils/message-handler';

type Options = {}

export class SameVoiceChannelHandler extends MessageHandler {
	constructor(options: MessageHandlerOptions<Options>) {
		super(options.method ?? 'reply');
	}

	async handle(
		interaction: ChatInputCommandInteraction<CacheType>,
		client: DiscordClient<boolean>
	): Promise<void> {
		if (PlayerInteractionUtils.isFromListener(interaction)) {
			await super.handle(interaction, client);
		}

		await this.reply(interaction, { embeds: this.buildEmbeds(), ephemeral: true });
	}

	private buildEmbeds(): EmbedBuilder[] {
		const message = new EmbedBuilder()
			.setColor(Colors.Blue)
			.setTitle('🐱 | Warning')
			.setDescription("You're not in the same voice channel as me!");

		return [message];
	}
}
