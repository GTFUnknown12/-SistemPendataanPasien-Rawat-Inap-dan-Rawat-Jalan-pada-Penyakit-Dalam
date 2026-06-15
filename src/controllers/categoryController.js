import categoryModel from "../models/categoryModel.js";
import validator from "../validators/validator.js";
import { categoriesValidationSchema } from "../validators/categoriesValidator.js";

const getAll = async (req, res, next) => {
  try {
    // ambil semua kategori
    const categories = await categoryModel.getAll();
    // jika data kosong response 404
    if (!categories)
      return res.status(404).json({ error: "Data tidak ditemukan" });
    return res.status(200).json({
      status: true,
      message: "berhasil",
      data: categories.map((cat) => ({
        id: Number(cat.id),
        nama: cat.name,
      })),
    });
  } catch (error) {
    return res.status(500).json({ error: error });
  }
};
const getById = async (req, res, next) => {
  try {
    // ambil parameter id
    const { id } = req.params;
    // jika id ada dan bukan number maka response error
    if (id && isNaN(id))
      return res.status(400).json({ error: "ID Kategori dibutuhkan" });
    // ambil detail kategori
    const category = await categoryModel.getById(id);
    // jika tidak ditemukan response 404
    if (!category)
      return res.status(404).json({ error: "Data tidak ditemukan" });
    return res.status(200).json({
      status: true,
      message: "berhasil",
      data: {
        id: Number(category.id),
        nama: category.name,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: error });
  }
};
const create = async (req, res, next) => {
  try {
    // ambil data dari body request
    const { body } = req;
    // jika data undefined maka response error
    if (!body) return res.status(400).json({ error: "Data tidak lengkap" });
    // ambil kategori yang mau diupdate
    // validasi data
    const { error, value } = validator(categoriesValidationSchema, body);
    // jika validasi salah tampilkan error

    // simpan kategori baru
    const newCategory = await categoryModel.create(value);
    return res.status(201).json({
      status: true,
      message: "berhasil",
      data: {
        id: Number(newCategory.id),
        nama: newCategory.name,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: error });
  }
};
const update = async (req, res, next) => {
  try {
    // ambil parameter id
    const { id } = req.params;
    // jika id ada dan bukan number maka response error
    if (id && isNaN(id))
      return res.status(400).json({ error: "ID Kategori dibutuhkan" });
    // ambil data dari body request
    const { body } = req;
    // jika data undefined maka response error
    if (!body) return res.status(400).json({ error: "Data tidak lengkap" });
    // ambil kategori yang mau diupdate
    const category = await categoryModel.getById(id);
    // jika tidak ditemukan response 404
    if (!category)
      return res.status(404).json({ error: "Data tidak ditemukan" });

    // validasi data
    const { error, value } = validator(categoriesValidationSchema, body);
    // jika validasi salah tampilkan error
    if (error) return res.status(400).json({ error: error });

    // update kategori
    const updatedCategory = await categoryModel.update(value, id);
    return res.status(201).json({
      status: true,
      message: "berhasil",
      data: {
        id: Number(updatedCategory.id),
        nama: updatedCategory.name,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: error });
  }
};
const destroy = async (req, res, next) => {
  try {
    // ambil parameter id
    const { id } = req.params;
    // jika id ada dan bukan number maka response error
    if (id && isNaN(id))
      return res.status(400).json({ error: "ID Kategori dibutuhkan" });
    // ambil info kategori
    const category = await categoryModel.getById(id);
    // jika tidak ditemukan response 404
    if (!category)
      return res.status(404).json({ error: "Data tidak ditemukan" });
    // hapus kategori berdasarkan id
    await categoryModel.delete(id);
    return res.status(200).json({
      status: true,
      message: "berhasil dihapus",
      data: {
        id: Number(category.id),
        nama: category.name,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: error });
  }
};

export default { getAll, getById, create, update, destroy };
