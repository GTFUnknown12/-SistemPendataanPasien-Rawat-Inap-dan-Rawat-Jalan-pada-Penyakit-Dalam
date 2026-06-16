import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import prisma from "../database/dbConfig.js";

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, dan password harus diisi" });
    }

    const existingUser = await prisma.users.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(409).json({ error: "Email sudah terdaftar" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.users.create({
      data: {
        name,
        email,
        password: hashedPassword
      }
    });

    return res.status(201).json({
      status: true,
      message: "Registrasi berhasil",
      user: {
        id: Number(newUser.id),
        name: newUser.name,
        email: newUser.email
      }
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || error });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email dan password harus diisi" });
    }

    const user = await prisma.users.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(404).json({ error: "User tidak ditemukan" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Password salah" });
    }

    const secretKey = process.env.JWT_SECRET || "your-secret-key-change-in-env";
    const token = jwt.sign(
      { id: Number(user.id), email: user.email, name: user.name },
      secretKey,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      status: true,
      message: "Login berhasil",
      token,
      user: {
        id: Number(user.id),
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || error });
  }
};

export default { register, login };
