import { type ChatInputCommandInteraction, type CacheType } from 'discord.js';
import { DiscordClient } from '@utils/discord-client';
import { MessageHandler, type MessageHandlerOptions } from '@utils/message-handler';
import { PlayerInteractionUtils } from '@utils/player-interaction';

type Options = {
	fromGuild?: boolean;
};

export class IsAllowedHandler extends MessageHandler {
	private options: Required<Options>;

	constructor(options: MessageHandlerOptions<Options>) {
		super(options.method ?? 'reply');
		this.options = {
			fromGuild: options.fromGuild ?? true,
		};
	}

	async handle(
		interaction: ChatInputCommandInteraction<CacheType>,
		client: DiscordClient<boolean>
	): Promise<void> {
		if (!this.validate(interaction)) {
			await this.reply(interaction, {
				content: "You're not allowed to use this command",
				ephemeral: true,
			});
		} else {
			return super.handle(interaction, client);
		}
	}

	private validate(interaction: ChatInputCommandInteraction<CacheType>) {
		let isAllowed = true;

		if (this.options.fromGuild) {
			isAllowed = PlayerInteractionUtils.isFromGuildMember(interaction);
		}

		return isAllowed;
	}
}
