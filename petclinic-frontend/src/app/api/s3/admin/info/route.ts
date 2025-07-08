import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://petclinic-be.default.svc.cluster.local:8080';

export async function GET(request: NextRequest) {
  try {
    // Forward the Authorization header if present
    const authHeader = request.headers.get('Authorization');
    const headers: HeadersInit = {};
    
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    
    const response = await fetch(`${BACKEND_URL}/api/s3/admin/info`, {
      headers
    });
    
    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error proxying to backend:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin info from backend' },
      { status: 500 }
    );
  }
} 
