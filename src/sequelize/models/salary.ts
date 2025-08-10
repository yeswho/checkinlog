import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from '@sequelize/core';
import { Attribute, AutoIncrement, BelongsTo, NotNull, PrimaryKey, Table } from '@sequelize/core/decorators-legacy';
import { Employee } from './employee';

@Table({ tableName: 'salaries' })
export class Salary extends Model<InferAttributes<Salary>, InferCreationAttributes<Salary>> {
    @PrimaryKey
    @AutoIncrement
    @Attribute(DataTypes.INTEGER)
    declare id: CreationOptional<number>;

    @Attribute(DataTypes.INTEGER)
    @NotNull
    declare employee_id: number;

    @Attribute(DataTypes.DOUBLE)
    @NotNull
    declare basic_salary: number;

    @Attribute(DataTypes.DOUBLE)
    declare bonus: number;

    @Attribute(DataTypes.DOUBLE)
    declare advance: number;

    @Attribute(DataTypes.DOUBLE)
    declare overtime: number;

    @Attribute(DataTypes.DOUBLE)
    @NotNull
    declare total_salary: number;

    @Attribute(DataTypes.DATE)
    @NotNull
    declare salary_date: Date;

    @Attribute(DataTypes.DATE)
    declare createdAt: CreationOptional<Date>;

    @Attribute(DataTypes.DATE)
    declare updatedAt: CreationOptional<Date>;

    @BelongsTo(() => Employee, { foreignKey: 'employee_id' })
    declare employee: Employee;
}