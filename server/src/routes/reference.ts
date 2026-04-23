import { Router, Request, Response } from 'express';

// @ts-ignore — JSON import
import cropKnowledgeRaw from '../data/cropKnowledge.json';

import logger from '../utils/logger';

const cropKnowledge = cropKnowledgeRaw as Record<string, Record<string, unknown>>;

// ---------------------------------------------------------------------------
// Reference data routes — static lookups for the InputWizard
// ---------------------------------------------------------------------------

const referenceRouter = Router();

// GET /api/crops — list available crops
referenceRouter.get('/crops', (_req: Request, res: Response): void => {
  const crops = Object.keys(cropKnowledge).map(id => ({
    id,
    name: id.charAt(0).toUpperCase() + id.slice(1),
  }));
  logger.info(`Returning ${crops.length} crops`);
  res.json({ success: true, data: crops });
});

// GET /api/crops/:cropId/stages — list stages for a crop
referenceRouter.get('/crops/:cropId/stages', (req: Request, res: Response): void => {
  const cropId = req.params.cropId as string;
  const stages = cropKnowledge[cropId];
  if (!stages) {
    res.status(404).json({ success: false, error: `Crop not found: ${cropId}` });
    return;
  }
  const stageList = Object.keys(stages).map(id => ({
    id,
    name: id.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
  }));
  logger.info(`Returning ${stageList.length} stages for ${cropId}`);
  res.json({ success: true, data: stageList });
});

export default referenceRouter;
