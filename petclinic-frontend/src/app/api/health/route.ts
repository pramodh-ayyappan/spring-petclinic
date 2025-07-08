import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://petclinic-be.default.svc.cluster.local:8080';

export async function GET() {
  try {
    // Try to reach the backend
    const response = await fetch(`${BACKEND_URL}/actuator/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const backendStatus = response.ok ? 'UP' : 'DOWN';
    const backendData = response.ok ? await response.json() : null;

    return NextResponse.json({
      status: 'UP',
      frontend: 'UP',
      backend: backendStatus,
      backendUrl: BACKEND_URL,
      backendData,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json({
      status: 'DOWN',
      frontend: 'UP',
      backend: 'DOWN',
      backendUrl: BACKEND_URL,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 503 });
  }
} 
