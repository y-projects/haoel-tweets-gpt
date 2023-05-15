# Hao Chen's Tweets GPT

AI-powered search and chat for [Hao Chen's](https://twitter.com/haoel) Twitter.

All code & data used is 100% open-source.

[Online](https://haoel-tweets-gpt.vercel.app/)

## How It Works

Hao Chen's Tweets GPT provides 2 things:

1. A search interface.
2. A chat interface.

### Search

Search was created with [OpenAI Embeddings](https://platform.openai.com/docs/guides/embeddings) (`text-embedding-ada-002`).

First, we loop over the tweets and generate embeddings for each chunk of text.

Then in the app we take the user's search query, generate an embedding, and use the result to find the most similar passages from the book.

The comparison is done using cosine similarity across our database of vectors.

Our database is a Postgres database with the [pgvector](https://github.com/pgvector/pgvector) extension hosted on [Supabase](https://supabase.com/).

Results are ranked by similarity score and returned to the user.

### Chat

Chat builds on top of search. It uses search results to create a prompt that is fed into GPT-3.5-turbo.

This allows for a chat-like experience where the user can ask questions about the book and get answers.

### Notes

卓越之识论道（Great minds discuss ideas）

平常之识论事（Average minds discuss events）

狹隘之识论人（Small minds discuss people）

——CoolShell.cn 陈皓

**R.I.P**
