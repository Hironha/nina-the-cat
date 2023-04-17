import {
	italic,
	bold,
	Colors,
	EmbedBuilder,
	type ChatInputCommandInteraction,
	type CacheType,
	type Collection,
} from 'discord.js';

import { type Command } from '@utils/command';
import { DiscordClient } from '@utils/discord-client';
import { MessageHandler, type MessageHandlerOptions } from '@utils/message-handler';

type Options = {};

export class HelpHandler extends MessageHandler {
	constructor(options?: MessageHandlerOptions<Options>) {
		super(options?.method ?? 'reply');
	}

	async handle(
		interaction: ChatInputCommandInteraction<CacheType>,
		client: DiscordClient<boolean>
	): Promise<void> {
		if (interaction.isRepliable()) {
			return super.reply(interaction, { embeds: this.buildEmbedMessage(client.commands) });
		}

		return super.handle(interaction, client);
	}

	private buildEmbedMessage(commands: Collection<string, Command>): EmbedBuilder[] {
		const availableCommands = commands.map(command => ({
			name: italic(bold(`/${command.name}`)),
			value: command.description,
			inline: false,
		}));

		const message = new EmbedBuilder()
			.setColor(Colors.Blue)
			.setTitle('😽 | Available Commands')
			.setDescription('Here are the available commands, nya.')
			.setFields(availableCommands);

		return [message];
	}
}
