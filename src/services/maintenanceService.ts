import { Maintenance } from '@src/sequelize/models/maintenance';
import { Room } from '@src/sequelize/models';
import BaseService from '@src/services/baseService';
import { ROOM_STATUS } from '@src/enums/database';

class MaintenanceService extends BaseService<Maintenance> {
  constructor() {
    super(Maintenance);
  }

  async deleteMaintenanceRecord(id: number): Promise<void> {
    try {
      const maintenanceRecord = await Maintenance.findByPk(id);
      if (!maintenanceRecord) {
        throw new Error('Maintenance record not found');
      }

      const room = await Room.findByPk(maintenanceRecord.room_id);
      if (!room) {
        throw new Error('Room not found');
      }

      await maintenanceRecord.destroy();
      room.status = ROOM_STATUS.AVAILABLE;
      await room.save();
    } catch (error: any) {
      throw new Error(`Error deleting maintenance record: ${error.message}`);
    }
  }

  async createMaintenanceRecord(data: Partial<Maintenance>): Promise<Maintenance> {
    try {
      const room = await Room.findByPk(data.room_id);
      if (!room) {
        throw new Error('Room not found');
      }

      if (room.status === ROOM_STATUS.OCCUPIED) {
        throw new Error('Cannot create maintenance record for an occupied room');
      }

      const maintenanceData = { ...data, room_id: room.id } as Maintenance;
      const maintenanceRecord = await Maintenance.create(maintenanceData);
      return maintenanceRecord;
    } catch (error: any) {
      throw new Error(`Error creating maintenance record: ${error.message}`);
    }
  }

  // Display all maintenance records for table
  async getAllMaintenanceDetails(): Promise<any[]> {
    try {
      const maintenances = await Maintenance.findAll({
        include: [
          {
            model: Room,
            attributes: ['id', 'name'],
          },
        ],
      });

      return maintenances;
    } catch (error: any) {
      throw new Error(`Error fetching maintenance records: ${error.message}`);
    }
  }

  async updateMaintenanceByRoomId(room_id: number, updateData: Partial<Maintenance>): Promise<Maintenance[]> {
    try {
      const [numberOfAffectedRows, updatedMaintenances] = await Maintenance.update(updateData, {
        where: { room_id },
        returning: true, 
      });
      if (numberOfAffectedRows === 0) {
        throw new Error('No maintenance records found for the specified room_id');
      }

      return updatedMaintenances;
    } catch (error: any) {
      throw new Error(`Error updating maintenance records: ${error.message}`);
    }
  }


  
}



export default new MaintenanceService();