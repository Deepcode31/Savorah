import { Transaction } from '../types';
import { api } from './api';

export interface ExtractedTransaction {
  title: string;
  amount: number;
  type: 'expense' | 'income';
  category: string;
  date: string;
  paymentMethod: string;
  notes?: string;
  isEssential?: boolean;
  tags?: string[];
  confidence: number;
  source: 'receipt' | 'statement' | 'sms' | 'manual';
}

export interface StatementRow extends ExtractedTransaction {
  id: string;
  isDuplicate?: boolean;
  selected: boolean;
}

const MERCHANT_MAP: Record<string, { category: string; isEssential: boolean; tags: string[] }> = {
  swiggy: { category: 'Groceries & Dining', isEssential: true, tags: ['food', 'delivery'] },
  zomato: { category: 'Groceries & Dining', isEssential: true, tags: ['food', 'delivery'] },
  uber: { category: 'Transport & Fuel', isEssential: false, tags: ['transport', 'cab'] },
  ola: { category: 'Transport & Fuel', isEssential: false, tags: ['transport', 'cab'] },
  amazon: { category: 'Shopping & Apparel', isEssential: false, tags: ['online', 'shopping'] },
  flipkart: { category: 'Shopping & Apparel', isEssential: false, tags: ['online', 'shopping'] },
  netflix: { category: 'Entertainment & Leisure', isEssential: false, tags: ['streaming'] },
  airtel: { category: 'Utilities & Bills', isEssential: true, tags: ['telecom'] },
  jio: { category: 'Utilities & Bills', isEssential: true, tags: ['telecom'] },
  salary: { category: 'Salary & Allowance', isEssential: true, tags: ['income', 'salary'] },
};

function detectCategoryFromText(text: string) {
  const lower = text.toLowerCase();
  for (const [kw, data] of Object.entries(MERCHANT_MAP)) {
    if (lower.includes(kw)) return { ...data, confidence: 88 };
  }
  return { category: 'Other', isEssential: false, tags: [] as string[], confidence: 55 };
}

/** Offline regex fallback when AI is unavailable. */
function parseSMSLocal(text: string): ExtractedTransaction {
  const amountMatch =
    text.match(/(?:Rs\.?|₹|INR)\s*([\d,]+(?:\.\d+)?)/i) ||
    text.match(/([\d,]+(?:\.\d+)?)\s*(?:Rs\.?|₹|INR)/i);
  const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : 0;

  const merchantMatch = text.match(
    /(?:\bat\b|\bto\b|\bfrom\b|@)\s+([A-Za-z][A-Za-z0-9\s&'.,-]{2,35}?)(?:\s+on\b|\s+via\b|\s+Ref\b|\.|\n|$)/i
  );
  const merchant = merchantMatch ? merchantMatch[1].trim() : 'Bank Alert';

  let paymentMethod = 'UPI / Cash';
  if (/credit\s*card/i.test(text)) paymentMethod = 'Credit Card';
  else if (/debit\s*card/i.test(text)) paymentMethod = 'Debit Card';
  else if (/neft|imps|rtgs|bank\s*transfer/i.test(text)) paymentMethod = 'Bank Transfer';

  const isIncome = /credited|received|salary|refund|deposited/i.test(text);
  const { category, isEssential, tags, confidence } = detectCategoryFromText(merchant + ' ' + text);

  return {
    title: merchant,
    amount,
    type: isIncome ? 'income' : 'expense',
    category,
    date: new Date().toISOString().split('T')[0],
    paymentMethod,
    isEssential,
    tags,
    confidence,
    source: 'sms',
    notes: 'Parsed offline (AI unavailable)',
  };
}

export async function parseSMS(text: string): Promise<ExtractedTransaction> {
  try {
    const data = await api<{ transaction: ExtractedTransaction }>('/api/ai/parse-sms', {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
    return { ...data.transaction, source: 'sms' };
  } catch (err) {
    console.warn('AI SMS parse failed, using local parser:', err);
    const local = parseSMSLocal(text);
    if (!local.amount) throw err;
    return local;
  }
}

function fileToBase64(file: File): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || '');
      resolve({ base64: result, mimeType: file.type || 'image/jpeg' });
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

function fileToText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

/** Naive CSV parser — handles quoted fields. */
export function parseCsvToRows(csv: string): Array<{ date: string; title: string; amount: number; type: 'expense' | 'income' }> {
  const lines = csv
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length < 2) return [];

  const split = (line: string) => {
    const out: string[] = [];
    let cur = '';
    let inQ = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        inQ = !inQ;
        continue;
      }
      if (ch === ',' && !inQ) {
        out.push(cur.trim());
        cur = '';
        continue;
      }
      cur += ch;
    }
    out.push(cur.trim());
    return out;
  };

  const headers = split(lines[0]).map((h) => h.toLowerCase());
  const dateIdx = headers.findIndex((h) => /date|txn\s*date|transaction\s*date|value\s*date/.test(h));
  const descIdx = headers.findIndex((h) => /desc|narration|particular|merchant|details|remark/.test(h));
  const amountIdx = headers.findIndex((h) => /^amount$|txn\s*amount|transaction\s*amount/.test(h));
  const debitIdx = headers.findIndex((h) => /debit|withdrawal|dr/.test(h));
  const creditIdx = headers.findIndex((h) => /credit|deposit|cr/.test(h));

  const rows: Array<{ date: string; title: string; amount: number; type: 'expense' | 'income' }> = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = split(lines[i]);
    const title = (descIdx >= 0 ? cols[descIdx] : cols[1]) || 'Transaction';
    let amount = 0;
    let type: 'expense' | 'income' = 'expense';

    if (amountIdx >= 0) {
      const raw = (cols[amountIdx] || '').replace(/[₹,Rs\.\s]/gi, '');
      amount = Math.abs(parseFloat(raw) || 0);
      if (raw.startsWith('-') || /dr|debit/i.test(cols[amountIdx] || '')) type = 'expense';
      else if (/cr|credit/i.test(cols[amountIdx] || '')) type = 'income';
    } else if (debitIdx >= 0 || creditIdx >= 0) {
      const debit = parseFloat((cols[debitIdx] || '0').replace(/[₹,\s]/g, '')) || 0;
      const credit = parseFloat((cols[creditIdx] || '0').replace(/[₹,\s]/g, '')) || 0;
      if (credit > 0) {
        amount = credit;
        type = 'income';
      } else {
        amount = debit;
        type = 'expense';
      }
    }

    if (!amount) continue;

    let date = new Date().toISOString().slice(0, 10);
    if (dateIdx >= 0 && cols[dateIdx]) {
      const parsed = new Date(cols[dateIdx]);
      if (!isNaN(parsed.getTime())) date = parsed.toISOString().slice(0, 10);
    }

    rows.push({ date, title, amount, type });
  }

  return rows;
}

export async function parseReceiptImage(file: File): Promise<ExtractedTransaction> {
  const { base64, mimeType } = await fileToBase64(file);
  const data = await api<{ transaction: ExtractedTransaction }>('/api/ai/parse-receipt', {
    method: 'POST',
    body: JSON.stringify({ imageBase64: base64, mimeType }),
  });
  return { ...data.transaction, source: 'receipt' };
}

export async function parseStatement(
  file: File,
  existingTransactions: Transaction[]
): Promise<StatementRow[]> {
  const name = file.name.toLowerCase();
  const isCsv = name.endsWith('.csv') || name.endsWith('.txt') || file.type.includes('csv') || file.type === 'text/plain';
  const isImage = file.type.startsWith('image/') || /\.(png|jpe?g|webp)$/i.test(name);

  let extracted: ExtractedTransaction[] = [];

  if (isCsv) {
    const text = await fileToText(file);
    // Prefer AI on the CSV text for categorization; fall back to local CSV + heuristics
    try {
      const data = await api<{ transactions: ExtractedTransaction[] }>('/api/ai/parse-statement', {
        method: 'POST',
        body: JSON.stringify({ text }),
      });
      extracted = data.transactions || [];
    } catch (err) {
      console.warn('AI statement parse failed, using local CSV parser:', err);
      extracted = parseCsvToRows(text).map((r) => {
        const cat = detectCategoryFromText(r.title);
        return {
          ...r,
          category: cat.category,
          paymentMethod: 'Bank Transfer',
          isEssential: cat.isEssential,
          tags: cat.tags,
          confidence: cat.confidence,
          source: 'statement' as const,
        };
      });
    }
  } else if (isImage || name.endsWith('.pdf')) {
    // Vision / document: send as base64 data URL text extract path via statement AI if text, else receipt-style
    if (isImage) {
      const one = await parseReceiptImage(file);
      extracted = [{ ...one, source: 'statement' }];
    } else {
      // PDF: try reading as text (works for text PDFs); otherwise ask user-facing error
      const text = await fileToText(file);
      if (text.replace(/\s/g, '').length < 40) {
        throw new Error('Could not read this PDF as text. Please export your statement as CSV and try again.');
      }
      const data = await api<{ transactions: ExtractedTransaction[] }>('/api/ai/parse-statement', {
        method: 'POST',
        body: JSON.stringify({ text }),
      });
      extracted = data.transactions || [];
    }
  } else if (name.endsWith('.xlsx') || name.endsWith('.xls')) {
    throw new Error('Excel (.xlsx) is not supported yet. Please save/export as CSV and upload again.');
  } else {
    const text = await fileToText(file);
    const data = await api<{ transactions: ExtractedTransaction[] }>('/api/ai/parse-statement', {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
    extracted = data.transactions || [];
  }

  return extracted.map((row, i) => {
    const isDuplicate = existingTransactions.some(
      (tx) => tx.title.toLowerCase() === row.title.toLowerCase() && Math.abs(tx.amount - row.amount) < 1
    );
    return {
      ...row,
      id: `import-${Date.now()}-${i}`,
      source: 'statement' as const,
      confidence: row.confidence ?? 80,
      isDuplicate,
      selected: !isDuplicate,
    };
  });
}

export function checkDuplicate(
  tx: { title: string; amount: number },
  existing: Transaction[]
): boolean {
  return existing.some(
    (e) => e.title.toLowerCase() === tx.title.toLowerCase() && Math.abs(e.amount - tx.amount) < 0.01
  );
}
