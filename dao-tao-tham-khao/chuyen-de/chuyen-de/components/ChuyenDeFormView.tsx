/**
 * ChuyenDeFormView Component
 * 
 * Form view for ChuyenDe sub-module using React Hook Form
 */

import React, { useMemo } from 'react';
import { FormProvider } from 'react-hook-form';
import { type ChuyenDe, type ChuyenDeNhom } from '@src/types';
import { BaseFormView } from '@components/foundation/views';
import FormSection from '@components/ui/forms/FormSection';
import { FormInputRHF, FormSelectRHF } from '@components/ui/forms';
import { useFormValidation } from '@lib/hooks/useFormValidation';
import {
  chuyenDeTopicFormSchema,
  type ChuyenDeTopicFormData,
} from '@features/cong-viec/dao-tao/chuyen-de-topic/schemas/chuyenDeTopic.schema';

interface ChuyenDeFormViewProps {
  onBack: () => void;
  onSave: (item: Partial<ChuyenDe>) => Promise<ChuyenDe | null>;
  itemToEdit: Partial<ChuyenDe> | null;
  groupList: ChuyenDeNhom[];
}

const ChuyenDeFormView: React.FC<ChuyenDeFormViewProps> = ({
  onBack,
  onSave,
  itemToEdit,
  groupList,
}) => {
  const isEditing = !!itemToEdit?.id;

  const defaultValues = useMemo<ChuyenDeTopicFormData>(() => ({
    nhom_id: itemToEdit?.nhom_id || undefined as any, // Schema will validate (must be positive integer > 0)
    ten_chuyen_de: itemToEdit?.ten_chuyen_de || '',
    ghi_chu: itemToEdit?.ghi_chu || '',
  }), [itemToEdit]);

  const { form, handleSubmit, isSubmitting, isValid } =
    useFormValidation<ChuyenDeTopicFormData>({
      schema: chuyenDeTopicFormSchema,
      defaultValues,
      onSubmit: async (data) => {
        await onSave({
          ...(itemToEdit?.id ? { id: itemToEdit.id } : {}),
          ...data,
        });
      },
      successMessage: isEditing
        ? 'Cập nhật chuyên đề thành công!'
        : 'Thêm chuyên đề thành công!',
      onSuccess: () => {
        onBack();
      },
    });

  return (
    <FormProvider {...form}>
      <BaseFormView
        onBack={onBack}
        onSave={handleSubmit}
        isSubmitting={isSubmitting}
        isEditing={isEditing}
        disabled={!isValid}
      >
        <FormSection title="Thông tin chuyên đề">
          <FormSelectRHF
            name="nhom_id"
            label="Nhóm chuyên đề"
            required
            wrapperClassName="md:col-span-2"
          >
            <option value="">-- Chọn nhóm --</option>
            {groupList.map((group) => (
              <option key={group.id} value={group.id}>
                {group.ten_nhom}
              </option>
            ))}
          </FormSelectRHF>
          <FormInputRHF
            name="ten_chuyen_de"
            label="Tên chuyên đề"
            required
            wrapperClassName="md:col-span-2"
          />
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

export default ChuyenDeFormView;

