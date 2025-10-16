# 🧠 RANCANG BANGUN CHATBOT MULTIMODAL – FRONTEND

Frontend untuk sistem chatbot multimodal yang dikembangkan sebagai bagian dari tugas akhir berjudul  
**“Rancang Bangun Fitur Chatbot Multimodal Terintegrasi Teks dan Suara untuk Meningkatkan Pelayanan Nasabah di Bank Nagari.”**

---

## 🚀 Teknologi Utama

- ⚛️ **React.js (TypeScript)** – Framework utama untuk pengembangan antarmuka pengguna.  
- 💎 **Mantine UI** – Library komponen untuk tampilan modern dan responsif.  
- 🧭 **React Router** – Navigasi antar halaman.  
- 🌐 **Axios** – Komunikasi HTTP dengan backend berbasis Go (Gin).  
- 🔐 **React-Auth-Kit** – Autentikasi login dan manajemen sesi pengguna.  
- 🔊 **AWS SDK (Polly & Transcribe)** – Integrasi Text-to-Speech dan Speech-to-Text.  

---

## 💡 Fitur Utama

- 🔑 Login, register, dan logout user dengan JWT.  
- 💬 Antarmuka percakapan mirip ChatGPT dengan daftar riwayat di sidebar.  
- 🎙️ *Voice mode* – Chat dengan suara menggunakan AWS Polly & Transcribe.  
- 💾 Penyimpanan riwayat chat ke MongoDB melalui backend Go.  
- 🗣️ Fitur *voice change* (ubah gender suara TTS).  
- 📱 Tampilan *responsive* dan *user-friendly*.  

---

## ⚙️ Cara Menjalankan

Pastikan backend (Go + Flask NLP) sudah berjalan sebelum memulai frontend.

```bash
# Clone repository
git clone https://github.com/username/chatbot-frontend.git
cd chatbot-frontend

# Instal dependensi
npm install

# Jalankan aplikasi
npm run dev
