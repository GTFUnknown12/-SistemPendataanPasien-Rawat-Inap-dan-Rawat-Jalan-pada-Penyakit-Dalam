import Joi from "joi";

const categoriesValidationSchema = Joi.object({
  name: Joi.string().required().max(100).messages({
    "string.base": "Nama kategori name harus string",
    "string.empty": "Nama kategor name tidak boleh kosong",
    "string.max": "Nama kategori maksimal 100 karakter atau kurang",
    "any.required": "Nama kategori tidak boleh kosong",
  }),
});

export { categoriesValidationSchema };
