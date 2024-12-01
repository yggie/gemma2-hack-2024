PoMAIA (Podcast Marketing AI Assistant) is an intelligent system designed to take source content, targeted at podcast transcripts, and turn them into bite sized content which can be used in marketing material.

Check out our [demo](https://gemma2-hack-2024.vercel.app/)

It is recommend to use Chrome to view the demo, since the demo requires WebGPU support

## Problem
The project was born from the frustration of managing social media. Our team
also runs a podcast, the Amata World Podcast, which has been our passion
project for some time. While speaking with guests about different topics are
fun, having to manage social media and marketing on top of running this
podcast has been a real energy drain. We believe we are not the only ones in
this predicament. Passion projects often don’t go the extra mile because of
the lack of investment in areas like marketing and social media management.
We want to simplify the content creation process, so forward thinkers spend more
time on the parts that matter the most.

## Solution
Introducing PoMAIA, an intelligent system that takes your content (any text content, from podcast transcripts to blog posts) and produces bite sized content. Given the time constraints, we could only demonstrate the feasibility of building the solution to produce simple text content, but we envisage this could do so much more.

## Technology
We wanted this demo to be as accessible as possible, which is one of the reasons why we opted to build it to work entirely client-side. We used gemma2, loaded on the browser using WebLLM, to perform the heavy lifting. Various components of langchain are also used to pre-process the input text.

## Features
- Content summarisation with tagging, alternative titles and a short summary
- Highlight key points in the provided text which can be quoted in short-form content like TikTok or Twitter/X/Bluesky posts
- Simple and easy-to-use UI
- Regenerate parts which are unsatisfactory

## Future Plans
We are committed to continuing this project, at the very least, this will take the Amata World Podcast to the next level
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Development

First, run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the
result.
