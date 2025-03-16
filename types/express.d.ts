import { User } from '../src/sequelize/models/user';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
