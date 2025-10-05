import { Router } from 'express';
import axios from 'axios';

const router = Router();

// Calculate route endpoint
router.post('/calculate', async (req, res, next) => {
  try {
    const { origin, destination } = req.body;
    
    if (!origin || !destination) {
      return res.status(400).json({ error: 'Missing origin or destination' });
    }

    // Use Mapbox Directions API
    const mapboxToken = process.env.MAPBOX_ACCESS_TOKEN;
    if (!mapboxToken) {
      return res.status(500).json({ error: 'Mapbox token not configured' });
    }

    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}`;
    
    const response = await axios.get(url, {
      params: {
        access_token: mapboxToken,
        geometries: 'geojson',
        steps: true,
        overview: 'full'
      }
    });

    if (response.data.routes && response.data.routes.length > 0) {
      const route = response.data.routes[0];
      res.json({
        distance: route.distance,
        duration: route.duration,
        geometry: route.geometry,
        steps: route.legs[0]?.steps || []
      });
    } else {
      res.status(404).json({ error: 'No route found' });
    }
  } catch (error) {
    next(error);
  }
});

export { router as routeRouter };
