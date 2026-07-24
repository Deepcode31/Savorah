import { TransactionType } from '../types';

export interface ExtractedTransactionData {
  title: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string;
  paymentMethod: string;
  isEssential: boolean;
  confidenceScore: number;
  notes?: string;
  tags?: string[];
  source: 'sms' | 'receipt' | 'statement' | 'manual';
  rawInput?: string;
}

// Category heuristics dictionary
const CATEGORY_MAP: { [key: string]: string[] } = {
  'Food & Dining': [
    'swiggy', 'zomato', 'mcdonald', 'domino', 'starbucks', 'cafe', 'restaurant',
    'diner', 'pizza', 'burger', 'kfc', 'subway', 'food', 'dining', 'cafeteria', 'bakery'
  ],
  'Groceries & Dining': [
    'groceries', 'reliance fresh', 'bigbasket', 'blinkit', 'zepto', 'instamart',
    'dmart', 'supermarket', 'mart', 'grofers', 'spencer', 'more retail', 'provisions'
  ],
  'Transport & Fuel': [
    'uber', 'ola', 'rapido', 'namma yatri', 'petrol', 'diesel', 'iocl', 'hpcl',
    'bpcl', 'shell', 'fuel', 'metro', 'irctc', 'train', 'bus', 'flight', 'indigo',
    'air india', 'toll', 'fastag', 'parking'
  ],
  'Housing & Rent': [
    'rent', 'landlord', 'housing', 'society maintenance', 'maintenance', 'mortgage', 'lease'
  ],
  'Utilities & Bills': [
    'electricity', 'bescom', 'mseb', 'tata power', 'water bill', 'gas', 'indane',
    'hp gas', 'airtel', 'jio', 'vi', 'wifi', 'broadband', 'recharge', 'dth'
  ],
  'Shopping & Lifestyle': [
    'amazon', 'flipkart', 'myntra', 'nykaa', 'ajio', 'zara', 'h&m', 'uniqlo',
    'trends', 'clothing', 'shopping', 'electronics', 'apple', 'croma', 'reliance digital'
  ],
  'Entertainment & Leisure': [
    'netflix', 'prime video', 'hotstar', 'spotify', 'bookmyshow', 'cinema',
    'movie', 'gaming', 'steam', 'playstation', 'youtube', 'recreation'
  ],
  'Healthcare & Wellness': [
    'apollo', 'pharmacy', 'pharmeasy', '1mg', 'practo', 'hospital', 'doctor',
    'clinic', 'medplus', 'lab', 'diagnostics', 'gym', 'fitness', 'cult.fit'
  ],
  'Education & Learning': [
    'udemy', 'coursera', 'books', 'college', 'tuition', 'school', 'fee', 'coaching',
    'stationery', 'xerox'
  ],
  'Salary & Income': [
    'salary', 'paycheck', 'dividend', 'stipend', 'interest', 'freelance', 'refund',
    'cashback', 'credit', 'bonus'
  ],
};

/**
 * Smart Category Predictor based on Title / Merchant name
 */
export function predictCategory(title: string, type: TransactionType): string {
  if (type === 'income') {
    return 'Salary & Income';
  }

  const lowerTitle = title.toLowerCase();

  for (const [category, keywords] of Object.entries(CATEGORY_MAP)) {
    if (category === 'Salary & Income') continue;
    for (const kw of keywords) {
      if (lowerTitle.includes(kw)) {
        return category;
      }
    }
  }

  return 'Groceries & Dining';
}

/**
 * Determine if cost is essential
 */
export function checkIsEssential(category: string): boolean {
  const essentialCategories = [
    'Groceries & Dining',
    'Housing & Rent',
    'Utilities & Bills',
    'Healthcare & Wellness',
    'Education & Learning',
    'Transport & Fuel'
  ];
  return essentialCategories.includes(category);
}

/**
 * Parses mobile payment SMS or UPI notification
 */
export function parsePaymentSMS(smsText: string): ExtractedTransactionData {
  const cleanText = smsText.trim();
  const textLower = cleanText.toLowerCase();

  // 1. Detect Type (Income vs Expense)
  let type: TransactionType = 'expense';
  if (
    textLower.includes('credited') ||
    textLower.includes('received') ||
    textLower.includes('deposited') ||
    textLower.includes('salary') ||
    textLower.includes('refund') ||
    textLower.includes('cashback')
  ) {
    type = 'income';
  }

  // 2. Extract Amount (Supports ₹, Rs, Rs., INR, numbers with commas)
  let amount = 0;
  const amountRegexes = [
    /(?:rs\.?|inr|₹)\s*([\d,]+(?:\.\d{1,2})?)/i,
    /(?:paid|spent|spent of|amount|debited|credited|received)\s*(?:rs\.?|inr|₹)?\s*([\d,]+(?:\.\d{1,2})?)/i,
    /([\d,]+(?:\.\d{1,2})?)\s*(?:spent|paid|debited|credited)/i,
  ];

  for (const regex of amountRegexes) {
    const match = cleanText.match(regex);
    if (match && match[1]) {
      const parsed = parseFloat(match[1].replace(/,/g, ''));
      if (!isNaN(parsed) && parsed > 0) {
        amount = parsed;
        break;
      }
    }
  }

  // 3. Extract Merchant / Recipient / Sender
  let title = 'Mobile Payment';
  const merchantPatterns = [
    /(?:at|to|via|vpa|paid to|sent to)\s+([A-Za-z0-9\s&'-]{3,30}?)(?=\s+(?:on|using|via|ref|upi|a\/c|val|date|\.|$))/i,
    /(?:at|to|from)\s+([A-Za-z0-9\s&'-]{3,30})/i,
    /(?:info|ref|text):\s*([A-Za-z0-9\s&'-]{3,25})/i,
  ];

  for (const pattern of merchantPatterns) {
    const match = cleanText.match(pattern);
    if (match && match[1]) {
      const candidate = match[1].trim();
      // Exclude common noise words
      if (!['upi', 'credit card', 'debit card', 'account', 'bank', 'your', 'rs', 'inr'].includes(candidate.toLowerCase())) {
        title = candidate;
        break;
      }
    }
  }

  // Capitalize title
  if (title !== 'Mobile Payment') {
    title = title
      .split(' ')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
  }

  // 4. Extract Payment Method
  let paymentMethod = 'UPI / Cash';
  if (textLower.includes('credit card') || textLower.includes('cc')) {
    paymentMethod = 'Credit Card';
  } else if (textLower.includes('debit card') || textLower.includes('dc')) {
    paymentMethod = 'Debit Card';
  } else if (textLower.includes('a/c') || textLower.includes('netbanking') || textLower.includes('neft') || textLower.includes('imps')) {
    paymentMethod = 'Bank Transfer';
  } else if (textLower.includes('upi') || textLower.includes('gpay') || textLower.includes('phonepe') || textLower.includes('paytm')) {
    paymentMethod = 'UPI / Cash';
  }

  // 5. Extract Date
  let date = new Date().toISOString().split('T')[0];
  const dateRegexes = [
    /(?:on|date)?\s*(\d{1,2}[-/\s](?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[-/\s]\d{2,4})/i,
    /(\d{4}-\d{2}-\d{2})/,
    /(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/,
  ];

  for (const dateReg of dateRegexes) {
    const dMatch = cleanText.match(dateReg);
    if (dMatch && dMatch[1]) {
      try {
        const parsedDate = new Date(dMatch[1]);
        if (!isNaN(parsedDate.getTime())) {
          date = parsedDate.toISOString().split('T')[0];
          break;
        }
      } catch {
        // Fallback to today
      }
    }
  }

  // 6. Predict Category
  const category = predictCategory(title, type);
  const isEssential = checkIsEssential(category);

  // 7. Calculate Confidence Score
  let confidence = 70;
  if (amount > 0) confidence += 15;
  if (title !== 'Mobile Payment') confidence += 10;
  if (textLower.includes('upi') || textLower.includes('card') || textLower.includes('bank')) confidence += 3;

  return {
    title,
    amount: amount || 250,
    type,
    category,
    date,
    paymentMethod,
    isEssential,
    confidenceScore: Math.min(99, confidence),
    notes: `Extracted from SMS message`,
    tags: ['SMS Import', paymentMethod.split(' ')[0]],
    source: 'sms',
    rawInput: smsText,
  };
}
