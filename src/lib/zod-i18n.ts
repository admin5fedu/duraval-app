import { z } from "zod"

/**
 * Zod Vietnamese Error Messages Configuration
 * 
 * Cấu hình message lỗi tiếng Việt cho Zod validation
 * Áp dụng cho toàn bộ ứng dụng
 */

// Set default error messages for Zod
z.setErrorMap((issue) => {
  let message: string

  switch (issue.code) {
    case z.ZodIssueCode.invalid_type:
      if (issue.received === "undefined") {
        message = "Trường này là bắt buộc"
      } else if (issue.received === "null") {
        message = "Trường này không được để trống"
      } else {
        message = `Giá trị phải là ${issue.expected}, nhận được ${issue.received}`
      }
      break

    case z.ZodIssueCode.invalid_string:
      if (issue.validation === "email") {
        message = "Email không hợp lệ"
      } else if (issue.validation === "url") {
        message = "URL không hợp lệ"
      } else if (issue.validation === "uuid") {
        message = "UUID không hợp lệ"
      } else if (issue.validation === "regex") {
        message = "Định dạng không hợp lệ"
      } else {
        message = "Chuỗi không hợp lệ"
      }
      break

    case z.ZodIssueCode.too_small:
      if (issue.type === "string") {
        if (issue.minimum === 1) {
          message = "Trường này là bắt buộc"
        } else {
          message = `Phải có ít nhất ${issue.minimum} ký tự`
        }
      } else if (issue.type === "number") {
        if (issue.minimum === 0) {
          message = "Phải lớn hơn hoặc bằng 0"
        } else {
          message = `Phải lớn hơn hoặc bằng ${issue.minimum}`
        }
      } else if (issue.type === "array") {
        message = `Phải có ít nhất ${issue.minimum} phần tử`
      } else {
        message = "Giá trị quá nhỏ"
      }
      break

    case z.ZodIssueCode.too_big:
      if (issue.type === "string") {
        message = `Không được vượt quá ${issue.maximum} ký tự`
      } else if (issue.type === "number") {
        message = `Không được vượt quá ${issue.maximum}`
      } else if (issue.type === "array") {
        message = `Không được vượt quá ${issue.maximum} phần tử`
      } else {
        message = "Giá trị quá lớn"
      }
      break

    case z.ZodIssueCode.invalid_enum_value:
      message = `Giá trị không hợp lệ. Chỉ chấp nhận: ${issue.options.join(", ")}`
      break

    case z.ZodIssueCode.invalid_date:
      message = "Ngày tháng không hợp lệ"
      break

    case z.ZodIssueCode.custom:
      // Use custom message if provided, otherwise use default
      message = issue.message || "Dữ liệu không hợp lệ"
      break

    default:
      // Fallback to custom message if provided
      message = issue.message || "Dữ liệu không hợp lệ"
  }

  return { message }
})

/**
 * Export để có thể import và sử dụng trong các file khác
 * Chỉ cần import file này một lần trong app entry point
 */
export {}

