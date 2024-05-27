//::================================>>Core library<<================================::
//::================================================================================::

//::================================>>Third party<<=================================::
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
//::================================================================================::

//::===============================>>Custom library<<===============================::
import { roles } from './role.seed';
import { users } from './user.seed';
//::================================================================================::

// initialize Prisma Client

const prisma = new PrismaClient();

async function main() {
  //::================================>>Delete data<<=================================::
  await prisma.log.deleteMany();
  await prisma.userSession.deleteMany();
  await prisma.user.deleteMany();
  await prisma.role.deleteMany();
  //::================================================================================::

  //::================================>>Start seed<<==================================::
  for (const role of roles) {
    const newRole = await prisma.role.create({ data: role });
    console.log(newRole);
  }

  for (const user of users) {
    const { password, ...userData } = user;
    const newUser = await prisma.user.create({
      data: {
        ...userData,
        password: await bcrypt.hash(password, 10),
      },
    });
    console.log(newUser);
  }
  //::================================================================================::

  console.log('===============================');
  console.log('|| 🚀  seed succesfully  🚀 ||');
  console.log('===============================');
}

// execute the main function

main()
  .catch((e) => {
    console.error(e);

    process.exit(1);
  })

  .finally(async () => {
    // close Prisma Client at the end

    await prisma.$disconnect();
  });
