import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://petclinic-be.default.svc.cluster.local:8080';

export async function GET() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/s3/files`);
    
    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error proxying to backend:', error);
    return NextResponse.json(
      { error: 'Failed to fetch S3 files from backend' },
      { status: 500 }
    );
  }
} 
