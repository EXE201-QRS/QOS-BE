export const CATEGORY_MESSAGE = {
  CREATED_SUCCESS: 'Category created successfully',
  UPDATED_SUCCESS: 'Category updated successfully',
  DELETED_SUCCESS: 'Category deleted successfully',
  GET_ALL_SUCCESS: 'Get all categories successfully',
  GET_SUCCESS: 'Get category successfully',
  // error
  NOT_FOUND: 'Category not found',
  NAME_EXISTED: 'Category name already exists',
  NAME_IS_REQUIRED: 'Category name is required',
  NAME_IS_INVALID: 'Category name is invalid',
  ID_IS_INVALID: 'Category ID is invalid'
} as const

export const DISH_MESSAGE = {
  CREATED_SUCCESS: 'Dish created successfully',
  UPDATED_SUCCESS: 'Dish updated successfully',
  DELETED_SUCCESS: 'Dish deleted successfully',
  GET_ALL_SUCCESS: 'Get all dishes successfully',
  GET_SUCCESS: 'Get dish successfully',
  // error
  NOT_FOUND: 'Dish not found',
  NAME_EXISTED: 'Dish name already exists',
  NAME_IS_REQUIRED: 'Dish name is required',
  NAME_IS_INVALID: 'Dish name is invalid',
  ID_IS_INVALID: 'Dish ID is invalid',
  PRICE_IS_INVALID: 'Dish price must be a positive number'
} as const

export const DISH_SNAPSHOT_MESSAGE = {
  CREATED_SUCCESS: 'Dish snapshot created successfully',
  UPDATED_SUCCESS: 'Dish snapshot updated successfully',
  DELETED_SUCCESS: 'Dish snapshot deleted successfully',
  GET_ALL_SUCCESS: 'Get all dish snapshots successfully',
  GET_SUCCESS: 'Get dish snapshot successfully',
  // error
  NOT_FOUND: 'Dish snapshot not found',
  NAME_EXISTED: 'Dish snapshot name already exists',
  NAME_IS_REQUIRED: 'Dish snapshot name is required',
  NAME_IS_INVALID: 'Dish snapshot name is invalid',
  ID_IS_INVALID: 'Dish snapshot ID is invalid',
  PRICE_IS_INVALID: 'Dish snapshot price must be a positive number'
} as const

export const TABLE_MESSAGE = {
  CREATED_SUCCESS: 'Table created successfully',
  UPDATED_SUCCESS: 'Table updated successfully',
  DELETED_SUCCESS: 'Table deleted successfully',
  GET_ALL_SUCCESS: 'Get all tables successfully',
  GET_SUCCESS: 'Get table successfully',
  // error
  NOT_FOUND: 'Table not found',
  NUMBER_EXISTED: 'Table number already exists',
  NUMBER_IS_REQUIRED: 'Table number is required',
  NUMBER_IS_INVALID: 'Table number is invalid',
  ID_IS_INVALID: 'Table ID is invalid',
  CAPACITY_IS_INVALID: 'Table capacity must be a positive number',
  STATUS_IS_INVALID: 'Table status is invalid',
  TOKEN_IS_INVALID: 'Table token is invalid'
} as const

export const GUEST_MESSAGE = {
  CREATED_SUCCESS: 'Guest created successfully',
  UPDATED_SUCCESS: 'Guest updated successfully',
  DELETED_SUCCESS: 'Guest deleted successfully',
  GET_ALL_SUCCESS: 'Get all guests successfully',
  GET_SUCCESS: 'Get guest successfully',
  // error
  NOT_FOUND: 'Guest not found',
  NAME_EXISTED: 'Guest name already exists',
  NAME_IS_REQUIRED: 'Guest name is required',
  TABLE_NUMBER_IS_INVALID: 'Guest table number is invalid',
  NAME_IS_INVALID: 'Guest name is invalid',
  ID_IS_INVALID: 'Guest ID is invalid'
} as const
