import Joi from "joi";

const createNewsValidationSchema = Joi.object({
  title: Joi.string().required().max(255).messages({
    "string.base": "Judul harus string",
    "string.empty": "Judul tidak boleh kosong",
    "string.max": "Judul maksimal 255 karakter",
    "any.required": "Judul berita harus diisi",
  }),
  content: Joi.string().required().messages({
    "string.base": "Konten harus string",
    "string.empty": "Konten tidak boleh kosong",
    "any.required": "Konten berita harus diisi",
  }),
  image: Joi.string().required().max(255).messages({
    "string.base": "URL gambar harus string",
    "string.empty": "URL gambar tidak boleh kosong",
    "string.max": "URL gambar maksimal 255 karakter",
    "any.required": "URL gambar berita harus diisi",
  }),
  user_id: Joi.number().integer().positive().required().messages({
    "number.base": "User ID harus angka",
    "number.integer": "User ID harus bilangan bulat",
    "number.positive": "User ID harus positif",
    "any.required": "User ID harus diisi",
  }),
  category_id: Joi.number().integer().positive().required().messages({
    "number.base": "Category ID harus angka",
    "number.integer": "Category ID harus bilangan bulat",
    "number.positive": "Category ID harus positif",
    "any.required": "Category ID harus diisi",
  }),
});

const updateNewsValidationSchema = Joi.object({
  title: Joi.string().max(255).messages({
    "string.base": "Judul harus string",
    "string.empty": "Judul tidak boleh kosong",
    "string.max": "Judul maksimal 255 karakter",
  }),
  content: Joi.string().messages({
    "string.base": "Konten harus string",
    "string.empty": "Konten tidak boleh kosong",
  }),
  image: Joi.string().max(255).messages({
    "string.base": "URL gambar harus string",
    "string.empty": "URL gambar tidak boleh kosong",
    "string.max": "URL gambar maksimal 255 karakter",
  }),
  user_id: Joi.number().integer().positive().messages({
    "number.base": "User ID harus angka",
    "number.integer": "User ID harus bilangan bulat",
    "number.positive": "User ID harus positif",
  }),
  category_id: Joi.number().integer().positive().messages({
    "number.base": "Category ID harus angka",
    "number.integer": "Category ID harus bilangan bulat",
    "number.positive": "Category ID harus positif",
  }),
}).min(1);

export { createNewsValidationSchema, updateNewsValidationSchema };
