import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Todo } from './todo.model';
import { Sequelize } from 'sequelize';

@Injectable()
export class TodoService {
  constructor(@InjectModel(Todo) private readonly todoModel: typeof Todo) {}

  async create(createTodoDto: CreateTodoDto): Promise<Todo> {
    const todo = await this.todoModel.create(createTodoDto as any);
    console.log(`Created todo with id ${todo.id}`);
    return todo;
  }

  async findAll(): Promise<Todo[]> {
    return await this.todoModel.findAll({
      attributes: {
        include: [
          [Sequelize.literal(`TO_CHAR(created_at,'DD/MM/YYYY')`), 'created_at'],
        ],
      },
      raw: true,
      order: [['created_at', 'DESC']],
    });
  }

  async findOne(id: string): Promise<Todo> {
    const todo = await this.todoModel.findByPk(id);
    if (!todo) {
      throw new NotFoundException(`Todo with id ${id} not found`);
    }
    return todo;
  }

  async update(id: string, updateTodoDto: UpdateTodoDto): Promise<Todo> {
    const todo = await this.findOne(id);
    return todo.update(updateTodoDto);
  }

  async remove(id: string): Promise<void> {
    const todo = await this.findOne(id);
    await todo.destroy();
  }
}
