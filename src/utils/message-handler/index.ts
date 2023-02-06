import { type DiscordClient } from '@utils/discord-client';
import { type ChatInputCommandInteraction } from 'discord.js';

export type ReplyMethod = 'follow-up' | 'reply' | 'edit-reply';

export abstract class MessageHandler {
	protected nextHandler: MessageHandler | null = null;
	protected method: ReplyMethod;

	constructor(method?: ReplyMethod) {
		this.method = method ?? 'reply';
	}

	fallback(handler: MessageHandler) {
		this.nextHandler = handler;
	}

	next(nextHandler: MessageHandler) {
		this.nextHandler = nextHandler;
		return nextHandler;
	}

	async handle(interaction: ChatInputCommandInteraction, client: DiscordClient) {
		if (this.nextHandler) {
			this.nextHandler.handle(interaction, client);
			interaction.reply({});
		}
	}
}
