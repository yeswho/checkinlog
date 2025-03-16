import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from '@sequelize/core';
import { Attribute, AutoIncrement, BelongsTo, BelongsToMany, NotNull, PrimaryKey, Table, HasMany } from '@sequelize/core/decorators-legacy';
import { ROOM_STATUS } from '@src/enums/database';
import { Floor } from '@models/floorsModel';
import { RoomType } from './index';
import { Booking } from './index';
import { Maintenance } from '@models/maintenance';
import { BookingRoom } from './index';

@Table({ tableName: 'rooms' })
export class Room extends Model<InferAttributes<Room>, InferCreationAttributes<Room>> {
    @PrimaryKey
    @AutoIncrement
    @Attribute(DataTypes.INTEGER)
    declare id: CreationOptional<number>;

    @Attribute(DataTypes.STRING(100))
    @NotNull
    declare name: string;

    @Attribute(DataTypes.INTEGER)
    @NotNull
    declare floor_id: number;

    @Attribute(DataTypes.INTEGER)
    @NotNull
    declare roomType_id: number;

    @Attribute(DataTypes.DOUBLE)
    declare rate: number;

    @Attribute(DataTypes.ENUM(...Object.values(ROOM_STATUS)))
    declare status: ROOM_STATUS;

    @Attribute(DataTypes.DATE)
    declare createdAt: CreationOptional<Date>;

    @Attribute(DataTypes.DATE)
    declare updatedAt: CreationOptional<Date>;

    @BelongsTo(() => Floor, { foreignKey: 'floor_id' })
    floor!: Floor;

    @BelongsTo(() => RoomType, { foreignKey: 'roomType_id' })
    roomType!: RoomType;

    @BelongsToMany(() => Booking, { 
        through: () => BookingRoom, 
        foreignKey: 'room_id', 
        otherKey: 'booking_id',
        inverse: { as: 'rooms' } 
    })
    declare bookings: Booking[];
    

    @HasMany(() => Maintenance, { foreignKey: 'room_id' })
    maintenances!: Maintenance[];
}