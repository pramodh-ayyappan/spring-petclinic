import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://petclinic-be.default.svc.cluster.local:8080';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization required for debug endpoint' },
        { status: 401 }
      );
    }

    const diagnostics = {
      backend_url: BACKEND_URL,
      tests: {} as Record<string, {
        status?: number;
        ok?: boolean;
        response?: unknown;
        error?: string;
      }>
    };

    // Test 1: Basic backend connectivity
    try {
      const healthResponse = await fetch(`${BACKEND_URL}/actuator/health`);
      diagnostics.tests.health_check = {
        status: healthResponse.status,
        ok: healthResponse.ok,
        response: healthResponse.ok ? await healthResponse.json() : await healthResponse.text()
      };
    } catch (error) {
      diagnostics.tests.health_check = {
        error: (error as Error).message
      };
    }

    // Test 2: Admin info endpoint
    try {
      const adminResponse = await fetch(`${BACKEND_URL}/api/s3/admin/info`, {
        headers: { 'Authorization': authHeader }
      });
      diagnostics.tests.admin_info = {
        status: adminResponse.status,
        ok: adminResponse.ok,
        response: adminResponse.ok ? await adminResponse.json() : await adminResponse.text()
      };
    } catch (error) {
      diagnostics.tests.admin_info = {
        error: (error as Error).message
      };
    }

    // Test 3: List local files (to check export directory)
    try {
      const localFilesResponse = await fetch(`${BACKEND_URL}/api/s3/files/local`, {
        headers: { 'Authorization': authHeader }
      });
      diagnostics.tests.local_files = {
        status: localFilesResponse.status,
        ok: localFilesResponse.ok,
        response: localFilesResponse.ok ? await localFilesResponse.json() : await localFilesResponse.text()
      };
    } catch (error) {
      diagnostics.tests.local_files = {
        error: (error as Error).message
      };
    }

    // Test 4: Try a simple vets export to local
    try {
      const exportResponse = await fetch(`${BACKEND_URL}/api/s3/vets/export?filename=debug-test&source=merged&uploadToS3=false`, {
        method: 'POST',
        headers: { 'Authorization': authHeader }
      });
      diagnostics.tests.export_test = {
        status: exportResponse.status,
        ok: exportResponse.ok,
        response: exportResponse.ok ? await exportResponse.json() : await exportResponse.text()
      };
    } catch (error) {
      diagnostics.tests.export_test = {
        error: (error as Error).message
      };
    }

    return NextResponse.json(diagnostics);
  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Debug endpoint error: ' + (error as Error).message,
        stack: (error as Error).stack
      },
      { status: 500 }
    );
  }
} 
