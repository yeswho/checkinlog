
import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from '@sequelize/core';
import { Attribute, AutoIncrement, NotNull, PrimaryKey, Table } from '@sequelize/core/decorators-legacy';
import { DESIGNATIONS } from '@src/enums/database';

@Table({ tableName: 'employees' })
export class Employee extends Model<InferAttributes<Employee>, InferCreationAttributes<Employee>> {
    @PrimaryKey
    @AutoIncrement
    @Attribute(DataTypes.INTEGER)
    declare id: CreationOptional<number>;

    @Attribute(DataTypes.STRING(255))
    @NotNull
    declare name: string;

    @Attribute(DataTypes.ENUM(...Object.values(DESIGNATIONS)))
    @NotNull
    declare designation: DESIGNATIONS;

    @Attribute(DataTypes.DOUBLE)
    @NotNull
    declare basic_salary: number;

    @Attribute(DataTypes.DATE)
    declare createdAt: CreationOptional<Date>;

    @Attribute(DataTypes.DATE)
    declare updatedAt: CreationOptional<Date>;
}