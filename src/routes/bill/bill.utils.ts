import { format } from 'date-fns'

/**
 * Generate unique bill number with format: BILL-YYYYMMDD-XXXXXX
 * Example: BILL-20250618-000001
 */
export function generateBillNumber(): string {
  const today = new Date()
  const dateStr = format(today, 'yyyyMMdd')
  const timestamp = Date.now().toString().slice(-6) // Last 6 digits of timestamp

  return `BILL-${dateStr}-${timestamp.padStart(6, '0')}`
}

/**
 * Generate unique PayOS order ID with format: QOS-YYYYMMDD-HHMMSS-XXX
 * Example: QOS-20250618-143025-123
 */
export function generatePayOSOrderId(): string {
  const now = new Date()
  const dateStr = format(now, 'yyyyMMdd')
  const timeStr = format(now, 'HHmmss')
  const randomNum = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0')

  return `QOS-${dateStr}-${timeStr}-${randomNum}`
}

/**
 * Calculate bill totals with tax and service charge
 */
export interface BillCalculation {
  subtotal: number
  taxAmount: number
  serviceCharge: number
  discountAmount: number
  totalAmount: number
}

export interface BillCalculationOptions {
  subtotal: number
  taxRate?: number // Default 10% (0.1)
  serviceChargeRate?: number // Default 5% (0.05)
  discountAmount?: number // Default 0
}

export function calculateBillTotals(options: BillCalculationOptions): BillCalculation {
  const {
    subtotal,
    taxRate = 0.1, // 10% VAT
    serviceChargeRate = 0.05, // 5% service charge
    discountAmount = 0
  } = options

  // Calculate service charge on subtotal
  const serviceCharge = Math.round(subtotal * serviceChargeRate)

  // Calculate tax on (subtotal + service charge - discount)
  const taxableAmount = subtotal + serviceCharge - discountAmount
  const taxAmount = Math.round(taxableAmount * taxRate)

  // Calculate final total
  const totalAmount = subtotal + serviceCharge + taxAmount - discountAmount

  return {
    subtotal: Math.round(subtotal),
    taxAmount,
    serviceCharge,
    discountAmount: Math.round(discountAmount),
    totalAmount: Math.round(totalAmount)
  }
}

/**
 * Calculate change amount for cash payments
 */
export function calculateChange(totalAmount: number, receivedAmount: number): number {
  const change = receivedAmount - totalAmount
  return change >= 0 ? Math.round(change) : 0
}

/**
 * Validate payment amount
 */
export function validatePaymentAmount(
  totalAmount: number,
  paymentAmount: number,
  paymentMethod: string
): { isValid: boolean; error?: string } {
  if (paymentAmount <= 0) {
    return { isValid: false, error: 'Số tiền thanh toán phải lớn hơn 0' }
  }

  // For cash payments, received amount must be >= total amount
  if (paymentMethod === 'CASH' && paymentAmount < totalAmount) {
    return {
      isValid: false,
      error: 'Số tiền nhận được phải lớn hơn hoặc bằng tổng tiền thanh toán'
    }
  }

  // For other payment methods, amount should equal total amount
  if (paymentMethod !== 'CASH' && paymentAmount !== totalAmount) {
    return {
      isValid: false,
      error: 'Số tiền thanh toán phải bằng tổng tiền hóa đơn'
    }
  }

  return { isValid: true }
}

/**
 * Format currency for display (VND)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

/**
 * Generate bill summary text for notifications
 */
export function generateBillSummary(bill: {
  billNumber: string
  tableNumber: number
  totalAmount: number
  orderCount: number
}): string {
  return `Hóa đơn ${bill.billNumber} - Bàn ${bill.tableNumber} - ${bill.orderCount} món - ${formatCurrency(bill.totalAmount)}`
}
