import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RedisService } from 'src/redis/redis.service';
import { TodoCreate, TodoUpdate } from 'src/todo/dto/todo.dto';
import { Todo } from 'src/todo/entities/todo.entity';

const TODO_LIST_KEY = 'todo_list';

@Injectable()
export class TodoService {
  @InjectRepository(Todo)
  private readonly todoRepository: Repository<Todo>;

  @Inject(RedisService)
  private readonly redisClient: RedisService;

  // 设置缓存过期时间为 1 小时
  private cacheTTL = 60 * 60;

  // 获取代办事项列表
  async getTodoList() {
    // 从 Redis 中获取数据
    const todo_list =
      await this.redisClient.getObjectsFromZSetDesc(TODO_LIST_KEY);

    if (todo_list.length > 0) {
      return todo_list;
    }

    // 从数据库中获取数据
    const data = await this.todoRepository.find({
      order: { createdTime: 'desc' },
    });

    // 将数据存入 Redis, 过期时间为 600 秒
    await this.redisClient.pushListToZSet(TODO_LIST_KEY, data, this.cacheTTL);

    // 返回数据
    return data;
  }

  // 创建待办事项
  async create(todo: TodoCreate) {
    // 将数据存入数据库
    const data = await this.todoRepository.save(todo);

    // 添加单个数据到 Redis 中
    await this.redisClient.setHash<Todo>(
      `todo:${data.id}`,
      data,
      this.cacheTTL,
    );
    // 追加数据到待办事项列表中
    await this.redisClient.appendObjectToZSet(
      TODO_LIST_KEY,
      data,
      this.cacheTTL,
    );

    return data;
  }

  // 获取待办事项
  async getTodo(id: string, cache: boolean = true): Promise<Todo> {
    if (cache) {
      // 从 Redis 中获取数据
      const todo = await this.redisClient.getHash<Todo>(`todo:${id}`);
      if (todo) {
        return todo;
      }
    }

    // 从数据库中获取数据
    const data = await this.todoRepository.findOneBy({ id });
    if (!data) {
      return null;
    }

    // 将数据存入 Redis
    await this.redisClient.setHash(`todo:${id}`, data, this.cacheTTL);

    return data;
  }

  // 删除待办事项
  async delete(id: string) {
    // 找到旧的数据
    const oldData = await this.getTodo(id);

    // 删除数据库中的数据
    await this.todoRepository.delete(id);

    // 删除 Redis 中的相应缓存
    await this.redisClient.del(`todo:${id}`);

    // 删除 Redis 中的待办事项列表中的数据
    await this.redisClient.deleteObjectInZSet(TODO_LIST_KEY, oldData);

    return oldData;
  }

  // 更新待办事项
  async update(todo: TodoUpdate) {
    // 将 id 从 todo 对象中取出
    const { id, ...updateData } = todo;

    // 找到旧的数据
    const oldData = await this.getTodo(id);
    if (!oldData) {
      throw new HttpException('待办事项不存在', HttpStatus.NOT_FOUND);
    }

    // 更新数据库
    await this.todoRepository.update(id, updateData);

    // 找到新的数据
    const newData = await this.getTodo(id, false);

    // 更新 Redis 中的数据
    await this.redisClient.setHash(`todo:${id}`, newData, this.cacheTTL);

    // 更新待办事项列表中的数据
    await this.redisClient.updateObjectInZSet(
      TODO_LIST_KEY,
      oldData,
      newData,
      this.cacheTTL,
    );

    // 返回更新数据
    return newData;
  }
}
