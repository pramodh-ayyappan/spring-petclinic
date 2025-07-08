import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://petclinic-be.default.svc.cluster.local:8080';

export async function GET() {
  try {
    // Fix: Backend endpoint is /api/s3/files/local, not /api/s3/local-files
    const response = await fetch(`${BACKEND_URL}/api/s3/files/local`);
    
    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch local files' },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching local files:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
