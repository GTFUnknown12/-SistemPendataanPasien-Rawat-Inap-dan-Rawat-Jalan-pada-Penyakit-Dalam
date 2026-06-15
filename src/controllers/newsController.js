import slugify from "slugify";
import newsModel from "../models/newsModel.js";
import validator from "../validators/validator.js";
import {
  createNewsValidationSchema,
  updateNewsValidationSchema,
} from "../validators/newsValidator.js";

const getAll = async (req, res) => {
  try {
    const news = await newsModel.getAll();
    return res.status(200).json({
      status: true,
      message: "berhasil",
      data: news.map((item) => ({
        id: Number(item.id),
        title: item.title,
        slug: item.slug,
        content: item.content,
        image: item.image,
        user_id: Number(item.user_id),
        category_id: Number(item.category_id),
        created_at: item.created_at,
        updated_at: item.updated_at,
      })),
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || error });
  }
};

const getById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(id))
      return res.status(400).json({ error: "ID berita tidak valid" });

    const news = await newsModel.getById(id);
    if (!news) return res.status(404).json({ error: "Data tidak ditemukan" });

    return res.status(200).json({
      status: true,
      message: "berhasil",
      data: {
        id: Number(news.id),
        title: news.title,
        slug: news.slug,
        content: news.content,
        image: news.image,
        user_id: Number(news.user_id),
        category_id: Number(news.category_id),
        created_at: news.created_at,
        updated_at: news.updated_at,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || error });
  }
};

const create = async (req, res) => {
  try {
    const { body } = req;
    if (!body || Object.keys(body).length === 0)
      return res.status(400).json({ error: "Data tidak lengkap" });

    const { error, value } = validator(createNewsValidationSchema, body);
    if (error) return res.status(400).json({ error });

    const slug = slugify(value.title, { lower: true, strict: true });
    const now = new Date();
    const newNews = await newsModel.create({
      title: value.title,
      slug,
      content: value.content,
      image: value.image,
      user_id: Number(value.user_id),
      category_id: Number(value.category_id),
      created_at: now,
      updated_at: now,
    });

    return res.status(201).json({
      status: true,
      message: "berhasil",
      data: {
        id: Number(newNews.id),
        title: newNews.title,
        slug: newNews.slug,
        content: newNews.content,
        image: newNews.image,
        user_id: Number(newNews.user_id),
        category_id: Number(newNews.category_id),
        created_at: newNews.created_at,
        updated_at: newNews.updated_at,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || error });
  }
};

const update = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(id))
      return res.status(400).json({ error: "ID berita tidak valid" });

    const { body } = req;
    if (!body || Object.keys(body).length === 0)
      return res.status(400).json({ error: "Data tidak lengkap" });

    const existing = await newsModel.getById(id);
    if (!existing) return res.status(404).json({ error: "Data tidak ditemukan" });

    const { error, value } = validator(updateNewsValidationSchema, body);
    if (error) return res.status(400).json({ error });

    const updatedData = {
      ...value,
      updated_at: new Date(),
    };

    if (value.title) {
      updatedData.slug = slugify(value.title, { lower: true, strict: true });
    }

    if (value.user_id) updatedData.user_id = Number(value.user_id);
    if (value.category_id) updatedData.category_id = Number(value.category_id);

    const updatedNews = await newsModel.update(updatedData, id);

    return res.status(200).json({
      status: true,
      message: "berhasil",
      data: {
        id: Number(updatedNews.id),
        title: updatedNews.title,
        slug: updatedNews.slug,
        content: updatedNews.content,
        image: updatedNews.image,
        user_id: Number(updatedNews.user_id),
        category_id: Number(updatedNews.category_id),
        created_at: updatedNews.created_at,
        updated_at: updatedNews.updated_at,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || error });
  }
};

const destroy = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(id))
      return res.status(400).json({ error: "ID berita tidak valid" });

    const existing = await newsModel.getById(id);
    if (!existing) return res.status(404).json({ error: "Data tidak ditemukan" });

    await newsModel.delete(id);

    return res.status(200).json({
      status: true,
      message: "berhasil dihapus",
      data: {
        id: Number(existing.id),
        title: existing.title,
        slug: existing.slug,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || error });
  }
};

export default { getAll, getById, create, update, destroy };
