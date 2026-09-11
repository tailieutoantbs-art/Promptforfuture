/* ==========================================================================
   CONFIG, CONSTANTS & GLOBAL STATE VARIABLES
   ========================================================================== */

const MON_OPTIONS = ["Toán", "Vật lý", "Hóa học", "Sinh học", "Ngữ văn", "Tiếng Anh", "Lịch sử & Địa lý", "Tin học", "Khoa học tự nhiên", "Khác..."];
const LOP_OPTIONS = ["Lớp 6", "Lớp 7", "Lớp 8", "Lớp 9", "Lớp 10", "Lớp 11", "Lớp 12", "Tiểu học", "THCS", "THPT"];

const THEMES = [
  { id: "ocean-blue", name: "🌊 Xanh Nước Biển Nhạt (Mặc định)" },
  { id: "classic-green", name: "🌲 Bảng Phấn Xanh Cổ Điển" },
  { id: "dark-midnight", name: "🌙 Hiện Đại Đêm (Dark Mode)" },
  { id: "soft-pastel", name: "🌸 Hồng Đào / Soft Pastel" }
];

// Shared application state variables
const formValuesCache = {};
const editingArchiveIds = {};
let cloudArchiveItems = [];
let cloudSourceItems = [];
let cloudSavedLinksItems = [];
let visitsCount = Number(localStorage.getItem("LOCAL_VISITS_COUNT") || 128);
let heartsCount = Number(localStorage.getItem("LOCAL_HEARTS_COUNT") || 56);
let currentUser = null;
let fbApp = null;
let fbAuth = null;
let fbDb = null;

// Cấu hình mặc định Firebase Cloud
const defaultFirebaseConfig = {
  apiKey: "AIzaSyBX4_WGe0BZCG0ZSG_c09GcleJ-hq4aeEY",
  authDomain: "tpn123-f7971.firebaseapp.com",
  databaseURL: "https://tpn123-f7971-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "tpn123-f7971",
  storageBucket: "tpn123-f7971.firebasestorage.app",
  messagingSenderId: "443986355362",
  appId: "1:443986355362:web:1d62c3378d8b439ec6e3fb",
  measurementId: "G-JFQDG5X5CN"
};
