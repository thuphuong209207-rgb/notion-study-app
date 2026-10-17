/**
 * Bộ công cụ học tập dành riêng cho Notion Học Tập:
 * 1. Đồng hồ Pomodoro tập trung học sâu
 * 2. Trình ôn tập Flashcard & Active Recall toàn màn hình
 * 3. Bảng Kanban quản lý tiến độ ôn thi theo phương pháp Spaced Repetition
 */

class StudyTools {
    constructor() {
        this.pomodoro = {
            state: 'idle', // 'running', 'paused', 'idle'
            mode: 'work',  // 'work', 'shortBreak', 'longBreak'
            timeLeft: 25 * 60,
            interval: null,
            workDuration: 25 * 60,
            shortBreakDuration: 5 * 60,
            longBreakDuration: 15 * 60,
            sessionsCompleted: 0
        };

        this.flashcardSession = {
            cards: [],
            currentIndex: 0,
            isFlipped: false
        };

        this.initPomodoro();
        this.initAudio();
    }

    /* ====================================================
       1. POMODORO TIMER
       ==================================================== */
    initPomodoro() {
        this.pillEl = document.getElementById('pomodoro-pill');
        this.timeTextEl = document.getElementById('pomodoro-time');
        this.modalEl = document.getElementById('pomodoro-modal');

        if (this.pillEl) {
            this.pillEl.onclick = () => this.togglePomodoroModal();
        }

        this.updatePomodoroDisplay();
    }

    initAudio() {
        // Sử dụng Web Audio API để phát âm thanh thông báo không cần file mp3 ngoài
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioCtx = new AudioContext();
        } catch (e) {
            console.log('Web Audio not supported');
        }
    }

    playChime() {
        if (!this.audioCtx) return;
        if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }

        const now = this.audioCtx.currentTime;
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.setValueAtTime(880, now + 0.15); // A5

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(now);
        osc.stop(now + 0.8);
    }

    startPomodoro() {
        if (this.pomodoro.state === 'running') return;
        this.pomodoro.state = 'running';

        if (this.pillEl) this.pillEl.classList.add('active');

        this.pomodoro.interval = setInterval(() => {
            if (this.pomodoro.timeLeft > 0) {
                this.pomodoro.timeLeft--;
                this.updatePomodoroDisplay();
            } else {
                this.handlePomodoroComplete();
            }
        }, 1000);

        this.updatePomodoroModalButtons();
    }

    pausePomodoro() {
        if (this.pomodoro.state !== 'running') return;
        this.pomodoro.state = 'paused';
        clearInterval(this.pomodoro.interval);
        this.pomodoro.interval = null;

        if (this.pillEl) this.pillEl.classList.remove('active');
        this.updatePomodoroModalButtons();
    }

    resetPomodoro() {
        this.pausePomodoro();
        this.pomodoro.state = 'idle';
        if (this.pomodoro.mode === 'work') {
            this.pomodoro.timeLeft = this.pomodoro.workDuration;
        } else if (this.pomodoro.mode === 'shortBreak') {
            this.pomodoro.timeLeft = this.pomodoro.shortBreakDuration;
        } else {
            this.pomodoro.timeLeft = this.pomodoro.longBreakDuration;
        }
        this.updatePomodoroDisplay();
        this.updatePomodoroModalButtons();
    }

    switchPomodoroMode(mode) {
        this.pomodoro.mode = mode;
        this.resetPomodoro();
        const modeBadge = document.getElementById('pomo-current-mode');
        if (modeBadge) {
            if (mode === 'work') modeBadge.textContent = 'Thời Gian Tập Trung (25m)';
            else if (mode === 'shortBreak') modeBadge.textContent = 'Nghỉ Ngắn (5m)';
            else modeBadge.textContent = 'Nghỉ Dài (15m)';
        }
    }

    handlePomodoroComplete() {
        this.pausePomodoro();
        this.playChime();

        if (this.pomodoro.mode === 'work') {
            this.pomodoro.sessionsCompleted++;
            if (window.confetti) window.confetti({ particleCount: 70, spread: 60 });

            if (this.pomodoro.sessionsCompleted % 4 === 0) {
                alert('Tuyệt vời! Bạn đã hoàn thành 4 phiên tập trung. Hãy nghỉ dài 15 phút nhé! ☕');
                this.switchPomodoroMode('longBreak');
            } else {
                alert('Hết giờ tập trung! Hãy nghỉ giải lao 5 phút và uống nước nào! 🌱');
                this.switchPomodoroMode('shortBreak');
            }
        } else {
            alert('Hết giờ giải lao! Sẵn sàng cho phiên học mới tràn đầy năng lượng nào! 🚀');
            this.switchPomodoroMode('work');
        }

        const countEl = document.getElementById('pomo-session-count');
        if (countEl) countEl.innerText = this.pomodoro.sessionsCompleted;
    }

    updatePomodoroDisplay() {
        const m = Math.floor(this.pomodoro.timeLeft / 60);
        const s = this.pomodoro.timeLeft % 60;
        const formatted = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;

        if (this.timeTextEl) this.timeTextEl.innerText = formatted;

        const modalTimer = document.getElementById('pomo-modal-timer');
        if (modalTimer) modalTimer.innerText = formatted;

        document.title = this.pomodoro.state === 'running' 
            ? `(${formatted}) Notion Học Tập` 
            : 'Notion Học Tập';
    }

    togglePomodoroModal() {
        if (!this.modalEl) return;
        const isHidden = this.modalEl.style.display === 'none' || !this.modalEl.style.display;
        this.modalEl.style.display = isHidden ? 'flex' : 'none';
        this.updatePomodoroModalButtons();
    }

    updatePomodoroModalButtons() {
        const startBtn = document.getElementById('pomo-start-btn');
        if (!startBtn) return;
        if (this.pomodoro.state === 'running') {
            startBtn.innerHTML = '⏸️ Tạm Dừng';
            startBtn.className = 'btn btn-secondary';
            startBtn.onclick = () => this.pausePomodoro();
        } else {
            startBtn.innerHTML = '▶️ Bắt Đầu Học';
            startBtn.className = 'btn btn-primary';
            startBtn.onclick = () => this.startPomodoro();
        }
    }


    /* ====================================================
       2. FLASHCARD & ACTIVE RECALL REVIEW MODE
       ==================================================== */
    openFlashcardReview(allPages = false) {
        let cards = [];
        const sourcePages = allPages ? window.app.data.pages : [window.app.getCurrentPage()];

        sourcePages.forEach(page => {
            if (!page || !page.blocks) return;
            page.blocks.forEach(block => {
                if (block.type === 'flashcard') {
                    cards.push({
                        id: block.id,
                        pageTitle: page.title,
                        front: block.front || 'Câu hỏi trống',
                        back: block.back || 'Đáp án trống'
                    });
                } else if (block.type === 'toggle') {
                    cards.push({
                        id: block.id,
                        pageTitle: page.title,
                        front: block.question || 'Câu hỏi',
                        back: block.answer || 'Đáp án'
                    });
                }
            });
        });

        if (cards.length === 0) {
            alert('Trang này chưa có Thẻ Flashcard hoặc Khối Thu gọn (Toggle) nào để ôn tập! Hãy thêm khối Flashcard bằng cách gõ "/flashcard" hoặc "/toggle".');
            return;
        }

        // Trộn ngẫu nhiên (Shuffle)
        this.flashcardSession.cards = cards.sort(() => Math.random() - 0.5);
        this.flashcardSession.currentIndex = 0;
        this.flashcardSession.isFlipped = false;

        const modal = document.getElementById('flashcard-modal');
        if (modal) modal.style.display = 'flex';

        this.renderCurrentFlashcard();
    }

    renderCurrentFlashcard() {
        const session = this.flashcardSession;
        const total = session.cards.length;
        const card = session.cards[session.currentIndex];

        if (!card) {
            this.finishFlashcardReview();
            return;
        }

        session.isFlipped = false;

        const innerEl = document.getElementById('fc-card-inner');
        if (innerEl) innerEl.classList.remove('flipped');

        document.getElementById('fc-progress-text').innerText = `Thẻ ${session.currentIndex + 1} / ${total}`;
        document.getElementById('fc-progress-bar').style.width = `${((session.currentIndex) / total) * 100}%`;
        document.getElementById('fc-page-source').innerText = `Chủ đề: ${card.pageTitle}`;

        document.getElementById('fc-front-content').innerHTML = card.front;
        document.getElementById('fc-back-content').innerHTML = card.back;

        // Render KaTeX nếu có trong thẻ
        if (window.renderMathInElement) {
            window.renderMathInElement(document.getElementById('fc-front-content'));
            window.renderMathInElement(document.getElementById('fc-back-content'));
        }
    }

    flipCurrentCard() {
        this.flashcardSession.isFlipped = !this.flashcardSession.isFlipped;
        const innerEl = document.getElementById('fc-card-inner');
        if (innerEl) innerEl.classList.toggle('flipped', this.flashcardSession.isFlipped);
    }

    rateCurrentCard(score) {
        // score: 'hard', 'medium', 'easy'
        this.flashcardSession.currentIndex++;
        if (this.flashcardSession.currentIndex >= this.flashcardSession.cards.length) {
            this.finishFlashcardReview();
        } else {
            this.renderCurrentFlashcard();
        }
    }

    finishFlashcardReview() {
        const modal = document.getElementById('flashcard-modal');
        if (modal) modal.style.display = 'none';

        if (window.confetti) {
            window.confetti({
                particleCount: 120,
                spread: 80,
                origin: { y: 0.6 }
            });
        }

        window.app.showToast('🎉 Xuất sắc! Bạn đã hoàn thành toàn bộ thẻ ôn tập Active Recall hôm nay!');
    }


    /* ====================================================
       3. KANBAN STUDY BOARD
       ==================================================== */
    renderKanbanBoard() {
        const container = document.getElementById('kanban-board-container');
        if (!container) return;
        container.innerHTML = '';

        const kanbanData = window.app.data.kanban;

        kanbanData.forEach(col => {
            const colEl = document.createElement('div');
            colEl.className = 'kanban-col';
            colEl.dataset.colId = col.id;

            colEl.innerHTML = `
                <div class="kanban-col-header">
                    <span>${col.title}</span>
                    <span class="workspace-badge">${col.cards.length}</span>
                </div>
                <div class="kanban-cards-list" id="col-list-${col.id}"></div>
                <div style="padding: 8px 10px; border-top: 1px solid var(--border-subtle);">
                    <button class="btn btn-secondary add-card-btn" style="width: 100%; justify-content: center; font-size: 12px;">+ Thêm bài tập</button>
                </div>
            `;

            const cardsList = colEl.querySelector('.kanban-cards-list');
            col.cards.forEach(card => {
                const cardEl = this.createKanbanCardElement(card, col.id);
                cardsList.appendChild(cardEl);
            });

            // Nút thêm thẻ bài tập
            colEl.querySelector('.add-card-btn').onclick = () => {
                this.promptAddKanbanCard(col.id);
            };

            container.appendChild(colEl);
        });

        // Thiết lập Sortable cho kéo thả giữa các cột
        this.setupKanbanDrag();
    }

    createKanbanCardElement(card, colId) {
        const el = document.createElement('div');
        el.className = 'kanban-card';
        el.dataset.cardId = card.id;

        const tagColorClass = card.subject === 'Toán' ? 'tag-blue' :
            card.subject === 'Tiếng Anh' ? 'tag-green' :
            card.subject === 'Vật Lý' ? 'tag-purple' :
            card.subject === 'Hóa Học' ? 'tag-yellow' : 'tag-red';

        el.innerHTML = `
            <div class="kanban-card-title">${card.title}</div>
            <div class="kanban-card-meta">
                <span class="kanban-tag ${tagColorClass}">${card.subject || 'Môn học'}</span>
                <span style="color: var(--text-muted); font-size: 11px;">⏰ ${card.dueDate || 'Hôm nay'}</span>
                <button class="nav-action-btn del-card" title="Xóa thẻ" style="font-size: 10px;">✕</button>
            </div>
        `;

        el.querySelector('.del-card').onclick = (e) => {
            e.stopPropagation();
            if (confirm('Xóa thẻ học này khỏi bảng?')) {
                this.deleteKanbanCard(colId, card.id);
            }
        };

        return el;
    }

    promptAddKanbanCard(colId) {
        const title = prompt('Nhập tên bài học / chuyên đề cần học:');
        if (!title) return;
        const subject = prompt('Nhập môn học (Toán, Tiếng Anh, Vật Lý, Hóa Học, Văn...):', 'Toán') || 'Khác';
        const dueDate = prompt('Hạn hoặc chu kỳ ôn:', 'Tuần này') || 'Hôm nay';

        const col = window.app.data.kanban.find(c => c.id === colId);
        if (col) {
            col.cards.push({
                id: 'c-' + Date.now(),
                title,
                subject,
                priority: 'medium',
                dueDate
            });
            window.app.saveToStorage();
            this.renderKanbanBoard();
        }
    }

    deleteKanbanCard(colId, cardId) {
        const col = window.app.data.kanban.find(c => c.id === colId);
        if (col) {
            col.cards = col.cards.filter(c => c.id !== cardId);
            window.app.saveToStorage();
            this.renderKanbanBoard();
        }
    }

    setupKanbanDrag() {
        if (!window.Sortable) return;
        const lists = document.querySelectorAll('.kanban-cards-list');
        lists.forEach(listEl => {
            new Sortable(listEl, {
                group: 'kanban-group',
                animation: 150,
                onEnd: () => {
                    // Cập nhật lại cấu trúc kanban trong data
                    window.app.data.kanban.forEach(col => {
                        const colList = document.getElementById(`col-list-${col.id}`);
                        if (!colList) return;
                        const cardIds = Array.from(colList.children).map(child => child.dataset.cardId);
                        
                        // Lấy tất cả card từ mọi cột để tái cấu trúc
                        const allCards = window.app.data.kanban.flatMap(c => c.cards);
                        col.cards = cardIds.map(id => allCards.find(c => c.id === id)).filter(Boolean);
                    });
                    window.app.saveToStorage();
                }
            });
        });
    }
}
