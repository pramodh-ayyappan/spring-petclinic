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
    const uploadToS3 = searchParams.get('uploadToS3') === 'true';
    
    // Build the backend URL with query parameters
    const backendUrl = new URL(`${BACKEND_URL}/api/s3/owners/export`);
    backendUrl.searchParams.set('filename', filename);
    backendUrl.searchParams.set('uploadToS3', uploadToS3.toString());
    
    console.log('Owners export request:', {
      url: backendUrl.toString(),
      filename,
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
      
      console.error('Backend owners export error:', {
        status: response.status,
        statusText: response.statusText,
        errorText,
        errorJson
      });
      
      return NextResponse.json(
        { 
          error: `Owners export failed: ${response.status} ${response.statusText}`,
          details: errorText,
          backendResponse: errorJson
        },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    console.log('Owners export success:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Owners export request error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error as Error).message,
        stack: (error as Error).stack
      },
      { status: 500 }
    );
  }
} 
