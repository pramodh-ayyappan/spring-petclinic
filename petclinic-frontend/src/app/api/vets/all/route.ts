import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://petclinic-be.default.svc.cluster.local:8080';

export async function GET() {
  try {
    // Fetch data from different sources to provide complete information
    const [mergedResponse, databaseResponse, additionalResponse] = await Promise.all([
      fetch(`${BACKEND_URL}/api/vets/all?source=merged`),
      fetch(`${BACKEND_URL}/api/vets/all?source=database`),
      fetch(`${BACKEND_URL}/api/vets/all?source=additional`)
    ]);
    
    if (!mergedResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch vets data' },
        { status: mergedResponse.status }
      );
    }
    
    const [mergedData, databaseData, additionalData] = await Promise.all([
      mergedResponse.json(),
      databaseResponse.ok ? databaseResponse.json() : [],
      additionalResponse.ok ? additionalResponse.json() : []
    ]);
    
    // Build response with data source information
    const response = {
      vets: mergedData,
      dataSource: {
        type: 'merged',
        counts: {
          total: mergedData.length,
          database: databaseData.length,
          additional: additionalData.length,
          merged: mergedData.length
        },
        sources: {
          database: databaseData.length > 0,
          additionalJson: additionalData.length > 0,
          merged: true
        },
        description: `Showing ${mergedData.length} vets total (${databaseData.length} from database${additionalData.length > 0 ? ` + ${additionalData.length} from JSON file` : ''})`
      }
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching vets:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
