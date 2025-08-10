import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from '@sequelize/core';
import { Attribute, AutoIncrement, NotNull, PrimaryKey, Table } from '@sequelize/core/decorators-legacy';

@Table({ tableName: 'revenue_summaries' })
export class RevenueSummary extends Model<InferAttributes<RevenueSummary>, InferCreationAttributes<RevenueSummary>> {
    @PrimaryKey
    @AutoIncrement
    @Attribute(DataTypes.INTEGER)
    declare id: CreationOptional<number>;

    @Attribute(DataTypes.DATEONLY)
    @NotNull
    declare summary_date: Date;

    @Attribute(DataTypes.DOUBLE)
    @NotNull
    declare total_revenue: number;

    @Attribute(DataTypes.DOUBLE)
    @NotNull
    declare room_revenue: number;

    @Attribute(DataTypes.DOUBLE)
    @NotNull
    declare food_revenue: number;

    @Attribute(DataTypes.DOUBLE)
    @NotNull
    declare other_revenue: number;

    @Attribute(DataTypes.DOUBLE)
    @NotNull
    declare total_expenses: number;

    @Attribute(DataTypes.DOUBLE)
    @NotNull
    declare salary_expenses: number;

    @Attribute(DataTypes.DOUBLE)
    @NotNull
    declare operational_expenses: number;

    @Attribute(DataTypes.DOUBLE)
    @NotNull
    declare net_profit: number;

    @Attribute(DataTypes.INTEGER)
    @NotNull
    declare total_bookings: number;

    @Attribute(DataTypes.DATE)
    declare createdAt: CreationOptional<Date>;

    @Attribute(DataTypes.DATE)
    declare updatedAt: CreationOptional<Date>;
    month: any;
}