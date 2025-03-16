import { DataTypes, Model } from '@sequelize/core';
import { Attribute, PrimaryKey, Table } from '@sequelize/core/decorators-legacy';
import { Booking } from '@src/sequelize/models/bookingsModel';
import { Room } from '@src/sequelize/models/roomsModel';

@Table({ tableName: 'booking_rooms' })
export class BookingRoom extends Model {
    @PrimaryKey
    @Attribute(DataTypes.INTEGER)
    declare booking_id: number;

    @PrimaryKey
    @Attribute(DataTypes.INTEGER)
    declare room_id: number;
}
