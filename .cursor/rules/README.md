# Cursor Rules Documentation

Thư mục này chứa các quy tắc và hướng dẫn để Cursor AI hiểu và làm việc hiệu quả với dự án Duraval ERP.

## 📁 Cấu Trúc Files

```
.cursor/rules/
├── README.md           # File này - Giải thích cấu trúc
├── general.md          # Quy tắc chung: Stack, Coding Standards, Folder Structure
├── interaction.md      # Persona: Ask vs Agent mode, Documentation rules
├── frontend.md         # React patterns, Components, UI, Routing
└── backend.md          # Supabase, API, Database patterns
```

## 🎯 Mục Đích

Mỗi file được thiết kế để:
- **Phân tách concerns**: Tách biệt quy tắc theo domain (general, frontend, backend)
- **Giảm context noise**: Cursor chỉ cần đọc file liên quan đến task hiện tại
- **Dễ maintain**: Cập nhật quy tắc mà không ảnh hưởng toàn bộ
- **Tăng accuracy**: AI hiểu rõ hơn về project structure và conventions

## 📖 Cách Cursor Sử Dụng Rules

### Tự Động Đọc Rules
Cursor **tự động** đọc tất cả file `.md` trong thư mục `.cursor/rules/` khi:
- ✅ Bạn bắt đầu một conversation mới trong Cursor
- ✅ Bạn mở project trong Cursor lần đầu
- ✅ Cursor cần context về coding standards và conventions
- ✅ Bạn chuyển context giữa các phần của codebase

### Cách Cursor Đối Chiếu Rules

**1. Context-Aware Reading:**
- Cursor sẽ đọc **TẤT CẢ** các file rules để có context đầy đủ
- Nhưng sẽ **ưu tiên** file phù hợp với ngữ cảnh hiện tại:
  - Khi làm việc với React component → `frontend.md` được ưu tiên
  - Khi làm việc với Supabase/API → `backend.md` được ưu tiên
  - Khi ở Ask mode → `interaction.md` được ưu tiên

**2. Priority Order:**
```
1. interaction.md (Always - Persona rules)
2. general.md (Always - Base rules)
3. frontend.md (When working with React/UI code)
4. backend.md (When working with API/Database code)
```

**3. Rule Application:**
- Cursor sẽ **tự động áp dụng** các quy tắc khi:
  - Generate code mới
  - Suggest code changes
  - Review code
  - Answer questions

**4. Không Cần Config Thêm:**
- ❌ Không cần thêm vào `.cursorrules` (file cũ, không cần nữa)
- ❌ Không cần config trong Cursor settings
- ✅ Chỉ cần đặt files trong `.cursor/rules/` là đủ

### Kiểm Tra Rules Có Hoạt Động Không

**Test đơn giản:**
1. Mở Cursor chat mới
2. Hỏi: "Tôi nên đặt tên component như thế nào?"
3. Cursor sẽ trả lời dựa trên conventions trong `general.md` và `frontend.md`

**Hoặc test với code generation:**
1. Prompt: "Tạo một React component mới tên UserProfile"
2. Cursor sẽ follow patterns từ `frontend.md`:
   - Sử dụng "use client"
   - Functional component với TypeScript
   - Proper imports structure
   - etc.

### Khi Nào Rules Được Reload

Rules được reload khi:
- ✅ Restart Cursor
- ✅ Open project mới
- ✅ Rules files được update (Cursor sẽ detect changes)

**Lưu ý**: Nếu bạn sửa rules, có thể cần restart Cursor hoặc mở lại conversation để áp dụng changes mới.

## 🔍 Map Quy Tắc Vào File

| Nội Dung | File |
|----------|------|
| Tech stack, Coding standards | `general.md` |
| Ask vs Agent behavior, JSDoc | `interaction.md` |
| React, Components, Routing | `frontend.md` |
| Supabase, API, Database | `backend.md` |

## ⚠️ Quy Tắc Đặc Biệt

**KHÔNG được tự ý tạo file .md** (trừ README.md). Khi muốn tạo file mới, phải hỏi user trước.

## 📝 Cập Nhật Rules

Khi thêm/sửa quy tắc:
1. Chọn file phù hợp (general/frontend/backend/interaction)
2. Giữ format markdown rõ ràng, có sections
3. Thêm examples nếu cần
4. Cập nhật README này nếu cấu trúc thay đổi

