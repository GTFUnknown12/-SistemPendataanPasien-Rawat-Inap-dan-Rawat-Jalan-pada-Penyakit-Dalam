import express from "express";
// Import default sesuai dengan export di controller
import pemeriksaan from "../controllers/pemeriksaanController.js";

const router = express.Router();

// Routes CRUD Penyakit Dalam menggunakan metode milik dosen (getAll, getById, dll)
router.get("/penyakit-dalam", pemeriksaan.getAll);
router.get("/penyakit-dalam/:id", pemeriksaan.getById);
router.post("/penyakit-dalam", pemeriksaan.create);
router.put("/penyakit-dalam/:id", pemeriksaan.update);
router.delete("/penyakit-dalam/:id", pemeriksaan.destroy);

export default router;