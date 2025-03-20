import { UserController } from '@controllers/userController';
import { authenticateToken } from '@src/middleware/auth';
import { Router } from 'express';

const router = Router();

const userController = new UserController();

router.post('/login', userController.login);
router.post('/refresh-token', userController.refreshToken);
router.post('/logout', authenticateToken, userController.logout);

router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUser);


export default router;
