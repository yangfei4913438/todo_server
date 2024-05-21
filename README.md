## 普通安装

#### 1、安装依赖
  
  ```bash
  npm install
  ```

#### 2、创建环境变量文件 .env
  > 根据实际的本地服务配置，MySQL 要先创建一个数据库，根据实际情况填。

  ```bash
  # redis
  REDIS_HOST='127.0.0.1'
  REDIS_PORT=6379
  REDIS_DB=0

  # mysql
  MYSQL_HOST='127.0.0.1'
  MYSQL_PORT=3306
  MYSQL_USER='root'
  MYSQL_PASSWORD='123456'
  MYSQL_DATABASE='todo'
  ```

#### 3、启动服务

  ```bash
  npm run start
  ```

#### 4、查看接口

  ```bash
  http://127.0.0.1:3001
  ```

## docker 启动
> 因为只是演示，所以这里的步骤，只针对本地docker环境，不是正式服务器上的操作步骤.
> 这个需要先安装本地的 docker 运行环境。

#### 1、创建环境变量文件 .env
  > 根据实际的本地服务配置，MySQL 要先创建一个数据库，根据实际情况填。
  > 这里的 IP 是本地的局域网的IP。

  ```bash
  # redis
  REDIS_HOST='192.168.50.8'
  REDIS_PORT=6379
  REDIS_DB=0
  REDIS_PASSWORD=""

  # mysql
  MYSQL_HOST='192.168.50.8'
  MYSQL_PORT=3306
  MYSQL_USER='root'
  MYSQL_PASSWORD='123456'
  MYSQL_DATABASE='todo'
  ```

#### 2、在项目的根目录下执行, 构建docker镜像

```bash
docker build -t todo_server:first .
```

#### 3、启动服务

```bash
docker run --name todo_server -p 3001:3001 -d  --restart=always todo_server:first
```
