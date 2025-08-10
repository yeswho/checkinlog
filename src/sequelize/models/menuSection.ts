// src/sequelize/models/menuSection.ts
import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from '@sequelize/core';
import { Attribute, AutoIncrement, HasMany, NotNull, PrimaryKey, Table } from '@sequelize/core/decorators-legacy';
import { MenuSubsection } from './menuSubsection';

@Table({ tableName: 'menu_sections' })
export class MenuSection extends Model<InferAttributes<MenuSection>, InferCreationAttributes<MenuSection>> {
    @PrimaryKey
    @AutoIncrement
    @Attribute(DataTypes.INTEGER)
    declare section_id: CreationOptional<number>;

    @Attribute(DataTypes.STRING(100))
    @NotNull
    declare title: string;

    @Attribute(DataTypes.INTEGER)
    @NotNull
    declare display_order: number;

    @Attribute(DataTypes.DATE)
    declare createdAt: CreationOptional<Date>;

    @Attribute(DataTypes.DATE)
    declare updatedAt: CreationOptional<Date>;

    @HasMany(() => MenuSubsection, { foreignKey: 'section_id' })
    declare subsections: MenuSubsection[];
}