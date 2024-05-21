import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RedisService } from 'src/redis/redis.service';
import { TodoCreate, TodoUpdate } from 'src/todo/dto/todo.dto';
import { Todo } from 'src/todo/entities/todo.entity';

const TODO_KEY = 'todo_list';

@Injectable()
export class TodoService {
  @InjectRepository(Todo)
  private readonly todoRepository: Repository<Todo>;

  @Inject(RedisService)
  private readonly redisClient: RedisService;

  async getTodoList() {
    // 从 Redis 中获取数据
    const todo_list = await this.redisClient.getListAll(TODO_KEY);
    if (todo_list.length > 0) {
      return todo_list;
    }

    // 从数据库中获取数据
    const data = await this.todoRepository.find({
      order: { createTime: 'desc' },
    });

    // 将数据存入 Redis, 过期时间为 600 秒
    await this.redisClient.pushArray(TODO_KEY, data, 600);

    // 返回数据
    return data;
  }

  // 创建待办事项
  async create(todo: TodoCreate) {
    // 将数据存入数据库
    const data = await this.todoRepository.save(todo);

    // 追加数据到 Redis 中
    await this.redisClient.appendToList(TODO_KEY, data.id, data);

    return data;
  }

  // 删除待办事项
  async delete(id: string) {
    const data = await this.todoRepository.delete(id);

    // 删除 Redis 中的相应缓存
    await this.redisClient.removeElementById(TODO_KEY, id);

    return data;
  }

  // 更新待办事项
  async update(todo: TodoUpdate) {
    // 将 id 从 todo 对象中取出
    const { id, ...updateData } = todo;

    // 更新数据库
    const data = await this.todoRepository.update(id, updateData);

    // 更新 Redis 中的数据
    await this.redisClient.updateElementById(TODO_KEY, id, updateData);

    // 返回更新数据
    return data;
  }
}
