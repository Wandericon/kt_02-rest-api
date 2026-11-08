const Joi = require('joi');
const { categories } = require('../config');

const name = Joi.string().min(2).max(100);
const price = Joi.number().greater(0);
const category = Joi.string().valid(...categories);
const stock = Joi.number().integer().min(0);
const description = Joi.string().max(500).allow('');

const createSchema = Joi.object({
  name: name.required(),
  price: price.required(),
  category: category.required(),
  stock: stock.default(0),
  description,
});

const patchSchema = Joi.object({
  name,
  price,
  category,
  stock,
  description,
}).min(1);

const querySchema = Joi.object({
  category,
  minPrice: Joi.number().min(0),
  maxPrice: Joi.number().min(0),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
});

function validate(schema, source = 'body') {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const details = error.details.map((d) => ({
        field: d.path.join('.'),
        message: d.message,
      }));
      return res.status(400).json({ error: 'Ошибка валидации', details });
    }

    if (source === 'query') {
      req.validatedQuery = value;
    } else {
      req[source] = value;
    }
    next();
  };
}

module.exports = {
  validate,
  createSchema,
  patchSchema,
  querySchema,
};
