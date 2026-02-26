import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import prisma from '../lib/prisma';

const router = Router();

router.use(requireAuth);

router.get('/', async (_req, res) => {
  try {
    const widgets = await prisma.widget.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(widgets);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, type, config } = req.body;
    if (!name || !type || !config) {
      res.status(400).json({ error: 'name, type et config sont requis.' });
      return;
    }
    const widget = await prisma.widget.create({ data: { name, type, config } });
    res.status(201).json(widget);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const widget = await prisma.widget.findUnique({ where: { id: req.params.id } });
    if (!widget) {
      res.status(404).json({ error: 'Widget introuvable.' });
      return;
    }
    res.json(widget);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const { name, config } = req.body;
    const widget = await prisma.widget.update({
      where: { id: req.params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(config !== undefined && { config }),
      },
    });
    res.json(widget);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await prisma.widget.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
