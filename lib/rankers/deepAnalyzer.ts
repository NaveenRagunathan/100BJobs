import { NormalizedCandidate } from '@/types/candidate';
import { ScoredCandidate, FinalSelection } from '@/types/results';
import { RoleRequirement } from '@/types/query';
import { mistralClient } from '../llm/mistralClient';
import { buildDeepAnalysisPrompt } from '../llm/promptBuilder';

export async function performDeepAnalysis(
  topCandidates: ScoredCandidate[],
  role: RoleRequirement,
  count: number
): Promise<FinalSelection[]> {
  const candidates = topCandidates.slice(0, Math.min(50, topCandidates.length)).map(sc => sc.candidate);
  
  const prompt = buildDeepAnalysisPrompt(candidates, role, count);

  console.log(`[DEBUG] Deep analysis for ${role.title}: Processing ${candidates.length} candidates`);
  console.log(`[DEBUG] Deep analysis prompt length: ${prompt.length}`);

  try {
    const response = await mistralClient.chat({
      model: 'mistral-medium',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4,
      maxTokens: 4000
    });

    console.log(`[DEBUG] Deep analysis response received, length: ${response.choices[0].message.content.length}`);

    const content = response.choices[0].message.content;

    // Extract JSON from markdown code blocks if present, otherwise use raw content
    let jsonContent = content.trim();
    const jsonMatch = jsonContent.match(/```(?:json)?\s*([\s\S]*?)\s*```/);

    if (jsonMatch) {
      jsonContent = jsonMatch[1].trim();
      console.log(`[DEBUG] Extracted JSON from markdown, length: ${jsonContent.length}`);
    }

    try {
      const parsed = JSON.parse(jsonContent);
      console.log(`[DEBUG] Successfully parsed JSON with ${parsed.selections?.length || 0} selections`);

      return parsed.selections.map((selection: any) => {
        const candidate = candidates.find(c => c.id === selection.id);
        if (!candidate) {
          throw new Error(`Candidate ${selection.id} not found`);
        }

        return {
          candidate,
          role: role.title,
          matchPercentage: selection.matchPercentage,
          strengths: selection.strengths || [],
          concerns: selection.concerns || [],
          uniqueQualities: selection.uniqueQualities || [],
          detailedReasoning: selection.detailedReasoning,
          rank: selection.rank
        };
      }).sort((a: FinalSelection, b: FinalSelection) => a.rank - b.rank);
    } catch (parseError) {
      console.error('[DEBUG] JSON parse error in deep analysis:', parseError);
      console.error('[DEBUG] Content preview:', jsonContent.substring(0, 500));

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

        console.log(`[DEBUG] Attempting to parse heavily cleaned JSON, length: ${cleanedJson.length}`);

        // Try to fix common JSON structural issues
        if (!cleanedJson.startsWith('{')) {
          // If it doesn't start with {, try to find the first {
          const startIndex = cleanedJson.indexOf('{');
          if (startIndex > 0) {
            cleanedJson = cleanedJson.substring(startIndex);
            console.log(`[DEBUG] Extracted JSON starting from position ${startIndex}`);
          }
        }

        if (!cleanedJson.endsWith('}')) {
          // If it doesn't end with }, try to find the last }
          const lastBrace = cleanedJson.lastIndexOf('}');
          if (lastBrace > 0 && lastBrace < cleanedJson.length - 1) {
            cleanedJson = cleanedJson.substring(0, lastBrace + 1);
            console.log(`[DEBUG] Extracted JSON ending at position ${lastBrace}`);
          }
        }

        const parsed = JSON.parse(cleanedJson);
        console.log(`[DEBUG] Successfully parsed heavily cleaned JSON with ${parsed.selections?.length || 0} selections`);

        return parsed.selections.map((selection: any) => {
          const candidate = candidates.find(c => c.id === selection.id);
          if (!candidate) {
            throw new Error(`Candidate ${selection.id} not found`);
          }

          return {
            candidate,
            role: role.title,
            matchPercentage: selection.matchPercentage,
            strengths: selection.strengths || [],
            concerns: selection.concerns || [],
            uniqueQualities: selection.uniqueQualities || [],
            detailedReasoning: selection.detailedReasoning,
            rank: selection.rank
          };
        }).sort((a: FinalSelection, b: FinalSelection) => a.rank - b.rank);
      } catch (cleanParseError) {
        console.error('[DEBUG] Heavily cleaned JSON still failed:', cleanParseError);
        console.error('[DEBUG] Final cleaned content preview:', jsonContent.substring(0, 200));
        throw cleanParseError; // Re-throw to trigger fallback
      }
    }
  } catch (error) {
    console.error('[DEBUG] Error in deep analysis API call:', error);
    throw error; // Re-throw to trigger fallback
  }
}


export async function selectMultiRoleCandidates(
  allCandidates: NormalizedCandidate[],
  roles: RoleRequirement[],
  onProgress?: (stage: string, roleIndex: number, totalRoles: number) => void
): Promise<FinalSelection[]> {
  const allSelections: FinalSelection[] = [];
  const remainingCandidates = [...allCandidates];

  for (let i = 0; i < roles.length; i++) {
    const role = roles[i];
    
    if (onProgress) {
      onProgress(`Processing role: ${role.title}`, i + 1, roles.length);
    }

    // Import and use filtering and scoring
    const { applyRuleBasedFilter } = await import('../filters/ruleBasedFilter');
    const { processCandidatesInBatches } = await import('../llm/batchProcessor');

    // Phase 1: Filter
    const filtered = applyRuleBasedFilter(remainingCandidates, {
      skills: role.mustHaveSkills,
      minExperience: role.minYearsExperience,
      maxExperience: role.maxYearsExperience,
      salaryMax: role.salaryRange?.max,
    });

    // Phase 2: Score
    const scored = await processCandidatesInBatches(filtered, role);

    // Phase 3: Deep analysis
    const selections = await performDeepAnalysis(scored, role, role.count);

    // Add to results
    allSelections.push(...selections);

    // Remove selected candidates from pool
    const selectedIds = selections.map(s => s.candidate.id);
    for (let j = remainingCandidates.length - 1; j >= 0; j--) {
      if (selectedIds.includes(remainingCandidates[j].id)) {
        remainingCandidates.splice(j, 1);
      }
    }
  }

  return allSelections;
}
