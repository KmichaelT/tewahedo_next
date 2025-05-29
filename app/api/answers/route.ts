import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { db, answers, eq } from '@/lib/db';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Get answers using Drizzle's query syntax
    const allAnswers = await db.select().from(answers);
    
    return NextResponse.json(allAnswers);
  } catch (error) {
    console.error('Error fetching answers:', error);
    return NextResponse.json({ error: 'Failed to fetch answers' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { questionId, content } = body;

    // Insert new answer
    const [newAnswer] = await db.insert(answers).values({
      questionId,
      content,
      authorId: session.user.id,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();

    return NextResponse.json(newAnswer);
  } catch (error) {
    console.error('Error creating answer:', error);
    return NextResponse.json({ error: 'Failed to create answer' }, { status: 500 });
  }
}