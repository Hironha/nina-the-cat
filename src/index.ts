import * as dotenv from 'dotenv';
import { Player } from 'discord-player';
import { GatewayIntentBits } from 'discord.js';
import { Environment } from '@utils/environment';

import { EventUtils } from '@utils/event';
import { PlayerEventUtils } from '@utils/player-event';
import { DiscordClient } from '@utils/discord-client';

dotenv.config();

async function main() {
	const token = Environment.getDiscordBotToken();

	const client = new DiscordClient({
		intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
	});

	const events = await EventUtils.load();
	EventUtils.attach(client, events);

	const player = new Player(client);
	const playerEvents = await PlayerEventUtils.loadEvents();
	PlayerEventUtils.attach(player, playerEvents);

	client.login(token);
}

main();
