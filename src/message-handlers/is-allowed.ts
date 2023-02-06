import { DiscordClient } from '@utils/discord-client';
import { MessageHandler, type ReplyMethod } from '@utils/message-handler';
import { PlayerInteractionUtils } from '@utils/player-interaction';
import { type ChatInputCommandInteraction, type CacheType } from 'discord.js';

export type Options = {
	method?: ReplyMethod;
	guildMember?: boolean;
};

export class IsAllowed extends MessageHandler {
	private options: Required<Options>;

	constructor(options: Options) {
		super();
		this.options = {
			method: options.method ?? 'reply',
			guildMember: options.guildMember ?? true,
		};
	}

	async handle(
		interaction: ChatInputCommandInteraction<CacheType>,
		client: DiscordClient<boolean>
	): Promise<void> {
		if (!this.validate(interaction)) {
			await interaction.reply({
				content: "You're not allowed to use this command",
				ephemeral: true,
			});
		} else {
			return super.handle(interaction, client);
		}
	}

	private validate(interaction: ChatInputCommandInteraction<CacheType>) {
		let isAllowed = true;

		if (this.options.guildMember) {
			isAllowed = PlayerInteractionUtils.isFromGuildMember(interaction);
		}

		return isAllowed;
	}
}
