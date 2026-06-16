import express from "express";
// Import controller
import pemeriksaan from "../controllers/pemeriksaanController.js";
import auth from "../controllers/authController.js";
// Import middleware
import verifyToken from "../middleware/authMiddleware.js";

const router = express.Router();

// ==========================================
// PUBLIC ROUTES
// ==========================================
// Auth endpoints: register dan login
router.post("/register", auth.register);
router.post("/login", auth.login);

// ==========================================
// PROTECTED ROUTES (Perlu JWT Token)
// ==========================================
// Routes CRUD Penyakit Dalam dengan auth middleware
router.get("/penyakit-dalam", verifyToken, pemeriksaan.getAll);
router.get("/penyakit-dalam/:id", verifyToken, pemeriksaan.getById);
router.post("/penyakit-dalam", verifyToken, pemeriksaan.create);
router.put("/penyakit-dalam/:id", verifyToken, pemeriksaan.update);
router.delete("/penyakit-dalam/:id", verifyToken, pemeriksaan.destroy);

export default router;