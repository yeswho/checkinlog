import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from '@sequelize/core';
import { Attribute, AutoIncrement, BelongsTo, BelongsToMany, HasMany, NotNull, PrimaryKey, Table } from '@sequelize/core/decorators-legacy';
import { BOOKING_SOURCE, BOOKING_STATUS, PAYMENT_MODE } from '@src/enums/database';
import { Customer } from '@src/sequelize/models/customerModel';
import { Room } from './index';
import { BookingRoom } from './index';
import { AdditionalCharge } from '@src/sequelize/models/additionalCharge';

@Table({ tableName: 'bookings' })
export class Booking extends Model<InferAttributes<Booking>, InferCreationAttributes<Booking>> {
    @PrimaryKey
    @AutoIncrement
    @Attribute(DataTypes.INTEGER)
    declare id: CreationOptional<number>;

    @Attribute(DataTypes.INTEGER)
    @NotNull
    declare customer_id: number;

    @Attribute(DataTypes.DATE)
    @NotNull
    declare check_in: Date;

    @Attribute(DataTypes.DOUBLE)
    declare rate: number;

    @Attribute(DataTypes.DATE)
    @NotNull
    declare check_out: Date;

    @Attribute(DataTypes.INTEGER)
    @NotNull
    declare pax: number;

    @Attribute(DataTypes.JSON)
    declare requested_roomType: number[];

    @Attribute(DataTypes.ENUM(...Object.values(PAYMENT_MODE)))
    declare payment_mode: PAYMENT_MODE;

    @Attribute(DataTypes.ENUM(...Object.values(BOOKING_STATUS)))
    declare status: BOOKING_STATUS;

    @Attribute(DataTypes.ENUM(...Object.values(BOOKING_SOURCE)))
    @NotNull
    declare source: BOOKING_SOURCE;

    @Attribute(DataTypes.DATE)
    declare createdAt: CreationOptional<Date>;

    @Attribute(DataTypes.DATE)
    declare updatedAt: CreationOptional<Date>;

    @BelongsTo(() => Customer, { foreignKey: 'customer_id' })
    declare customer: Customer;

    @BelongsToMany(() => Room, {
        through: () => BookingRoom,
        foreignKey: 'booking_id',
        otherKey: 'room_id',
        inverse: { as: 'bookings' }
    })
    declare rooms: Room[];

    @HasMany(() => AdditionalCharge, { foreignKey: 'booking_id' }) // Add this relationship
    declare additionalCharges: AdditionalCharge[];
}