import { PGTweet, PGJSON } from '@/types';
import { loadEnvConfig } from '@next/env';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import { Configuration, OpenAIApi } from 'openai';
import path from 'path';

loadEnvConfig('');

const generateEmbeddings = async (tweets: PGTweet[]) => {
	const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
	const openai = new OpenAIApi(configuration);

	const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

	for (let i = 0; i < tweets.length; i++) {
		const section = tweets[i];

		for (let j = 0; j < section.chunks.length; j++) {
			const chunk = section.chunks[j];

			const { tweet_url, tweet_likes_count, tweet_reply_count, tweet_retweet_count, tweet_date, content, content_length, content_tokens } = chunk;

			const embeddingResponse = await openai.createEmbedding({
				model: 'text-embedding-ada-002',
				input: content,
			});

			const [{ embedding }] = embeddingResponse.data.data;

			const row = {
				tweet_url,
				tweet_date,
				tweet_likes_count,
				tweet_reply_count,
				tweet_retweet_count,
				content,
				content_length,
				content_tokens,
				embedding,
			};

			const { data, error } = await supabase.from('pg').insert(row).select('*');

			if (error) {
				console.log('error', error);
			} else {
				console.log('saved', i, j);
			}

			// await new Promise((resolve) => setTimeout(resolve, 200));
		}
	}
};

(async () => {
	const twint: PGJSON = JSON.parse(fs.readFileSync(path.join(__dirname, 'pg.json'), 'utf8'));

	await generateEmbeddings(twint.tweets);
})();
