import { Table, Column, Model, DataType, PrimaryKey, Default, HasMany} from 'sequelize-typescript';
import { Todo } from '../todo/todo.model';
import { Optional } from 'sequelize';

export interface UserAttributes {
  id: string;
  email: string;
  image: string;
  password: string;
}

export interface UserCreationAttributes
  extends Optional<UserAttributes, 'id'> {}

@Table({ tableName: 'users' })
export class User extends Model<UserAttributes, UserCreationAttributes> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  email: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  image: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  password: string;

  @HasMany(() => Todo)
  todos: Todo[];
}
