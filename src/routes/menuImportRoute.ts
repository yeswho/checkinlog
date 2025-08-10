// src/routes/menuImportRoutes.ts
import { Router } from 'express';
import { MenuImportController } from '@controllers/menuImportController';
import { authenticateToken, authorizeRole } from '@src/middleware/auth';
import multer from 'multer';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload', 
    authenticateToken,
    authorizeRole('admin'),
    upload.single('file'),
    MenuImportController.uploadMenu
);

router.get('/template', 
    authenticateToken,
    authorizeRole('admin'),
    MenuImportController.downloadTemplate
);

export default router;