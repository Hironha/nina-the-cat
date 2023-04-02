import * as dotenv from 'dotenv';
import { Player } from 'discord-player';
import { GatewayIntentBits } from 'discord.js';
import { Environment } from '@utils/environment';

import { clientReadyEvent } from '@events/client-ready';
import { interactionCreateEvent } from '@events/interaction-create';

import { audioTrackAddEvent } from '@player-events/audio-track-add';
import { audioTracksAddEvent } from '@player-events/audio-tracks-add';
import { emptyChannelEvent } from '@player-events/empty-channel';
import { emptyQueueEvent } from '@player-events/empty-queue';
import { playerErrorEvent } from '@player-events/player-error';
import { playerStartEvent } from '@player-events/player-start';

import { DiscordClient } from '@utils/discord-client';
import { createHandler } from '@utils/player-event';

dotenv.config();

async function main() {
	const token = Environment.getDiscordBotToken();

	const client = new DiscordClient({
		intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
	});

	client.on('ready', clientReadyEvent);
	client.on('interactionCreate', interaction => interactionCreateEvent(interaction, client));

	const player = new Player(client);
	player.events.on('audioTrackAdd', createHandler(audioTrackAddEvent));
	player.events.on('audioTracksAdd', createHandler(audioTracksAddEvent));
	player.events.on('emptyChannel', createHandler(emptyChannelEvent));
	player.events.on('emptyQueue', createHandler(emptyQueueEvent));
	player.events.on('playerError', createHandler(playerErrorEvent));
	player.events.on('playerStart', createHandler(playerStartEvent));

	client.login(token);
}

main();
