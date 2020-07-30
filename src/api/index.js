import { version } from '../../package.json';
import { Router } from 'express';
import root from './root';
import TelegramBot from 'node-telegram-bot-api';
import { extractLink, validURL, isPhoto } from '../lib/util';
import download from 'download';
import _, { size } from 'lodash';

export default () => {
	let bot = new TelegramBot(process.env.BOT_TOKEN, {polling: true, filepath: false});
	let api = Router();
	// let xray = Xray();
	api.use((req, res, next) => {
    next();
	});
	// perhaps expose some API metadata at the root
	api.get('/', (req, res) => {
		res.json({ version });
	});

	api.use('/root', root);

	bot.onText(/\/get (.+)/, async (msg, match) => {
		const chatId = msg.chat.id;
		const resp = match[1];

		try {
			let isValid = validURL(resp);
			if (!isValid) {
				throw Error('Invalid url');
			}
			const links = await extractLink(resp);
			if (links.length > 19) {
				throw Error('Album is too big try using /getp <url>');
			}
			bot.sendMessage(chatId, 'Begin downloading, please be patient');			
			for (const i in links) {
				download(links[i].media).then((image) => {
					bot.sendDocument(chatId, image, {}, {
						filename: links[i].filename.replace(/\.[^/.]+$/, '')
					});
				});
			}
		} catch (error) {
			bot.sendMessage(chatId, error.message);
		}
	});

	bot.onText(/\/getp (.+)/, async (msg, match) => {
		const chatId = msg.chat.id;
		const resp = match[1];

		try {
			let isValid = validURL(resp);
			if (!isValid) {
				throw Error('Invalid url');
			}
			const links = await extractLink(resp);
			bot.sendMessage(chatId, 'Begin downloading, please be patient');			
			for (const i in links) {
				download(links[i].media).then(async (image) => {
					// if (i % 19 === 0) {
					// 	console.log('slowing down');
					// 	sleep(30000);
					// }
					bot.sendDocument(chatId, image, {}, {
						filename: links[i].filename.replace(/\.[^/.]+$/, '')
					});
				});
			}
		} catch (error) {
			bot.sendMessage(chatId, error.message);
		}
	});

	bot.onText(/\/mini (.+)/, async (msg, match) => {
		const chatId = msg.chat.id;
		const resp = match[1];

		try {
			let isValid = validURL(resp);
			if (!isValid) {
				throw Error('Invalid url');
			}
			const links = await extractLink(resp);
			bot.sendMessage(chatId, 'Begin downloading, please be patient');
			for (const i in links) {
				links[i].type = isPhoto ? 'photo' : 'video';
			}
			let media = {
				data: _.chunk(links, 10)
			};
			for(const i in media.data) {
				bot.sendMediaGroup(chatId, media.data[i]);
			}
			
		} catch (error) {
			bot.sendMessage(chatId, error.message);
		}
	});

	bot.onText(/\/help/, async (msg) => {
		const chatId = msg.chat.id;
		try {
			bot.sendMessage(chatId, `Commands: 
			/get <url> - Max album size 20 images.
			/getp <url> -  No Max album size.
			/mini <url> - Compressed grouped images. Buggy
			`);
						
		} catch (error) {
			bot.sendMessage(chatId, error.message);
		}
	});

	return api;
};
