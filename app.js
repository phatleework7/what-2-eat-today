// Import Firebase modules via CDN (works without bundler)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB0RFvbg0QWdBTmxnDQhdr7xdNuCm4hPyk",
  authDomain: "what-2-eat-today.firebaseapp.com",
  projectId: "what-2-eat-today",
  storageBucket: "what-2-eat-today.firebasestorage.app",
  messagingSenderId: "1097166772673",
  appId: "1:1097166772673:web:4229f98a773b3a43e9b740",
  measurementId: "G-4B1QTDN6S3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Meal time labels
const mealTimeLabels = {
  sáng: "🌅 Sáng",
  trưa: "☀️ Trưa",
  chiều: "🌤️ Chiều",
  tối: "🌙 Tối"
};

const categoryMeta = {
  "Món ngon": {
    className: "category-món-ngon",
    label: "🌟 Món ngon"
  },
  "Thử vị mới": {
    className: "category-thử-vị-mới",
    label: "✨ Thử vị mới"
  },
  "Đặc biệt": {
    className: "category-đặc-biệt",
    label: "💫 Đặc biệt"
  }
};

const foodForm = document.getElementById("foodForm");
const foodList = document.getElementById("foodList");

initializeForm();

// Form submission handler
foodForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(e.target);
  const foodName = formData.get("food_name").trim();
  const location = formData.get("location").trim();
  const imageUrl = formData.get("image_url").trim();

  try {
    // Add new food entry to Firestore
    await addDoc(collection(db, "food_diary"), {
      date: formData.get("date"),
      meal_time: formData.get("meal_time"),
      food_name: foodName,
      category: formData.get("category"),
      location,
      rating: Number.parseInt(formData.get("rating"), 10),
      image_url: imageUrl,
      timestamp: new Date()
    });

    // Reset form and show success message
    e.target.reset();
    initializeForm();
    alert("✅ Đã lưu món ăn thành công!");
  } catch (error) {
    console.error("Error adding document:", error);
    alert("❌ Lỗi khi lưu: " + error.message);
  }
});

// Load and display food entries from Firestore
// Initial data fetch and real-time updates
const q = query(collection(db, "food_diary"), orderBy("date", "desc"));

onSnapshot(q, (querySnapshot) => {
  if (querySnapshot.empty) {
    renderEmptyState();
    return;
  }

  // Firestore sorts by date; keep meal order stable within the same day.
  const sortedDocs = Array.from(querySnapshot.docs).sort((a, b) => {
    if (a.data().date !== b.data().date) {
      return b.data().date.localeCompare(a.data().date);
    }

    const timeOrder = { sáng: 1, trưa: 2, chiều: 3, tối: 4 };
    return timeOrder[a.data().meal_time] - timeOrder[b.data().meal_time];
  });

  // Generate HTML for each food item
  const html = sortedDocs.map(docSnap => {
    const data = docSnap.data();
    const dateParts = data.date.split("-");
    const category = categoryMeta[data.category] || categoryMeta["Đặc biệt"];

    return `
      <div class="food-item" id="${docSnap.id}">
        <button type="button" class="delete-btn" onclick="deleteFood('${docSnap.id}')">🗑️ Xóa</button>

        <div class="food-header">
          <div>
            <div class="food-name">${escapeHtml(data.food_name)}</div>
            <span class="category-badge ${category.className}">${category.label}</span>
          </div>

          <div style="text-align: right;">
            <strong>${dateParts[2]}/${dateParts[1]}/${dateParts[0]}</strong>
            <span style="font-size: 0.9rem; color: #6c757d;">${mealTimeLabels[data.meal_time] || ''}</span>
          </div>
        </div>

        ${data.location ? `
          <div class="food-meta">
            <span class="meta-item">📍 ${escapeHtml(data.location)}</span>
          </div>
        ` : ''}

        ${data.rating >= 1 && data.rating <= 5 ? `
          <div class="food-meta">
            <span class="meta-item">💯 ${'⭐'.repeat(data.rating)}</span>
          </div>
        ` : ''}

        ${data.image_url ? `
          <img src="${escapeHtml(data.image_url)}" alt="${escapeHtml(data.food_name)}" 
               class="food-image" 
               onerror="this.src='https://via.placeholder.com/400x300?text=Ảnh+không+load+được'" />
        ` : ''}
      </div>
    `;
  }).join('');

  foodList.innerHTML = html;
}, (error) => {
  console.error("Error loading food diary:", error);
  foodList.innerHTML = `<p class="loading">Không thể tải dữ liệu: ${escapeHtml(error.message)}</p>`;
});

// Delete food entry function
window.deleteFood = async (documentId) => {
  if (!confirm("🗑️ Bạn có chắc muốn xóa món ăn này không?")) return;

  try {
    await deleteDoc(doc(db, "food_diary", documentId));
    alert("✅ Đã xóa thành công!");
  } catch (error) {
    console.error("Error deleting document:", error);
    alert("❌ Lỗi khi xóa: " + error.message);
  }
};

function initializeForm() {
  foodForm.date.value = new Date().toISOString().split("T")[0];
}

function renderEmptyState() {
  foodList.innerHTML = '<p style="text-align: center; color: #6c757d;">Chưa có món ăn nào được lưu. Hãy thêm món ăn đầu tiên nhé! 😊</p>';
}

// Helper function to escape HTML characters
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
