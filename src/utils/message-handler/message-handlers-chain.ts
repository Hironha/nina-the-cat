import { type MessageHandler } from '.';

export class MessageHandlersChain {
	private initial: MessageHandler;
	private current: MessageHandler | null;

	constructor(initialHandler: MessageHandler) {
		this.initial = initialHandler;
		this.current = initialHandler;
	}

	next(handler: MessageHandler): this {
		if (this.current) {
			this.current.next(handler);
		}
		this.current = handler;

		return this;
	}

	run(...params: Parameters<MessageHandler['handle']>): ReturnType<MessageHandler['handle']> {
		const [interaction, client] = params;
		return this.initial.handle(interaction, client);
	}
}
