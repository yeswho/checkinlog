import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from '@sequelize/core';
import { Attribute, AutoIncrement, NotNull, PrimaryKey, Table, Unique } from '@sequelize/core/decorators-legacy';
import { GENDER } from '@src/enums/database';

@Table({ tableName: 'Customers' })
export class Customer extends Model<InferAttributes<Customer>, InferCreationAttributes<Customer>> {
    @PrimaryKey
    @AutoIncrement
    @Attribute(DataTypes.INTEGER)
    declare id: CreationOptional<number>;

    @Attribute(DataTypes.STRING(100))
    @NotNull
    declare firstname: string;

    @Attribute(DataTypes.STRING(100))
    @NotNull
    declare lastname: string;

    @Attribute(DataTypes.STRING(255))
    declare address: string | null;

    @Attribute(DataTypes.DATE)
    @NotNull
    declare dateofbirth: Date;

    @Attribute(DataTypes.STRING(15))
    @NotNull
    @Unique
    declare contact: string;

    @Attribute(DataTypes.ENUM(...Object.values(GENDER)))
    declare gender: GENDER;

    @Attribute(DataTypes.STRING(100))
    declare company: string | null;

    @Attribute(DataTypes.DATE)
    declare createdAt: Date;

    @Attribute(DataTypes.DATE)
    declare updatedAt: Date;
}
