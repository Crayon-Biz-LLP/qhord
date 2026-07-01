import { AiProvider, AiProviderConfig, AiChatRequest, AiChatResponse } from './ai-provider.interface';

const MOCK_REPLIES = [
  'Thank you for reaching out! I have analyzed the lead data and generated a personalized outreach strategy. Based on the company profile and industry trends, I recommend focusing on their key pain points around scalability and operational efficiency.',
  'I have reviewed the prospect\'s background and here is a tailored approach: highlight how your solution reduces manual outreach work by 60% and increases reply rates by 3x. Their industry typically responds well to data-driven case studies.',
  'Based on the available information, I suggest the following personalized icebreaker: "Hi {{first_name}}, I noticed {{company_name}} has been expanding rapidly in the {{industry}} space. Many teams at your stage find that automating personalized outreach at scale is a game-changer — curious if that resonates?"',
  'Analysis complete. The lead appears to be a strong fit based on company size, industry, and role. Recommended next steps: send personalized email highlighting ROI metrics, follow up on LinkedIn with a connection request mentioning the outreach.',
];

let mockIndex = 0;

const MOCK_TOOL_RESULTS: Record<string, string> = {
  apollo_search: 'Found 5 leads matching your criteria:\n1. John Smith - CTO at TechCorp\n2. Sarah Lee - VP Eng at DataFlow\n3. Mike Chen - Head of Sales at GrowthCo',
  clay_enrich: 'Enriched lead data: company_size=500, revenue=$50M, technology_stack=["salesforce","hubspot","zapier"]',
  instantly_campaign: 'Campaign draft created: "Q1 Outreach - SaaS Leaders" with 3 steps. Estimated reach: 500 contacts.',
  smartlead_sequence: 'Sequence generated: 6-email sequence with 3-day gaps. Subject line A/B testing enabled.',
  calendly_schedule: 'Available slots found for next week. Suggested: Tue 10am, Wed 2pm, Thu 11am EST.',
};

export class MockProvider implements AiProvider {
  readonly name = 'mock';

  async chat(request: AiChatRequest, _config: AiProviderConfig): Promise<AiChatResponse> {
    // Simulate latency
    await new Promise((r) => setTimeout(r, 300 + Math.random() * 500));

    const lastMessage = request.messages[request.messages.length - 1]?.content || '';
    const toolCalls: Array<{ id: string; name: string; input: Record<string, unknown> }> = [];

    // Check if tools should be invoked
    if (request.tools && request.tools.length > 0) {
      for (const tool of request.tools.slice(0, 2)) {
        toolCalls.push({
          id: `mock_tc_${Date.now()}`,
          name: tool.name,
          input: { query: lastMessage.substring(0, 50) },
        });
      }
    }

    const reply = MOCK_REPLIES[mockIndex % MOCK_REPLIES.length]
      .replace(/{{first_name}}/g, 'there')
      .replace(/{{company_name}}/g, 'your company')
      .replace(/{{industry}}/g, 'your industry');

    mockIndex++;

    return {
      content: toolCalls.length > 0
        ? `I found relevant information and prepared actions for you. ${MOCK_TOOL_RESULTS[Object.keys(MOCK_TOOL_RESULTS)[mockIndex % Object.keys(MOCK_TOOL_RESULTS).length]] || reply}`
        : reply,
      toolCalls,
      usage: {
        inputTokens: Math.floor(Math.random() * 500) + 100,
        outputTokens: Math.floor(Math.random() * 300) + 50,
      },
    };
  }
}
