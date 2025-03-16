import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from '@sequelize/core';
import { Attribute, AutoIncrement, BelongsTo, NotNull, PrimaryKey, Table } from '@sequelize/core/decorators-legacy';
import { Booking } from '@src/sequelize/models/bookingsModel';

@Table({ tableName: 'billings' })
export class Billing extends Model<InferAttributes<Billing>, InferCreationAttributes<Billing>> {
    @PrimaryKey
    @AutoIncrement
    @Attribute(DataTypes.INTEGER)
    declare id: CreationOptional<number>;

    @Attribute(DataTypes.INTEGER)
    @NotNull
    declare booking_id: number;

    @Attribute(DataTypes.DOUBLE)
    @NotNull
    declare total_amount: number;

    @Attribute(DataTypes.DOUBLE)
    declare discount: number;

    @Attribute(DataTypes.DOUBLE)
    declare extra_charge: number;

    @Attribute(DataTypes.DOUBLE)
    @NotNull
    declare final_amount: number;

    @Attribute(DataTypes.STRING(255))
    declare remarks: string | null;

    @Attribute(DataTypes.DATE)
    @NotNull
    declare billing_date: Date;

    @Attribute(DataTypes.DATE)
    declare createdAt: CreationOptional<Date>;

    @Attribute(DataTypes.DATE)
    declare updatedAt: CreationOptional<Date>;

    @BelongsTo(() => Booking, { foreignKey: 'booking_id' })
    declare booking: Booking;
}