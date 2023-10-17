import ddl from './ddl';

interface OpenAIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: 'user' | 'system' | 'assistant';
      content: string;
      finish_reason: 'stop' | 'max_tokens' | 'timeout';
    };
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}
export class OpenAI {
  private headers: Record<string, string>;
  private readonly promptBase: string = `あなたはSQLマスターです。Google Cloud の BigQuery を考慮して質問されたものに対して適切なSQLを返答してください。DDLは以下です。`;
  private readonly baseURL = 'https://api.openai.com/v1/chat/completions';
  private readonly settings = {
    model: 'gpt-3.5-turbo',
    temperature: 1,
    max_tokens: 500,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  };

  constructor() {
    this.promptBase += ddl;
    this.headers = {
      'content-type': 'application/json',
    };
  }

  public async createCompletion(
    apiKey: string,
    prompt: string
  ): Promise<string> {
    this.headers['authorization'] = `Bearer ${apiKey}`;

    const messages = [
      {role: 'system', content: this.promptBase},
      {role: 'user', content: prompt},
    ];

    const res = await fetch(this.baseURL, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({
        ...this.settings,
        messages,
      }),
    });

    if (!res.ok) {
      throw new Error(res.statusText);
    }

    const json: OpenAIResponse = await res.json();

    return json.choices[0].message.content;
  }
}
