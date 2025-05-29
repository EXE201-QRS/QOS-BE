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
