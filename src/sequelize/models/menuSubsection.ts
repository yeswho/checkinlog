// src/sequelize/models/menuSubsection.ts
import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from '@sequelize/core';
import { Attribute, AutoIncrement, BelongsTo, HasMany, NotNull, PrimaryKey, Table } from '@sequelize/core/decorators-legacy';
import { MenuSection } from './menuSection';
import { MenuItem } from './menuItem';

@Table({ tableName: 'menu_subsections' })
export class MenuSubsection extends Model<InferAttributes<MenuSubsection>, InferCreationAttributes<MenuSubsection>> {
    @PrimaryKey
    @AutoIncrement
    @Attribute(DataTypes.INTEGER)
    declare subsection_id: CreationOptional<number>;

    @Attribute(DataTypes.INTEGER)
    @NotNull
    declare section_id: number;

    @Attribute(DataTypes.STRING(100))
    @NotNull
    declare title: string;

    @Attribute(DataTypes.TEXT)
    declare description: string | null;

    @Attribute(DataTypes.INTEGER)
    @NotNull
    declare display_order: number;

    @Attribute(DataTypes.DATE)
    declare createdAt: CreationOptional<Date>;

    @Attribute(DataTypes.DATE)
    declare updatedAt: CreationOptional<Date>;

    @BelongsTo(() => MenuSection, { foreignKey: 'section_id' })
    declare section: MenuSection;

    @HasMany(() => MenuItem, { foreignKey: 'subsection_id' })
    declare items: MenuItem[];
}