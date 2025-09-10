const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
// Büyük JSON payload'ları için limitleri artır
app.use(bodyParser.json({ limit: '15mb' }));
app.use(bodyParser.urlencoded({ limit: '15mb', extended: true }));

// SSE clients
const sseClients = new Set();
function sseBroadcast(event, data) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  sseClients.forEach((res) => res.write(payload));
}

app.get('/api/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders && res.flushHeaders();

  res.write('retry: 3000\n\n');
  sseClients.add(res);
  req.on('close', () => sseClients.delete(res));
});

app.get('/', (req, res) => {
  res.json({ message: 'PAPUCGNC Backend API', version: '1.0.0' });
});

// Products
app.get('/api/products', async (req, res) => {
  const products = await prisma.product.findMany({ orderBy: { id: 'desc' } });
  // JSON string'leri parse et
  const formattedProducts = products.map(product => ({
    ...product,
    sizes: product.sizes ? JSON.parse(product.sizes) : [36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46],
    stockBySize: product.stockBySize ? JSON.parse(product.stockBySize) : {}
  }));
  res.json(formattedProducts);
});

app.post('/api/products', async (req, res) => {
  try {
    const data = {
      ...req.body,
      sizes: req.body.sizes ? JSON.stringify(req.body.sizes) : JSON.stringify([36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46]),
      stockBySize: req.body.stockBySize ? JSON.stringify(req.body.stockBySize) : JSON.stringify({})
    };
    const product = await prisma.product.create({ data });
    // Response'u formatla
    const formattedProduct = {
      ...product,
      sizes: JSON.parse(product.sizes),
      stockBySize: JSON.parse(product.stockBySize)
    };
    res.status(201).json(formattedProduct);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const data = {
      ...req.body,
      sizes: req.body.sizes ? JSON.stringify(req.body.sizes) : undefined,
      stockBySize: req.body.stockBySize ? JSON.stringify(req.body.stockBySize) : undefined
    };
    const product = await prisma.product.update({ where: { id }, data });
    // Response'u formatla
    const formattedProduct = {
      ...product,
      sizes: product.sizes ? JSON.parse(product.sizes) : [36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46],
      stockBySize: product.stockBySize ? JSON.parse(product.stockBySize) : {}
    };
    res.json(formattedProduct);
  } catch (e) {
    res.status(404).json({ error: 'Ürün bulunamadı' });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.product.delete({ where: { id } });
    res.json({ message: 'Ürün silindi' });
  } catch (e) {
    res.status(404).json({ error: 'Ürün bulunamadı' });
  }
});

// Orders
app.get('/api/orders', async (req, res) => {
  const orders = await prisma.order.findMany({ include: { items: true }, orderBy: { createdAt: 'desc' } });
  res.json(orders);
});

app.get('/api/orders/:id', async (req, res) => {
  try {
    const order = await prisma.order.findUnique({ where: { id: req.params.id }, include: { items: true } });
    if (!order) return res.status(404).json({ error: 'Sipariş bulunamadı' });
    res.json(order);
  } catch (e) {
    res.status(400).json({ error: 'İstek hatalı' });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const { id, items, shipping, paymentMethod, totals } = req.body;
    const order = await prisma.order.create({
      data: {
        id: id,
        fullName: shipping.fullName,
        phone: shipping.phone,
        email: shipping.email,
        address: shipping.address,
        city: shipping.city,
        district: shipping.district,
        note: shipping.note,
        payment: paymentMethod,
        subtotal: totals.subtotal,
        shipping: totals.shipping,
        total: totals.grandTotal,
        items: {
          create: items.map((it) => ({
            name: it.name,
            price: it.price,
            quantity: it.quantity || 1,
            size: String(it.selectedSize || it.size || '') || null
          }))
        }
      },
      include: { items: true }
    });

    // broadcast
    sseBroadcast('order:new', { order });

    res.status(201).json(order);
  } catch (e) {
    console.error(e);
    res.status(400).json({ error: e.message });
  }
});

app.put('/api/orders/:id', async (req, res) => {
  try {
    const order = await prisma.order.update({ where: { id: req.params.id }, data: req.body });

    // broadcast
    sseBroadcast('order:update', { orderId: order.id, status: order.status });

    res.json(order);
  } catch (e) {
    res.status(404).json({ error: 'Sipariş bulunamadı' });
  }
});

// Dashboard
app.get('/api/dashboard', async (req, res) => {
  const [total, yeni, tamamlandi, gelir] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: 'yeni' } }),
    prisma.order.count({ where: { status: 'tamamlandi' } }),
    prisma.order.aggregate({ _sum: { total: true } })
  ]);

  const recentOrders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: { items: true }
  });

  res.json({
    stats: {
      total,
      new: yeni,
      completed: tamamlandi,
      revenue: gelir._sum.total || 0
    },
    recentOrders,
    products: await prisma.product.count()
  });
});

app.listen(PORT, () => {
  console.log(`API: http://localhost:${PORT}`);
});
