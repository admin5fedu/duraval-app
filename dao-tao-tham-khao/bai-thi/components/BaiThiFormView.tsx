/**
 * BaiThiFormView Component
 * 
 * Form view for BaiThi module using BaseFormView foundation component
 */

import { BaseFormView } from '@components/foundation/views';
import {
    FormInputRHF,
    FormSelectRHF,
} from '@components/ui/forms';
import FormSection from '@components/ui/forms/FormSection';
import { useAuth } from '@lib/contexts/AuthContext';
import { useFormValidation } from '@lib/hooks/useFormValidation';
import {
    BAI_THI_TRANG_THAI_OPTIONS,
    baiThiFormSchema,
    type BaiThiFormData,
} from '@features/cong-viec/dao-tao/bai-thi/schemas/baiThi.schema';
import { getMaNhanVien } from '@lib/utils/formDataHelpers';
import { type BaiThiLam, type Employee, type KyThi } from '@src/types';
import React, { useEffect, useMemo } from 'react';
import { FormProvider, useWatch } from 'react-hook-form';

interface BaiThiFormViewProps {
  onBack: () => void;
  onSave: (item: Partial<BaiThiLam>) => void | Promise<void>;
  itemToEdit: Partial<BaiThiLam> | null;
  kyThiList: KyThi[];
  enhancedEmployees: Employee[];
}

const BaiThiFormView: React.FC<BaiThiFormViewProps> = ({
  onBack,
  onSave,
  itemToEdit,
  kyThiList,
  enhancedEmployees,
}) => {
  const { currentUser } = useAuth();
  const isEditing = !!itemToEdit?.id;

  const defaultValues = useMemo<BaiThiFormData>(() => ({
    ky_thi_id: itemToEdit?.ky_thi_id || 0,
    nhan_vien_id: itemToEdit?.nhan_vien_id || 0,
    ngay_lam_bai: itemToEdit?.ngay_lam_bai || new Date().toISOString().split('T')[0],
    thoi_gian_bat_dau: itemToEdit?.thoi_gian_bat_dau?.slice(0, 16) || '',
    thoi_gian_ket_thuc: itemToEdit?.thoi_gian_ket_thuc?.slice(0, 16) || '',
    diem_so: itemToEdit?.diem_so ?? null,
    tong_so_cau: itemToEdit?.tong_so_cau ?? null,
    trang_thai: (itemToEdit?.trang_thai as BaiThiFormData['trang_thai']) || 'Chưa thi',
  }), [itemToEdit]);

  const { form, handleSubmit, isSubmitting, isValid } =
    useFormValidation<BaiThiFormData>({
      schema: baiThiFormSchema,
      defaultValues,
      onSubmit: async (data) => {
        await onSave({
          ...(itemToEdit?.id ? { id: itemToEdit.id } : {}),
          ...data,
        });
      },
      successMessage: isEditing
        ? 'Cập nhật bài thi thành công!'
        : 'Thêm bài thi thành công!',
      onSuccess: () => {
        onBack();
      },
    });

  const kyThiId = useWatch({ control: form.control, name: 'ky_thi_id' });

  const eligibleEmployees = useMemo(() => {
    if (!kyThiId) return [];
    const selectedKyThi = kyThiList?.find((k) => k.id === kyThiId);
    if (!selectedKyThi) return [];
    
    // Sử dụng ma_nhan_vien để filter
    const maNhanVien = getMaNhanVien(currentUser);
    
    return enhancedEmployees.filter(
      (e) =>
        selectedKyThi.chuc_vu_ids?.includes(e.chuc_vu_id) ||
        (maNhanVien && (e.ma_nhan_vien === maNhanVien || e.id === maNhanVien))
    );
  }, [kyThiId, kyThiList, enhancedEmployees, currentUser]);

  // Auto-update tong_so_cau when ky_thi_id changes
  useEffect(() => {
    if (kyThiId) {
      const selectedKyThi = kyThiList?.find((k) => k.id === kyThiId);
      if (selectedKyThi) {
        form.setValue('tong_so_cau', selectedKyThi.so_cau_hoi || null, {
          shouldValidate: true,
        });
        // Reset employee if not in the new eligible list
        const currentNhanVienId = form.getValues('nhan_vien_id');
        if (
          currentNhanVienId &&
          !eligibleEmployees.some((e) => e.id === currentNhanVienId)
        ) {
          form.setValue('nhan_vien_id', 0, { shouldValidate: true });
        }
      }
    } else {
      form.setValue('tong_so_cau', null, { shouldValidate: true });
    }
  }, [kyThiId, kyThiList, eligibleEmployees, form]);

  return (
    <FormProvider {...form}>
      <BaseFormView
        onBack={onBack}
        onSave={handleSubmit}
        isSubmitting={isSubmitting}
        isEditing={isEditing}
        disabled={!isValid}
      >
        <FormSection title="Thông tin cơ bản">
          <FormSelectRHF
            name="ky_thi_id"
            label="Kỳ thi"
            required
            wrapperClassName="md:col-span-2"
          >
            <option value="">-- Bước 1: Chọn kỳ thi --</option>
            {kyThiList && Array.isArray(kyThiList)
              ? kyThiList.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.ten_ky_thi}
                  </option>
                ))
              : null}
          </FormSelectRHF>
          <FormSelectRHF
            name="nhan_vien_id"
            label="Nhân viên"
            required
            disabled={!kyThiId}
          >
            <option value="">-- Bước 2: Chọn nhân viên --</option>
            {eligibleEmployees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.ho_ten}
              </option>
            ))}
          </FormSelectRHF>
          <FormInputRHF
            name="ngay_lam_bai"
            label="Ngày làm bài"
            type="date"
          />
        </FormSection>

        <FormSection title="Thời gian">
          <FormInputRHF
            name="thoi_gian_bat_dau"
            label="Thời gian bắt đầu"
            type="datetime-local"
          />
          <FormInputRHF
            name="thoi_gian_ket_thuc"
            label="Thời gian kết thúc"
            type="datetime-local"
          />
        </FormSection>

        <FormSection title="Kết quả">
          <FormInputRHF
            name="diem_so"
            label="Số câu đúng"
            type="number"
            min="0"
          />
          <FormInputRHF
            name="tong_so_cau"
            label="Tổng số câu"
            type="number"
            min="1"
            readOnly
          />
          <FormSelectRHF
            name="trang_thai"
            label="Trạng thái"
            wrapperClassName="md:col-span-2"
          >
            {BAI_THI_TRANG_THAI_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </FormSelectRHF>
        </FormSection>
      </BaseFormView>
    </FormProvider>
  );
};

export default BaiThiFormView;

