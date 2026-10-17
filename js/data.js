// Dữ liệu mẫu ban đầu cho Notion Học Tập
const DEFAULT_WORKSPACE_DATA = {
    settings: {
        theme: 'light', // 'light' hoặc 'dark'
        fontFamily: 'sans', // 'sans', 'serif', 'mono'
        smallText: false,
        fullWidth: false,
        userName: 'Học Sinh Chăm Chỉ',
        pomodoro: {
            workTime: 25,
            breakTime: 5,
            longBreakTime: 15,
            autoStart: false
        }
    },
    kanban: [
        {
            id: 'col-todo',
            title: '📖 Cần học / Kiến thức mới',
            color: 'blue',
            cards: [
                { id: 'c1', title: 'Tích phân từng phần (Giải tích 12)', subject: 'Toán', priority: 'high', dueDate: 'Hôm nay' },
                { id: 'c2', title: 'Từ vựng IELTS Topic Environment (30 từ)', subject: 'Tiếng Anh', priority: 'medium', dueDate: 'Ngày mai' }
            ]
        },
        {
            id: 'col-doing',
            title: '✍️ Đang ôn tập & Luyện tập',
            color: 'yellow',
            cards: [
                { id: 'c3', title: 'Định luật Ôm & Mạch điện xoay chiều', subject: 'Vật Lý', priority: 'high', dueDate: 'Tuần này' },
                { id: 'c4', title: 'Phương pháp ghi chép Cornell Method', subject: 'Kỹ năng', priority: 'low', dueDate: 'Đang làm' }
            ]
        },
        {
            id: 'col-review',
            title: '🧠 Ôn lặp ngắt quãng (Spaced Recall)',
            color: 'purple',
            cards: [
                { id: 'c5', title: 'Phản ứng Este hóa & Xà phòng hóa', subject: 'Hóa Học', priority: 'medium', dueDate: '3 ngày nữa' }
            ]
        },
        {
            id: 'col-done',
            title: '🎉 Đã nắm vững (Mastered)',
            color: 'green',
            cards: [
                { id: 'c6', title: 'Bảng động từ bất quy tắc (150 từ)', subject: 'Tiếng Anh', priority: 'high', dueDate: 'Hoàn thành' },
                { id: 'c7', title: 'Công thức Lượng giác cơ bản', subject: 'Toán', priority: 'medium', dueDate: 'Hoàn thành' }
            ]
        }
    ],
    pages: [
        {
            id: 'page-cornell',
            title: 'Phương pháp ghi chép Cornell (Study Guide)',
            icon: '📝',
            cover: 'gradient-sunset',
            isFavorite: true,
            createdAt: '2026-10-15',
            updatedAt: '2026-10-17',
            blocks: [
                {
                    id: 'b-cor-callout',
                    type: 'callout',
                    icon: '💡',
                    content: '<strong>Phương pháp Cornell Note-Taking:</strong> Giúp bạn ghi chú có cấu trúc, tự kiểm tra kiến thức (Active Recall) và tổng kết bài học nhanh chóng chỉ trong 5 phút sau buổi học.'
                },
                {
                    id: 'b-cor-h1',
                    type: 'heading_1',
                    content: '1. Cấu trúc trang ghi chép Cornell'
                },
                {
                    id: 'b-cor-p1',
                    type: 'text',
                    content: 'Trang giấy được chia làm 3 phần chính:'
                },
                {
                    id: 'b-cor-todo1',
                    type: 'todo',
                    content: 'Cột phải (Notes - 70%): Ghi chép bài giảng, ý chính, sơ đồ, công thức',
                    checked: true
                },
                {
                    id: 'b-cor-todo2',
                    type: 'todo',
                    content: 'Cột trái (Cues / Questions - 30%): Đặt các câu hỏi gợi nhớ, từ khóa then chốt',
                    checked: true
                },
                {
                    id: 'b-cor-todo3',
                    type: 'todo',
                    content: 'Phần đáy (Summary): Tóm tắt 2-3 câu ngắn gọn về toàn bộ nội dung bài',
                    checked: false
                },
                {
                    id: 'b-cor-h2',
                    type: 'heading_2',
                    content: '2. Câu hỏi Active Recall tự ôn tập'
                },
                {
                    id: 'b-cor-tog1',
                    type: 'toggle',
                    question: 'Vì sao không nên chép bài nguyên văn lời giáo viên?',
                    answer: 'Bởi vì não bộ chỉ học hiệu quả khi chủ động xử lý và tóm lược thông tin bằng ngôn ngữ của chính mình (Generative Learning), thay vì sao chép thụ động.'
                },
                {
                    id: 'b-cor-tog2',
                    type: 'toggle',
                    question: 'Quy tắc 5R trong phương pháp Cornell là gì?',
                    answer: '5R bao gồm: Record (Ghi chép) -> Reduce (Rút gọn từ khóa) -> Recite (Tự đọc diễn giải lại không nhìn tập) -> Reflect (Suy ngẫm liên hệ) -> Review (Định kỳ ôn tập lặp lại).'
                },
                {
                    id: 'b-cor-quote',
                    type: 'quote',
                    content: '"Học mà không suy nghĩ thì mịt mờ, suy nghĩ mà không học thì nguy hiểm." — Khổng Tử'
                }
            ]
        },
        {
            id: 'page-math',
            title: 'Toán học: Đạo hàm & Bảng Công thức',
            icon: '📐',
            cover: 'gradient-ocean',
            isFavorite: true,
            createdAt: '2026-10-16',
            updatedAt: '2026-10-17',
            blocks: [
                {
                    id: 'b-math-callout',
                    type: 'callout',
                    icon: '⚡',
                    content: '<strong>Ghi chú quan trọng:</strong> Nhớ kỹ quy tắc đạo hàm hàm hợp <code>(u(x))\' = u\'(x) \\cdot f\'(u)</code>. Sử dụng chế độ KaTeX để xem công thức sắc nét!'
                },
                {
                    id: 'b-math-h1',
                    type: 'heading_1',
                    content: 'Định nghĩa & Công thức cơ bản'
                },
                {
                    id: 'b-math-katex1',
                    type: 'math',
                    content: 'f\'(x_0) = \\lim_{\\Delta x \\to 0} \\frac{f(x_0 + \\Delta x) - f(x_0)}{\\Delta x}'
                },
                {
                    id: 'b-math-h2',
                    type: 'heading_2',
                    content: 'Bảng đạo hàm các hàm sơ cấp'
                },
                {
                    id: 'b-math-katex2',
                    type: 'math',
                    content: '(x^n)\' = n \\cdot x^{n-1} \\quad ; \\quad (\\sqrt{x})\' = \\frac{1}{2\\sqrt{x}} \\quad ; \\quad (\\sin x)\' = \\cos x'
                },
                {
                    id: 'b-math-tog1',
                    type: 'toggle',
                    question: 'Đạo hàm của hàm phân thức hữu tỉ (ax + b) / (cx + d) bằng gì?',
                    answer: 'f\'(x) = (ad - bc) / (cx + d)^2'
                },
                {
                    id: 'b-math-flash1',
                    type: 'flashcard',
                    front: 'Ý nghĩa hình học của đạo hàm tại điểm x0 là gì?',
                    back: 'Hệ số góc (k = f\'(x0)) của tiếp tuyến với đồ thị hàm số tại điểm M(x0, y0).'
                },
                {
                    id: 'b-math-todo1',
                    type: 'todo',
                    content: 'Làm 15 bài tập đạo hàm hàm số lượng giác',
                    checked: false
                },
                {
                    id: 'b-math-todo2',
                    type: 'todo',
                    content: 'Ôn tập tính đơn điệu & tìm cực trị của hàm số',
                    checked: false
                }
            ]
        },
        {
            id: 'page-english',
            title: 'IELTS Vocabulary: Topic Technology & AI',
            icon: '💻',
            cover: 'gradient-emerald',
            isFavorite: false,
            createdAt: '2026-10-17',
            updatedAt: '2026-10-17',
            blocks: [
                {
                    id: 'b-eng-callout',
                    type: 'callout',
                    icon: '🎯',
                    content: '<strong>Mục tiêu:</strong> Làm chủ 5 collocations nâng cao về Trí tuệ nhân tạo & Công nghệ số để sử dụng trong IELTS Writing Task 2.'
                },
                {
                    id: 'b-eng-h1',
                    type: 'heading_1',
                    content: 'High-scoring Vocabulary List'
                },
                {
                    id: 'b-eng-flash1',
                    type: 'flashcard',
                    front: 'State-of-the-art / Cutting-edge (adj)',
                    back: 'Nghĩa: Rất hiện đại, tối tân, tân tiến nhất hiện nay.\nVí dụ: The university invested heavily in cutting-edge laboratory equipment.'
                },
                {
                    id: 'b-eng-flash2',
                    type: 'flashcard',
                    front: 'Pave the way for something (idiom)',
                    back: 'Nghĩa: Mở đường, tạo tiền đề thuận lợi cho điều gì phát triển.\nVí dụ: Breakthroughs in machine learning have paved the way for automated medical diagnosis.'
                },
                {
                    id: 'b-eng-tog1',
                    type: 'toggle',
                    question: 'Synonym của "Technological advancement"?',
                    answer: 'Technological breakthrough / Technological leap / Innovation / Digital transformation'
                },
                {
                    id: 'b-eng-h2',
                    type: 'heading_2',
                    content: 'Sample Essay Sentence'
                },
                {
                    id: 'b-eng-quote',
                    type: 'quote',
                    content: '"While artificial intelligence poses ethical dilemmas regarding data privacy, its potential to revolutionize personalized education is undeniable."'
                }
            ]
        },
        {
            id: 'page-spaced-rep',
            title: 'Chiến Lược Spaced Repetition (Lặp Ngắt Quãng)',
            icon: '⏳',
            cover: 'gradient-amethyst',
            isFavorite: false,
            createdAt: '2026-10-17',
            updatedAt: '2026-10-17',
            blocks: [
                {
                    id: 'b-sr-callout',
                    type: 'callout',
                    icon: '📈',
                    content: '<strong>Đường cong quên lãng (Ebbinghaus Forgetting Curve):</strong> Sau 24 giờ, não bộ có xu hướng quên tới 70% kiến thức nếu không được gợi nhớ đúng lúc.'
                },
                {
                    id: 'b-sr-h1',
                    type: 'heading_1',
                    content: 'Chu kỳ ôn tập tối ưu'
                },
                {
                    id: 'b-sr-b1',
                    type: 'bullet',
                    content: '<strong>Lần 1:</strong> Ngay sau khi học 10-15 phút (Xem lại ghi chú, kiểm tra câu hỏi Cornell)'
                },
                {
                    id: 'b-sr-b2',
                    type: 'bullet',
                    content: '<strong>Lần 2:</strong> Sau 1 ngày (Mở chế độ Ôn Flashcards trong ứng dụng này)'
                },
                {
                    id: 'b-sr-b3',
                    type: 'bullet',
                    content: '<strong>Lần 3:</strong> Sau 3 ngày (Giải bài tập hoặc giải thích lại cho người khác)'
                },
                {
                    id: 'b-sr-b4',
                    type: 'bullet',
                    content: '<strong>Lần 4:</strong> Sau 7 ngày & 1 tháng (Kiến thức chuyển vào trí nhớ dài hạn - Long-term memory)'
                }
            ]
        }
    ]
};

// Preset Covers cho bài viết giống Notion
const NOTION_COVERS = [
    { id: 'gradient-sunset', name: 'Sunset Glow', css: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)' },
    { id: 'gradient-ocean', name: 'Ocean Breeze', css: 'linear-gradient(135deg, #2af598 0%, #009efd 100%)' },
    { id: 'gradient-emerald', name: 'Emerald Forest', css: 'linear-gradient(135deg, #0ba360 0%, #3cba92 100%)' },
    { id: 'gradient-amethyst', name: 'Amethyst Night', css: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { id: 'gradient-cherry', name: 'Cherry Blossom', css: 'linear-gradient(135deg, #ff758c 0%, #ff7eb3 100%)' },
    { id: 'gradient-dark-space', name: 'Deep Space', css: 'linear-gradient(135deg, #1f1c2c 0%, #928dab 100%)' },
    { id: 'minimal-gray', name: 'Minimal Sand', css: 'linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)' }
];

// Danh sách icon emoji phổ biến cho trang
const EMOJI_PRESETS = ['📝', '📚', '📐', '💡', '💻', '⏳', '🎯', '🧪', '🌍', '🎨', '🔥', '⭐', '🚀', '🧠', '☕', '⚡'];
