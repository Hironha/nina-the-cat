import { Command, type CacheType, type ChatInputCommandInteraction } from '@utils/command';
import { type DiscordClient } from '@utils/discord-client';

class Play extends Command {
	constructor() {
		super();
	}

	execute<Cached extends CacheType = CacheType>(
		interaction: ChatInputCommandInteraction<Cached>,
		client: DiscordClient
	) {
		if (!interaction.isRepliable()) return;

		interaction.reply('Todo: create play command');
	}

	build() {
		return this.setName('play').setDescription('Play a song in your voice channel!');
	}
}

export default new Play().build();
