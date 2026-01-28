/**
 * Library Management System Logic
 * Features:
 * - Data Persistence (LocalStorage)
 * - CRUD Books
 * - Borrow/Return Logic
 * - Search Filter
 * - Stats, Toasts, Activity Log
 */

const STORAGE_KEY_BOOKS = 'library_books';
const STORAGE_KEY_LOGS = 'library_logs';

// --------------------------------------------------------------------------
// 1. Data Models & Helper Functions
// --------------------------------------------------------------------------

class Book {
    constructor(id, name, author, category, image = null, description = null, content = null) {
        this.id = id;
        this.name = name;
        this.author = author;
        this.category = category;
        this.image = image || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=50`;
        this.description = description || 'Chưa có mô tả cho cuốn sách này.';
        this.content = content || '<p>Nội dung đang cập nhật... Vui lòng quay lại sau.</p>';

        this.status = 'Còn'; // 'Còn' or 'Đang mượn'
        this.borrower = null;
        this.borrowDate = null;
    }
}

const dummyContent = `
    <h3>Lời nói đầu</h3>
    <p>Cuốn sách này là cánh cửa dẫn bạn vào một thế giới mới. Hãy đọc và suy ngẫm.</p>
    <h3>Chương 1</h3>
    <p>Trong một ngôi làng nhỏ, có những câu chuyện chưa từng được kể...</p>
`;

const sampleDesc = "Tác phẩm kinh điển mang giá trị nhân văn sâu sắc, phản ánh chân thực bức tranh xã hội và con người.";

const initialBooks = [
    new Book('BK001', 'HTML & CSS Căn Bản', 'Jon Duckett', 'Tin học', 'https://m.media-amazon.com/images/I/31b4K-hFH-L._SX342_SY445_.jpg', 'Sách nhập môn tuyệt vời về Web Design.', dummyContent),
    new Book('BK002', 'Tuổi Trẻ Đáng Giá Bao Nhiêu', 'Rosie Nguyễn', 'Kỹ năng', 'https://bizweb.dktcdn.net/100/197/269/products/tuoi-tre-dang-gia-bao-nhieu.jpg?v=1522312675973', 'Cuốn sách truyền cảm hứng cho giới trẻ Việt Nam.', dummyContent),
    new Book('BK003', 'Dế Mèn Phiêu Lưu Ký', 'Tô Hoài', 'Văn học', 'https://salt.tikicdn.com/cache/w1200/ts/product/2e/b5/35/2eb5357929d9553b3b4f99589a1c6a2b.jpg', 'Tác phẩm văn học thiếu nhi kinh điển của Việt Nam.', dummyContent),
    new Book('BK004', 'Nhà Giả Kim', 'Paulo Coelho', 'Văn học', 'https://cdn0.fahasa.com/media/catalog/product/n/h/nha-gia-kim-tai-ban-2020.jpg', 'Hành trình đi tìm kho báu của chàng chăn cừu Santiago.', dummyContent),
    new Book('BK005', 'Clean Code', 'Robert C. Martin', 'Tin học', 'https://m.media-amazon.com/images/I/41xShlnTZTL._SX342_SY445_.jpg', 'Kinh thánh cho lập trình viên muốn viết code sạch.', dummyContent),
    new Book('BK006', 'Đắc Nhân Tâm', 'Dale Carnegie', 'Kỹ năng', 'https://cdn0.fahasa.com/media/catalog/product/d/a/dac-nhan-tam-kho-lon-2016-ml.jpg', 'Nghệ thuật thu phục lòng người.', dummyContent),
    new Book('BK007', 'Mắt Biếc', 'Nguyễn Nhật Ánh', 'Văn học', 'https://cdn0.fahasa.com/media/catalog/product/m/a/mat-biec-bia-mem-2019.jpg', 'Câu chuyện tình yêu buồn nhất của Nguyễn Nhật Ánh.', dummyContent),
    new Book('BK008', 'Tội Ác Và Hình Phạt', 'Fyodor Dostoevsky', 'Văn học', 'https://cdn0.fahasa.com/media/catalog/product/i/m/image_195509_1_50882.jpg', 'Kiệt tác văn học Nga về tâm lý tội phạm.', dummyContent),
    new Book('BK009', 'Số Đỏ', 'Vũ Trọng Phụng', 'Văn học', 'https://cdn0.fahasa.com/media/catalog/product/8/9/8935235226257.jpg', 'Tiểu thuyết trào phúng xuất sắc của văn học Việt Nam.', dummyContent),
    new Book('BK010', 'Tắt Đèn', 'Ngô Tất Tố', 'Văn học', 'https://cdn0.fahasa.com/media/catalog/product/i/m/image_195509_1_25732.jpg', 'Bức tranh hiện thực về nông thôn Việt Nam trước 1945.', dummyContent),
    new Book('BK011', 'Lão Hạc', 'Nam Cao', 'Văn học', 'https://cdn0.fahasa.com/media/catalog/product/8/9/8936067597812.jpg', sampleDesc, dummyContent),
    new Book('BK012', 'Chí Phèo', 'Nam Cao', 'Văn học', 'https://cdn0.fahasa.com/media/catalog/product/8/9/8935235222716.jpg', sampleDesc, dummyContent),
    new Book('BK013', 'Vợ Nhặt', 'Kim Lân', 'Văn học', 'https://cdn0.fahasa.com/media/catalog/product/n/x/nxbtre_full_26152019_031557.jpg', sampleDesc, dummyContent),
    new Book('BK014', 'Rừng Xà Nu', 'Nguyễn Trung Thành', 'Văn học', 'https://cdn0.fahasa.com/media/catalog/product/8/9/8934974160432.jpg', sampleDesc, dummyContent),
    new Book('BK015', 'Chiếc Thuyền Ngoài Xa', 'Nguyễn Minh Châu', 'Văn học', 'https://cdn0.fahasa.com/media/catalog/product/8/9/8935235226271.jpg', sampleDesc, dummyContent),
    new Book('BK016', 'Harry Potter và Phòng Chứa Bí Mật', 'J.K. Rowling', 'Văn học', 'https://cdn0.fahasa.com/media/catalog/product/8/9/8935244869001.jpg', 'Tập 2 trong series Harry Potter.', dummyContent),
    new Book('BK017', 'Sherlock Holmes Toàn Tập', 'Arthur Conan Doyle', 'Văn học', 'https://cdn0.fahasa.com/media/catalog/product/8/9/8936067595504.jpg', 'Những vụ án thám tử lừng danh.', dummyContent),
    new Book('BK018', 'Đồi Gió Hú', 'Emily Brontë', 'Văn học', 'https://cdn0.fahasa.com/media/catalog/product/8/9/8935235228671.jpg', 'Câu chuyện tình yêu đầy ám ảnh.', dummyContent),
    new Book('BK019', 'Trăm Năm Cô Đơn', 'Gabriel García Márquez', 'Văn học', 'https://cdn0.fahasa.com/media/catalog/product/8/9/8935235231718.jpg', 'Kinh điển của chủ nghĩa hiện thực huyền ảo.', dummyContent),
    new Book('BK020', 'Tiếng Gọi Nơi Hoang Dã', 'Jack London', 'Văn học', 'https://cdn0.fahasa.com/media/catalog/product/t/i/tieng-goi-noi-hoang-da-tai-ban-2020.jpg', 'Câu chuyện về chú chó Buck.', dummyContent)
];

// Set random statuses
initialBooks[2].status = 'Đang mượn'; initialBooks[2].borrower = 'Nguyễn Văn A';
initialBooks[9].status = 'Đang mượn'; initialBooks[9].borrower = 'Lê Văn C';

class LibraryManager {
    constructor() {
        // Quick verify: if we have cached data but it has < 11 books, user probably just had the old seed data. 
        // Force refresh to get new books.
        const stored = localStorage.getItem(STORAGE_KEY_BOOKS);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed.length < 11) {
                // Expansion: Reset to get new seed data
                localStorage.removeItem(STORAGE_KEY_BOOKS);
                this.books = this.loadBooks();
            } else {
                this.books = parsed;
            }
        } else {
            this.books = this.loadBooks();
        }
        this.logs = this.loadLogs();
    }

    loadBooks() {
        const stored = localStorage.getItem(STORAGE_KEY_BOOKS);
        if (stored) return JSON.parse(stored);
        localStorage.setItem(STORAGE_KEY_BOOKS, JSON.stringify(initialBooks));
        return initialBooks;
    }

    loadLogs() {
        const stored = localStorage.getItem(STORAGE_KEY_LOGS);
        return stored ? JSON.parse(stored) : [];
    }
    save() { localStorage.setItem(STORAGE_KEY_BOOKS, JSON.stringify(this.books)); }
    saveLogs() {
        if (this.logs.length > 20) this.logs = this.logs.slice(0, 20);
        localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(this.logs));
    }
    logActivity(message) {
        this.logs.unshift({ message, timestamp: new Date().toLocaleString('vi-VN') });
        this.saveLogs();
        renderActivityLog(this.logs);
    }
    addBook(name, author) {
        const id = 'BK' + Date.now().toString().slice(-4) + Math.floor(Math.random() * 10);
        const newBook = new Book(id, name, author, 'Tổng hợp', null, 'Sách mới thêm.', dummyContent);
        this.books.push(newBook);
        this.save();
        this.logActivity(`Thêm sách mới: ${name} (${id})`);
        return newBook;
    }
    findBook(id) { return this.books.find(b => b.id.toUpperCase() === id.toUpperCase()); }

    borrowBook(id, borrowerName) {
        const book = this.findBook(id);
        if (!book) return { success: false, message: 'Mã sách không tồn tại!' };
        if (book.status !== 'Còn') return { success: false, message: `Sách đang được mượn bởi: ${book.borrower}` };
        book.status = 'Đang mượn'; book.borrower = borrowerName; book.borrowDate = new Date().toLocaleDateString('vi-VN');
        this.save();
        this.logActivity(`${borrowerName} mượn sách ${book.name} (${id})`);
        return { success: true, message: `Cho mượn sách "${book.name}" thành công!` };
    }
    returnBook(id) {
        const book = this.findBook(id);
        if (!book) return { success: false, message: 'Mã sách không tồn tại!' };
        if (book.status === 'Còn') return { success: false, message: 'Sách này chưa được mượn!' };
        const prev = book.borrower;
        book.status = 'Còn'; book.borrower = null; book.borrowDate = null;
        this.save();
        this.logActivity(`${prev} trả sách ${book.name} (${id})`);
        return { success: true, message: `Đã trả sách "${book.name}".` };
    }
    getStats() {
        const total = this.books.length;
        const borrowed = this.books.filter(b => b.status === 'Đang mượn').length;
        return { total, borrowed, available: total - borrowed };
    }
}

// --------------------------------------------------------------------------
// 2. UI Helper Functions
// --------------------------------------------------------------------------

function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const iconClass = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
    toast.innerHTML = `<i class="fas ${iconClass}"></i><span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => { toast.style.animation = 'fadeOut 0.3s ease-out forwards'; setTimeout(() => toast.remove(), 300); }, 3000);
}

function renderActivityLog(logs) {
    const list = document.getElementById('activityLog');
    if (!list) return;
    list.innerHTML = '';
    if (logs.length === 0) { list.innerHTML = '<li style="color:#999; font-style:italic;">Chưa có hoạt động nào.</li>'; return; }
    logs.slice(0, 5).forEach(log => {
        const li = document.createElement('li');
        li.innerHTML = `${log.message}<span class="activity-time">${log.timestamp}</span>`;
        list.appendChild(li);
    });
}

function updateStatsUI(app) {
    const totalEl = document.getElementById('statTotal');
    const borrowEl = document.getElementById('statBorrowed');
    const availEl = document.getElementById('statAvailable');
    if (totalEl && borrowEl && availEl) {
        const stats = app.getStats();
        totalEl.textContent = stats.total; borrowEl.textContent = stats.borrowed; availEl.textContent = stats.available;
    }
}

// --------------------------------------------------------------------------
// 3. UI Controller
// --------------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', function () {
    // Only run main UI logic if we are on a page with the table
    const tableBody = document.getElementById('bookListBody');
    if (!tableBody) return; // If we are on detail.html (with no table), skip this part

    const app = new LibraryManager();
    // Expose for debugging
    window.appInstance = app;

    function refreshUI(filterText = '') {
        renderTable(filterText);
        updateStatsUI(app);
        renderActivityLog(app.logs);
    }

    function renderTable(filterText = '') {
        if (!tableBody) return;
        tableBody.innerHTML = '';

        app.books.forEach(book => {
            const contentString = `${book.id} ${book.name} ${book.author} ${book.category}`.toLowerCase();
            if (filterText && !contentString.includes(filterText.toLowerCase())) {
                return;
            }

            const tr = document.createElement('tr');
            const statusClass = book.status === 'Còn' ? 'available' : 'borrowed';
            const statusText = book.status === 'Còn' ? 'Còn' : `Đang mượn`;

            tr.innerHTML = `
                <td><strong>${book.id}</strong></td>
                <td>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <img src="${book.image}" class="book-cover" alt="Cover" onerror="this.src='https://via.placeholder.com/40x60'">
                        <span>${book.name}</span>
                    </div>
                </td>
                <td>${book.author}</td>
                <td>${book.category}</td>
                <td><span class="status ${statusClass}">${statusText}</span></td>
                <td>
                    <a href="detail.html?id=${book.id}" class="btn-primary" style="padding: 5px 10px; font-size: 0.8rem; text-decoration: none; display: inline-block;">
                        <i class="fas fa-eye"></i> Xem
                    </a>
                </td>
            `;
            tableBody.appendChild(tr);
        });
    }

    refreshUI();

    // Event Listeners (Add/Borrow/Search)
    const addBookForm = document.getElementById('addBookForm');
    if (addBookForm) {
        addBookForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const inputs = addBookForm.querySelectorAll('input');
            const name = inputs[0].value.trim(); const author = inputs[1].value.trim();
            if (name) {
                app.addBook(name, author);
                showToast(`Đã thêm sách: ${name}`, 'success');
                addBookForm.reset(); refreshUI();
            }
        });
    }
    const borrowForm = document.getElementById('borrowForm');
    if (borrowForm) {
        borrowForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const studentNameInput = borrowForm.querySelector('input[placeholder*="Nguyễn Văn A"]');
            const bookIdInput = borrowForm.querySelector('input[placeholder*="BK001"]');
            const actionInputs = borrowForm.querySelectorAll('input[name="ht"]');

            const studentName = studentNameInput.value.trim(); const bookId = bookIdInput.value.trim();
            let action = 'muon'; actionInputs.forEach(input => { if (input.checked) action = input.value; });
            if (!bookId) { showToast('Vui lòng nhập Mã sách!', 'error'); return; }
            let result;
            if (action === 'muon') {
                if (!studentName) { showToast('Vui lòng nhập tên học sinh!', 'error'); return; }
                result = app.borrowBook(bookId, studentName);
            } else {
                result = app.returnBook(bookId);
            }
            if (result.success) {
                showToast(result.message, 'success'); borrowForm.reset(); actionInputs[0].checked = true; refreshUI();
            } else {
                showToast(result.message, 'error');
            }
        });
    }
    const searchInput = document.getElementById('tableSearch');
    if (searchInput) { searchInput.addEventListener('keyup', function () { refreshUI(this.value); }); }

    const sidebarSearchBtn = document.querySelector('.box-search button');
    if (sidebarSearchBtn) {
        sidebarSearchBtn.addEventListener('click', function () {
            const val = this.previousElementSibling.value;
            if (val) showToast('Tìm kiếm: ' + val, 'success');
        });
    }
});
