export const CATEGORY_MESSAGE = {
  CREATED_SUCCESS: 'Tạo danh mục thành công',
  UPDATED_SUCCESS: 'Cập nhật danh mục thành công',
  DELETED_SUCCESS: 'Xóa danh mục thành công',
  GET_ALL_SUCCESS: 'Lấy danh sách danh mục thành công',
  GET_SUCCESS: 'Lấy danh mục thành công',
  // error
  NOT_FOUND: 'Không tìm thấy danh mục',
  NAME_EXISTED: 'Tên danh mục đã tồn tại',
  NAME_IS_REQUIRED: 'Tên danh mục là bắt buộc',
  NAME_IS_INVALID: 'Tên danh mục không hợp lệ',
  ID_IS_INVALID: 'ID danh mục không hợp lệ'
} as const

export const DISH_MESSAGE = {
  CREATED_SUCCESS: 'Tạo món ăn thành công',
  UPDATED_SUCCESS: 'Cập nhật món ăn thành công',
  DELETED_SUCCESS: 'Xóa món ăn thành công',
  GET_ALL_SUCCESS: 'Lấy danh sách món ăn thành công',
  GET_SUCCESS: 'Lấy món ăn thành công',
  // error
  NOT_FOUND: 'Không tìm thấy món ăn',
  NAME_EXISTED: 'Tên món ăn đã tồn tại',
  NAME_IS_REQUIRED: 'Tên món ăn là bắt buộc',
  NAME_IS_INVALID: 'Tên món ăn không hợp lệ',
  ID_IS_INVALID: 'ID món ăn không hợp lệ',
  PRICE_IS_INVALID: 'Giá món ăn phải là một số dương'
} as const

export const DISH_SNAPSHOT_MESSAGE = {
  CREATED_SUCCESS: 'Tạo bản sao món ăn thành công',
  UPDATED_SUCCESS: 'Cập nhật bản sao món ăn thành công',
  DELETED_SUCCESS: 'Xóa bản sao món ăn thành công',
  GET_ALL_SUCCESS: 'Lấy danh sách bản sao món ăn thành công',
  GET_SUCCESS: 'Lấy bản sao món ăn thành công',
  // error
  NOT_FOUND: 'Không tìm thấy bản sao món ăn',
  NAME_EXISTED: 'Tên bản sao món ăn đã tồn tại',
  NAME_IS_REQUIRED: 'Tên bản sao món ăn là bắt buộc',
  NAME_IS_INVALID: 'Tên bản sao món ăn không hợp lệ',
  ID_IS_INVALID: 'ID bản sao món ăn không hợp lệ',
  PRICE_IS_INVALID: 'Giá bản sao món ăn phải là một số dương'
} as const

export const TABLE_MESSAGE = {
  CREATED_SUCCESS: 'Tạo bàn ăn thành công',
  UPDATED_SUCCESS: 'Cập nhật bàn ăn thành công',
  DELETED_SUCCESS: 'Xóa bàn ăn thành công',
  GET_ALL_SUCCESS: 'Lấy danh sách bàn ăn thành công',
  GET_SUCCESS: 'Lấy bàn ăn thành công',
  // error
  NOT_FOUND: 'Không tìm thấy bàn ăn',
  NUMBER_EXISTED: 'Số bàn đã tồn tại',
  NUMBER_IS_REQUIRED: 'Số bàn là bắt buộc',
  NUMBER_IS_INVALID: 'Số bàn không hợp lệ',
  ID_IS_INVALID: 'ID bàn không hợp lệ',
  CAPACITY_IS_INVALID: 'Sức chứa bàn phải là một số dương',
  STATUS_IS_INVALID: 'Trạng thái bàn không hợp lệ',
  TOKEN_IS_INVALID: 'Mã bàn không hợp lệ'
} as const

export const GUEST_MESSAGE = {
  CREATED_SUCCESS: 'Tạo khách thành công',
  UPDATED_SUCCESS: 'Cập nhật khách thành công',
  DELETED_SUCCESS: 'Xóa khách thành công',
  GET_ALL_SUCCESS: 'Lấy danh sách khách thành công',
  GET_SUCCESS: 'Lấy thông tin khách thành công',
  // error
  NOT_FOUND: 'Không tìm thấy khách',
  NAME_EXISTED: 'Tên khách đã tồn tại',
  NAME_IS_REQUIRED: 'Tên khách là bắt buộc',
  TABLE_NUMBER_IS_INVALID: 'Số bàn của khách không hợp lệ',
  NAME_IS_INVALID: 'Tên khách không hợp lệ',
  ID_IS_INVALID: 'ID khách không hợp lệ'
} as const

export const ORDER_MESSAGE = {
  CREATED_SUCCESS: 'Tạo đơn hàng thành công',
  UPDATED_SUCCESS: 'Cập nhật đơn hàng thành công',
  DELETED_SUCCESS: 'Xóa đơn hàng thành công',
  GET_ALL_SUCCESS: 'Lấy danh sách đơn hàng thành công',
  GET_SUCCESS: 'Lấy đơn hàng thành công',
  // error
  NOT_FOUND: 'Không tìm thấy đơn hàng',
  NAME_EXISTED: 'Tên đơn hàng đã tồn tại',
  NAME_IS_REQUIRED: 'Tên đơn hàng là bắt buộc',
  NAME_IS_INVALID: 'Tên đơn hàng không hợp lệ',
  ID_IS_INVALID: 'ID đơn hàng không hợp lệ',
  GUEST_ID_IS_INVALID: 'ID khách của đơn hàng không hợp lệ',
  PRICE_IS_INVALID: 'Giá đơn hàng phải là một số dương',
  TABLE_NUMBER_IS_INVALID: 'Số bàn của đơn hàng không hợp lệ',
  DISH_SNAPSHOT_ID_IS_INVALID: 'ID bản sao món ăn của đơn hàng không hợp lệ',
  QUANTITY_IS_INVALID: 'Số lượng món phải là một số dương',
  DESCRIPTION_IS_TOO_LONG: 'Mô tả đơn hàng quá dài, tối đa 500 ký tự',
  DISH_ID_IS_INVALID: 'ID món ăn của đơn hàng không hợp lệ'
} as const
