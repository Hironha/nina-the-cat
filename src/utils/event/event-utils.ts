import { type DiscordClient } from '@utils/discord-client';
import { ClientReady } from '@events/client-ready';
import { InteractionCreate } from '@events/interaction-create';
import { type Event } from './event';

export class EventUtils {
	private constructor() {}

	static load(): Event[] {
		return [new ClientReady(), new InteractionCreate()];
	}

	static attach(client: DiscordClient, events: Event[]): DiscordClient {
		const createEventExecuter = (event: Event, client: DiscordClient) => {
			return (...args: any[]) => event.execute(...args, client).catch(err => console.error(err));
		};

		events.forEach(event => {
			if (event.once) {
				client.once(event.name, createEventExecuter(event, client));
			} else {
				client.on(event.name, createEventExecuter(event, client));
			}
		});

		return client;
	}
}
