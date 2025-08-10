import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from '@sequelize/core';
import { Attribute, AutoIncrement, NotNull, PrimaryKey, Table } from '@sequelize/core/decorators-legacy';
import { EXPENSE_CATEGORY } from '@src/enums/database';

@Table({ tableName: 'expenses' })
export class Expense extends Model<InferAttributes<Expense>, InferCreationAttributes<Expense>> {
    @PrimaryKey
    @AutoIncrement
    @Attribute(DataTypes.INTEGER)
    declare id: CreationOptional<number>;

    @Attribute(DataTypes.STRING(255))
    @NotNull
    declare name: string;

    @Attribute(DataTypes.DOUBLE)
    @NotNull
    declare amount: number;

    @Attribute(DataTypes.DATE)
    @NotNull
    declare expense_date: Date;

    @Attribute(DataTypes.ENUM(...Object.values(EXPENSE_CATEGORY)))
    @NotNull
    declare category: EXPENSE_CATEGORY;

    @Attribute(DataTypes.STRING(255))
    @NotNull
    declare remarks: string;

    @Attribute(DataTypes.DATE)
    declare createdAt: CreationOptional<Date>;

    @Attribute(DataTypes.DATE)
    declare updatedAt: CreationOptional<Date>;
}