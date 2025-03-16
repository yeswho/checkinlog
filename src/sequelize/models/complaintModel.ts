import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from '@sequelize/core';
import { Attribute, AutoIncrement, BelongsTo, NotNull, PrimaryKey, Table } from '@sequelize/core/decorators-legacy';
import { Customer } from './customerModel';
import { Room } from './roomsModel';

@Table({ tableName: 'complaints' })
export class Complaint extends Model<InferAttributes<Complaint>, InferCreationAttributes<Complaint>> {
    @PrimaryKey
    @AutoIncrement
    @Attribute(DataTypes.INTEGER)
    declare id: CreationOptional<number>;

    @Attribute(DataTypes.STRING)
    @NotNull
    declare title: string;

    @Attribute(DataTypes.TEXT)
    @NotNull
    declare description: string;

    @Attribute(DataTypes.ENUM('open', 'in_progress', 'resolved'))
    @NotNull
    declare status: 'open' | 'in_progress' | 'resolved';

    @Attribute(DataTypes.ENUM('low', 'medium', 'high'))
    @NotNull
    declare priority: 'low' | 'medium' | 'high';

    @Attribute(DataTypes.INTEGER)
    declare roomId: number | null;

    @Attribute(DataTypes.INTEGER)
    declare customerId: number | null;

    @Attribute(DataTypes.DATE)
    declare createdAt: CreationOptional<Date>;

    @Attribute(DataTypes.DATE)
    declare updatedAt: CreationOptional<Date>;

    @BelongsTo(() => Customer, { foreignKey: 'customerId' })
    declare customer: Customer;

    @BelongsTo(() => Room, { foreignKey: 'roomId' })
    declare room: Room;
}