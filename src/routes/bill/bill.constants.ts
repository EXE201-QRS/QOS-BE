/**
 * Bill and Payment related constants
 */

// Bill status constants
export const BILL_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  PAID: 'PAID',
  CANCELLED: 'CANCELLED'
} as const

// Payment method constants
export const PAYMENT_METHOD = {
  CASH: 'CASH',
  BANK_TRANSFER: 'BANK_TRANSFER'
} as const

// Payment status constants
export const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  PAID: 'PAID',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
  EXPIRED: 'EXPIRED',
  REFUNDED: 'REFUNDED'
} as const

// Tax and fee configurations
export const BILL_CONFIG = {
  DEFAULT_TAX_RATE: 0.1, // 10% VAT
  DEFAULT_SERVICE_CHARGE_RATE: 0.05, // 5% service charge
  MIN_BILL_AMOUNT: 1000, // Minimum bill amount in VND
  MAX_BILL_AMOUNT: 50000000, // Maximum bill amount in VND (50M)
  BILL_NUMBER_PREFIX: 'BILL',
  PAYOS_ORDER_PREFIX: 'QOS'
} as const

// PayOS configuration
export const PAYOS_CONFIG = {
  PAYMENT_LINK_EXPIRES_IN: 15 * 60, // 15 minutes in seconds
  WEBHOOK_TOLERANCE: 300, // 5 minutes tolerance for webhook verification
  MAX_RETRY_COUNT: 3,
  RETRY_DELAY: 5000 // 5 seconds
} as const

// Order status that can be included in bills
export const BILLABLE_ORDER_STATUS = ['DELIVERED'] as const

// Table status after payment completion
export const POST_PAYMENT_TABLE_STATUS = 'CLEANING' as const

// Order status after payment completion
export const POST_PAYMENT_ORDER_STATUS = 'COMPLETED' as const

// Notification types for bill and payment
export const BILL_NOTIFICATION_TYPES = {
  BILL_CREATED: 'BILL_CREATED',
  BILL_CONFIRMED: 'BILL_CONFIRMED',
  PAYMENT_PENDING: 'PAYMENT_PENDING',
  PAYMENT_SUCCESS: 'PAYMENT_SUCCESS',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  PAYMENT_EXPIRED: 'PAYMENT_EXPIRED'
} as const

// WebSocket rooms for real-time updates
export const BILL_SOCKET_ROOMS = {
  STAFF: 'staff',
  TABLE: (tableNumber: number) => `table_${tableNumber}`,
  PAYMENT: (billId: number) => `bill_payment_${billId}`
} as const

// Error messages
export const BILL_ERROR_MESSAGES = {
  BILL_NOT_FOUND: 'Không tìm thấy hóa đơn',
  BILL_ALREADY_PAID: 'Hóa đơn đã được thanh toán',
  BILL_CANCELLED: 'Hóa đơn đã bị hủy',
  NO_DELIVERED_ORDERS: 'Không có món ăn nào đã được phục vụ',
  INVALID_TABLE_STATUS: 'Trạng thái bàn không hợp lệ',
  PAYMENT_AMOUNT_MISMATCH: 'Số tiền thanh toán không khớp',
  PAYMENT_EXPIRED: 'Thanh toán đã hết hạn',
  PAYOS_CONNECTION_ERROR: 'Lỗi kết nối với PayOS',
  INSUFFICIENT_RECEIVED_AMOUNT: 'Số tiền nhận được không đủ'
} as const

// Success messages
export const BILL_SUCCESS_MESSAGES = {
  BILL_CREATED: 'Tạo hóa đơn thành công',
  BILL_CONFIRMED: 'Xác nhận hóa đơn thành công',
  PAYMENT_SUCCESS: 'Thanh toán thành công',
  BILL_CANCELLED: 'Hủy hóa đơn thành công'
} as const

export type BillStatus = (typeof BILL_STATUS)[keyof typeof BILL_STATUS]
export type PaymentMethod = (typeof PAYMENT_METHOD)[keyof typeof PAYMENT_METHOD]
export type PaymentStatus = (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS]
