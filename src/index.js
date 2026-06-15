import "dotenv/config";
import express from "express";
import swaggerUi from "swagger-ui-express";

import router from "./routes/api.js";

const app = express();
const port = process.env.PORT || 2024;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ==========================================
// KONFIGURASI OPENAPI (SWAGGER)
// ==========================================
const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "API Sistem Pendataan Pasien Penyakit Dalam Rawat Inap/Rawat Jalan",
    version: "2.0.0",
    description: "Dokumentasi Web Service untuk Rawat Inap & Rawat Jalan menggunakan Express dan Prisma ORM. Setiap kategori memiliki data dokter spesialis penyakit dalam, tindakan, dan pasien."
  },
  servers: [
    {
      url: `http://localhost:${port}`,
      description: "Local Server"
    }
  ],
  components: {
    schemas: {
      Pasien: {
        type: "object",
        properties: {
          nama: { type: "string", example: "Budi Santoso" },
          waktu_tindakan: { type: "string", format: "date-time", example: "2026-06-15T08:00:00Z" }
        },
        required: ["nama", "waktu_tindakan"]
      },
      Tindakan: {
        type: "object",
        properties: {
          nama_tindakan: {
            type: "string",
            example: "Monitoring Pasien Kritis",
            description: "Contoh lain: Pemasangan Infus, Pemeriksaan EKG, Konsultasi Gizi, Pemberian Terapi Oksigen"
          },
          pasien: {
            type: "array",
            items: { $ref: "#/components/schemas/Pasien" }
          }
        },
        required: ["nama_tindakan", "pasien"]
      },
      Dokter: {
        type: "object",
        properties: {
          nama_dokter: { type: "string", example: "dr. Andi Susanto, Sp.PD" },
          spesialisasi: {
            type: "string",
            example: "Penyakit Dalam",
            description: "Otomatis diisi 'Penyakit Dalam', tidak perlu dikirim di request body"
          },
          daftar_tindakan: {
            type: "array",
            items: { $ref: "#/components/schemas/Tindakan" }
          }
        },
        required: ["nama_dokter", "daftar_tindakan"]
      },
      PemeriksaanCreate: {
        type: "object",
        properties: {
          kategori: {
            type: "string",
            enum: ["rawat inap", "rawat jalan"],
            example: "rawat inap",
            description: "Hanya dua pilihan: 'rawat inap' atau 'rawat jalan'"
          },
          daftar_dokter: {
            type: "array",
            items: { $ref: "#/components/schemas/Dokter" }
          }
        },
        required: ["kategori", "daftar_dokter"]
      },
      PemeriksaanUpdate: {
        type: "object",
        properties: {
          kategori: {
            type: "string",
            enum: ["rawat inap", "rawat jalan"],
            example: "rawat jalan",
            description: "Hanya dua pilihan: 'rawat inap' atau 'rawat jalan'"
          }
        },
        required: ["kategori"]
      }
    }
  },
  paths: {
    "/api/penyakit-dalam": {
      get: {
        tags: ["Pemeriksaan"],
        summary: "Mengambil semua data pemeriksaan",
        description: "Mengembalikan seluruh data pemeriksaan beserta dokter, tindakan, dan pasien. Dapat difilter berdasarkan kategori atau mengambil semua tanpa filter.",
        parameters: [
          {
            in: "query",
            name: "kategori",
            schema: {
              type: "string",
              enum: ["rawat inap", "rawat jalan", "Semua"]
            },
            description: "Filter berdasarkan kategori (rawat inap / rawat jalan). Gunakan 'Semua' atau '--' untuk mengambil semua data tanpa filter. Jika tidak diberikan, akan mengambil semua data."
          }
        ],
        responses: {
          200: { description: "Berhasil mengambil data pemeriksaan" },
          400: { description: "Kategori tidak valid" },
          500: { description: "Terjadi kesalahan pada server" }
        }
      },
      post: {
        tags: ["Pemeriksaan"],
        summary: "Menambahkan data pemeriksaan baru",
        description: "Membuat data pemeriksaan baru secara nested: Pemeriksaan → Dokter (Sp.PD) → Tindakan → Pasien",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/PemeriksaanCreate" },
              example: {
                kategori: "rawat inap",
                daftar_dokter: [
                  {
                    nama_dokter: "dr. Andi Susanto, Sp.PD",
                    daftar_tindakan: [
                      {
                        nama_tindakan: "Monitoring Pasien Kritis",
                        pasien: [
                          { nama: "Ahmad Fauzi", waktu_tindakan: "2026-06-15T08:00:00Z" },
                          { nama: "Siti Rahayu", waktu_tindakan: "2026-06-15T09:00:00Z" }
                        ]
                      },
                      {
                        nama_tindakan: "Pemasangan Infus",
                        pasien: [
                          { nama: "Eko Prasetyo", waktu_tindakan: "2026-06-15T10:00:00Z" }
                        ]
                      }
                    ]
                  },
                  {
                    nama_dokter: "dr. Rina Mulyani, Sp.PD",
                    daftar_tindakan: [
                      {
                        nama_tindakan: "Pemeriksaan EKG",
                        pasien: [
                          { nama: "Dewi Lestari", waktu_tindakan: "2026-06-15T11:00:00Z" }
                        ]
                      }
                    ]
                  }
                ]
              }
            }
          }
        },
        responses: {
          201: { description: "Data rekam medis berhasil ditambahkan" },
          400: { description: "Kategori tidak valid atau daftar_dokter kosong" },
          500: { description: "Terjadi kesalahan pada server" }
        }
      }
    },
    "/api/penyakit-dalam/{id}": {
      get: {
        tags: ["Pemeriksaan"],
        summary: "Mengambil detail data berdasarkan ID",
        description: "Mengembalikan detail satu pemeriksaan beserta seluruh dokter, tindakan, dan pasien terkait. Parameter kategori wajib diberikan.",
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
            description: "ID Pemeriksaan"
          },
          {
            in: "query",
            name: "kategori",
            required: true,
            schema: {
              type: "string",
              enum: ["rawat inap", "rawat jalan"]
            },
            description: "Kategori pemeriksaan (rawat inap / rawat jalan). Wajib diisi."
          }
        ],
        responses: {
          200: { description: "Berhasil mengambil detail data" },
          400: { description: "Kategori wajib diisi atau tidak valid" },
          404: { description: "Data tidak ditemukan atau kategori tidak sesuai" },
          500: { description: "Terjadi kesalahan pada server" }
        }
      },
      put: {
        tags: ["Pemeriksaan"],
        summary: "Memperbarui kategori pemeriksaan",
        description: "Hanya dapat mengubah kategori pemeriksaan (rawat inap / rawat jalan). Untuk mengubah dokter/tindakan/pasien, gunakan endpoint masing-masing.",
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
            description: "ID Pemeriksaan"
          }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/PemeriksaanUpdate" },
              example: {
                kategori: "rawat inap",
                daftar_dokter: [
                  {
                    nama_dokter: "dr. MarcelloJohannos, Sp.PD",
                    daftar_tindakan: [
                      {
                        nama_tindakan: "Monitoring Pasien Kritis",
                        pasien: [
                          { nama: "Ahmad Fauzi", waktu_tindakan: "2026-06-15T08:00:00Z" },
                          { nama: "Siti Rahayu", waktu_tindakan: "2026-06-15T09:00:00Z" }
                        ]
                      },
                      {
                        nama_tindakan: "Pemasangan Infus",
                        pasien: [
                          { nama: "Eko Prasetyo", waktu_tindakan: "2026-06-15T10:00:00Z" }
                        ]
                      }
                    ]
                  },
                  {
                    nama_dokter: "dr. Ruru, Sp.PD",
                    daftar_tindakan: [
                      {
                        nama_tindakan: "Rawat Luka",
                        pasien: [
                          { nama: "Dewi Lestari", waktu_tindakan: "2026-06-15T11:00:00Z" }
                        ]
                      }
                    ]
                  }
                ]
              }
            }
          }
        },
        responses: {
          200: { description: "Data berhasil diperbarui" },
          400: { description: "Kategori tidak valid" },
          404: { description: "Data tidak ditemukan" },
          500: { description: "Terjadi kesalahan pada server" }
        }
      },
      delete: {
        tags: ["Pemeriksaan"],
        summary: "Menghapus data pemeriksaan",
        description: "Menghapus pemeriksaan beserta seluruh dokter, tindakan, dan pasien terkait (Cascade Delete).",
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
            description: "ID Pemeriksaan"
          }
        ],
        responses: {
          200: { description: "Data beserta detail dokter, tindakan, dan pasien berhasil dihapus" },
          404: { description: "Data tidak ditemukan" },
          500: { description: "Terjadi kesalahan pada server" }
        }
      }
    }
  }
};

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// ==========================================
// ROUTES UTAMA & ERROR HANDLER
// ==========================================
app.use("/api", router);

app.use((req, res, next) => {
  res.status(404).json({ error: "Endpoint tidak ditemukan" });
});

app.listen(port, () => {
  console.log(`Server berjalan di port ${port}`);
  console.log(`Dokumentasi API (OpenAPI) tersedia di http://localhost:${port}/api-docs`);
});