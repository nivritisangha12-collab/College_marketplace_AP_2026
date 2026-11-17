const { validateListingInput, validateCategoryInput, validateMessageInput } = require('../utils/validators');

function validateListing(req, res, next) {
  const result = validateListingInput(req.body);
  if (!result.isValid) {
    return res.status(400).json({
      error: 'Validation Failed',
      messages: result.errors
    });
  }
  next();
}

function validateCategory(req, res, next) {
  const result = validateCategoryInput(req.body);
  if (!result.isValid) {
    return res.status(400).json({
      error: 'Validation Failed',
      messages: result.errors
    });
  }
  next();
}

function validateMessage(req, res, next) {
  const result = validateMessageInput(req.body);
  if (!result.isValid) {
    return res.status(400).json({
      error: 'Validation Failed',
      messages: result.errors
    });
  }
  next();
}

module.exports = {
  validateListing,
  validateCategory,
  validateMessage
};
