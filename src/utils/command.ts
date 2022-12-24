import { type Message } from 'discord.js';

export interface Command {
	name: string;
	description: string;
	execute<InGuild extends boolean = boolean>(message: Message<InGuild>, ...args: string[]): any;
}

export { type Message };
