import { Client, Collection, type ClientOptions } from 'discord.js';

import { type Command } from './command/command';

export class DiscordClient<Ready extends boolean = boolean> extends Client<Ready> {
	private _commands: Collection<string, Command>;

	constructor(options: ClientOptions) {
		super(options);
		this._commands = new Collection();
	}

	static isDiscordClient(client: unknown): client is DiscordClient {
		return client instanceof DiscordClient;
	}

	get commands(): Collection<string, Command> {
		return this._commands;
	}

	set commands(commands: Collection<string, Command> | Array<Command>) {
		if (Array.isArray(commands)) {
			const collection = new Collection<string, Command>();
			commands.forEach(command => collection.set(command.name, command));
			this.commands = collection;
		} else {
			this._commands = commands;
		}
	}
}
