import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from '@sequelize/core';
import { Attribute, AutoIncrement, BelongsTo, NotNull, PrimaryKey, Table, Unique } from '@sequelize/core/decorators-legacy';
import { PAYMENT_MODE } from '@src/enums/database';
import { Room } from '@src/sequelize/models/roomsModel';
import { Customer } from '@src/sequelize/models/customerModel';
@Table({ tableName: 'Bookings' })
export class Booking extends Model<InferAttributes<Booking>, InferCreationAttributes<Booking>> {
    @PrimaryKey
    @AutoIncrement
    @Attribute(DataTypes.INTEGER)
    declare id: CreationOptional<number>;

    @Attribute(DataTypes.INTEGER)
    @NotNull
    declare customer_id: number;

    @Attribute(DataTypes.INTEGER)
    @NotNull
    declare room_id: number;

    @Attribute(DataTypes.DATE)
    @NotNull
    declare check_in: Date;

    @Attribute(DataTypes.DATE)
    @NotNull
    declare check_out: Date;

    @Attribute(DataTypes.ENUM(...Object.values(PAYMENT_MODE)))
    declare payment_mode: PAYMENT_MODE;

    @Attribute(DataTypes.DATE)
    declare createdAt: CreationOptional<Date>;

    @Attribute(DataTypes.DATE)
    declare updatedAt: CreationOptional<Date>;

    @BelongsTo(() => Customer, { foreignKey: 'customer_id' })
    customer!: Customer;

    @BelongsTo(() => Room, { foreignKey: 'room_id' })
    room!: Room;
}
