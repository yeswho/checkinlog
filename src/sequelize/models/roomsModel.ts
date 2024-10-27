import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from '@sequelize/core';
import { Attribute, AutoIncrement, BelongsTo, NotNull, PrimaryKey, Table } from '@sequelize/core/decorators-legacy';
import { ROOM_STATUS } from '@src/enums/database';
import { Floor } from '@models/floorsModel';
import { RoomType } from '@models/roomTypesModel';

@Table({ tableName: 'Room' })
export class Room extends Model<InferAttributes<Room>, InferCreationAttributes<Room>> {
    @PrimaryKey
    @AutoIncrement
    @Attribute(DataTypes.INTEGER)
    declare id: CreationOptional<number>;

    @Attribute(DataTypes.INTEGER)
    @NotNull
    declare floor_id: number;

    @Attribute(DataTypes.INTEGER)
    @NotNull
    declare roomType_id: number;

    @Attribute(DataTypes.DOUBLE)
    declare rate: number;

    @Attribute(DataTypes.ENUM(...Object.values(ROOM_STATUS)))
    declare status: ROOM_STATUS

    @Attribute(DataTypes.DATE)
    declare createdAt: CreationOptional<Date>;

    @Attribute(DataTypes.DATE)
    declare updatedAt: CreationOptional<Date>;

    @BelongsTo(() => Floor, { foreignKey: 'floor_id' })
    floor!: Floor;

    @BelongsTo(() => RoomType, { foreignKey: 'roomType_id' })
    roomType!: RoomType;
}
