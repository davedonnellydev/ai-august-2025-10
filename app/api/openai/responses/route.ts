import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { zodTextFormat } from 'openai/helpers/zod';
import { z } from 'zod';
import { MODEL } from '@/app/config/constants';
import { ServerRateLimiter } from '@/app/lib/utils/api-helpers';

export async function POST(request: NextRequest) {
  try {
    // Get client IP
    const ip =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown';

    // Server-side rate limiting
    if (!ServerRateLimiter.checkLimit(ip)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    const { QuizConfig } = await request.json();

    // Environment validation
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('OpenAI API key not configured');
      return NextResponse.json(
        { error: 'Translation service temporarily unavailable' },
        { status: 500 }
      );
    }

    const client = new OpenAI({
      apiKey,
    });

    // Enhanced content moderation
    const moderatedQuizTopic = await client.moderations.create({
      input: QuizConfig.quizTopic,
    });

    const { flagged, categories } = moderatedQuizTopic.results[0];

    if (flagged) {
      const keys: string[] = Object.keys(categories);
      const flaggedCategories = keys.filter(
        (key: string) => categories[key as keyof typeof categories]
      );
      return NextResponse.json(
        {
          error: `Content flagged as inappropriate: ${flaggedCategories.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Check each round topic for moderation
    for (let i = 0; i < QuizConfig.rounds.length; i++) {
      const roundTopic = QuizConfig.rounds[i].topic;
      if (roundTopic && roundTopic.trim()) {
        const moderatedRoundTopic = await client.moderations.create({
          input: roundTopic,
        });

        const { flagged, categories } = moderatedRoundTopic.results[0];

        if (flagged) {
          const keys: string[] = Object.keys(categories);
          const flaggedCategories = keys.filter(
            (key: string) => categories[key as keyof typeof categories]
          );
          return NextResponse.json(
            {
              error: `Content flagged as inappropriate: ${flaggedCategories.join(', ')}`,
            },
            { status: 400 }
          );
        }
      }
    }

    const Question = z.object({
      question: z.string(),
      answer: z.string(),
    });

    const Round = z.object({
      questions: z.array(Question),
      title: z.string(),
    });

    const QuizQuestions = z.object({
      rounds: z.array(Round),
    });

    const instructions: string = `You are an expert quiz master. Your role is to create quizzes for people about any topic, with anywhere between 1 and 10 rounds, with each round containing anywhere between 1 and 30 questions. 
    
    You will be given the config in the form of an object, containing a general quiz topic (QuizConfig.quizTopic). If no topic is specified, make the quiz a general knowledge quiz. 
    
    Within the quiz, create the number of rounds specified (QuizConfig.rounds.length). 
    
    For each round, there may be a topic specified (QuizConfig.rounds[i].topic). If any or all of the rounds have a topic specified, make that the topic of that round. If there is more than one round and no specific round topics are set, start with easy questions in the first round and get progressively harder as the questions progress. 
    
    If there are specific round topics set, keep each round a mix of easy and hard questions for that topic. 
    
    Regardless of topic, within every round created, also vary the difficulty of questions, so that not all questions in even the hardest round are impossible for a lay person to get.

    Each round may also have a name specified (QuizConfig.rounds[i].name). If it doesn't though, make up an appropriate name for the round.
    
    Provide your questions and answers in the JSON schema format specified.`;

    const response = await client.responses.parse({
      model: MODEL,
      instructions,
      input: JSON.stringify(QuizConfig),
      text: {
        format: zodTextFormat(QuizQuestions, 'quiz_questions'),
      },
    });

    if (response.status !== 'completed') {
      throw new Error(`Responses API error: ${response.status}`);
    }

    console.log(response.output_parsed);

    return NextResponse.json({
      response: response.output_parsed || 'Response recieved',
      originalInput: QuizConfig,
      remainingRequests: ServerRateLimiter.getRemaining(ip),
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'OpenAI failed';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
