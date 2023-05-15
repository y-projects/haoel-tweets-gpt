import { PGChunk, PGTweet, PGJSON } from '@/types';
import fs from 'fs';
import { encode } from 'gpt-3-encoder';
import path from 'path';
import { parse } from 'csv-parse';

const CHUNK_SIZE = 1000;

const chunkTweet = async (tweet: PGTweet) => {
	const { url, date, likes_count, reply_count, retweet_count, content, ...chunklessSection } = tweet;

	let tweetTextChunks = [];

	if (encode(content).length > CHUNK_SIZE) {
		const split = content.split('。');
		let chunkText = '';

		for (let i = 0; i < split.length; i++) {
			const sentence = split[i];
			const sentenceTokenLength = encode(sentence);
			const chunkTextTokenLength = encode(chunkText).length;

			if (chunkTextTokenLength + sentenceTokenLength.length > CHUNK_SIZE) {
				tweetTextChunks.push(chunkText);
				chunkText = '';
			}

			if (sentence[sentence.length - 1].match(/[a-z0-9]/i)) {
				chunkText += sentence + '。 ';
			} else {
				chunkText += sentence + ' ';
			}
		}

		tweetTextChunks.push(chunkText.trim());
	} else {
		tweetTextChunks.push(content.trim());
	}

	const tweetChunks = tweetTextChunks.map((text) => {
		const trimmedText = text.trim();

		const chunk: PGChunk = {
			tweet_url: url,
			tweet_date: date,
			tweet_likes_count: likes_count,
			tweet_reply_count: reply_count,
			tweet_retweet_count: retweet_count,
			content: trimmedText,
			content_length: trimmedText.length,
			content_tokens: encode(trimmedText).length,
			embedding: [],
		};

		return chunk;
	});

	if (tweetChunks.length > 1) {
		for (let i = 0; i < tweetChunks.length; i++) {
			const chunk = tweetChunks[i];
			const prevChunk = tweetChunks[i - 1];

			if (chunk.content_tokens < 100 && prevChunk) {
				prevChunk.content += ' ' + chunk.content;
				prevChunk.content_length += chunk.content_length;
				prevChunk.content_tokens += chunk.content_tokens;
				tweetChunks.splice(i, 1);
				i--;
			}
		}
	}

	const chunkedSection: PGTweet = {
		...tweet,
		chunks: tweetChunks,
	};

	return chunkedSection;
};

(async () => {
	const tweets: PGTweet[] = [];

	const temp: PGTweet[] = [];

	fs.createReadStream(path.join(__dirname, 'haoel.csv'), 'utf8')
		.pipe(parse({ from_line: 2 }))
		.on('data', (row) => {
			const [index, id, date, likes_count, retweet_count, reply_count, source, text, links, url] = row;
			const content = text.trim();

			const data = {
				content,
				date,
				likes_count,
				reply_count,
				retweet_count,
				url,
				length: content.length,
				tokens: encode(content).length,
				chunks: [],
			};
			temp.push(data);
		})
		.on('end', async () => {
			console.log('parse done.');
			for (const item of temp) {
				const chunkedTweet = await chunkTweet(item);

				tweets.push(chunkedTweet);
			}

			const json: PGJSON = {
				current_date: '2023-05-15',
				author: 'haoel',
				url: 'https://twitter.com/haoel',
				length: tweets.reduce((acc, tweet) => acc + tweet.length, 0),
				tokens: tweets.reduce((acc, tweet) => acc + tweet.tokens, 0),
				tweets,
			};

			fs.writeFileSync('scripts/pg.json', JSON.stringify(json));
		});
})();
