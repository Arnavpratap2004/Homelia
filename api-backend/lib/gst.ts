/**
 * GST Calculation Utilities for India
 * HSN Code for Laminates: 4823 (18% GST)
 * Ported from backend/src/utils/gst.ts
 */

export const DEFAULT_GST_RATE = 18;

interface GSTBreakdown {
  subtotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalTax: number;
  totalAmount: number;
  gstType: 'INTRA_STATE' | 'INTER_STATE';
}

export function calculateGST(
  subtotal: number,
  sellerStateCode: string,
  buyerStateCode: string,
  gstRate: number = DEFAULT_GST_RATE
): GSTBreakdown {
  const taxAmount = subtotal * (gstRate / 100);
  const isIntraState = sellerStateCode === buyerStateCode;

  if (isIntraState) {
    const halfTax = roundToTwo(taxAmount / 2);
    return {
      subtotal: roundToTwo(subtotal),
      cgst: halfTax,
      sgst: halfTax,
      igst: 0,
      totalTax: roundToTwo(halfTax * 2),
      totalAmount: roundToTwo(subtotal + halfTax * 2),
      gstType: 'INTRA_STATE',
    };
  } else {
    return {
      subtotal: roundToTwo(subtotal),
      cgst: 0,
      sgst: 0,
      igst: roundToTwo(taxAmount),
      totalTax: roundToTwo(taxAmount),
      totalAmount: roundToTwo(subtotal + taxAmount),
      gstType: 'INTER_STATE',
    };
  }
}

export function calculateItemTax(
  quantity: number,
  unitPrice: number,
  gstRate: number = DEFAULT_GST_RATE
): { subtotal: number; taxAmount: number; totalPrice: number } {
  const subtotal = quantity * unitPrice;
  const taxAmount = subtotal * (gstRate / 100);
  return {
    subtotal: roundToTwo(subtotal),
    taxAmount: roundToTwo(taxAmount),
    totalPrice: roundToTwo(subtotal + taxAmount),
  };
}

export function roundToTwo(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

export function getFinancialYear(date: Date = new Date()): string {
  const month = date.getMonth();
  const year = date.getFullYear();
  if (month >= 3) {
    return `${year}-${(year + 1).toString().slice(-2)}`;
  } else {
    return `${year - 1}-${year.toString().slice(-2)}`;
  }
}

export function getStateCodeFromGSTIN(gstin: string): string | null {
  if (!gstin || gstin.length < 2) return null;
  const code = gstin.substring(0, 2);
  const STATE_CODES: Record<string, string> = {
    '01': 'Jammu & Kashmir', '02': 'Himachal Pradesh', '03': 'Punjab',
    '04': 'Chandigarh', '05': 'Uttarakhand', '06': 'Haryana',
    '07': 'Delhi', '08': 'Rajasthan', '09': 'Uttar Pradesh',
    '10': 'Bihar', '11': 'Sikkim', '12': 'Arunachal Pradesh',
    '13': 'Nagaland', '14': 'Manipur', '15': 'Mizoram',
    '16': 'Tripura', '17': 'Meghalaya', '18': 'Assam',
    '19': 'West Bengal', '20': 'Jharkhand', '21': 'Odisha',
    '22': 'Chhattisgarh', '23': 'Madhya Pradesh', '24': 'Gujarat',
    '26': 'Dadra & Nagar Haveli', '27': 'Maharashtra', '29': 'Karnataka',
    '30': 'Goa', '31': 'Lakshadweep', '32': 'Kerala',
    '33': 'Tamil Nadu', '34': 'Puducherry', '35': 'Andaman & Nicobar',
    '36': 'Telangana', '37': 'Andhra Pradesh', '38': 'Ladakh',
  };
  return STATE_CODES[code] ? code : null;
}

export function numberToWords(num: number): string {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  if (num === 0) return 'Zero';
  if (num < 0) return 'Minus ' + numberToWords(Math.abs(num));
  let words = '';
  if (Math.floor(num / 10000000) > 0) { words += numberToWords(Math.floor(num / 10000000)) + ' Crore '; num %= 10000000; }
  if (Math.floor(num / 100000) > 0) { words += numberToWords(Math.floor(num / 100000)) + ' Lakh '; num %= 100000; }
  if (Math.floor(num / 1000) > 0) { words += numberToWords(Math.floor(num / 1000)) + ' Thousand '; num %= 1000; }
  if (Math.floor(num / 100) > 0) { words += ones[Math.floor(num / 100)] + ' Hundred '; num %= 100; }
  if (num > 0) {
    if (num < 20) { words += ones[num]; }
    else { words += tens[Math.floor(num / 10)]; if (num % 10 > 0) words += ' ' + ones[num % 10]; }
  }
  return words.trim();
}

export function amountInWords(amount: number): string {
  const rupees = Math.floor(amount);
  const paise = Math.round((amount - rupees) * 100);
  let result = 'Rupees ' + numberToWords(rupees);
  if (paise > 0) result += ' and ' + numberToWords(paise) + ' Paise';
  return result + ' Only';
}
