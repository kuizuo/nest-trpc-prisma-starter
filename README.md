# Nest + tRPC + Prisma + Zod

这是一个使用 Nest.js、Prisma、tRPC 和 Zod 构建的现代化全栈应用程序的示例项目。

## ✨ 特性

- NestJS + tRPC 一套完整的类型安全方案，客户端 api 接入体验拉满！
- Prisma 现代化的 ORM 框架。
- 使用 Zod 替代 [class-validator](https://github.com/typestack/class-validator)，让你无需编写繁琐的装饰器。
- [CASL.js](https://casl.js.org/) 完成复杂角色权限的验证。

## 🔧 技术栈

- Server
  - NestJS
  - tRPC
  - Prisma
  - Zod
- Web 
  - Next.js
- Admin
  - Ant Design Pro

## 📄 使用说明

你可以使用传统 Controller 的方式来编写接口，也可以定义 tRPC router 的形式，取决于你喜好。我个人针对用户端部分(Next.js、React Native) 会偏向于 tRPC，而对于管理面板(Ant Design Pro)还是选用传统 Controller 方式。

### 运行项目

1. 克隆该项目

```
git clone https://github.com/kuizuo/nest-trpc-prisma-starter
```

2. 配置环境变量，将 .env.example 更改为 .env，并配置好 postgresql 数据库变量。
3. 执行如下代码

```
pnpm i
pnpm dev 
```

将会启动以下服务

Server: http://127.0.0.1:5001

Trpc placground:  http://127.0.0.1:5001/api/trpc-playground

Admin: http://localhost:8000

Web: http://localhost:3000

### 创建一个 trpc 服务模块

实现代码参考

1. 假定你的 module 为 xxx，在 modules/xxx 文件夹下创建 xxx.trpc.ts 文件，其代码可以参考 [todo.trpc.ts](./apps/server/src/modules/todo/todo.trpc.ts) 文件。这里贴上示例代码

   ```typescript
   @TRPCRouter()
   @Injectable()
   export class TodoTrpcRouter implements OnModuleInit {
     private router: ReturnType<typeof this.createRouter>
   
     constructor(
       private readonly trpcService: TRPCService,
       private readonly todoService: TodoService,
     ) { }
   
     onModuleInit() {
       this.router = this.createRouter()
     }
   
     private createRouter() {
       const procedureAuth = this.trpcService.procedureAuth
       return defineTrpcRouter('todo', {
         list: this.trpcService.procedureAuth
           .input(TodoPagerDto.schema)
           .meta({ model: 'Todo', action: Action.Read })
           .query(async (opt) => {
             const { input, ctx: { user } } = opt
   
             return this.todoService.list(input, user.id)
           }),
         create: procedureAuth
           .input(TodoInputSchema)
           .meta({ model: 'Todo', action: Action.Create })
           .mutation(async (opt) => {
             const { input, ctx: { user } } = opt
   
             return this.todoService.create(input, user.id)
           }),
     }
   }
   ```

2. 将 xxx.trpc.ts 在 xxx.module.ts 声明导入，同时在 [trpc.routers.ts](./apps/server/src/shared/trpc/trpc.routes.ts) 导入用于类型提示生成。

3. 此时便可在 client 端接入 trpc server，这部分请参阅 [tRPC 文档](https://trpc.io/docs/client)。

### 如何进行权限控制

1. 首先要定义所访问的资源，也就是 Prisma 的 model，可在 [ability.class.ts](./apps/server/src/modules/casl/ability.class.ts) 中查看详情，这里假定你的模块为 `XXX`。

2. 在指定 module 中，创建 xxx.ability.ts，可以仿造 [todo.ability.ts](./apps/server/src/modules/todo/todo.ability.ts) 进行编写。

3. 记得将 xxxAbility 作为 Provider 导入到 xxxModule 中，CaslModule 会自动扫描所有 ability 注入服务。

4. 在 Controller 中使用装饰器 `@UseGuards(PolicyGuard)`，同样可参见 [todo.controller.ts](./apps/server/src/modules/todo/todo.controller.ts) 。并在指定控制器方法中 使用 `@Policy` 来声明该路由请求者所需的权限。 

   ```typescript
   export class TodoController {
     
     @Get(':id')
     @Policy({ model: 'Todo', action: Action.Read })
     async findOne(@Param() { id }: IdDto) {
       return this.todoService.findOne(id)
     }
   }
   ```

5. trpc 则使用 `.meta`，如下所示。

   ```typescript
       defineTrpcRouter('todo', {
   			byId: procedureAuth
           .input(IdDto.schema)
           .meta({ model: 'Todo', action: Action.Read })
           .query(async (opt) => {
             const { input } = opt
             const { id } = input
   
             return this.todoService.findOne(id)
           }),
       }
   ```

### VS Code 多根工作区

由于项目使用 Monorepo 进行管理，因此你可以打开 .vscode/project.code-workspace，点击右下角 Open Workplace 打开多根工作区，如下图所示。

![image-20240505171520650](https://img.kuizuo.cn/2024/0505171846-image-20240505171520650.png)

## TODO

- [ ] 示例从 Todo List 更改成 Post
- [ ] 升级到 Trpc 11
- [ ] 升级 Tanstack Query 5
- [ ] 集成 [Auth.js](https://authjs.dev/) 

## 相关项目

[Youni](https://github.com/kuizuo/youni) 一个基于 React Native 开发的校园社交应用。

## 参考

http://blog.innei.ren/nestjs-with-trpc-and-dependency-injection

https://www.tomray.dev/nestjs-nextjs-trpc

## 📝License

[MIT](./LICENSE)

Copyright (c) 2024 Kuizuo