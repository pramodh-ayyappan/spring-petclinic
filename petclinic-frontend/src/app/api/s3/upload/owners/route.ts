import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://petclinic-be.default.svc.cluster.local:8080';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401 }
      );
    }

    // Get query parameters from the request URL
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename') || 'owners';
    
    // Build the backend URL with query parameters
    const backendUrl = new URL(`${BACKEND_URL}/api/s3/owners/upload`);
    backendUrl.searchParams.set('filename', filename);
    
    const response = await fetch(backendUrl.toString(), {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend error:', response.status, errorText);
      return NextResponse.json(
        { error: `Failed to upload owners: ${errorText}` },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error uploading owners:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
} 
