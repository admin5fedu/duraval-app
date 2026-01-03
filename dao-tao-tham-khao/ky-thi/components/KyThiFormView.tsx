/**
 * KyThiFormView Component
 * 
 * Form view for KyThi module using BaseFormView foundation component
 */

import React, { useMemo, useContext } from 'react';
import { FormProvider, useWatch } from 'react-hook-form';
import { type KyThi, type CauHoi, type DonViToChuc, type ChucVu, type Employee } from '@src/types';
import { useChuyenDeNhom, useChuyenDe } from '@lib/hooks/queries/useTraining';
import { BaseFormView } from '@components/foundation/views';
import FormSection from '@components/ui/forms/FormSection';
import Alert from '@components/ui/feedback/Alert';
import {
  FormInputRHF,
  DatePickerRHF,
  ChuyenDeMultiSelectRHF,
  ChucVuMultiSelectRHF,
  ButtonGroupRHF,
} from '@components/ui/forms';
import { useFormValidation } from '@lib/hooks/useFormValidation';
import {
  kyThiFormSchema,
  KY_THI_TRANG_THAI_OPTIONS,
  type KyThiFormData,
} from '@features/cong-viec/dao-tao/ky-thi/schemas/kyThi.schema';
import { ToastContext } from '@lib/contexts/ToastContext';

interface KyThiFormViewProps {
  onBack: () => void;
  onSave: (item: Partial<KyThi>) => void | Promise<void>;
  itemToEdit: Partial<KyThi> | null;
  cauHoiList: CauHoi[];
  donViToChuc: DonViToChuc[];
  chucVu: ChucVu[];
  nhanSu: Employee[];
}

const KyThiFormView: React.FC<KyThiFormViewProps> = ({
  onBack,
  onSave,
  itemToEdit,
  cauHoiList,
  donViToChuc,
  chucVu,
  nhanSu,
}) => {
  // Use TanStack Query hooks directly instead of TrainingProvider
  // This removes dependency on TrainingProvider and makes KyThi module more independent
  const { data: groupList = [] } = useChuyenDeNhom();
  const { data: topicList = [] } = useChuyenDe();
  const { addToast } = useContext(ToastContext);
  const isEditing = !!itemToEdit?.id;

  const defaultValues = useMemo<KyThiFormData>(() => ({
    ngay: itemToEdit?.ngay || new Date().toISOString().split('T')[0],
    ten_ky_thi: itemToEdit?.ten_ky_thi || '',
    so_cau_hoi: itemToEdit?.so_cau_hoi || 10,
    so_phut_lam_bai: itemToEdit?.so_phut_lam_bai || 15,
    nhom_chuyen_de_ids: itemToEdit?.nhom_chuyen_de_ids || [],
    chuyen_de_ids: itemToEdit?.chuyen_de_ids || [],
    chuc_vu_ids: itemToEdit?.chuc_vu_ids || [],
    trang_thai: (itemToEdit?.trang_thai as KyThiFormData['trang_thai']) || 'Mở',
    ghi_chu: itemToEdit?.ghi_chu || '',
  }), [itemToEdit]);

  const { form, handleSubmit, isSubmitting, isValid } =
    useFormValidation<KyThiFormData>({
      schema: kyThiFormSchema,
      defaultValues,
      onSubmit: async (data) => {
        // Validation: Kiểm tra số câu hỏi
        const totalQuestionsInSelectedTopics = data.chuyen_de_ids
          ? cauHoiList.filter((q) => data.chuyen_de_ids!.includes(q.chuyen_de_id)).length
          : 0;

        if ((data.so_cau_hoi || 0) > totalQuestionsInSelectedTopics) {
          addToast?.({
            message: `Không đủ câu hỏi! Cần ${data.so_cau_hoi}, chỉ có ${totalQuestionsInSelectedTopics} câu trong các chuyên đề đã chọn.`,
            type: 'error',
          });
          return;
        }

        // chuc_vu_ids phải là ma_chuc_vu (string) từ var_chuc_vu, không được đổi sang id
        await onSave({
          ...(itemToEdit?.id ? { id: itemToEdit.id } : {}),
          ...data,
          ten_ky_thi: data.ten_ky_thi.trim(),
          // chuc_vu_ids đã là string[] (ma_chuc_vu) từ ChucVuMultiSelectRHF, giữ nguyên
          chuc_vu_ids: data.chuc_vu_ids || [],
        });
      },
      successMessage: isEditing
        ? 'Cập nhật kỳ thi thành công!'
        : 'Thêm kỳ thi thành công!',
      onSuccess: () => {
        onBack();
      },
    });

  const chuyenDeIds = useWatch({ control: form.control, name: 'chuyen_de_ids' });
  const soCauHoi = useWatch({ control: form.control, name: 'so_cau_hoi' });

  const totalQuestionsInSelectedTopics = useMemo(() => {
    if (!chuyenDeIds || chuyenDeIds.length === 0) return 0;
    return cauHoiList.filter((q) => chuyenDeIds.includes(q.chuyen_de_id)).length;
  }, [chuyenDeIds, cauHoiList]);

  const questionCountError = useMemo(() => {
    if ((soCauHoi || 0) > totalQuestionsInSelectedTopics) {
      return `Không đủ câu hỏi! Cần ${soCauHoi}, chỉ có ${totalQuestionsInSelectedTopics} câu trong các chuyên đề đã chọn.`;
    }
    return null;
  }, [soCauHoi, totalQuestionsInSelectedTopics]);

  return (
    <FormProvider {...form}>
      <BaseFormView
        onBack={onBack}
        onSave={handleSubmit}
        isSubmitting={isSubmitting}
        isEditing={isEditing}
        disabled={!isValid}
      >
        {questionCountError && (
          <div className="mb-4">
            <Alert
              variant="error"
              message={questionCountError}
              dismissible={false}
            />
          </div>
        )}

        <FormSection title="Thông tin cơ bản">
          <FormInputRHF
            name="ten_ky_thi"
            label="Tên kỳ thi"
            required
            wrapperClassName="md:col-span-2"
          />
          <DatePickerRHF name="ngay" label="Ngày thi" required />
          <ButtonGroupRHF
            name="trang_thai"
            label="Trạng thái"
            options={KY_THI_TRANG_THAI_OPTIONS as unknown as string[]}
            required
          />
        </FormSection>

        <FormSection title={`Nội dung thi (${totalQuestionsInSelectedTopics} câu hỏi)`}>
          <ChuyenDeMultiSelectRHF
            name="chuyen_de_ids"
            label="Chọn chuyên đề"
            groupList={groupList}
            topicList={topicList}
            cauHoiList={cauHoiList}
            wrapperClassName="md:col-span-2"
          />
        </FormSection>

        <FormSection title="Thiết lập bài thi">
          <FormInputRHF
            name="so_cau_hoi"
            label="Số câu hỏi"
            type="number"
            min="1"
            required
          />
          <FormInputRHF
            name="so_phut_lam_bai"
            label="Thời gian (phút)"
            type="number"
            min="1"
            required
          />
          {questionCountError && (
            <div className="md:col-span-2">
              <p className="text-xs text-danger mt-1">{questionCountError}</p>
            </div>
          )}
        </FormSection>

        <FormSection title="Đối tượng tham gia">
          <ChucVuMultiSelectRHF
            name="chuc_vu_ids"
            label="Chọn chức vụ"
            chucVuList={chucVu}
            donViToChucList={donViToChuc}
            nhanSu={nhanSu}
            wrapperClassName="md:col-span-2"
          />
        </FormSection>

        <FormSection title="Ghi chú">
          <FormInputRHF
            name="ghi_chu"
            label="Ghi chú"
            as="textarea"
            wrapperClassName="md:col-span-2"
          />
        </FormSection>
      </BaseFormView>
    </FormProvider>
  );
};

export default KyThiFormView;

