import { NextRequest, NextResponse } from 'next/server';
import { unparse } from 'papaparse';
import { FinalSelection } from '@/types/results';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { results } = body as { results: FinalSelection[] };

    if (!results || !Array.isArray(results)) {
      return NextResponse.json(
        { error: 'Invalid results data' },
        { status: 400 }
      );
    }

    const csvData = results.map(result => ({
      Rank: result.rank,
      Name: result.candidate.name,
      Email: result.candidate.email,
      Phone: result.candidate.phone || 'N/A',
      Role: result.role,
      'Match %': result.matchPercentage,
      'Years Experience': result.candidate.yearsOfExperience || 0,
      Skills: result.candidate.skills.join('; '),
      Strengths: result.strengths.join('; '),
      Concerns: result.concerns.join('; '),
      'Unique Qualities': result.uniqueQualities.join('; '),
      Reasoning: result.detailedReasoning,
      Location: result.candidate.location || 'N/A',
      Portfolio: result.candidate.portfolio || 'N/A',
      GitHub: result.candidate.github || 'N/A',
      LinkedIn: result.candidate.linkedin || 'N/A'
    }));

    const csv = unparse(csvData);

    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="candidates_${Date.now()}.csv"`
      }
    });

  } catch (error: any) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to export results' },
      { status: 500 }
    );
  }
}
