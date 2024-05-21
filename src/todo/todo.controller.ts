import {
  Body,
  Param,
  Controller,
  Get,
  Post,
  Delete,
  Put,
  HttpException,
} from '@nestjs/common';
import { TodoService } from './todo.service';
import { TodoCreate, TodoUpdate } from './dto/todo.dto';

@Controller('todo')
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  @Get()
  async getTodoList() {
    try {
      return await this.todoService.getTodoList();
    } catch (error) {
      throw new HttpException(error.message, error.status || 500);
    }
  }

  @Post()
  async create(@Body() body: TodoCreate) {
    try {
      return await this.todoService.create(body);
    } catch (error) {
      throw new HttpException(error.message, error.status || 500);
    }
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    try {
      return await this.todoService.delete(id);
    } catch (error) {
      throw new HttpException(error.message, error.status || 500);
    }
  }

  @Put()
  async update(@Body() todo: TodoUpdate) {
    try {
      return await this.todoService.update(todo);
    } catch (error) {
      throw new HttpException(error.message, error.status || 500);
    }
  }
}
