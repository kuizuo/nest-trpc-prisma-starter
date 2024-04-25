import { PrismaClient, Prisma } from '.';
import { hashSync } from 'bcrypt'

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding...');

  await prisma.user.upsert({
    where: { username: 'admin' },
    create: {
      id: '23900561662304251',
      username: 'admin',
      password: hashSync('Aa123456', 10),
      role: "Admin",
      avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=Muffin',
      email: 'admin@example.com',
    },
    update: {}
  })

  const userId = '23900561662304252'
  await prisma.user.upsert({
    where: { username: 'user' },
    create: {
      id: '23900561662304252',
      username: 'user',
      password: hashSync('Aa123456', 10),
      role: "User",
      avatar: 'https://kuizuo.cn/img/logo.png',
      email: 'hi@example.cn',
    },
    update: {}
  })

  const todos = ['code', 'sleep', 'eat']

  await prisma.todo.createMany({
    data: todos.map((todo, i) => ({
      id: '2390056166230000' + i,
      userId: userId,
      value: todo
    }))
  })

  console.log('Seeding done!');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
