import { type DiscordClient } from '@utils/discord-client';
import { type InteractionReplyOptions, type ChatInputCommandInteraction } from 'discord.js';

export type ReplyMethod = 'follow-up' | 'reply' | 'edit-reply';

export type MessageHandlerOptions<T extends {}> = T & {
	method?: ReplyMethod;
};

export interface Handler {
	handle(interaction: ChatInputCommandInteraction, client: DiscordClient): Promise<void>;
}

export abstract class MessageHandler implements Handler {
	protected nextHandler: MessageHandler | null = null;
	protected method: ReplyMethod;

	constructor(method?: ReplyMethod) {
		this.method = method ?? 'reply';
	}

	next(nextHandler: MessageHandler): MessageHandler {
		this.nextHandler = nextHandler;
		return nextHandler;
	}

	async handle(interaction: ChatInputCommandInteraction, client: DiscordClient): Promise<void> {
		if (this.nextHandler) {
			return await this.nextHandler.handle(interaction, client);
		}
	}

	protected async reply(
		interaction: ChatInputCommandInteraction,
		options: InteractionReplyOptions
	): Promise<void> {
		switch (this.method) {
			case 'reply':
				await interaction.reply(options);
			case 'follow-up':
				await interaction.followUp(options);
			case 'edit-reply':
				await interaction.editReply(options);
		}
	}
}
