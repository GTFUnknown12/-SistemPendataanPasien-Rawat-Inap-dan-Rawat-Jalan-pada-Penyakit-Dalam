import prisma from "../database/dbConfig.js";

const serializeData = (data) => {
    return JSON.parse(JSON.stringify(data, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
    ));
};

const formatMysqlDateTime = (value) => {
    const date = value instanceof Date ? value : new Date(value);
    if (!value || Number.isNaN(date.getTime())) {
        throw new Error("waktu_tindakan harus berupa tanggal yang valid, misalnya 2026-06-15T08:00:00Z");
    }
    return date.toISOString().replace("T", " ").replace("Z", "").replace(/\.\d{3}$/, "");
};

// Validasi kategori yang diizinkan
const VALID_KATEGORI = ["rawat inap", "rawat jalan"];

// 1. GET: Ambil Semua Data Pemeriksaan (Termasuk Dokter, Tindakan, dan Pasien)
export const getAll = async (req, res) => {
    try {
        const { kategori } = req.query;

        // Validasi kategori jika diberikan (tidak termasuk "Semua" atau "--")
        if (kategori && !["semua", "--"].includes(kategori.toLowerCase()) && !VALID_KATEGORI.includes(kategori.toLowerCase())) {
            return res.status(400).json({
                message: `Kategori tidak valid. Pilihan yang tersedia: ${VALID_KATEGORI.join(", ")}, Semua, atau --`
            });
        }

        // Jika kategori adalah "Semua" atau "--", maka ambil semua tanpa filter
        const normalizedKategori = kategori ? kategori.toLowerCase() : undefined;
        const filter = !normalizedKategori || ["semua", "--"].includes(normalizedKategori) ? {} : { kategori: normalizedKategori };
        const responseMessage = normalizedKategori === "rawat inap"
            ? "Berhasil mengambil detail rawat inap"
            : normalizedKategori === "rawat jalan"
                ? "Berhasil mengambil detail rawat jalan"
                : "Berhasil mengambil data pemeriksaan";

        const data = await prisma.pemeriksaan.findMany({
            where: filter,
            include: {
                dokter: {
                    include: {
                        tindakan: {
                            include: {
                                pasien: true
                            }
                        }
                    }
                }
            }
        });

        res.status(200).json({
            message: responseMessage,
            data: serializeData(data)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 2. GET: Ambil Detail Berdasarkan ID (Dengan Validasi Kategori Wajib)
export const getById = async (req, res) => {
    try {
        const { kategori } = req.query;

        // Validasi kategori wajib diisi
        if (!kategori || !VALID_KATEGORI.includes(kategori.toLowerCase())) {
            return res.status(400).json({
                message: `Kategori wajib diisi. Pilihan yang tersedia: ${VALID_KATEGORI.join(", ")}`
            });
        }

        const data = await prisma.pemeriksaan.findUnique({
            where: { id: BigInt(req.params.id) },
            include: {
                dokter: {
                    include: {
                        tindakan: {
                            include: {
                                pasien: true
                            }
                        }
                    }
                }
            }
        });

        if (!data) return res.status(404).json({ message: "Data tidak ditemukan" });

        // Validasi kategori sesuai dengan yang diminta
        if (data.kategori !== kategori.toLowerCase()) {
            return res.status(404).json({ message: "Data tidak ditemukan" });
        }

        res.status(200).json({
            message: "Berhasil mengambil detail data",
            data: serializeData(data)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 3. POST: Tambah Data Baru Sekaligus (Nested: Pemeriksaan > Dokter > Tindakan > Pasien)
export const create = async (req, res) => {
    try {
        const { kategori, daftar_dokter } = req.body;

        if (!kategori || !VALID_KATEGORI.includes(kategori.toLowerCase())) {
            return res.status(400).json({
                message: `Kategori tidak valid. Pilihan yang tersedia: ${VALID_KATEGORI.join(", ")}`
            });
        }

        if (!daftar_dokter || !Array.isArray(daftar_dokter) || daftar_dokter.length === 0) {
            return res.status(400).json({
                message: "daftar_dokter wajib diisi dan tidak boleh kosong"
            });
        }

        const newData = await prisma.pemeriksaan.create({
            data: {
                kategori: kategori.toLowerCase(),
                dokter: {
                    create: daftar_dokter.map(d => ({
                        nama_dokter: d.nama_dokter,
                        spesialisasi: "Penyakit Dalam",
                        tindakan: {
                            create: d.daftar_tindakan.map(t => ({
                                nama_tindakan: t.nama_tindakan,
                                pasien: {
                                    create: t.pasien.map(p => ({
                                        nama: p.nama,
                                        waktu_tindakan: formatMysqlDateTime(p.waktu_tindakan)
                                    }))
                                }
                            }))
                        }
                    }))
                }
            },
            include: {
                dokter: {
                    include: {
                        tindakan: {
                            include: {
                                pasien: true
                            }
                        }
                    }
                }
            }
        });

        res.status(201).json({
            message: "Data rekam medis berhasil ditambahkan",
            data: serializeData(newData)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 4. PUT: Update Data Pemeriksaan (Hanya Kategori)
export const update = async (req, res) => {
    try {
        const { kategori } = req.body;

        if (!kategori || !VALID_KATEGORI.includes(kategori.toLowerCase())) {
            return res.status(400).json({
                message: `Kategori tidak valid. Pilihan yang tersedia: ${VALID_KATEGORI.join(", ")}`
            });
        }

        const updatedData = await prisma.pemeriksaan.update({
            where: { id: BigInt(req.params.id) },
            data: {
                kategori: kategori.toLowerCase()
            }
        });

        res.status(200).json({
            message: "Data berhasil diperbarui",
            data: serializeData(updatedData)
        });
    } catch (error) {
        if (error?.code === 'P2025') {
            return res.status(404).json({ message: "Data tidak ditemukan" });
        }
        res.status(500).json({ error: error.message });
    }
};

// 5. DELETE: Hapus Data Pemeriksaan (Otomatis menghapus dokter, tindakan & pasien terkait karena Cascade)
export const destroy = async (req, res) => {
    try {
        await prisma.pemeriksaan.delete({
            where: { id: BigInt(req.params.id) }
        });

        res.status(200).json({ message: "Data beserta detail dokter, tindakan, dan pasien berhasil dihapus" });
    } catch (error) {
        if (error?.code === 'P2025') {
            return res.status(404).json({ message: "Data tidak ditemukan" });
        }
        res.status(500).json({ error: error.message });
    }
};

export default { getAll, getById, create, update, destroy };