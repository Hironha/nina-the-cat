import { type ChatInputCommandInteraction, type CacheType } from 'discord.js';
import { type DiscordClient } from '@utils/discord-client';
import { PlayerInteractionUtils } from '@utils/player-interaction';
import { MessageHandler, type ReplyMethod } from '@utils/message-handler';

export class SameVoiceChannelHandler extends MessageHandler {
	constructor(options: { method?: ReplyMethod }) {
		super(options.method ?? 'reply');
	}

	async handle(
		interaction: ChatInputCommandInteraction<CacheType>,
		client: DiscordClient<boolean>
	): Promise<void> {
		if (PlayerInteractionUtils.isFromListener(interaction)) {
			return super.handle(interaction, client);
		}

		await this.reply(interaction, {
			content: "You're not in the same voice channel as me",
			ephemeral: true,
		});
	}
}
