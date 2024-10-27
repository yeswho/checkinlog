// services/base.service.ts

import { Model, ModelStatic, WhereOptions, CreationAttributes } from '@sequelize/core';
import { CustomError } from '@src/middleware/errorHandler';

class BaseService<T extends Model> {
  protected model: ModelStatic<T>;

  constructor(model: ModelStatic<T>) {
    this.model = model;
  }

  // Create a new entry
  async create(data:CreationAttributes<T>): Promise<T> {
    try {
      return await this.model.create(data) as T;
    } catch (error: any) {
      throw new CustomError(`Error creating entry: ${error.message}`, 500);
    }
  }

  // Find by ID
  async findById(id: number): Promise<T | null> {
    try {
      const item = await this.model.findByPk(id);
      if (!item) {
        throw new CustomError('Entry not found', 404);
      }
      return item;
    } catch (error: any) {
      throw new CustomError(`Error fetching entry: ${error.message}`, 500);
    }
  }

  // Find all
  async findAll(where: WhereOptions<T> = {}): Promise<T[]> {
    try {
      return await this.model.findAll({ where });
    } catch (error: any) {
      throw new CustomError(`Error fetching entries: ${error.message}`, 500);
    }
  }

  // Update an entry
  async update(id: number, data: Partial<CreationAttributes<T>>): Promise<T | null> {
    try {
      const item = await this.findById(id);
      if (!item) {
        throw new CustomError('Entry not found', 404);
      }
      await item.update(data);
      return item;
    } catch (error: any) {
      throw new CustomError(`Error updating entry: ${error.message}`, 500);
    }
  }

  // Delete an entry
  async delete(id: number): Promise<boolean> {
    try {
      const item = await this.findById(id);
      if (!item) {
        throw new CustomError('Entry not found', 404);
      }
      await item.destroy();
      return true;
    } catch (error: any) {
      throw new CustomError(`Error deleting entry: ${error.message}`, 500);
    }
  }
}

export default BaseService;
