import { NextRequest } from 'next/server';
import { cacheManager } from '@/lib/utils/cacheManager';
import { parseQuery } from '@/lib/parsers/queryParser';
import { applyRuleBasedFilter } from '@/lib/filters/ruleBasedFilter';
import { processCandidatesInBatches } from '@/lib/llm/batchProcessor';
import { performDeepAnalysis } from '@/lib/rankers/deepAnalyzer';
import { mistralClient } from '@/lib/llm/mistralClient';
import { ProcessingProgress } from '@/types/results';

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const sendProgress = (progress: ProcessingProgress) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(progress)}\n\n`));
      };

      try {
        const body = await request.json();
        const { sessionId, query } = body;

        if (!sessionId || !query) {
          sendProgress({
            stage: 'error',
            message: 'Missing sessionId or query',
            percentage: 0
          });
          controller.close();
          return;
        }

        // Get session data
        const session = cacheManager.getSession(sessionId);
        if (!session) {
          sendProgress({
            stage: 'error',
            message: 'Session expired or not found. Please re-upload your file.',
            percentage: 0
          });
          controller.close();
          return;
        }

        const candidates = session.candidates;
        console.log(`[DEBUG] Processing ${candidates.length} candidates for session ${sessionId}`);

        // Step 1: Parse query
        sendProgress({
          stage: 'parsing',
          message: 'Understanding your requirements...',
          percentage: 5
        });

        const parsedQuery = await parseQuery(query, mistralClient);
        console.log(`[DEBUG] Parsed query:`, parsedQuery);
        const totalPositions = parsedQuery.roles.reduce((sum, role) => sum + role.count, 0);

        // Process each role
        let currentPosition = 0;
        const allSelections = [];

        for (let roleIndex = 0; roleIndex < parsedQuery.roles.length; roleIndex++) {
          const role = parsedQuery.roles[roleIndex];
          const roleProgress = (roleIndex / parsedQuery.roles.length) * 100;

          // Phase 1: Filter
          sendProgress({
            stage: 'filtering',
            message: `Pre-filtering candidates for ${role.title}...`,
            percentage: 10 + roleProgress * 0.2,
            totalCandidates: candidates.length
          });

          const filtered = applyRuleBasedFilter(candidates, {
            skills: role.mustHaveSkills,
            minExperience: role.minYearsExperience,
            maxExperience: role.maxYearsExperience,
            salaryMax: role.salaryRange?.max,
          });

          console.log(`[DEBUG] Role: ${role.title}, Filtered from ${candidates.length} to ${filtered.length} candidates`);
          console.log(`[DEBUG] Filter criteria:`, {
            skills: role.mustHaveSkills,
            minExperience: role.minYearsExperience,
            maxExperience: role.maxYearsExperience,
            salaryMax: role.salaryRange?.max,
          });

          sendProgress({
            stage: 'filtering',
            message: `Filtered to ${filtered.length} candidates for ${role.title}`,
            percentage: 30 + roleProgress * 0.2,
            candidatesProcessed: filtered.length,
            totalCandidates: candidates.length
          });

          if (filtered.length === 0) {
            sendProgress({
              stage: 'error',
              message: `No candidates match the requirements for ${role.title}. Try broadening your criteria.`,
              percentage: 30 + roleProgress * 0.2
            });
            continue;
          }

          // Phase 2: Batch scoring
          sendProgress({
            stage: 'scoring',
            message: `Scoring candidates for ${role.title}...`,
            percentage: 40 + roleProgress * 0.3
          });

          const scored = await processCandidatesInBatches(
            filtered,
            role,
            (current, total) => {
              sendProgress({
                stage: 'scoring',
                message: `Scoring batch ${current} of ${total} for ${role.title}...`,
                percentage: 40 + roleProgress * 0.3 + ((current / total) * 20),
                currentBatch: current,
                totalBatches: total
              });
            }
          );

          // Phase 3: Deep analysis
          sendProgress({
            stage: 'analyzing',
            message: `Performing deep analysis for ${role.title}...`,
            percentage: 70 + roleProgress * 0.25
          });

          const selections = await performDeepAnalysis(scored, role, role.count);
          allSelections.push(...selections);

          currentPosition += role.count;
        }

        // Send final results
        console.log(`[DEBUG] Processing complete. Found ${allSelections.length} selections`);
        sendProgress({
          stage: 'complete',
          message: `Found ${allSelections.length} perfect candidates!`,
          percentage: 100
        });

        // Send results
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
          stage: 'complete',
          results: allSelections
        })}\n\n`));

        controller.close();

      } catch (error: any) {
        console.error('Processing error:', error);
        sendProgress({
          stage: 'error',
          message: error.message || 'An error occurred during processing',
          percentage: 0
        });
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
