/**
 * Main Application Controller cho Notion Học Tập
 * Quản lý trang, lưu trữ LocalStorage, chuyển đổi giao diện và chế độ học
 */

class NotionStudyApp {
    constructor() {
        this.STORAGE_KEY = 'notion_study_data_v1';
        this.data = this.loadData();
        this.currentPageId = this.data.pages[0]?.id || null;
        this.currentView = 'editor'; // 'editor' | 'kanban'

        this.editor = new NotionEditor();
        this.tools = new StudyTools();

        this.initThemeAndFont();
        this.initDOM();
        this.renderSidebar();
        this.loadCurrentPage();
        this.initKeyboardShortcuts();
    }

    loadData() {
        try {
            const saved = localStorage.getItem(this.STORAGE_KEY);
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (e) {
            console.error('Error loading localStorage data:', e);
        }
        return JSON.parse(JSON.stringify(DEFAULT_WORKSPACE_DATA));
    }

    saveToStorage() {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
            this.showSaveIndicator();
        } catch (e) {
            console.error('Error saving data:', e);
        }
    }

    showSaveIndicator() {
        const ind = document.getElementById('save-status');
        if (ind) {
            ind.innerText = 'Đã lưu ✓';
            setTimeout(() => { ind.innerText = ''; }, 1200);
        }
    }

    getCurrentPage() {
        return this.data.pages.find(p => p.id === this.currentPageId);
    }

    initThemeAndFont() {
        const theme = this.data.settings.theme || 'light';
        const font = this.data.settings.fontFamily || 'sans';
        document.documentElement.setAttribute('data-theme', theme);
        document.documentElement.setAttribute('data-font', font);
    }

    toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme') || 'light';
        const next = current === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', next);
        this.data.settings.theme = next;
        this.saveToStorage();
        this.showToast(`Đã chuyển sang giao diện ${next === 'dark' ? 'Tối (Dark Mode)' : 'Sáng (Light Mode)'}`);
    }

    setFontFamily(font) {
        document.documentElement.setAttribute('data-font', font);
        this.data.settings.fontFamily = font;
        this.saveToStorage();
    }

    initDOM() {
        // Toggle Sidebar
        document.getElementById('toggle-sidebar-btn').onclick = () => {
            const sidebar = document.getElementById('sidebar');
            sidebar.classList.toggle('collapsed');
        };

        // Theme Toggle
        document.getElementById('theme-toggle-btn').onclick = () => this.toggleTheme();

        // Nút thêm trang mới
        document.getElementById('add-page-btn').onclick = () => this.createNewPage();

        // Chuyển Tab (Ghi chú vs Bảng học tập Kanban)
        document.getElementById('tab-doc').onclick = () => this.switchView('editor');
        document.getElementById('tab-kanban').onclick = () => this.switchView('kanban');

        // Nút mở Flashcards
        document.getElementById('flashcard-btn').onclick = () => {
            this.tools.openFlashcardReview(false);
        };

        // Search trigger
        document.getElementById('search-trigger-btn').onclick = () => this.openSearchModal();

        // Page title listener
        const titleInput = document.getElementById('page-title-input');
        titleInput.oninput = () => {
            const page = this.getCurrentPage();
            if (page) {
                page.title = titleInput.value || 'Trang chưa đặt tên';
                this.saveToStorage();
                this.renderSidebar();
                document.getElementById('breadcrumb-page').innerText = page.title;
            }
        };

        // Cover & Icon Actions
        document.getElementById('page-icon-box').onclick = () => this.openEmojiPicker();
        document.getElementById('change-cover-btn').onclick = () => this.openCoverPicker();
        document.getElementById('remove-cover-btn').onclick = () => this.removeCover();

        // Favorite Toggle
        document.getElementById('page-star-btn').onclick = () => {
            const page = this.getCurrentPage();
            if (page) {
                page.isFavorite = !page.isFavorite;
                this.saveToStorage();
                this.renderSidebar();
                this.updateStarButton(page.isFavorite);
            }
        };

        // More options dropdown
        document.getElementById('page-more-btn').onclick = () => this.togglePageMenu();
    }

    switchView(viewName) {
        this.currentView = viewName;
        const docView = document.getElementById('page-doc-view');
        const kanbanView = document.getElementById('kanban-board-container');
        const tabDoc = document.getElementById('tab-doc');
        const tabKanban = document.getElementById('tab-kanban');

        if (viewName === 'editor') {
            docView.style.display = 'block';
            kanbanView.style.display = 'none';
            tabDoc.classList.add('active');
            tabKanban.classList.remove('active');
        } else {
            docView.style.display = 'none';
            kanbanView.style.display = 'flex';
            tabDoc.classList.remove('active');
            tabKanban.classList.add('active');
            this.tools.renderKanbanBoard();
        }
    }

    renderSidebar() {
        const favList = document.getElementById('fav-pages-list');
        const allList = document.getElementById('all-pages-list');

        favList.innerHTML = '';
        allList.innerHTML = '';

        const favorites = this.data.pages.filter(p => p.isFavorite);
        const regular = this.data.pages;

        favorites.forEach(page => {
            favList.appendChild(this.createSidebarItem(page));
        });

        regular.forEach(page => {
            allList.appendChild(this.createSidebarItem(page));
        });
    }

    createSidebarItem(page) {
        const item = document.createElement('div');
        item.className = `nav-item ${page.id === this.currentPageId ? 'active' : ''}`;
        item.dataset.pageId = page.id;

        item.innerHTML = `
            <span class="nav-icon">${page.icon || '📄'}</span>
            <span class="nav-title">${page.title || 'Untitled'}</span>
            <div class="nav-actions">
                <button class="nav-action-btn del-page" title="Xóa trang">🗑️</button>
            </div>
        `;

        item.onclick = (e) => {
            if (e.target.closest('.del-page')) {
                e.stopPropagation();
                if (confirm(`Bạn có chắc muốn xóa trang "${page.title}"?`)) {
                    this.deletePage(page.id);
                }
                return;
            }
            this.selectPage(page.id);
        };

        return item;
    }

    selectPage(pageId) {
        this.currentPageId = pageId;
        this.renderSidebar();
        this.loadCurrentPage();
        this.switchView('editor');
    }

    loadCurrentPage() {
        const page = this.getCurrentPage();
        if (!page) {
            if (this.data.pages.length > 0) {
                this.selectPage(this.data.pages[0].id);
            }
            return;
        }

        // Cập nhật Breadcrumbs
        document.getElementById('breadcrumb-page').innerText = page.title;

        // Cập nhật Cover
        const coverEl = document.getElementById('page-cover');
        if (page.cover) {
            coverEl.style.display = 'block';
            const preset = NOTION_COVERS.find(c => c.id === page.cover);
            if (preset) {
                coverEl.style.background = preset.css;
            } else {
                coverEl.style.backgroundImage = `url(${page.cover})`;
            }
        } else {
            coverEl.style.display = 'none';
        }

        // Cập nhật Icon
        const iconEl = document.getElementById('page-icon-box');
        iconEl.innerText = page.icon || '📝';

        // Cập nhật Title
        const titleInput = document.getElementById('page-title-input');
        titleInput.value = page.title || '';

        // Cập nhật Favorite Star
        this.updateStarButton(page.isFavorite);

        // Render Blocks
        this.editor.renderPageBlocks(page);
    }

    updateStarButton(isFav) {
        const starBtn = document.getElementById('page-star-btn');
        if (starBtn) {
            starBtn.innerHTML = isFav ? '⭐' : '☆';
            starBtn.title = isFav ? 'Bỏ khỏi mục yêu thích' : 'Thêm vào mục yêu thích';
        }
    }

    createNewPage(templateType = null) {
        const newId = 'page-' + Date.now();
        const newPage = {
            id: newId,
            title: 'Trang học tập mới',
            icon: '📘',
            cover: 'gradient-sunset',
            isFavorite: false,
            createdAt: new Date().toISOString().split('T')[0],
            blocks: [
                {
                    id: 'b-' + Date.now(),
                    type: 'callout',
                    icon: '💡',
                    content: 'Chào mừng bạn đến với trang học tập mới! Gõ <code>/</code> để chọn các khối học tập như Flashcard, Công thức Toán KaTeX, Toggle Active Recall...'
                },
                {
                    id: 'b-' + (Date.now() + 1),
                    type: 'heading_1',
                    content: 'Nội dung bài học'
                },
                {
                    id: 'b-' + (Date.now() + 2),
                    type: 'text',
                    content: ''
                }
            ]
        };

        this.data.pages.push(newPage);
        this.saveToStorage();
        this.selectPage(newId);
        this.showToast('Đã tạo trang ghi chú mới!');
    }

    deletePage(pageId) {
        if (this.data.pages.length <= 1) {
            alert('Bạn cần giữ lại ít nhất 1 trang!');
            return;
        }

        this.data.pages = this.data.pages.filter(p => p.id !== pageId);
        this.saveToStorage();
        this.selectPage(this.data.pages[0].id);
        this.showToast('Đã xóa trang!');
    }

    openEmojiPicker() {
        const page = this.getCurrentPage();
        if (!page) return;

        const emojis = EMOJI_PRESETS.join(' ');
        const chosen = prompt(`Chọn emoji đại diện (hoặc gõ emoji bất kỳ):\n${emojis}`, page.icon || '📝');
        if (chosen) {
            page.icon = chosen.trim();
            this.saveToStorage();
            this.loadCurrentPage();
            this.renderSidebar();
        }
    }

    openCoverPicker() {
        const page = this.getCurrentPage();
        if (!page) return;

        const list = NOTION_COVERS.map((c, i) => `${i + 1}. ${c.name}`).join('\n');
        const choice = prompt(`Chọn ảnh bìa dạng Gradient:\n${list}\n(Hoặc dán link URL ảnh bất kỳ)`, '1');

        if (!choice) return;

        const num = parseInt(choice, 10);
        if (!isNaN(num) && num >= 1 && num <= NOTION_COVERS.length) {
            page.cover = NOTION_COVERS[num - 1].id;
        } else if (choice.startsWith('http')) {
            page.cover = choice;
        }

        this.saveToStorage();
        this.loadCurrentPage();
    }

    removeCover() {
        const page = this.getCurrentPage();
        if (page) {
            page.cover = null;
            this.saveToStorage();
            this.loadCurrentPage();
        }
    }

    openSearchModal() {
        const modal = document.getElementById('search-modal');
        const input = document.getElementById('search-palette-input');
        const results = document.getElementById('search-results');

        modal.style.display = 'flex';
        input.value = '';
        input.focus();

        const doSearch = () => {
            const q = input.value.toLowerCase().trim();
            results.innerHTML = '';

            const matched = [];
            this.data.pages.forEach(p => {
                if (p.title.toLowerCase().includes(q)) {
                    matched.push({ page: p, match: 'Tiêu đề' });
                } else {
                    const blockMatch = p.blocks.find(b => 
                        (b.content && b.content.toLowerCase().includes(q)) ||
                        (b.question && b.question.toLowerCase().includes(q)) ||
                        (b.front && b.front.toLowerCase().includes(q))
                    );
                    if (blockMatch) {
                        matched.push({ page: p, match: 'Nội dung trong bài' });
                    }
                }
            });

            if (matched.length === 0) {
                results.innerHTML = '<div style="padding: 16px; color: var(--text-muted); text-align: center;">Không tìm thấy kết quả nào</div>';
                return;
            }

            matched.forEach(item => {
                const row = document.createElement('div');
                row.className = 'search-result-item';
                row.innerHTML = `
                    <span style="font-size: 20px;">${item.page.icon || '📄'}</span>
                    <div style="flex: 1;">
                        <div style="font-weight: 500;">${item.page.title}</div>
                        <div style="font-size: 11px; color: var(--text-muted);">Khớp: ${item.match}</div>
                    </div>
                `;
                row.onclick = () => {
                    modal.style.display = 'none';
                    this.selectPage(item.page.id);
                };
                results.appendChild(row);
            });
        };

        input.oninput = doSearch;
        doSearch();
    }

    togglePageMenu() {
        const choice = prompt('Tùy chọn trang:\n1. Xuất ra file Markdown (.md)\n2. In hoặc Lưu PDF\n3. Sao lưu toàn bộ dữ liệu (JSON)\n4. Phục hồi dữ liệu từ JSON', '1');
        if (choice === '1') this.exportCurrentPageMarkdown();
        else if (choice === '2') window.print();
        else if (choice === '3') this.exportWorkspaceBackup();
        else if (choice === '4') this.importWorkspaceBackup();
    }

    exportCurrentPageMarkdown() {
        const page = this.getCurrentPage();
        if (!page) return;

        let md = `# ${page.icon || ''} ${page.title}\n\n`;
        page.blocks.forEach(b => {
            if (b.type === 'heading_1') md += `\n# ${b.content}\n`;
            else if (b.type === 'heading_2') md += `\n## ${b.content}\n`;
            else if (b.type === 'heading_3') md += `\n### ${b.content}\n`;
            else if (b.type === 'todo') md += `- [${b.checked ? 'x' : ' '}] ${b.content}\n`;
            else if (b.type === 'bullet') md += `- ${b.content}\n`;
            else if (b.type === 'quote') md += `> ${b.content}\n`;
            else if (b.type === 'math') md += `\n$$\n${b.content}\n$$\n`;
            else if (b.type === 'toggle') md += `\n<details><summary>${b.question}</summary>\n${b.answer}\n</details>\n`;
            else if (b.type === 'flashcard') md += `\n**[Flashcard]**\n- Mặt trước: ${b.front}\n- Mặt sau: ${b.back}\n`;
            else if (b.type === 'callout') md += `\n> 💡 ${b.content}\n`;
            else md += `${b.content}\n\n`;
        });

        const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `${page.title || 'ghi-chu'}.md`;
        a.click();
        this.showToast('Đã tải xuống file Markdown!');
    }

    exportWorkspaceBackup() {
        const json = JSON.stringify(this.data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `notion_study_backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        this.showToast('Đã xuất file sao lưu dữ liệu!');
    }

    importWorkspaceBackup() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const parsed = JSON.parse(event.target.result);
                    if (parsed.pages) {
                        this.data = parsed;
                        this.saveToStorage();
                        this.renderSidebar();
                        this.loadCurrentPage();
                        this.showToast('Phục hồi dữ liệu thành công!');
                    }
                } catch (err) {
                    alert('File sao lưu JSON không hợp lệ!');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    }

    initKeyboardShortcuts() {
        window.addEventListener('keydown', (e) => {
            // Ctrl + K hoặc Cmd + K: Mở tìm kiếm nhanh
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.openSearchModal();
            }
            // Escape: Đóng modal
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal-overlay').forEach(m => m.style.display = 'none');
            }
        });
    }

    showToast(message) {
        let toast = document.getElementById('toast');
        if (!toast) return;
        toast.innerText = message;
        toast.style.display = 'block';
        setTimeout(() => { toast.style.display = 'none'; }, 2500);
    }
}

// Khởi chạy App khi tải xong DOM
window.addEventListener('DOMContentLoaded', () => {
    window.app = new NotionStudyApp();
});
