import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from '@sequelize/core';
import { Attribute, AutoIncrement, BelongsTo, NotNull, PrimaryKey, Table } from '@sequelize/core/decorators-legacy';
import { Room } from '@src/sequelize/models/roomsModel';

@Table({ tableName: 'Maintenance' })
export class Maintenance extends Model<InferAttributes<Maintenance>, InferCreationAttributes<Maintenance>> {
  @PrimaryKey
  @AutoIncrement
  @Attribute(DataTypes.INTEGER)
  declare id: CreationOptional<number>;

  @Attribute(DataTypes.INTEGER)
  @NotNull
  declare room_id: number;

  @Attribute(DataTypes.STRING)
  @NotNull
  declare reason: string;

  @Attribute(DataTypes.DATE)
  @NotNull
  declare startDate: Date;

  @Attribute(DataTypes.DATE)
  @NotNull
  declare expectedEndDate: Date;

  @Attribute(DataTypes.DATE)
  declare createdAt: CreationOptional<Date>;

  @Attribute(DataTypes.DATE)
  declare updatedAt: CreationOptional<Date>;

  @BelongsTo(() => Room, { foreignKey: 'room_id' })
  room!: Room;
}
