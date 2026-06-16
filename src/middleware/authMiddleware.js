import jwt from "jsonwebtoken";

const verifyToken = (req, res, next) => {
  try {
    // Ambil token dari header Authorization
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Token tidak ditemukan atau format salah. Gunakan: Authorization: Bearer <token>" });
    }

    const token = authHeader.slice(7); // Hapus "Bearer " prefix
    const secretKey = process.env.JWT_SECRET || "your-secret-key-change-in-env";

    // Verifikasi token
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded; // Simpan data user di request
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token sudah kadaluarsa" });
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Token tidak valid" });
    }
    return res.status(500).json({ error: error.message });
  }
};

export default verifyToken;
