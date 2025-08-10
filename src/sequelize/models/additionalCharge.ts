import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from '@sequelize/core';
import { Attribute, AutoIncrement, NotNull, PrimaryKey, Table } from '@sequelize/core/decorators-legacy';


@Table({ tableName: 'additional_charges' })
export class AdditionalCharge extends Model<InferAttributes<AdditionalCharge>, InferCreationAttributes<AdditionalCharge>> {
    @PrimaryKey
    @AutoIncrement
    @Attribute(DataTypes.INTEGER)
    declare id: CreationOptional<number>;

    @Attribute(DataTypes.INTEGER)
    @NotNull
    declare booking_id: number;

    @Attribute(DataTypes.STRING(255))
    @NotNull
    declare description: string;

    @Attribute(DataTypes.DOUBLE)
    @NotNull
    declare amount: number;

    @Attribute(DataTypes.BOOLEAN)
    @NotNull
    declare isFood: boolean;

    @Attribute(DataTypes.DATE)
    declare createdAt: CreationOptional<Date>;

    @Attribute(DataTypes.DATE)
    declare updatedAt: CreationOptional<Date>;
}