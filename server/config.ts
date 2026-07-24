import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/savorah_app',
  jwtSecret: process.env.JWT_SECRET || 'savorah-dev-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  appUrl: process.env.APP_URL || 'http://localhost:5000',
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER || '',
    // Gmail app passwords are often pasted with spaces — strip them.
    pass: (process.env.SMTP_PASS || '').replace(/\s+/g, ''),
    from: process.env.SMTP_FROM || process.env.SMTP_USER || 'support.savorah@gmail.com',
  },
  openRouter: {
    apiKey: process.env.OPENROUTER_API_KEY || '',
    baseUrl: 'https://openrouter.ai/api/v1/chat/completions',
    models: {
      chat: process.env.OPENROUTER_MODEL_CHAT || 'meta-llama/llama-3.3-70b-instruct:free',
      json: process.env.OPENROUTER_MODEL_JSON || 'openai/gpt-oss-20b:free',
      fast: process.env.OPENROUTER_MODEL_FAST || 'meta-llama/llama-3.2-3b-instruct:free',
      vision: process.env.OPENROUTER_MODEL_VISION || 'google/gemma-4-26b-a4b-it:free',
      fallback: 'openrouter/free',
    },
  },
};
