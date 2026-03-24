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

// Form submission handler
document.getElementById('foodForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  
  // Get food name and create unique ID suffix
  const foodName = formData.get('food_name');
  const foodIdSuffix = foodName.split('').map((char, index) => String.fromCharCode(65 + (index % 26))).join('') + Math.floor(Math.random() * 100);
  const documentId = `entry_${formData.get('date')}_${foodIdSuffix}`;
  
  try {
    // Add new food entry to Firestore
    await addDoc(collection(db, 'food_diary'), {
      id: documentId,
      date: formData.get('date'),
      meal_time: formData.get('meal_time'),
      food_name: formData.get('food_name'),
      category: formData.get('category'),
      location: formData.get('location') || '',
      rating: parseInt(formData.get('rating')),
      image_url: formData.get('image_url') || '',
      timestamp: new Date()
    });
    
    // Reset form and show success message
    e.target.reset();
    alert('✅ Đã lưu món ăn thành công!');
  } catch (error) {
    console.error('Error adding document:', error);
    alert('❌ Lỗi khi lưu: ' + error.message);
  }
});

// Load and display food entries from Firestore
const foodList = document.getElementById('foodList');

// Initial data fetch and real-time updates
const q = query(collection(db, 'food_diary'), orderBy('date', 'asc'));

onSnapshot(q, (querySnapshot) => {
  if (querySnapshot.empty) {
    foodList.innerHTML = '<p style="text-align: center; color: #6c757d;">Chưa có món ăn nào được lưu. Hãy thêm món ăn đầu tiên nhé! 😊</p>';
    return;
  }
  
  // Sort by date (most recent first) then meal time
  const sortedDocs = Array.from(querySnapshot.docs).sort((a, b) => {
    if (a.data().date !== b.data().date) {
      return b.data().date.localeCompare(a.data().date); // Most recent first
    }
    
    // Within same day: order by meal_time (sáng, trưa, chiều, tối)
    const timeOrder = { 'sáng': 1, 'trưa': 2, 'chiều': 3, 'tối': 4 };
    return timeOrder[a.data().meal_time] - timeOrder[b.data().meal_time];
  });
  
  // Generate HTML for each food item
  const html = sortedDocs.map(docSnap => {
    const data = docSnap.data();
    const dateParts = data.date.split('-'); // YYYY-MM-DD
    
    return `
      <div class="food-item" id="${docSnap.id}">
        <button type="button" class="delete-btn" onclick="deleteFood('${docSnap.id}')">🗑️ Xóa</button>
        
        <div class="food-header">
          <div>
            <div class="food-name">${escapeHtml(data.food_name)}</div>
            ${data.rating >= 4 ? '<span class="category-badge category-món-ngon">🌟 Món ngon</span>' : 
              data.rating === 3 ? '<span class="category-badge category-thử-vị-mới">✨ Thử vị mới</span>' : 
              '<span class="category-badge category-đặc-biệt">💫 Đặc biệt</span>'}
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
});

// Delete food entry function
window.deleteFood = async (documentId) => {
  if (!confirm('🗑️ Bạn có chắc muốn xóa món ăn này không?')) return;
  
  try {
    await deleteDoc(doc(db, 'food_diary', documentId));
    alert('✅ Đã xóa thành công!');
  } catch (error) {
    console.error('Error deleting document:', error);
    alert('❌ Lỗi khi xóa: ' + error.message);
  }
};

// Helper function to escape HTML characters
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
