-- ============================================
-- SQL Script cho Module Xét Duyệt Khách Buôn
-- Tự động hóa việc cập nhật trạng thái khách buôn theo ngay_ap_dung
-- ============================================

-- Bước 1: Thêm các cột cần thiết vào bảng bb_xet_duyet_khach_buon (nếu chưa có)
-- Lưu ý: Chạy lệnh này trước nếu các cột chưa tồn tại
DO $$ 
BEGIN
  -- Thêm cột da_thuc_thi
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bb_xet_duyet_khach_buon' 
    AND column_name = 'da_thuc_thi'
  ) THEN
    ALTER TABLE bb_xet_duyet_khach_buon 
    ADD COLUMN da_thuc_thi BOOLEAN DEFAULT FALSE;
    
    -- Cập nhật giá trị mặc định cho các bản ghi cũ
    UPDATE bb_xet_duyet_khach_buon 
    SET da_thuc_thi = FALSE 
    WHERE da_thuc_thi IS NULL;
  END IF;

END $$;

-- Bước 2: Tạo Function để thực thi xét duyệt khách buôn
CREATE OR REPLACE FUNCTION fn_thuc_thi_xet_duyet_khach_buon()
RETURNS TABLE(
  updated_count INTEGER,
  updated_ids INTEGER[]
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_updated_count INTEGER := 0;
  v_updated_ids INTEGER[] := ARRAY[]::INTEGER[];
  v_record RECORD;
BEGIN
  -- Tìm các bản ghi cần thực thi:
  -- - trang_thai = 'Đã duyệt'
  -- - da_thuc_thi = FALSE (hoặc NULL)
  -- - ngay_ap_dung <= CURRENT_DATE
  -- - Có khach_buon_id, giai_doan_id, trang_thai_id hợp lệ
  FOR v_record IN
    SELECT 
      xd.id,
      xd.khach_buon_id,
      xd.giai_doan_id,
      xd.trang_thai_id,
      xd.ngay_ap_dung
    FROM bb_xet_duyet_khach_buon xd
    WHERE xd.trang_thai = 'Đã duyệt'
      AND (xd.da_thuc_thi = FALSE OR xd.da_thuc_thi IS NULL)
      AND xd.ngay_ap_dung IS NOT NULL
      AND xd.khach_buon_id IS NOT NULL
      AND xd.giai_doan_id IS NOT NULL
      AND xd.trang_thai_id IS NOT NULL
      AND xd.ngay_ap_dung::date <= CURRENT_DATE
    ORDER BY xd.ngay_ap_dung ASC, xd.id ASC
  LOOP
    -- Cập nhật bb_khach_buon với giai_doan_id và trang_thai_id từ xét duyệt
    UPDATE bb_khach_buon
    SET 
      giai_doan_id = v_record.giai_doan_id,
      trang_thai_id = v_record.trang_thai_id,
      tg_cap_nhat = NOW()
    WHERE id = v_record.khach_buon_id;
    
    -- Đánh dấu bản ghi xét duyệt đã được thực thi
    UPDATE bb_xet_duyet_khach_buon
    SET da_thuc_thi = TRUE
    WHERE id = v_record.id;
    
    -- Ghi nhận ID đã xử lý
    v_updated_count := v_updated_count + 1;
    v_updated_ids := array_append(v_updated_ids, v_record.id);
  END LOOP;
  
  -- Trả về kết quả
  RETURN QUERY SELECT v_updated_count, v_updated_ids;
END;
$$;

-- Bước 3: Cấp quyền thực thi function
GRANT EXECUTE ON FUNCTION fn_thuc_thi_xet_duyet_khach_buon() TO authenticated;
GRANT EXECUTE ON FUNCTION fn_thuc_thi_xet_duyet_khach_buon() TO service_role;

-- Bước 4: Tạo Cron Job để tự động chạy hàm vào 00:01 mỗi ngày
-- Lưu ý: Cần có extension pg_cron được enable trong Supabase
-- Kiểm tra xem pg_cron đã được enable chưa:
-- SELECT * FROM pg_extension WHERE extname = 'pg_cron';

-- Nếu chưa có, cần enable (chạy với quyền superuser trong Supabase Dashboard):
-- CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Tạo cron job (chỉ chạy nếu pg_cron đã được enable)
DO $$
BEGIN
  -- Kiểm tra xem pg_cron extension có tồn tại không
  IF EXISTS (
    SELECT 1 FROM pg_extension WHERE extname = 'pg_cron'
  ) THEN
    -- Xóa job cũ nếu đã tồn tại (để tránh duplicate)
    PERFORM cron.unschedule('thuc-thi-xet-duyet-khach-buon-daily')
    WHERE EXISTS (
      SELECT 1 FROM cron.job WHERE jobname = 'thuc-thi-xet-duyet-khach-buon-daily'
    );
    
    -- Tạo cron job mới
    PERFORM cron.schedule(
      'thuc-thi-xet-duyet-khach-buon-daily',  -- Tên job
      '1 0 * * *',                            -- Schedule: 00:01 mỗi ngày (format: minute hour day month weekday)
      $$SELECT fn_thuc_thi_xet_duyet_khach_buon()$$  -- SQL command
    );
    
    RAISE NOTICE 'Cron job đã được tạo thành công!';
  ELSE
    RAISE NOTICE 'pg_cron extension chưa được enable. Vui lòng enable extension trước khi tạo cron job.';
    RAISE NOTICE 'Để enable: Vào Supabase Dashboard > Database > Extensions > Tìm pg_cron > Enable';
  END IF;
END $$;

-- ============================================
-- Các câu lệnh hữu ích để quản lý:
-- ============================================

-- Xem danh sách các cron jobs đã tạo:
-- SELECT * FROM cron.job WHERE jobname LIKE '%xet-duyet%';

-- Xem lịch sử chạy của cron job:
-- SELECT * FROM cron.job_run_details 
-- WHERE jobid = (
--   SELECT jobid FROM cron.job 
--   WHERE jobname = 'thuc-thi-xet-duyet-khach-buon-daily'
-- )
-- ORDER BY start_time DESC 
-- LIMIT 10;

-- Xóa cron job (nếu cần):
-- SELECT cron.unschedule('thuc-thi-xet-duyet-khach-buon-daily');

-- Test function thủ công:
-- SELECT * FROM fn_thuc_thi_xet_duyet_khach_buon();

-- Kiểm tra các bản ghi chưa được thực thi:
-- SELECT 
--   id,
--   khach_buon_id,
--   giai_doan_id,
--   trang_thai_id,
--   ngay_ap_dung,
--   trang_thai,
--   da_thuc_thi
-- FROM bb_xet_duyet_khach_buon
-- WHERE trang_thai = 'Đã duyệt'
--   AND (da_thuc_thi = FALSE OR da_thuc_thi IS NULL)
--   AND ngay_ap_dung IS NOT NULL
--   AND ngay_ap_dung::date <= CURRENT_DATE
-- ORDER BY ngay_ap_dung ASC, id ASC;

