import { ParsedQuery, RoleRequirement } from '@/types/query';

export async function parseQuery(query: string, llmClient: any): Promise<ParsedQuery> {
  const prompt = `Extract hiring requirements from this query. Return ONLY valid JSON.

Query: "${query}"

Return format:
{
  "roles": [
    {
      "title": "role name",
      "count": number,
      "seniority": "junior|mid|senior|lead|any",
      "mustHaveSkills": ["skill1", "skill2"],
      "niceToHaveSkills": ["skill3"],
      "minYearsExperience": number or null,
      "maxYearsExperience": number or null,
      "salaryRange": {"min": number, "max": number} or null,
      "softCriteria": ["criterion1"]
    }
  ]
}`;

  const response = await llmClient.chat({
    model: 'mistral-medium',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.1,
    maxTokens: 1000
  });

  const content = response.choices[0].message.content;

  // Extract JSON from markdown code blocks if present
  let jsonContent = content.trim();
  const jsonMatch = jsonContent.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (jsonMatch) {
    jsonContent = jsonMatch[1].trim();
  }

  const parsed = JSON.parse(jsonContent);

  return {
    originalQuery: query,
    roles: parsed.roles.map((r: any) => ({
      title: r.title,
      count: r.count || 1,
      seniority: r.seniority || 'any',
      mustHaveSkills: r.mustHaveSkills || [],
      niceToHaveSkills: r.niceToHaveSkills || [],
      minYearsExperience: r.minYearsExperience,
      maxYearsExperience: r.maxYearsExperience,
      salaryRange: r.salaryRange,
      softCriteria: r.softCriteria || []
    }))
  };
}
