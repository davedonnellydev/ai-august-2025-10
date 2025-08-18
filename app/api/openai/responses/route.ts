import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { zodTextFormat } from 'openai/helpers/zod';
import { z } from 'zod';
import { MODEL } from '@/app/config/constants';
import { InputValidator, ServerRateLimiter } from '@/app/lib/utils/api-helpers';

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

    const { input } = await request.json();

    // Enhanced validation
    const textValidation = InputValidator.validateText(input, 2000);
    if (!textValidation.isValid) {
      return NextResponse.json(
        { error: textValidation.error },
        { status: 400 }
      );
    }

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
    const moderatedText = await client.moderations.create({
      input,
    });

    const { flagged, categories } = moderatedText.results[0];

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

    const instructions: string = `You are an expert quiz master. Your role is to create quizzes for people about any topic, with anywhere between 1 and 10 rounds, with each round containing anywhere between 1 and 30 questions. If no topic is specified, make the quiz a general knowledge quiz. If no number of rounds specified, make a quiz with 3 rounds. If no number of questions is specified, make the default number of questions 10. If there are multiple rounds, start with easy questions and get progressively harder as the questions progress. Within every round created, also vary the difficulty of questions, so that not all questions in even the hardest round are impossible for a lay person to get. Provide your questions and answers in the JSON schema format specified.`;

    const response = await client.responses.parse({
      model: MODEL,
      instructions,
      input,
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
      originalInput: input,
      remainingRequests: ServerRateLimiter.getRemaining(ip),
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'OpenAI failed';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
