import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://petclinic-be.default.svc.cluster.local:8080';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    const authHeader = request.headers.get('Authorization');
    
    const headers: HeadersInit = {};
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    
    // Fix: Backend endpoint is /api/s3/files/local/{filename}, not /api/s3/local-files/{filename}
    const response = await fetch(`${BACKEND_URL}/api/s3/files/local/${filename}`, {
      method: 'DELETE',
      headers
    });
    
    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to delete local file' },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error deleting local file:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
