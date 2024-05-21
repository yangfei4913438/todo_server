import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'todo', comment: '待办事项表' })
export class Todo {
  @PrimaryGeneratedColumn('uuid', { comment: '主键' })
  id: string;

  @Column({
    type: 'varchar',
    nullable: false,
    length: 100,
    comment: '标题',
  })
  title: string;

  @Column({ comment: '是否已完成', type: 'boolean', default: false })
  completed: boolean;

  @CreateDateColumn({
    comment: '创建时间',
    type: 'datetime',
    name: 'created_at',
    insert: true,
    update: false,
  })
  createTime: Date;

  @UpdateDateColumn({
    comment: '更新时间',
    type: 'datetime',
    name: 'updated_at',
    insert: true,
    update: true,
  })
  updateTime: Date;
}
