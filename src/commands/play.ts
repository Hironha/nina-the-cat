import { Command, type CacheType, type ChatInputCommandInteraction } from '@utils/command';

class Play extends Command {
	constructor() {
		super();
	}

	execute<Cached extends CacheType = CacheType>(interaction: ChatInputCommandInteraction<Cached>) {
		if (!interaction.isRepliable()) return;

		interaction.reply('Todo: create play command');
	}

	build() {
		return this.setName('play').setDescription('Attempt to play a song');
	}
}

export default new Play().build();
