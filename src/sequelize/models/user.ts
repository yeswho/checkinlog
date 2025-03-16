import { 
    CreationOptional, 
    DataTypes, 
    InferAttributes, 
    InferCreationAttributes, 
    Model 
  } from '@sequelize/core';
  import { 
    Attribute, 
    AutoIncrement, 
    NotNull, 
    PrimaryKey, 
    Table, 
    Unique 
  } from '@sequelize/core/decorators-legacy';
  
  @Table({ tableName: 'User' })
  export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
    @PrimaryKey
    @AutoIncrement
    @Attribute(DataTypes.INTEGER)
    declare id: CreationOptional<number>;
  
    @Attribute(DataTypes.STRING(200))
    @NotNull
    @Unique
    declare email: string;
  
    @Attribute(DataTypes.STRING(200))
    @NotNull
    declare password: string;
  
    @Attribute(DataTypes.STRING(50))
    @Unique
    declare username: string;
  
    @Attribute(DataTypes.BOOLEAN)
    @NotNull
    declare isActive: CreationOptional<boolean>;
  
    @Attribute(DataTypes.INTEGER)
    @NotNull
    declare tokenVersion: number;
    
    @Attribute(DataTypes.DATE)
    declare createdAt: CreationOptional<Date>;
  
    @Attribute(DataTypes.DATE)
    declare updatedAt: CreationOptional<Date>;

  }
  