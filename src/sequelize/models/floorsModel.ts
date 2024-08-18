import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from '@sequelize/core';
import { Attribute, AutoIncrement, NotNull, PrimaryKey, Table, Unique } from '@sequelize/core/decorators-legacy';

@Table({ tableName: 'Floor' })
export class Floor extends Model<InferAttributes<Floor>, InferCreationAttributes<Floor>> {
    @PrimaryKey
    @AutoIncrement
    @Attribute(DataTypes.INTEGER)
    declare id: CreationOptional<number>;

    @Attribute(DataTypes.STRING(200))
    @NotNull
    @Unique
    declare name: string;

    @Attribute(DataTypes.DATE)
    declare createdAt: Date;

    @Attribute(DataTypes.DATE)
    declare updatedAt: Date;
}
