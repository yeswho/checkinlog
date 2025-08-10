// src/sequelize/models/menuItem.ts
import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from '@sequelize/core';
import { Attribute, AutoIncrement, BelongsTo, NotNull, PrimaryKey, Table } from '@sequelize/core/decorators-legacy';
import { MenuSubsection } from './menuSubsection';

@Table({ tableName: 'menu_items' })
export class MenuItem extends Model<InferAttributes<MenuItem>, InferCreationAttributes<MenuItem>> {
    @PrimaryKey
    @AutoIncrement
    @Attribute(DataTypes.INTEGER)
    declare item_id: CreationOptional<number>;

    @Attribute(DataTypes.INTEGER)
    @NotNull
    declare subsection_id: number;

    @Attribute(DataTypes.STRING(100))
    @NotNull
    declare name: string;

    @Attribute(DataTypes.STRING(50))
    @NotNull
    declare price: string;

    @Attribute(DataTypes.INTEGER)
    @NotNull
    declare display_order: number;

    @Attribute(DataTypes.DATE)
    declare createdAt: CreationOptional<Date>;

    @Attribute(DataTypes.DATE)
    declare updatedAt: CreationOptional<Date>;

    @BelongsTo(() => MenuSubsection, { foreignKey: 'subsection_id' })
    declare subsection: MenuSubsection;
}