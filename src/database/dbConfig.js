import prismaClientPkg from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const { PrismaClient } = prismaClientPkg;

// Ambil koneksi string dari env
const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaMariaDb(connectionString);

export const prismaClient = new PrismaClient({
  adapter: adapter,
  log: [
    {
      emit: "event",
      level: "query",
    },
    {
      emit: "event",
      level: "error",
    },
    {
      emit: "event",
      level: "info",
    },
    {
      emit: "event",
      level: "warn",
    },
  ],
});

prismaClient.$on("error", (e) => {
  console.error(e);
});

prismaClient.$on("warn", (e) => {
  console.warn(e);
});

prismaClient.$on("info", (e) => {
  console.info(e);
});

prismaClient.$on("query", (e) => {
  console.info(e);
});

export default prismaClient;
