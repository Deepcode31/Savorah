import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

const app = express();
app.use(express.json({ limit: '10mb' }));

const PORT = 3000;

// Initialize Google GenAI
const getAIClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is not configured in process.env');
  }
  return new GoogleGenAI({
    apiKey: apiKey || '',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// ------------------- API ROUTES -------------------

// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Savorah AI Engine' });
});

// 2. AI Budget Recommendation
app.post('/api/gemini/budget-recommendation', async (req, res) => {
  try {
    const { persona, monthlyIncome, goals } = req.body;
    const ai = getAIClient();

    const prompt = `Act as an expert financial planner for Savorah.
User Persona: ${persona}
Monthly Income: $${monthlyIncome}
Financial Goals: ${JSON.stringify(goals || [])}

Provide a starter monthly budget allocation breakdown in JSON format.
Include recommended category limits for:
- Housing & Rent
- Groceries & Dining
- Utilities & Bills
- Transport & Fuel
- Entertainment & Leisure
- Investments & Savings
- Healthcare & Medical
- Emergency Buffer

Provide concise, encouraging actionable advice for a ${persona}.
Return JSON matching:
{
  "recommendedBudgets": [
    { "category": string, "recommendedLimit": number, "percentage": number, "reason": string }
  ],
  "savingsTargetRecommended": number,
  "topAdvice": [string, string, string]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    res.json(JSON.parse(response.text || '{}'));
  } catch (error: any) {
    console.error('Error generating budget recommendation:', error);
    res.status(500).json({ error: error.message || 'Failed to generate budget recommendation' });
  }
});

// 3. AI Transaction Smart Categorization
app.post('/api/gemini/auto-categorize', async (req, res) => {
  try {
    const { title, amount, persona } = req.body;
    const ai = getAIClient();

    const prompt = `Categorize this financial transaction for Savorah:
Title/Description: "${title}"
Amount: $${amount}
User Persona: ${persona}

Categories available:
- Housing & Rent
- Groceries & Dining
- Utilities & Bills
- Entertainment & Leisure
- Education & Books
- Healthcare & Medical
- Transport & Fuel
- Investments & Savings
- Shopping & Apparel
- Childcare & Family
- Salary & Allowance
- Other

Return JSON:
{
  "category": "string",
  "isEssential": boolean,
  "tags": ["string"],
  "insight": "1 sentence note on whether this aligns with standard spending"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    res.json(JSON.parse(response.text || '{}'));
  } catch (error: any) {
    console.error('Auto categorize error:', error);
    res.status(500).json({ error: error.message || 'Auto categorize failed' });
  }
});

// 4. AI Spending Insights & Anomaly Detector
app.post('/api/gemini/insights', async (req, res) => {
  try {
    const { persona, transactions, budgets, monthlyIncome } = req.body;
    const ai = getAIClient();

    const prompt = `Analyze these recent transactions and budget allocations for Savorah:
Persona: ${persona}
Monthly Income: $${monthlyIncome}
Budgets: ${JSON.stringify(budgets)}
Transactions: ${JSON.stringify(transactions)}

Identify spending patterns, potential cash flow leaks, over-budget warnings, and 3 actionable savings tips tailored to a ${persona}.

Return JSON:
{
  "healthScore": number (1 to 100),
  "statusSummary": string,
  "anomaliesDetected": [{ "title": string, "description": string, "severity": "high" | "medium" | "low" }],
  "savingsOpportunities": [string, string],
  "monthlyForecast": { "projectedSavings": number, "burnRatePercentage": number }
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    res.json(JSON.parse(response.text || '{}'));
  } catch (error: any) {
    console.error('Insights error:', error);
    res.status(500).json({ error: error.message || 'Failed to analyze spending' });
  }
});

// 5. AI Financial Coach Chatbot (Multi-turn chat with optional High Thinking or Search Grounding)
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { messages, userContext, enableThinking, enableSearch } = req.body;
    const ai = getAIClient();

    const systemInstruction = `You are "Savorah AI", a friendly, empathetic, highly intelligent financial coach.
Current User Context:
- Name: ${userContext?.name || 'User'}
- Persona: ${userContext?.persona || 'professional'}
- Monthly Income: $${userContext?.monthlyIncome || 0}
- Current Total Expenses: $${userContext?.totalExpense || 0}
- Net Savings: $${userContext?.netSavings || 0}
- Top Categories Spent: ${JSON.stringify(userContext?.topCategories || [])}

Goal: Provide practical, jargon-free financial advice, budgeting strategy, tax tips, or savings hacks.
Keep tone tailored:
- If Student: encouraging, practical, focused on small daily savings & habits.
- If Professional: analytical, investment-smart, goal-oriented.
- If Family: supportive, household-focused, bill planning & emergency buffers.
- If Senior: patient, clear, reassuring, focused on fixed income preservation.`;

    // Determine model
    let modelName = 'gemini-3.5-flash';
    if (enableThinking) {
      modelName = 'gemini-3.1-pro-preview';
    }

    const config: any = {
      systemInstruction,
    };

    if (enableThinking) {
      config.thinkingConfig = { thinkingLevel: ThinkingLevel.HIGH };
    }

    if (enableSearch) {
      config.tools = [{ googleSearch: {} }];
    }

    // Format chat history
    const contents = messages.map((m: any) => ({
      role: m.sender === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }],
    }));

    const response = await ai.models.generateContent({
      model: modelName,
      contents,
      config,
    });

    // Extract grounding search metadata if present
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const groundingUrls = groundingChunks?.map((c: any) => ({
      title: c.web?.title || 'Source',
      uri: c.web?.uri || '',
    })).filter((c: any) => c.uri);

    res.json({
      text: response.text || 'I apologize, I could not generate a response.',
      groundingUrls: groundingUrls || [],
    });
  } catch (error: any) {
    console.error('Chat error:', error);
    res.status(500).json({ error: error.message || 'Chatbot execution failed' });
  }
});

// 6. AI Financial Vision Board Image Generator
app.post('/api/gemini/image', async (req, res) => {
  try {
    const { prompt, aspectRatio, imageSize } = req.body;
    const ai = getAIClient();

    const fullPrompt = `A inspiring, sleek, modern digital artwork depicting financial goal and dream: ${prompt}. Clean white and emerald green lighting, high resolution photorealistic render.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-image',
      contents: {
        parts: [{ text: fullPrompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio || '1:1',
          imageSize: imageSize || '1K',
        },
      },
    });

    let imageUrl = '';
    let textNote = '';

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const base64Data = part.inlineData.data;
          const mime = part.inlineData.mimeType || 'image/png';
          imageUrl = `data:${mime};base64,${base64Data}`;
        } else if (part.text) {
          textNote = part.text;
        }
      }
    }

    if (!imageUrl) {
      // Fallback placeholder image if model returns text only
      imageUrl = `https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&q=80&w=800`;
    }

    res.json({ imageUrl, textNote });
  } catch (error: any) {
    console.error('Image generation error:', error);
    res.status(500).json({ error: error.message || 'Image generation failed' });
  }
});

// 7. AI Monthly Summary Report
app.post('/api/gemini/monthly-report', async (req, res) => {
  try {
    const { persona, totalIncome, totalExpense, topCategories, savingsRate } = req.body;
    const ai = getAIClient();

    const prompt = `Write a clean, beautifully formatted plain-language Monthly Financial Review report for a Savorah user.
Persona: ${persona}
Total Income: $${totalIncome}
Total Expense: $${totalExpense}
Savings Rate: ${savingsRate}%
Top Category Expenses: ${JSON.stringify(topCategories)}

Generate JSON:
{
  "headline": string,
  "executiveSummary": string,
  "keyHighlights": [string, string, string],
  "recommendationNextMonth": string
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    res.json(JSON.parse(response.text || '{}'));
  } catch (error: any) {
    console.error('Monthly report error:', error);
    res.status(500).json({ error: error.message || 'Report generation failed' });
  }
});

// ------------------- VITE MIDDLEWARE / PRODUCTION -------------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
