import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://petclinic-be.default.svc.cluster.local:8080';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401 }
      );
    }
    
    const response = await fetch(`${BACKEND_URL}/api/s3/files/${filename}`, {
      method: 'DELETE',
      headers: {
        'Authorization': authHeader,
      },
    });
    
    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to delete S3 file' },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error deleting S3 file:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
