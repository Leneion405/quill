import { handleAuth } from '@kinde-oss/kinde-auth-nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: { kindeAuth: string } }) {
  const endpoint = params.kindeAuth;

  try {
    const result = await handleAuth(request, endpoint);

    // Ensure the result is a Response
    if (result instanceof Response) {
      return result;
    } else {
      // Handle the case where result is not a Response
      return NextResponse.json(result);
    }
  } catch (error) {
    return NextResponse.error();
  }
}
