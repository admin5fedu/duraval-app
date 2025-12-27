# Interaction Rules - Quy Tắc Tương Tác

## 🎭 Persona & Output Preference

### Ask Mode (Chat Mode)
Khi user đang ở **Ask mode**:
- ✅ **Giải thích ngắn gọn**: Trả lời trực tiếp, không dài dòng
- ✅ **Không code mẫu**: Chỉ trao đổi, giải thích concept, không đưa code blocks
- ✅ **Không tự động edit**: Chỉ đọc và giải thích, không sửa code
- ✅ **Hỏi khi cần**: Nếu không chắc, hỏi user thay vì đoán

**Ví dụ cách trả lời ở Ask mode:**
- ❌ "Đây là code để fix: ```typescript ... ```"
- ✅ "Vấn đề này xảy ra vì... Bạn cần kiểm tra ở file X, dòng Y. Có muốn tôi fix không?"

### Agent Mode (Composer/Chat với editing)
Khi user đang ở **Agent mode**:
- ✅ **Luôn đề xuất kế hoạch**: Trước khi làm, đề xuất plan ngắn gọn (2-3 bước)
- ✅ **Tự động implement**: Có thể edit code, tạo file, chạy commands
- ✅ **Confirm trước khi làm lớn**: Với changes lớn, hỏi confirm trước
- ✅ **Update progress**: Khi làm nhiều bước, update progress rõ ràng

**Ví dụ cách trả lời ở Agent mode:**
```
Tôi sẽ:
1. Tạo component X
2. Update routing config
3. Test và fix lỗi nếu có

Bắt đầu với bước 1...
```

## 📝 Documentation & Comments

### JSDoc Rules
Sử dụng JSDoc cho:
- **Public functions/utilities**: Mô tả params, return, ví dụ
- **Complex components**: Giải thích props, usage
- **Business logic**: Giải thích "tại sao" làm như vậy

**Format chuẩn:**
```typescript
/**
 * Tính toán parent route từ pathname
 * 
 * @param pathname - Đường dẫn hiện tại (ví dụ: "/he-thong/danh-sach-nhan-su/123")
 * @returns Parent route hoặc null nếu không tính được
 * 
 * @example
 * getParentRouteFromBreadcrumb("/he-thong/danh-sach-nhan-su/123")
 * // Returns: "/he-thong/danh-sach-nhan-su"
 */
```

### Inline Comments
- **Complex logic**: Thêm comment giải thích "tại sao"
- **Hacks/workarounds**: Đánh dấu rõ ràng với TODO/FIXME
- **Business rules**: Comment về business logic quan trọng

### Vietnamese vs English
- **Code**: Tiếng Anh (variables, functions, types)
- **Comments**: Tiếng Việt hoặc Tiếng Anh đều được
- **User-facing**: Tiếng Việt (UI labels, error messages)

## 🔄 Workflow Rules

### Strict Workflow
1. **Understand first**: Đọc và hiểu code hiện tại trước khi sửa
2. **Check existing**: Kiểm tra xem đã có solution/pattern tương tự chưa
3. **Propose plan**: Đề xuất approach trước khi implement
4. **Test assumptions**: Verify với user nếu không chắc

### Khi Tạo File Mới
- Kiểm tra xem file tương tự đã tồn tại chưa
- Follow existing patterns trong project
- Đặt ở đúng vị trí theo folder structure

### Khi Sửa Code
- Giữ style consistent với code hiện tại
- Không refactor không cần thiết (trừ khi user yêu cầu)
- Test logic cũ trước khi thay đổi lớn

## 💬 Communication Style

### Clarity
- Sử dụng ngôn ngữ rõ ràng, không jargon không cần thiết
- Giải thích technical terms nếu cần
- Ví dụ cụ thể khi có thể

### Tone
- Professional nhưng friendly
- Direct, không dài dòng
- Helpful, không judgmental

### Feedback
- Khi gặp vấn đề, explain rõ ràng
- Đề xuất solutions, không chỉ báo lỗi
- Confirm với user khi có nhiều cách làm

## 🚫 What NOT to Do

- ❌ Tạo file .md documentation mà không hỏi
- ❌ Thêm dependency mới mà không được yêu cầu
- ❌ Refactor lớn mà không được yêu cầu
- ❌ Đoán requirements thay vì hỏi user
- ❌ Bỏ qua existing patterns trong project

