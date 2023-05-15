export enum OpenAIModel {
	DAVINCI_TURBO = 'gpt-3.5-turbo',
}

export type PGTweet = {
	url: string;
	date: string;
	likes_count: string;
	retweet_count: string;
	reply_count: string;
	content: string;
	length: number;
	tokens: number;
	chunks: PGChunk[];
};

export type PGChunk = {
	tweet_url: string;
	tweet_date: string;
	tweet_likes_count: string;
	tweet_retweet_count: string;
	tweet_reply_count: string;
	content: string;
	content_length: number;
	content_tokens: number;
	embedding: number[];
};

export type PGJSON = {
	current_date: string;
	author: string;
	url: string;
	length: number;
	tokens: number;
	tweets: PGTweet[];
};
