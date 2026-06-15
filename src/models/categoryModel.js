import { prismaClient } from "../database/dbConfig.js";

const categoryModel = {
  getAll: async () => {
    return await prismaClient.categories.findMany();
  },
  getById: async (id) => {
    return await prismaClient.categories.findUnique({
      select: {
        id: true,
        name: true,
      },
      where: {
        id: Number(id),
      },
    });
  },
  create: async (data) => {
    return prismaClient.categories.create({ data: data });
  },
  update: async (data, id) => {
    return prismaClient.categories.update({
      data: data,
      where: {
        id: Number(id),
      },
    });
  },
  delete: async (id) => {
    return prismaClient.categories.delete({
      where: {
        id: Number(id),
      },
    });
  },
};

export default categoryModel;
