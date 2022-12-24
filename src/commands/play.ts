import { type Command, type Message } from '@utils/command';

class Play implements Command {
	public name = 'play';
	public description = 'command to play a song';

	public execute<InGuild extends boolean = boolean>(message: Message<InGuild>) {
		console.log(message);
	}
}

export default new Play();
	