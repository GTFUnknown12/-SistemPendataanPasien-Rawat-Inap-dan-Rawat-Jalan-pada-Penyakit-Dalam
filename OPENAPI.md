# Dokumentasi OpenAPI API Sistem Pendataan Pasien Penyakit Dalam

## Informasi Umum
- **Judul**: API Sistem Pendataan Pasien Penyakit Dalam Rawat Inap/Rawat Jalan
- **Versi**: 2.0.0
- **Base URL**: `http://localhost:2024`
- **Dokumentasi Swagger UI**: `http://localhost:2024/api-docs`

## Ringkasan
API ini mendukung operasi CRUD untuk entitas `penyakit-dalam` dengan relasi nested antara pemeriksaan, dokter, tindakan, dan pasien.

## Skema Data
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

### 1. GET `/api/penyakit-dalam`
Mengambil semua data pemeriksaan beserta dokter, tindakan, dan pasien.

#### Query Parameters
- `kategori` (string, optional)
  - nilai valid: `rawat inap`, `rawat jalan`, `Semua`, `--`
  - jika tidak diberikan atau diisi `Semua` / `--`, akan mengembalikan semua data.

#### Response
- `200` - Berhasil mengambil data pemeriksaan
- `400` - Kategori tidak valid
- `500` - Terjadi kesalahan pada server

#### Contoh Response
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

### 2. POST `/api/penyakit-dalam`
Menambahkan data pemeriksaan baru.

#### Request Body
- `kategori` (required, string)
- `daftar_dokter` (required, array)

#### Response
- `201` - Data rekam medis berhasil ditambahkan
- `400` - Kategori tidak valid atau `daftar_dokter` kosong
- `500` - Terjadi kesalahan pada server

#### Contoh Request Body
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
            { "nama": "Ahmad Fauzi", "waktu_tindakan": "2026-06-15T08:00:00Z" }
          ]
        }
      ]
    }
  ]
}
```

---

### 3. GET `/api/penyakit-dalam/{id}`
Mengambil detail pemeriksaan berdasarkan ID. `kategori` wajib dikirim sebagai query string.

#### Path Parameters
- `id` (string, required) - ID pemeriksaan

#### Query Parameters
- `kategori` (string, required) - `rawat inap` atau `rawat jalan`

#### Response
- `200` - Berhasil mengambil detail data
- `400` - Kategori wajib diisi atau tidak valid
- `404` - Data tidak ditemukan atau kategori tidak sesuai
- `500` - Terjadi kesalahan pada server

#### Contoh Response
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

### 4. PUT `/api/penyakit-dalam/{id}`
Memperbarui kategori pemeriksaan.

#### Path Parameters
- `id` (string, required) - ID pemeriksaan

#### Request Body
- `kategori` (required, string) - `rawat inap` atau `rawat jalan`

#### Response
- `200` - Data berhasil diperbarui
- `400` - Kategori tidak valid
- `404` - Data tidak ditemukan
- `500` - Terjadi kesalahan pada server

#### Contoh Request Body
```json
{
  "kategori": "rawat inap"
}
```

---

### 5. DELETE `/api/penyakit-dalam/{id}`
Menghapus pemeriksaan beserta dokter, tindakan, dan pasien terkait.

#### Path Parameters
- `id` (string, required) - ID pemeriksaan

#### Response
- `200` - Data beserta detail dokter, tindakan, dan pasien berhasil dihapus
- `404` - Data tidak ditemukan
- `500` - Terjadi kesalahan pada server

#### Contoh Response
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
- Validasi kategori hanya menerima `rawat inap` atau `rawat jalan`, kecuali `GET /api/penyakit-dalam` menerima juga `Semua` dan `--` sebagai nilai khusus untuk ambil semua data.
