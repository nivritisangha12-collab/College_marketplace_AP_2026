/**
 * Helper validation utilities for CampusXchange endpoints
 */

function validateListingInput(body) {
  const errors = [];
  if (!body.title || typeof body.title !== 'string' || body.title.trim().length === 0) {
    errors.push('Listing title is required.');
  }

  const buyPrice = body.price !== undefined && body.price !== null && body.price !== '' ? Number(body.price) : NaN;
  const rentPrice = body.rent_price !== undefined && body.rent_price !== null && body.rent_price !== '' ? Number(body.rent_price) : NaN;

  const hasValidBuy = !isNaN(buyPrice) && buyPrice >= 0;
  const hasValidRent = !isNaN(rentPrice) && rentPrice >= 0;

  if (!hasValidBuy && !hasValidRent) {
    errors.push('At least one valid price (Full Purchase Price or Monthly Rent Price) must be provided.');
  }

  if (!isNaN(buyPrice) && buyPrice < 0) {
    errors.push('Purchase price cannot be negative.');
  }

  if (!isNaN(rentPrice) && rentPrice < 0) {
    errors.push('Monthly rent price cannot be negative.');
  }

  if (!body.category_id && !body.category_name) {
    errors.push('Category is required.');
  }
  if (!body.condition) {
    errors.push('Product condition is required (NEW, LIKE_NEW, GOOD, FAIR, POOR).');
  }
  if (!body.location || body.location.trim().length === 0) {
    errors.push('Campus location is required.');
  }
  return {
    isValid: errors.length === 0,
    errors
  };
}

function validateCategoryInput(body) {
  const errors = [];
  if (!body.name || typeof body.name !== 'string' || body.name.trim().length === 0) {
    errors.push('Category name is required.');
  }
  return {
    isValid: errors.length === 0,
    errors
  };
}

function validateMessageInput(body) {
  const errors = [];
  if (!body.listing_id) {
    errors.push('Listing ID is required.');
  }
  if (!body.receiver_id) {
    errors.push('Receiver ID is required.');
  }
  if (!body.content || typeof body.content !== 'string' || body.content.trim().length === 0) {
    errors.push('Message content cannot be empty.');
  }
  return {
    isValid: errors.length === 0,
    errors
  };
}

module.exports = {
  validateListingInput,
  validateCategoryInput,
  validateMessageInput
};
