import { Router } from 'express';
import { Pool } from 'pg';
import { DANService } from '../services/DANService';

const router = Router();
const db = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/nigeria_nav'
});

const danService = new DANService(db);

// Decode DAN endpoint
router.get('/decode/:dan', async (req, res, next) => {
  try {
    const { dan } = req.params;
    const result = await danService.decodeDAN(dan);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Generate DAN endpoint
router.post('/generate', async (req, res, next) => {
  try {
    const { footprint, state } = req.body;
    
    if (!footprint || !state) {
      return res.status(400).json({ error: 'Missing footprint or state' });
    }

    const result = danService.generateDAN({ coordinates: footprint, state });
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export { router as danRouter };
