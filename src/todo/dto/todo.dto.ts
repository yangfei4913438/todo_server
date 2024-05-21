import { IsNotEmpty } from 'class-validator';

export class TodoCreate {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  completed: boolean;
}

export class TodoUpdate {
  @IsNotEmpty()
  id: string;

  title?: string;

  @IsNotEmpty()
  completed: boolean;
}
