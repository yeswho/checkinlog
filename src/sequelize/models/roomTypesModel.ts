import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from '@sequelize/core';
import { Attribute, AutoIncrement, NotNull, PrimaryKey, Table, Unique } from '@sequelize/core/decorators-legacy';
import { ROOM_TYPE } from '@src/enums/database';


@Table({ tableName: 'RoomType' })
export class RoomType extends Model<InferAttributes<RoomType>, InferCreationAttributes<RoomType>> {
    @PrimaryKey
    @AutoIncrement
    @Attribute(DataTypes.INTEGER)
    declare id: CreationOptional<number>;

    @Attribute(DataTypes.STRING(100))
    @NotNull
    declare name: string;

    @Attribute(DataTypes.INTEGER(20))
    declare bed: number;

    @Attribute(DataTypes.DATE)
    @NotNull
    declare dateofbirth: Date;

    @Attribute(DataTypes.STRING(15))
    @NotNull
    @Unique
    declare contact: string;

    @Attribute(DataTypes.STRING(100))
    declare company: string | null;

    @Attribute(DataTypes.DATE)
    declare createdAt: Date;

    @Attribute(DataTypes.DATE)
    declare updatedAt: Date;
}
