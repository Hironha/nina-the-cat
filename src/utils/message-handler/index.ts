import { type DiscordClient } from '@utils/discord-client';
import { type InteractionReplyOptions, type ChatInputCommandInteraction } from 'discord.js';

export type ReplyMethod = 'follow-up' | 'reply' | 'edit-reply';

export type MessageHandlerOptions<T extends {}> = T & {
	method?: ReplyMethod;
};

export abstract class MessageHandler {
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
			this.nextHandler.handle(interaction, client);
			interaction.reply({});
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
