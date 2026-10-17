/**
 * Block Editor cho Notion Học Tập
 * Hỗ trợ các khối học tập: Callout, Toggle (Active Recall), Math KaTeX, Flashcard, v.v.
 */

class NotionEditor {
    constructor() {
        this.container = document.getElementById('blocks-container');
        this.slashMenu = document.getElementById('slash-menu');
        this.slashSelectedIndex = 0;
        this.activeBlockElement = null;
        this.currentSlashQuery = '';
        this.saveTimeout = null;

        this.slashOptions = [
            { type: 'text', title: 'Văn bản (Text)', desc: 'Viết văn bản ghi chép thông thường', icon: '📝' },
            { type: 'heading_1', title: 'Tiêu đề 1 (H1)', desc: 'Tiêu đề lớn cho phần chính', icon: '📌' },
            { type: 'heading_2', title: 'Tiêu đề 2 (H2)', desc: 'Tiêu đề vừa cho mục con', icon: '📍' },
            { type: 'heading_3', title: 'Tiêu đề 3 (H3)', desc: 'Tiêu đề nhỏ', icon: '📎' },
            { type: 'todo', title: 'Việc cần làm (To-do)', desc: 'Danh sách bài tập, mục tiêu có ô tích', icon: '☑️' },
            { type: 'toggle', title: 'Danh sách thu gọn (Toggle)', desc: 'Ẩn hiện đáp án - Tối ưu cho Active Recall', icon: '▶️' },
            { type: 'flashcard', title: 'Thẻ Flashcard', desc: 'Tạo thẻ ghi nhớ Câu hỏi & Đáp án ngay trong bài', icon: '🎴' },
            { type: 'math', title: 'Công thức Toán học (KaTeX)', desc: 'Gõ công thức Toán, Lý, Hóa chuẩn LaTeX', icon: '🧮' },
            { type: 'callout', title: 'Hộp ghi chú (Callout)', desc: 'Làm nổi bật định lý, công thức quan trọng', icon: '💡' },
            { type: 'bullet', title: 'Danh sách gạch đầu dòng', desc: 'Liệt kê các ý chính nhanh', icon: '•' },
            { type: 'quote', title: 'Trích dẫn (Quote)', desc: 'Lời nhắc, danh ngôn, định nghĩa', icon: '❝' },
            { type: 'code', title: 'Khối mã nguồn (Code)', desc: 'Ghi chép mã lập trình, thuật toán', icon: '💻' },
            { type: 'divider', title: 'Đường phân cách (Divider)', desc: 'Ngăn cách các phần bài học', icon: '➖' }
        ];

        this.initEventListeners();
    }

    initEventListeners() {
        // Lắng nghe sự kiện click bên ngoài để đóng slash menu
        document.addEventListener('click', (e) => {
            if (!this.slashMenu.contains(e.target) && e.target !== this.activeBlockElement) {
                this.hideSlashMenu();
            }
        });

        // Điều khiển phím trong slash menu
        document.addEventListener('keydown', (e) => {
            if (this.slashMenu.style.display === 'block') {
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    this.navigateSlashMenu(1);
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    this.navigateSlashMenu(-1);
                } else if (e.key === 'Enter') {
                    e.preventDefault();
                    this.executeSelectedSlashOption();
                } else if (e.key === 'Escape') {
                    e.preventDefault();
                    this.hideSlashMenu();
                }
            }
        });
    }

    renderPageBlocks(page) {
        this.container.innerHTML = '';
        if (!page.blocks || page.blocks.length === 0) {
            // Khởi tạo một block trống mặc định
            page.blocks = [{ id: 'b-' + Date.now(), type: 'text', content: '' }];
        }

        page.blocks.forEach((block, index) => {
            const blockEl = this.createBlockElement(block, index);
            this.container.appendChild(blockEl);
        });

        this.setupDragAndDrop();
    }

    createBlockElement(block, index) {
        const wrapper = document.createElement('div');
        wrapper.className = `block-wrapper block-${block.type}`;
        wrapper.dataset.blockId = block.id;
        wrapper.dataset.blockType = block.type;

        // Gutter (nút + và nút kéo)
        const gutter = document.createElement('div');
        gutter.className = 'block-gutter';
        gutter.innerHTML = `
            <button class="block-gutter-btn add-btn" title="Thêm khối bên dưới">+</button>
            <button class="block-gutter-btn drag-btn" title="Kéo thả hoặc xóa">⋮⋮</button>
        `;

        gutter.querySelector('.add-btn').onclick = () => {
            this.insertBlockAfter(block.id, 'text');
        };

        gutter.querySelector('.drag-btn').onclick = (e) => {
            e.stopPropagation();
            if (confirm('Bạn muốn xóa khối này?')) {
                this.deleteBlock(block.id);
            }
        };

        wrapper.appendChild(gutter);

        // Render ruột theo từng loại block
        const inner = this.renderBlockContent(block);
        wrapper.appendChild(inner);

        return wrapper;
    }

    renderBlockContent(block) {
        const container = document.createElement('div');
        container.style.width = '100%';

        switch (block.type) {
            case 'heading_1':
            case 'heading_2':
            case 'heading_3':
            case 'text':
            case 'bullet':
            case 'quote': {
                const contentEl = document.createElement('div');
                contentEl.className = 'block-content';
                contentEl.contentEditable = true;
                contentEl.innerHTML = block.content || '';
                contentEl.dataset.placeholder = block.type.startsWith('heading') 
                    ? `Tiêu đề ${block.type.slice(-1)}...` 
                    : "Gõ '/' để mở menu khối lệnh hoặc bắt đầu viết...";

                this.bindEditableEvents(contentEl, block);
                container.appendChild(contentEl);
                break;
            }

            case 'todo': {
                const todoRow = document.createElement('div');
                todoRow.className = `block-todo ${block.checked ? 'todo-checked' : ''}`;
                
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.className = 'todo-checkbox';
                checkbox.checked = !!block.checked;
                checkbox.onchange = (e) => {
                    block.checked = e.target.checked;
                    todoRow.classList.toggle('todo-checked', block.checked);
                    this.triggerAutoSave();
                };

                const contentEl = document.createElement('div');
                contentEl.className = 'block-content';
                contentEl.contentEditable = true;
                contentEl.innerHTML = block.content || '';
                contentEl.dataset.placeholder = 'Nhiệm vụ cần hoàn thành...';

                this.bindEditableEvents(contentEl, block);

                todoRow.appendChild(checkbox);
                todoRow.appendChild(contentEl);
                container.appendChild(todoRow);
                break;
            }

            case 'callout': {
                const calloutWrap = document.createElement('div');
                calloutWrap.className = 'block-callout-wrapper';

                const iconEl = document.createElement('div');
                iconEl.className = 'callout-icon';
                iconEl.textContent = block.icon || '💡';
                iconEl.title = 'Bấm để đổi icon';
                iconEl.onclick = () => {
                    const newEmoji = prompt('Nhập emoji mới cho Callout:', block.icon || '💡');
                    if (newEmoji) {
                        block.icon = newEmoji;
                        iconEl.textContent = newEmoji;
                        this.triggerAutoSave();
                    }
                };

                const contentEl = document.createElement('div');
                contentEl.className = 'block-content';
                contentEl.contentEditable = true;
                contentEl.innerHTML = block.content || '';
                contentEl.dataset.placeholder = 'Ghi chú quan trọng, định lý, công thức...';

                this.bindEditableEvents(contentEl, block);

                calloutWrap.appendChild(iconEl);
                calloutWrap.appendChild(contentEl);
                container.appendChild(calloutWrap);
                break;
            }

            case 'toggle': {
                const toggleWrap = document.createElement('div');
                toggleWrap.className = 'toggle-block-wrapper';

                const toggleHeader = document.createElement('div');
                toggleHeader.className = 'toggle-header';

                const arrow = document.createElement('span');
                arrow.className = 'toggle-arrow';
                arrow.innerHTML = '▶';

                const qContent = document.createElement('div');
                qContent.className = 'block-content';
                qContent.contentEditable = true;
                qContent.innerHTML = block.question || '';
                qContent.dataset.placeholder = 'Câu hỏi gợi nhớ / Vấn đề cần trả lời...';

                qContent.oninput = () => {
                    block.question = qContent.innerHTML;
                    this.triggerAutoSave();
                };

                toggleHeader.appendChild(arrow);
                toggleHeader.appendChild(qContent);

                const toggleBody = document.createElement('div');
                toggleBody.className = 'toggle-body';

                const aContent = document.createElement('div');
                aContent.className = 'block-content';
                aContent.contentEditable = true;
                aContent.innerHTML = block.answer || '';
                aContent.dataset.placeholder = 'Đáp án ẩn / Giải thích chi tiết (nhấn mũi tên để ẩn/hiện)...';

                aContent.oninput = () => {
                    block.answer = aContent.innerHTML;
                    this.triggerAutoSave();
                };

                toggleBody.appendChild(aContent);

                arrow.onclick = (e) => {
                    e.stopPropagation();
                    toggleWrap.classList.toggle('open');
                };

                toggleWrap.appendChild(toggleHeader);
                toggleWrap.appendChild(toggleBody);
                container.appendChild(toggleWrap);
                break;
            }

            case 'flashcard': {
                const cardWrap = document.createElement('div');
                cardWrap.className = 'flashcard-block-wrapper';

                cardWrap.innerHTML = `
                    <div class="flashcard-header-badge">
                        <span>🎴 Thẻ Flashcard Ôn Tập</span>
                    </div>
                    <div class="flashcard-front-box">
                        <div class="flashcard-label">MẶT TRƯỚC (CÂU HỎI / TỪ VỰNG):</div>
                        <div class="block-content fc-front" contenteditable="true" data-placeholder="Nhập câu hỏi hoặc từ mới...">${block.front || ''}</div>
                    </div>
                    <div class="flashcard-back-box">
                        <div class="flashcard-label">MẶT SAU (ĐÁP ÁN / ĐỊNH NGHĨA):</div>
                        <div class="block-content fc-back" contenteditable="true" data-placeholder="Nhập giải thích, ví dụ hoặc nghĩa...">${block.back || ''}</div>
                    </div>
                `;

                const frontEl = cardWrap.querySelector('.fc-front');
                const backEl = cardWrap.querySelector('.fc-back');

                frontEl.oninput = () => {
                    block.front = frontEl.innerText;
                    this.triggerAutoSave();
                };

                backEl.oninput = () => {
                    block.back = backEl.innerText;
                    this.triggerAutoSave();
                };

                container.appendChild(cardWrap);
                break;
            }

            case 'math': {
                const mathWrap = document.createElement('div');
                mathWrap.className = 'katex-block-wrapper';

                const mathInput = document.createElement('div');
                mathInput.className = 'block-content';
                mathInput.contentEditable = true;
                mathInput.style.fontFamily = 'monospace';
                mathInput.style.fontSize = '14px';
                mathInput.style.padding = '6px';
                mathInput.style.marginBottom = '8px';
                mathInput.style.borderBottom = '1px dashed var(--border-color)';
                mathInput.innerText = block.content || 'f(x) = \\int_{a}^{b} x^2 dx';
                mathInput.dataset.placeholder = 'Gõ mã công thức LaTeX, ví dụ: \\int, \\lim, \\frac{a}{b}...';

                const mathPreview = document.createElement('div');
                mathPreview.className = 'katex-preview-render';
                mathPreview.style.minHeight = '30px';
                mathPreview.style.fontSize = '18px';

                const updateKaTeX = () => {
                    block.content = mathInput.innerText;
                    try {
                        if (window.katex) {
                            window.katex.render(block.content || '', mathPreview, {
                                throwOnError: false,
                                displayMode: true
                            });
                        } else {
                            mathPreview.innerText = block.content;
                        }
                    } catch (e) {
                        mathPreview.innerText = 'Lỗi cú pháp LaTeX: ' + e.message;
                    }
                    this.triggerAutoSave();
                };

                mathInput.oninput = updateKaTeX;
                setTimeout(updateKaTeX, 50);

                mathWrap.appendChild(mathInput);
                mathWrap.appendChild(mathPreview);
                container.appendChild(mathWrap);
                break;
            }

            case 'code': {
                const codeWrap = document.createElement('div');
                codeWrap.className = 'code-block-wrapper';

                const copyBtn = document.createElement('button');
                copyBtn.className = 'code-copy-btn';
                copyBtn.innerText = 'Copy';
                copyBtn.onclick = () => {
                    navigator.clipboard.writeText(codeContent.innerText);
                    copyBtn.innerText = 'Đã sao chép!';
                    setTimeout(() => copyBtn.innerText = 'Copy', 1500);
                };

                const codeContent = document.createElement('pre');
                codeContent.className = 'block-content';
                codeContent.contentEditable = true;
                codeContent.style.margin = '0';
                codeContent.innerText = block.content || '// Gõ mã code hoặc thuật toán ở đây...';

                codeContent.oninput = () => {
                    block.content = codeContent.innerText;
                    this.triggerAutoSave();
                };

                codeWrap.appendChild(copyBtn);
                codeWrap.appendChild(codeContent);
                container.appendChild(codeWrap);
                break;
            }

            case 'divider': {
                const divider = document.createElement('div');
                divider.className = 'block-divider';
                container.appendChild(divider);
                break;
            }

            default: {
                const p = document.createElement('div');
                p.className = 'block-content';
                p.contentEditable = true;
                p.innerHTML = block.content || '';
                this.bindEditableEvents(p, block);
                container.appendChild(p);
                break;
            }
        }

        return container;
    }

    bindEditableEvents(el, block) {
        el.oninput = () => {
            block.content = el.innerHTML;
            this.triggerAutoSave();

            // Kiểm tra phím tắt nhanh Markdown (ví dụ: gõ '# ' biến thành Heading 1)
            const text = el.innerText;
            if (text === '# ') {
                el.innerText = '';
                this.changeBlockType(block.id, 'heading_1');
                return;
            } else if (text === '## ') {
                el.innerText = '';
                this.changeBlockType(block.id, 'heading_2');
                return;
            } else if (text === '- ' || text === '* ') {
                el.innerText = '';
                this.changeBlockType(block.id, 'bullet');
                return;
            } else if (text === '[] ' || text === '[ ] ') {
                el.innerText = '';
                this.changeBlockType(block.id, 'todo');
                return;
            } else if (text === '> ') {
                el.innerText = '';
                this.changeBlockType(block.id, 'quote');
                return;
            }

            // Kiểm tra mở slash menu nếu gõ ký tự '/'
            if (text.endsWith('/')) {
                this.showSlashMenu(el);
            } else if (this.slashMenu.style.display === 'block') {
                const slashPos = text.lastIndexOf('/');
                if (slashPos !== -1) {
                    this.filterSlashMenu(text.substring(slashPos + 1));
                } else {
                    this.hideSlashMenu();
                }
            }
        };

        el.onkeydown = (e) => {
            if (e.key === 'Enter' && !e.shiftKey && this.slashMenu.style.display !== 'block') {
                e.preventDefault();
                this.insertBlockAfter(block.id, 'text');
            } else if (e.key === 'Backspace' && el.innerText.trim() === '' && block.type !== 'text') {
                e.preventDefault();
                this.changeBlockType(block.id, 'text');
            }
        };
    }

    showSlashMenu(targetElement) {
        this.activeBlockElement = targetElement;
        const rect = targetElement.getBoundingClientRect();

        this.slashMenu.style.top = `${rect.bottom + window.scrollY + 6}px`;
        let left = rect.left + window.scrollX;
        if (left + 320 > window.innerWidth) left = window.innerWidth - 330;
        this.slashMenu.style.left = `${left}px`;
        this.slashMenu.style.display = 'block';

        this.filterSlashMenu('');
    }

    hideSlashMenu() {
        this.slashMenu.style.display = 'none';
        this.currentSlashQuery = '';
    }

    filterSlashMenu(query) {
        this.currentSlashQuery = query.toLowerCase();
        const filtered = this.slashOptions.filter(item => 
            item.title.toLowerCase().includes(this.currentSlashQuery) ||
            item.desc.toLowerCase().includes(this.currentSlashQuery) ||
            item.type.toLowerCase().includes(this.currentSlashQuery)
        );

        this.slashMenu.innerHTML = '';
        if (filtered.length === 0) {
            this.slashMenu.innerHTML = '<div style="padding: 12px; font-size: 13px; color: var(--text-muted); text-align: center;">Không tìm thấy khối nào phù hợp</div>';
            return;
        }

        this.slashSelectedIndex = 0;
        filtered.forEach((item, index) => {
            const itemEl = document.createElement('div');
            itemEl.className = `slash-item ${index === 0 ? 'selected' : ''}`;
            itemEl.dataset.type = item.type;
            itemEl.innerHTML = `
                <div class="slash-item-icon">${item.icon}</div>
                <div class="slash-item-text">
                    <span class="slash-item-title">${item.title}</span>
                    <span class="slash-item-desc">${item.desc}</span>
                </div>
            `;
            itemEl.onclick = () => {
                this.selectBlockType(item.type);
            };
            this.slashMenu.appendChild(itemEl);
        });
    }

    navigateSlashMenu(direction) {
        const items = this.slashMenu.querySelectorAll('.slash-item');
        if (items.length === 0) return;

        items[this.slashSelectedIndex]?.classList.remove('selected');
        this.slashSelectedIndex = (this.slashSelectedIndex + direction + items.length) % items.length;
        items[this.slashSelectedIndex]?.classList.add('selected');
        items[this.slashSelectedIndex]?.scrollIntoView({ block: 'nearest' });
    }

    executeSelectedSlashOption() {
        const items = this.slashMenu.querySelectorAll('.slash-item');
        if (items.length > 0 && items[this.slashSelectedIndex]) {
            const chosenType = items[this.slashSelectedIndex].dataset.type;
            this.selectBlockType(chosenType);
        }
    }

    selectBlockType(type) {
        if (!this.activeBlockElement) return;
        const blockWrapper = this.activeBlockElement.closest('.block-wrapper');
        const blockId = blockWrapper?.dataset.blockId;

        if (blockId) {
            // Xóa ký tự '/' đã gõ
            if (this.activeBlockElement.innerHTML.endsWith('/')) {
                this.activeBlockElement.innerHTML = this.activeBlockElement.innerHTML.slice(0, -1);
            }
            this.changeBlockType(blockId, type);
        }

        this.hideSlashMenu();
    }

    changeBlockType(blockId, newType) {
        const page = window.app.getCurrentPage();
        if (!page) return;

        const block = page.blocks.find(b => b.id === blockId);
        if (block) {
            block.type = newType;
            if (newType === 'toggle') {
                block.question = block.content || 'Câu hỏi ôn tập';
                block.answer = 'Câu trả lời chi tiết';
            } else if (newType === 'flashcard') {
                block.front = block.content || 'Thuật ngữ / Câu hỏi';
                block.back = 'Định nghĩa / Giải thích đáp án';
            } else if (newType === 'callout') {
                block.icon = '💡';
            } else if (newType === 'math') {
                block.content = block.content || 'E = mc^2';
            }
            this.renderPageBlocks(page);
            this.triggerAutoSave();
        }
    }

    insertBlockAfter(currentBlockId, newType = 'text') {
        const page = window.app.getCurrentPage();
        if (!page) return;

        const index = page.blocks.findIndex(b => b.id === currentBlockId);
        const newBlock = {
            id: 'b-' + Date.now(),
            type: newType,
            content: ''
        };

        if (index !== -1) {
            page.blocks.splice(index + 1, 0, newBlock);
        } else {
            page.blocks.push(newBlock);
        }

        this.renderPageBlocks(page);
        this.triggerAutoSave();

        // Focus vào block mới tạo
        setTimeout(() => {
            const newBlockEl = document.querySelector(`[data-block-id="${newBlock.id}"] .block-content`);
            if (newBlockEl) newBlockEl.focus();
        }, 30);
    }

    deleteBlock(blockId) {
        const page = window.app.getCurrentPage();
        if (!page) return;

        if (page.blocks.length <= 1) {
            // Giữ lại ít nhất 1 block
            page.blocks = [{ id: 'b-' + Date.now(), type: 'text', content: '' }];
        } else {
            page.blocks = page.blocks.filter(b => b.id !== blockId);
        }

        this.renderPageBlocks(page);
        this.triggerAutoSave();
    }

    setupDragAndDrop() {
        if (!window.Sortable) return;
        new Sortable(this.container, {
            animation: 150,
            handle: '.drag-btn',
            onEnd: () => {
                const page = window.app.getCurrentPage();
                if (!page) return;

                const reorderedBlocks = [];
                const blockElements = this.container.querySelectorAll('.block-wrapper');
                blockElements.forEach(el => {
                    const id = el.dataset.blockId;
                    const found = page.blocks.find(b => b.id === id);
                    if (found) reorderedBlocks.push(found);
                });

                page.blocks = reorderedBlocks;
                this.triggerAutoSave();
            }
        });
    }

    triggerAutoSave() {
        clearTimeout(this.saveTimeout);
        this.saveTimeout = setTimeout(() => {
            window.app.saveToStorage();
        }, 500);
    }
}
