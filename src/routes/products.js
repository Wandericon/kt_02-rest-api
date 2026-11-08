const express = require('express');
const fs = require('fs');
const path = require('path');
const upload = require('../middleware/upload');
const {
  validate,
  createSchema,
  patchSchema,
  querySchema,
} = require('../middleware/validate');

const router = express.Router();

let products = [];
let nextId = 1;

function findProduct(req, res, next) {
  const id = Number(req.params.id);
  const product = products.find((p) => p.id === id);
  if (!product) {
    return res.status(404).json({ error: 'Товар не найден' });
  }
  req.product = product;
  next();
}

function removeImage(product) {
  if (!product.imageUrl) return;
  const file = path.join(__dirname, '..', '..', product.imageUrl);
  fs.unlink(file, () => {});
}

router.get('/', validate(querySchema, 'query'), (req, res) => {
  const { category, minPrice, maxPrice, page, limit } = req.validatedQuery;

  let result = products;
  if (category) result = result.filter((p) => p.category === category);
  if (minPrice !== undefined) result = result.filter((p) => p.price >= minPrice);
  if (maxPrice !== undefined) result = result.filter((p) => p.price <= maxPrice);

  const total = result.length;
  const start = (page - 1) * limit;
  const data = result.slice(start, start + limit);

  res.json({ data, total, page, limit });
});

router.get('/:id', findProduct, (req, res) => {
  res.json(req.product);
});

router.post('/', validate(createSchema), (req, res) => {
  const product = {
    id: nextId++,
    name: req.body.name,
    price: req.body.price,
    category: req.body.category,
    stock: req.body.stock,
    description: req.body.description || '',
    imageUrl: null,
    createdAt: new Date().toISOString(),
  };
  products.push(product);
  res.status(201).json(product);
});

router.put('/:id', findProduct, validate(createSchema), (req, res) => {
  const old = req.product;
  const updated = {
    id: old.id,
    name: req.body.name,
    price: req.body.price,
    category: req.body.category,
    stock: req.body.stock,
    description: req.body.description || '',
    imageUrl: old.imageUrl,
    createdAt: old.createdAt,
  };
  products = products.map((p) => (p.id === old.id ? updated : p));
  res.json(updated);
});

router.patch('/:id', findProduct, validate(patchSchema), (req, res) => {
  Object.assign(req.product, req.body);
  res.json(req.product);
});

router.delete('/:id', findProduct, (req, res) => {
  removeImage(req.product);
  products = products.filter((p) => p.id !== req.product.id);
  res.status(204).send();
});

router.post('/:id/image', findProduct, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Файл не передан, поле должно называться image' });
  }
  removeImage(req.product);
  req.product.imageUrl = `uploads/products/${req.file.filename}`;
  res.json(req.product);
});

module.exports = router;
