import { PrismaClient, Role } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding started...");

  // Clean existing users
  await prisma.user.deleteMany({});

  const passwordHash = bcrypt.hashSync("password123", 10);

  const usersToCreate = [
    {
      name: "John Manager",
      email: "manager@roadkings.com",
      passwordHash,
      role: Role.FLEET_MANAGER,
    },
    {
      name: "Rahul Dispatcher",
      email: "dispatcher@roadkings.com",
      passwordHash,
      role: Role.DISPATCHER,
    },
    {
      name: "Pradeep Safety",
      email: "safety@roadkings.com",
      passwordHash,
      role: Role.SAFETY_OFFICER,
    },
    {
      name: "Ananya Finance",
      email: "finance@roadkings.com",
      passwordHash,
      role: Role.FINANCIAL_ANALYST,
    },
  ];

  for (const user of usersToCreate) {
    const created = await prisma.user.create({
      data: user,
    });
    console.log(`Created user: ${created.email} with role ${created.role}`);
  }

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
