import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://petclinic-be.default.svc.cluster.local:8080';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    
    const response = await fetch(`${BACKEND_URL}/api/s3/download/${filename}`);
    
    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to download file' },
        { status: response.status }
      );
    }
    
    // Stream the file content
    const fileContent = await response.arrayBuffer();
    
    return new NextResponse(fileContent, {
      headers: {
        'Content-Type': response.headers.get('content-type') || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error downloading file:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
