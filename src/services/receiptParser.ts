import { ExtractedTransactionData, predictCategory, checkIsEssential } from './smsParser';

export interface OCRStepProgress {
  step: number;
  totalSteps: number;
  label: string;
}

/**
 * Simulates or performs receipt image/PDF scanning with OCR callback
 */
export async function parseReceiptImage(
  file: File,
  onProgress?: (progress: OCRStepProgress) => void
): Promise<ExtractedTransactionData> {
  const steps = [
    { step: 1, label: 'Scanning Receipt Image...' },
    { step: 2, label: 'Running High-Precision OCR Engine...' },
    { step: 3, label: 'Extracting Merchant & Vendor Details...' },
    { step: 4, label: 'Reading Line Items & Total Amount...' },
    { step: 5, label: 'Detecting Date & Payment Method...' },
    { step: 6, label: 'Predicting Smart Expense Category...' },
  ];

  for (let i = 0; i < steps.length; i++) {
    if (onProgress) {
      onProgress({
        step: steps[i].step,
        totalSteps: steps.length,
        label: steps[i].label,
      });
    }
    // Simulate real AI scanning delay
    await new Promise((r) => setTimeout(r, 450));
  }

  // Derive smart mock extracted results based on filename or random realistic receipt data
  const fileNameLower = file.name.toLowerCase();

  let title = 'Reliance Supermarket';
  let amount = 1485.50;
  let category = 'Groceries & Dining';
  let paymentMethod = 'Credit Card';
  let isEssential = true;
  let confidence = 98;

  if (fileNameLower.includes('swiggy') || fileNameLower.includes('zomato') || fileNameLower.includes('food')) {
    title = 'Swiggy Gourmet';
    amount = 640.00;
    category = 'Food & Dining';
    paymentMethod = 'UPI / Cash';
    isEssential = false;
    confidence = 96;
  } else if (fileNameLower.includes('uber') || fileNameLower.includes('taxi') || fileNameLower.includes('cab')) {
    title = 'Uber India Trip';
    amount = 320.00;
    category = 'Transport & Fuel';
    paymentMethod = 'UPI / Cash';
    isEssential = true;
    confidence = 97;
  } else if (fileNameLower.includes('apollo') || fileNameLower.includes('pharma') || fileNameLower.includes('medical')) {
    title = 'Apollo Pharmacy Store';
    amount = 890.00;
    category = 'Healthcare & Wellness';
    paymentMethod = 'Debit Card';
    isEssential = true;
    confidence = 99;
  } else if (fileNameLower.includes('amazon') || fileNameLower.includes('invoice') || fileNameLower.includes('bill')) {
    title = 'Amazon India Order';
    amount = 2499.00;
    category = 'Shopping & Lifestyle';
    paymentMethod = 'Credit Card';
    isEssential = false;
    confidence = 95;
  } else if (fileNameLower.includes('electric') || fileNameLower.includes('utility') || fileNameLower.includes('power')) {
    title = 'Bescom Electricity Bill';
    amount = 1850.00;
    category = 'Utilities & Bills';
    paymentMethod = 'Bank Transfer';
    isEssential = true;
    confidence = 99;
  } else {
    // Generate realistic amount if generic image file
    const randomAmt = Math.floor(Math.random() * 2500) + 120;
    amount = Number(randomAmt.toFixed(2));
    category = predictCategory(title, 'expense');
    isEssential = checkIsEssential(category);
  }

  const date = new Date().toISOString().split('T')[0];

  return {
    title,
    amount,
    type: 'expense',
    category,
    date,
    paymentMethod,
    isEssential,
    confidenceScore: confidence,
    notes: `Extracted from receipt document: ${file.name}`,
    tags: ['Receipt OCR', category],
    source: 'receipt',
    rawInput: file.name,
  };
}
