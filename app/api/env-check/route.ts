import { NextResponse } from "next/server";

export async function GET() {
  const filteredEnv = {
    EMAIL_HOST: process.env.EMAIL_HOST || 'not set',
    EMAIL_PORT: process.env.EMAIL_PORT || 'not set',
    EMAIL_SECURE: process.env.EMAIL_SECURE || 'not set',
    EMAIL_USER: process.env.EMAIL_USER ? `${process.env.EMAIL_USER.substring(0, 4)}...` : 'not set',
    EMAIL_PASSWORD: process.env.EMAIL_PASSWORD ? 'set but not shown' : 'not set',
    EMAIL_FROM: process.env.EMAIL_FROM || 'not set',
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'not set',
    NODE_ENV: process.env.NODE_ENV || 'not set'
  };
  
  return NextResponse.json(filteredEnv);
} 