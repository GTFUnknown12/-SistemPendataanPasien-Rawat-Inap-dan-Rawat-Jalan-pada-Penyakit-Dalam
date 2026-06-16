# Dokumentasi OpenAPI API Sistem Pendataan Pasien Penyakit Dalam

## Informasi Umum
- **Judul**: API Sistem Pendataan Pasien Penyakit Dalam Rawat Inap/Rawat Jalan
- **Versi**: 2.0.0
- **Base URL**: `http://localhost:2024`
- **Dokumentasi Swagger UI**: `http://localhost:2024/api-docs`

## Ringkasan
API ini mendukung:
- **Autentikasi**: Register dan login dengan JWT
- **CRUD Pemeriksaan**: Operasi CRUD untuk entitas `penyakit-dalam` dengan relasi nested (pemeriksaan → dokter → tindakan → pasien)

## Autentikasi JWT
Semua endpoint pemeriksaan memerlukan JWT token yang diperoleh dari login.

### Header Format
```
Authorization: Bearer <token>
```

### Token Validity
- Token berlaku selama **7 hari** setelah login
- Jika token expired atau invalid, akan menerima respons `401 Unauthorized`

---

## Skema Data

### User (Login/Register)
- `name` (string): Nama user
- `email` (string): Email unik
- `password` (string): Password (di-hash menggunakan bcryptjs)

### Pasien
- `nama` (string)
- `waktu_tindakan` (string, date-time)

Contoh:
```json
{
  "nama": "Budi Santoso",
  "waktu_tindakan": "2026-06-15T08:00:00Z"
}
```

### Tindakan
- `nama_tindakan` (string)
- `pasien` (array of `Pasien`)

Contoh:
```json
{
  "nama_tindakan": "Monitoring Pasien Kritis",
  "pasien": [
    { "nama": "Ahmad Fauzi", "waktu_tindakan": "2026-06-15T08:00:00Z" }
  ]
}
```

### Dokter
- `nama_dokter` (string)
- `spesialisasi` (string)
- `daftar_tindakan` (array of `Tindakan`)

Contoh:
```json
{
  "nama_dokter": "dr. Andi Susanto, Sp.PD",
  "spesialisasi": "Penyakit Dalam",
  "daftar_tindakan": [
    {
      "nama_tindakan": "Monitoring Pasien Kritis",
      "pasien": [
        { "nama": "Ahmad Fauzi", "waktu_tindakan": "2026-06-15T08:00:00Z" }
      ]
    }
  ]
}
```

### Pemeriksaan Create
- `kategori` (string): `rawat inap` atau `rawat jalan`
- `daftar_dokter` (array of `Dokter`)

Contoh:
```json
{
  "kategori": "rawat inap",
  "daftar_dokter": [
    {
      "nama_dokter": "dr. Andi Susanto, Sp.PD",
      "daftar_tindakan": [
        {
          "nama_tindakan": "Monitoring Pasien Kritis",
          "pasien": [
            { "nama": "Ahmad Fauzi", "waktu_tindakan": "2026-06-15T08:00:00Z" },
            { "nama": "Siti Rahayu", "waktu_tindakan": "2026-06-15T09:00:00Z" }
          ]
        }
      ]
    }
  ]
}
```

### Pemeriksaan Update
- `kategori` (string): `rawat inap` atau `rawat jalan`

Contoh:
```json
{
  "kategori": "rawat inap"
}
```

---

## Endpoint

### PUBLIC ENDPOINTS

#### 1. POST `/api/register`
Mendaftar user baru.

**Request Body**
```json
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123"
}
```

**Response Status**
- `201` - Registrasi berhasil
- `400` - Name, email, atau password tidak dikirim
- `409` - Email sudah terdaftar
- `500` - Terjadi kesalahan pada server

**Contoh Response (201)**
```json
{
  "status": true,
  "message": "Registrasi berhasil",
  "user": {
    "id": 1,
    "name": "Test User",
    "email": "test@example.com"
  }
}
```

---

#### 2. POST `/api/login`
Login dan dapatkan JWT token.

**Request Body**
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

**Response Status**
- `200` - Login berhasil, token diterima
- `400` - Email atau password tidak dikirim
- `404` - User tidak ditemukan
- `401` - Password salah
- `500` - Terjadi kesalahan pada server

**Contoh Response (200)**
```json
{
  "status": true,
  "message": "Login berhasil",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwibmFtZSI6IlRlc3QgVXNlciIsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsImlhdCI6MTcxODU0MzIwMCwiZXhwIjoxNzE5MTQ4MDAwfQ.abc123...",
  "user": {
    "id": 1,
    "name": "Test User",
    "email": "test@example.com"
  }
}
```

**Gunakan token ini untuk request ke endpoint terproteksi dengan header:**
```
Authorization: Bearer <token>
```

---

### PROTECTED ENDPOINTS (Memerlukan JWT Token)

#### 3. GET `/api/penyakit-dalam`
Mengambil semua data pemeriksaan beserta dokter, tindakan, dan pasien. **Memerlukan JWT Token.**

**Query Parameters**
- `kategori` (string, optional)
  - nilai valid: `rawat inap`, `rawat jalan`, `Semua`, `--`
  - jika tidak diberikan atau diisi `Semua` / `--`, akan mengembalikan semua data.

**Response Status**
- `200` - Berhasil mengambil data pemeriksaan
- `400` - Kategori tidak valid
- `401` - Token tidak ditemukan atau tidak valid
- `500` - Terjadi kesalahan pada server

**Contoh Request**
```bash
curl -X GET "http://localhost:2024/api/penyakit-dalam" \
  -H "Authorization: Bearer <token>"
```

**Contoh Response (200)**
```json
{
  "message": "Berhasil mengambil data pemeriksaan",
  "data": [
    {
      "id": 1,
      "kategori": "rawat inap",
      "dokter": [
        {
          "nama_dokter": "dr. Andi Susanto, Sp.PD",
          "spesialisasi": "Penyakit Dalam",
          "tindakan": [
            {
              "nama_tindakan": "Monitoring Pasien Kritis",
              "pasien": [
                { "nama": "Ahmad Fauzi", "waktu_tindakan": "2026-06-15T08:00:00Z" }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

---

#### 4. POST `/api/penyakit-dalam`
Menambahkan data pemeriksaan baru. **Memerlukan JWT Token.**

**Request Body**
- `kategori` (required, string)
- `daftar_dokter` (required, array)

**Response Status**
- `201` - Data rekam medis berhasil ditambahkan
- `400` - Kategori tidak valid atau `daftar_dokter` kosong
- `401` - Token tidak ditemukan atau tidak valid
- `500` - Terjadi kesalahan pada server

**Contoh Request**
```bash
curl -X POST "http://localhost:2024/api/penyakit-dalam" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "kategori": "rawat inap",
    "daftar_dokter": [
      {
        "nama_dokter": "dr. Andi Susanto, Sp.PD",
        "daftar_tindakan": [
          {
            "nama_tindakan": "Monitoring Pasien Kritis",
            "pasien": [
              { "nama": "Ahmad Fauzi", "waktu_tindakan": "2026-06-15T08:00:00Z" }
            ]
          }
        ]
      }
    ]
  }'
```

---

#### 5. GET `/api/penyakit-dalam/{id}`
Mengambil detail pemeriksaan berdasarkan ID. **Memerlukan JWT Token.**

**Path Parameters**
- `id` (string, required) - ID pemeriksaan

**Query Parameters**
- `kategori` (string, required) - `rawat inap` atau `rawat jalan`

**Response Status**
- `200` - Berhasil mengambil detail data
- `400` - Kategori wajib diisi atau tidak valid
- `401` - Token tidak ditemukan atau tidak valid
- `404` - Data tidak ditemukan atau kategori tidak sesuai
- `500` - Terjadi kesalahan pada server

**Contoh Request**
```bash
curl -X GET "http://localhost:2024/api/penyakit-dalam/1?kategori=rawat+inap" \
  -H "Authorization: Bearer <token>"
```

**Contoh Response (200)**
```json
{
  "message": "Berhasil mengambil detail data",
  "data": {
    "id": 1,
    "kategori": "rawat inap",
    "dokter": [
      {
        "nama_dokter": "dr. Andi Susanto, Sp.PD",
        "spesialisasi": "Penyakit Dalam",
        "tindakan": [
          {
            "nama_tindakan": "Monitoring Pasien Kritis",
            "pasien": [
              { "nama": "Ahmad Fauzi", "waktu_tindakan": "2026-06-15T08:00:00Z" }
            ]
          }
        ]
      }
    ]
  }
}
```

---

#### 6. PUT `/api/penyakit-dalam/{id}`
Memperbarui kategori pemeriksaan. **Memerlukan JWT Token.**

**Path Parameters**
- `id` (string, required) - ID pemeriksaan

**Request Body**
- `kategori` (required, string) - `rawat inap` atau `rawat jalan`

**Response Status**
- `200` - Data berhasil diperbarui
- `400` - Kategori tidak valid
- `401` - Token tidak ditemukan atau tidak valid
- `404` - Data tidak ditemukan
- `500` - Terjadi kesalahan pada server

**Contoh Request**
```bash
curl -X PUT "http://localhost:2024/api/penyakit-dalam/1" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"kategori": "rawat jalan"}'
```

---

#### 7. DELETE `/api/penyakit-dalam/{id}`
Menghapus pemeriksaan beserta dokter, tindakan, dan pasien terkait. **Memerlukan JWT Token.**

**Path Parameters**
- `id` (string, required) - ID pemeriksaan

**Response Status**
- `200` - Data beserta detail dokter, tindakan, dan pasien berhasil dihapus
- `401` - Token tidak ditemukan atau tidak valid
- `404` - Data tidak ditemukan
- `500` - Terjadi kesalahan pada server

**Contoh Request**
```bash
curl -X DELETE "http://localhost:2024/api/penyakit-dalam/1" \
  -H "Authorization: Bearer <token>"
```

**Contoh Response (200)**
```json
{
  "message": "Data beserta detail dokter, tindakan, dan pasien berhasil dihapus"
}
```

---

## Catatan Tambahan
- Semua endpoint menggunakan prefix `/api`.
- API ini menggunakan JSON sebagai format request dan response.
- Untuk `POST` dan `PUT`, pastikan header request: `Content-Type: application/json`.
- **Autentikasi**: Semua endpoint pemeriksaan (GET, POST, PUT, DELETE) memerlukan JWT token yang diperoleh dari login.
- **Token Format**: Header `Authorization: Bearer <token>`. Jika token invalid/expired, akan menerima respons `401 Unauthorized`.
- **Password Hashing**: Password di-hash menggunakan `bcryptjs`, tidak disimpan dalam plain text.
- Validasi kategori hanya menerima `rawat inap` atau `rawat jalan`, kecuali `GET /api/penyakit-dalam` menerima juga `Semua` dan `--` sebagai nilai khusus untuk ambil semua data.

---

## Quick Start

### 1. Register user
```bash
curl -X POST http://localhost:2024/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:2024/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Ambil token dari response, lalu gunakan untuk request berikutnya.**

### 3. Gunakan token untuk akses protected endpoint
```bash
curl -X GET http://localhost:2024/api/penyakit-dalam \
  -H "Authorization: Bearer <token-dari-login>"
```

---

## Dokumentasi Swagger UI
Buka `http://localhost:2024/api-docs` untuk interactive API documentation dengan try-it-out feature.
