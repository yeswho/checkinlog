import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from '@sequelize/core';
import { Attribute, AutoIncrement, NotNull, PrimaryKey, Table } from '@sequelize/core/decorators-legacy';

@Table({ tableName: 'RoomType' })
export class RoomType extends Model<InferAttributes<RoomType>, InferCreationAttributes<RoomType>> {
    @PrimaryKey
    @AutoIncrement
    @Attribute(DataTypes.INTEGER)
    declare id: CreationOptional<number>;

    @Attribute(DataTypes.STRING(100))
    @NotNull
    declare name: string;

    @Attribute(DataTypes.INTEGER)
    declare bed: number;

    @Attribute({type: DataTypes.BOOLEAN, defaultValue: false})
    declare ac: boolean;

    @Attribute({type: DataTypes.BOOLEAN, defaultValue: true})
    declare bathroom: boolean;

    @Attribute(DataTypes.DATE)
    declare createdAt: Date;

    @Attribute(DataTypes.DATE)
    declare updatedAt: Date;
}
