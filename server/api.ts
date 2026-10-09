import type { IncomingMessage, ServerResponse } from 'node:http';
import { ai } from './gemini.ts';

interface RequestBody {
  [key: string]: any;
}

async function parseBody(req: IncomingMessage): Promise<RequestBody> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res: ServerResponse, statusCode: number, data: any) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.end(JSON.stringify(data));
}

export async function handleApiRoute(
  req: IncomingMessage,
  res: ServerResponse,
  urlPath: string
): Promise<boolean> {
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.end();
    return true;
  }

  if (urlPath === '/api/prompt/enhance' && req.method === 'POST') {
    try {
      const { prompt, language = 'uz', framework = 'auto' } = await parseBody(req);
      if (!prompt || typeof prompt !== 'string') {
        sendJson(res, 400, { error: 'Prompt matni kiritilishi shart' });
        return true;
      }

      const systemInstruction = `You are a world-class Prompt Engineering specialist.
Your task is to take a raw, imperfect user prompt and transform it into an elite, highly effective, structured prompt.
Target language for explanations and analysis: ${language === 'uz' ? 'Uzbek (Oʻzbekcha)' : 'English'}.
The enhanced prompt itself should be in the language best suited for the user's intent (or maintain the original language).

You MUST output ONLY valid JSON in the exact schema below, without markdown ticks:
{
  "originalPrompt": string,
  "enhancedPrompt": string,
  "title": string,
  "framework": string,
  "score": number, // 0 to 100
  "metrics": {
    "clarity": number, // 0 to 100
    "specificity": number, // 0 to 100
    "context": number, // 0 to 100
    "guardrails": number, // 0 to 100
    "formatting": number // 0 to 100
  },
  "sections": {
    "role": string,
    "context": string,
    "instructions": string,
    "outputFormat": string,
    "constraints": string
  },
  "variables": string[], // list of detected placeholders, e.g. ["[mavzu]", "[til]"]
  "improvementSummary": string,
  "tips": string[]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Raw prompt to optimize: "${prompt}". Preferred framework: ${framework}. Optimize it to the highest standard.`,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          temperature: 0.7,
        },
      });

      const responseText = response.text || '{}';
      let parsed;
      try {
        parsed = JSON.parse(responseText);
      } catch {
        // Fallback cleanup if model returned markdown
        const cleaned = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        parsed = JSON.parse(cleaned);
      }

      sendJson(res, 200, parsed);
      return true;
    } catch (err: any) {
      console.error('Enhance API error:', err);
      sendJson(res, 500, {
        error: err.message || 'Xatolik yuz berdi',
      });
      return true;
    }
  }

  if (urlPath === '/api/prompt/generate' && req.method === 'POST') {
    try {
      const {
        goal,
        category = 'general',
        framework = 'CLEAR',
        tone = 'professional',
        targetAudience = 'general',
        outputType = 'detailed',
        language = 'uz',
      } = await parseBody(req);

      if (!goal) {
        sendJson(res, 400, { error: 'Maqsad yoki vazifa ko\'rsatilishi zarur' });
        return true;
      }

      const systemInstruction = `You are an expert Prompt Architect.
Generate an exceptionally crafted, production-ready system prompt based on user goals and settings.
Language of UI / explanations: ${language === 'uz' ? 'Uzbek (Oʻzbekcha)' : 'English'}.
Framework chosen: ${framework} (e.g. CLEAR: Context, Limitations, Examples, Action, Result | RTF: Role, Task, Format | Chain-of-Thought).

Respond ONLY with valid JSON with this schema:
{
  "title": string,
  "description": string,
  "framework": string,
  "prompt": string,
  "systemRole": string,
  "exampleInputs": string[],
  "variables": string[],
  "tags": string[],
  "proTips": string[]
}`;

      const userContent = `Goal: ${goal}
Category: ${category}
Framework: ${framework}
Tone: ${tone}
Target Audience: ${targetAudience}
Output Type: ${outputType}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: userContent,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          temperature: 0.7,
        },
      });

      const text = response.text || '{}';
      const parsed = JSON.parse(text);
      sendJson(res, 200, parsed);
      return true;
    } catch (err: any) {
      console.error('Generate API error:', err);
      sendJson(res, 500, { error: err.message || 'Prompt yaratishda xatolik yuz berdi' });
      return true;
    }
  }

  if (urlPath === '/api/prompt/execute' && req.method === 'POST') {
    try {
      const { prompt, systemInstruction = '', temperature = 0.7 } = await parseBody(req);
      if (!prompt) {
        sendJson(res, 400, { error: 'Prompt kiritilishi shart' });
        return true;
      }

      const startTime = Date.now();
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: systemInstruction || undefined,
          temperature: typeof temperature === 'number' ? temperature : 0.7,
        },
      });
      const durationMs = Date.now() - startTime;
      const text = response.text || '';

      // Estimate tokens
      const estimatedTokens = Math.round((prompt.length + text.length) / 4);

      sendJson(res, 200, {
        output: text,
        durationMs,
        estimatedTokens,
        model: 'gemini-3.8-flash',
      });
      return true;
    } catch (err: any) {
      console.error('Execute API error:', err);
      sendJson(res, 500, { error: err.message || 'Gemini modelini ishga tushirishda xatolik' });
      return true;
    }
  }

  if (urlPath === '/api/prompt/compare' && req.method === 'POST') {
    try {
      const { rawPrompt, enhancedPrompt } = await parseBody(req);
      if (!rawPrompt || !enhancedPrompt) {
        sendJson(res, 400, { error: 'Ikkala prompt ham kiritilishi shart' });
        return true;
      }

      const start1 = Date.now();
      const res1 = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: rawPrompt,
      });
      const dur1 = Date.now() - start1;

      const start2 = Date.now();
      const res2 = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: enhancedPrompt,
      });
      const dur2 = Date.now() - start2;

      sendJson(res, 200, {
        rawOutput: res1.text || '',
        rawDurationMs: dur1,
        enhancedOutput: res2.text || '',
        enhancedDurationMs: dur2,
      });
      return true;
    } catch (err: any) {
      console.error('Compare API error:', err);
      sendJson(res, 500, { error: err.message || 'Taqqoslashda xatolik' });
      return true;
    }
  }

  if (urlPath === '/api/prompt/reverse' && req.method === 'POST') {
    try {
      const { sampleOutput, language = 'uz' } = await parseBody(req);
      if (!sampleOutput) {
        sendJson(res, 400, { error: 'Namuna matn yoki natija kiritilishi zarur' });
        return true;
      }

      const systemInstruction = `You are a Reverse-Engineering Prompt Expert.
Given an AI output or final text, reconstruct the EXACT prompt, system instructions, tone, and constraints that would generate this result.
Target language for metadata & explanation: ${language === 'uz' ? 'Uzbek (Oʻzbekcha)' : 'English'}.

Respond ONLY with valid JSON in this schema:
{
  "deducedRole": string,
  "deducedObjective": string,
  "reconstructedPrompt": string,
  "systemInstruction": string,
  "toneAndStyle": string,
  "recommendedVariables": string[],
  "explanation": string
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Analyze this AI output and reverse-engineer the prompt that generated it:\n\n${sampleOutput}`,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          temperature: 0.5,
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      sendJson(res, 200, parsed);
      return true;
    } catch (err: any) {
      console.error('Reverse API error:', err);
      sendJson(res, 500, { error: err.message || 'Promptni teskari tahlil qilishda xatolik' });
      return true;
    }
  }

  return false;
}
