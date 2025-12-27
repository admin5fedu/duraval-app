# Hướng Dẫn Sử Dụng Cursor Rules

## 🎯 Mục Đích

File này hướng dẫn cách sử dụng và kiểm tra xem Cursor có đang áp dụng rules đúng cách không.

## ✅ Cách Hoạt Động

### 1. Cursor Tự Động Đọc Rules

Cursor **KHÔNG CẦN CONFIG** gì thêm. Chỉ cần:
- ✅ Đặt files trong `.cursor/rules/`
- ✅ Dùng format `.md` (markdown)
- ✅ Cursor sẽ tự động detect và đọc

### 2. Khi Nào Rules Được Áp Dụng

Cursor đọc và áp dụng rules trong các tình huống sau:

#### a) Khi Bắt Đầu Conversation Mới
```
Bạn: "Tạo một component mới"
Cursor: [Đọc rules → Áp dụng patterns từ frontend.md]
```

#### b) Khi Generate Code
```
Bạn: "Thêm function tính tổng"
Cursor: [Đọc rules → Follow naming conventions từ general.md]
```

#### c) Khi Review/Suggest Changes
```
Bạn: Highlight code → Ask "Có cách nào tốt hơn không?"
Cursor: [Đọc rules → Suggest theo best practices]
```

#### d) Khi Trả Lời Câu Hỏi
```
Bạn: "Tôi nên đặt file này ở đâu?"
Cursor: [Đọc rules → Trả lời dựa trên folder structure trong general.md]
```

### 3. Context-Aware Rules

Cursor thông minh trong việc chọn rules phù hợp:

| Bạn Đang Làm Gì | Rules Được Ưu Tiên |
|----------------|-------------------|
| React component | `frontend.md` + `general.md` |
| Supabase query | `backend.md` + `general.md` |
| Ask mode (chat) | `interaction.md` |
| Agent mode (edit) | Tất cả rules |
| Folder structure | `general.md` |

## 🧪 Cách Test Rules

### Test 1: Naming Convention
**Prompt:**
```
Tạo một function để lấy dữ liệu user
```

**Expected behavior:**
- ✅ Function name: `getUserData` (camelCase)
- ✅ File name: `get-user-data.ts` hoặc trong file phù hợp
- ✅ Có JSDoc comment

### Test 2: Component Structure
**Prompt:**
```
Tạo component UserProfile
```

**Expected behavior:**
- ✅ File: `UserProfile.tsx` hoặc `user-profile.tsx`
- ✅ Có `"use client"` directive
- ✅ Functional component với TypeScript interface
- ✅ Imports đúng thứ tự

### Test 3: Ask Mode Behavior
**Prompt (trong Ask mode):**
```
Làm sao để optimize component này?
```

**Expected behavior:**
- ✅ Giải thích ngắn gọn, không code mẫu dài
- ✅ Chỉ trao đổi, không tự động edit
- ✅ Có thể hỏi thêm nếu cần

### Test 4: Documentation Rule
**Prompt:**
```
Tạo file hướng dẫn sử dụng API
```

**Expected behavior:**
- ✅ Cursor HỎI bạn trước khi tạo file .md
- ✅ Tuân thủ quy tắc "Không tự ý tạo .md file"

### Test 5: Folder Structure
**Prompt:**
```
Tôi nên đặt utility function này ở đâu?
```

**Expected behavior:**
- ✅ Trả lời dựa trên folder structure trong `general.md`
- ✅ Kiểm tra xem có utility tương tự trong `shared/utils/` chưa
- ✅ Đề xuất vị trí phù hợp

## 🔍 Troubleshooting

### Rules Không Hoạt Động?

**1. Kiểm tra file location:**
```bash
# Đảm bảo files ở đúng vị trí
.cursor/rules/
├── README.md
├── general.md
├── interaction.md
├── frontend.md
└── backend.md
```

**2. Kiểm tra format:**
- ✅ Files phải có extension `.md`
- ✅ Nội dung phải là valid markdown
- ✅ Không có syntax errors

**3. Restart Cursor:**
- Đóng và mở lại Cursor
- Hoặc reload window (Cmd+R / Ctrl+R)

**4. Check Cursor version:**
- Đảm bảo Cursor version mới nhất
- Older versions có thể không support `.cursor/rules/`

### Rules Không Được Áp Dụng Đúng?

**1. Rules quá dài?**
- Cursor có giới hạn context
- Nếu rules quá dài, Cursor có thể không đọc hết
- Giải pháp: Tách nhỏ rules, chỉ giữ phần quan trọng

**2. Rules mâu thuẫn?**
- Đảm bảo rules không mâu thuẫn nhau
- Ưu tiên: `interaction.md` > `general.md` > domain-specific rules

**3. Prompt không rõ ràng?**
- Cursor cần context để chọn rules phù hợp
- Đưa thêm context trong prompt nếu cần

## 📝 Best Practices

### 1. Cập Nhật Rules
- Cập nhật rules khi project phát triển
- Thêm patterns mới vào rules khi có
- Loại bỏ patterns cũ không dùng nữa

### 2. Giữ Rules Ngắn Gọn
- Chỉ giữ thông tin quan trọng
- Dùng examples ngắn gọn
- Tránh duplicate content

### 3. Test Thường Xuyên
- Test rules sau khi cập nhật
- Verify Cursor follow rules đúng
- Điều chỉnh nếu cần

### 4. Document Changes
- Comment trong rules khi có changes lớn
- Giữ README.md updated
- Note breaking changes nếu có

## 🎓 Tips & Tricks

### Tip 1: Reference Specific Rules
Khi cần, bạn có thể reference trực tiếp rules:
```
"Tạo component theo pattern trong frontend.md"
```

### Tip 2: Override Rules Khi Cần
Bạn có thể override rules trong prompt:
```
"Tạo component, nhưng dùng class component thay vì functional"
```
Cursor sẽ ưu tiên explicit instructions của bạn.

### Tip 3: Combine Rules
Reference nhiều rules cùng lúc:
```
"Theo frontend.md và general.md, tạo component mới"
```

## ✅ Checklist

Sử dụng checklist này để verify setup:

- [ ] Files trong `.cursor/rules/` với extension `.md`
- [ ] `README.md` giải thích cấu trúc
- [ ] `general.md` có coding standards
- [ ] `interaction.md` có persona rules
- [ ] `frontend.md` có React patterns
- [ ] `backend.md` có Supabase patterns
- [ ] Test ít nhất 1 rule hoạt động
- [ ] Cursor detect và apply rules

---

**Lưu ý**: Cursor rules là guidelines, không phải hard requirements. Cursor sẽ cố gắng follow rules nhưng có thể cần explicit instructions trong một số cases.

