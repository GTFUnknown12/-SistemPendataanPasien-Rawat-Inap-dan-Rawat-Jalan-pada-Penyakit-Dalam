import { prismaClient } from "../database/dbConfig.js";

const newsModel = {
  getAll: async () => {
    return prismaClient.news.findMany();
  },
  getById: async (id) => {
    return prismaClient.news.findUnique({
      where: {
        id: Number(id),
      },
    });
  },
  create: async (data) => {
    return prismaClient.news.create({ data });
  },
  update: async (data, id) => {
    return prismaClient.news.update({
      where: {
        id: Number(id),
      },
      data,
    });
  },
  delete: async (id) => {
    return prismaClient.news.delete({
      where: {
        id: Number(id),
      },
    });
  },
};

export default newsModel;
