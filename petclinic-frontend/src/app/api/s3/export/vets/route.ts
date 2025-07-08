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
    const filename = searchParams.get('filename') || 'vets';
    const source = searchParams.get('source') || 'merged';
    const uploadToS3 = searchParams.get('uploadToS3') === 'true';
    
    // Build the backend URL with query parameters
    const backendUrl = new URL(`${BACKEND_URL}/api/s3/vets/export`);
    backendUrl.searchParams.set('filename', filename);
    backendUrl.searchParams.set('source', source);
    backendUrl.searchParams.set('uploadToS3', uploadToS3.toString());
    
    console.log('Export request:', {
      url: backendUrl.toString(),
      filename,
      source,
      uploadToS3
    });
    
    const response = await fetch(backendUrl.toString(), {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
      },
    });
    
    if (!response.ok) {
      let errorText = '';
      let errorJson = null;
      
      try {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          errorJson = await response.json();
          errorText = JSON.stringify(errorJson, null, 2);
        } else {
          errorText = await response.text();
        }
      } catch {
        errorText = 'Unable to parse error response';
      }
      
      console.error('Backend export error:', {
        status: response.status,
        statusText: response.statusText,
        errorText,
        errorJson
      });
      
      return NextResponse.json(
        { 
          error: `Export failed: ${response.status} ${response.statusText}`,
          details: errorText,
          backendResponse: errorJson
        },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    console.log('Export success:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Export request error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error as Error).message,
        stack: (error as Error).stack
      },
      { status: 500 }
    );
  }
} 
