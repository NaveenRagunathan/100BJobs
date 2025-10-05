import { NormalizedCandidate } from '@/types/candidate';
import { ScoredCandidate } from '@/types/results';
import { RoleRequirement } from '@/types/query';
import { mistralClient } from './mistralClient';
import { buildBatchScoringPrompt } from './promptBuilder';

const BATCH_SIZE = 100;

export async function processCandidatesInBatches(
  candidates: NormalizedCandidate[],
  role: RoleRequirement,
  onProgress?: (current: number, total: number) => void
): Promise<ScoredCandidate[]> {
  const batches: NormalizedCandidate[][] = [];
  
  // Split into batches
  for (let i = 0; i < candidates.length; i += BATCH_SIZE) {
    batches.push(candidates.slice(i, i + BATCH_SIZE));
  }

  const totalBatches = batches.length;
  const allScored: ScoredCandidate[] = [];

  // Process batches in parallel (max 3 at a time to avoid rate limits)
  const maxParallel = 3;
  for (let i = 0; i < batches.length; i += maxParallel) {
    const batchPromises = batches.slice(i, i + maxParallel).map(async (batch, index) => {
      const batchNumber = i + index + 1;
      if (onProgress) {
        onProgress(batchNumber, totalBatches);
      }

      return await scoreBatch(batch, role);
    });

    const results = await Promise.all(batchPromises);
    results.forEach(scored => allScored.push(...scored));
  }

  // Sort by score descending
  return allScored.sort((a, b) => b.score - a.score);
}

async function scoreBatch(
  candidates: NormalizedCandidate[],
  role: RoleRequirement
): Promise<ScoredCandidate[]> {
  const prompt = buildBatchScoringPrompt(candidates, role);

  try {
    const response = await mistralClient.chat({
      model: 'mistral-medium',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      maxTokens: 3000
    });

    const content = response.choices[0].message.content;

    // Extract JSON from markdown code blocks if present, otherwise use raw content
    let jsonContent = content.trim();
    const jsonMatch = jsonContent.match(/```(?:json)?\s*([\s\S]*?)\s*```/);

    if (jsonMatch) {
      jsonContent = jsonMatch[1].trim();
    }

    try {
      const parsed = JSON.parse(jsonContent);
      return parsed.scores.map((score: any) => {
        const candidate = candidates.find(c => c.id === score.id);
        if (!candidate) {
          throw new Error(`Candidate ${score.id} not found in batch`);
        }

        return {
          candidate,
          score: score.score,
          briefReasoning: score.reason,
          role: role.title
        };
      });
    } catch (parseError) {
      console.error('JSON parse error, trying cleanup:', parseError);

      // Try to fix common JSON issues
      try {
        // First, try to extract just the JSON part if it's mixed with other content
        let cleanedJson = jsonContent;

        // More aggressive markdown and control character removal
        cleanedJson = cleanedJson
          // Remove all markdown formatting - handle nested cases
          .replace(/\*\*(.*?)\*\*/gs, '$1') // Remove bold markdown (global, multiline)
          .replace(/\*(.*?)\*/gs, '$1')     // Remove italic markdown (global, multiline)
          .replace(/`(.*?)`/gs, '$1')       // Remove inline code markdown (global, multiline)
          .replace(/__(.*?)__/gs, '$1')     // Remove underline markdown (global, multiline)
          .replace(/~~(.*?)~~/gs, '$1')     // Remove strikethrough markdown (global, multiline)
          .replace(/#{1,6}\s*/g, '')        // Remove headers
          .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // Remove links but keep text
          .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1') // Remove images but keep alt text
          .replace(/>\s*/g, '')             // Remove blockquotes
          .replace(/[-*_]{3,}/g, '')        // Remove horizontal rules
          // Handle control characters more aggressively
          .replace(/[\u0000-\u001F\u007F-\u009F]/g, ' ')
          .replace(/[\r\n]+/g, ' ')         // Replace line breaks with spaces
          .replace(/,\s*([}\]])/g, '$1')    // Fix trailing commas
          .replace(/\s+/g, ' ')             // Normalize whitespace
          .trim();

        const parsed = JSON.parse(cleanedJson);
        return parsed.scores.map((score: any) => {
          const candidate = candidates.find(c => c.id === score.id);
          if (!candidate) {
            throw new Error(`Candidate ${score.id} not found in batch`);
          }

          return {
            candidate,
            score: score.score,
            briefReasoning: score.reason,
            role: role.title
          };
        });
      } catch (cleanParseError) {
        console.error('Cleaned JSON still failed, using fallback:', cleanParseError);
        throw cleanParseError; // Re-throw to trigger fallback
      }
    }
  } catch (error) {
    console.error('Error scoring batch:', error);
    // Fallback: return candidates with default scores
    return candidates.map(candidate => ({
      candidate,
      score: 50,
      briefReasoning: 'Error during scoring',
      role: role.title
    }));
  }
}
