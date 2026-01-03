/**
 * ChuyenDeNhomFormView Component
 * 
 * Form view for ChuyenDeNhom sub-module using React Hook Form
 */

import React, { useMemo } from 'react';
import { FormProvider } from 'react-hook-form';
import { type ChuyenDeNhom } from '@src/types';
import { BaseFormView } from '@components/foundation/views';
import FormSection from '@components/ui/forms/FormSection';
import { FormInputRHF } from '@components/ui/forms';
import { useFormValidation } from '@lib/hooks/useFormValidation';
import {
  chuyenDeGroupFormSchema,
  type ChuyenDeGroupFormData,
} from '@features/cong-viec/dao-tao/chuyen-de-group/schemas/chuyenDeGroup.schema';

interface ChuyenDeNhomFormViewProps {
  onBack: () => void;
  onSave: (item: Partial<ChuyenDeNhom>) => Promise<ChuyenDeNhom | null>;
  itemToEdit: Partial<ChuyenDeNhom> | null;
}

const ChuyenDeNhomFormView: React.FC<ChuyenDeNhomFormViewProps> = ({
  onBack,
  onSave,
  itemToEdit,
}) => {
  const isEditing = !!itemToEdit?.id;

  const defaultValues = useMemo<ChuyenDeGroupFormData>(() => ({
    ten_nhom: itemToEdit?.ten_nhom || '',
  }), [itemToEdit]);

  const { form, handleSubmit, isSubmitting, isValid } =
    useFormValidation<ChuyenDeGroupFormData>({
      schema: chuyenDeGroupFormSchema,
      defaultValues,
      onSubmit: async (data) => {
        await onSave({
          ...(itemToEdit?.id ? { id: itemToEdit.id } : {}),
          ...data,
        });
      },
      successMessage: isEditing
        ? 'Cập nhật nhóm chuyên đề thành công!'
        : 'Thêm nhóm chuyên đề thành công!',
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
        <FormSection title="Thông tin nhóm">
          <FormInputRHF
            name="ten_nhom"
            label="Tên nhóm"
            required
            wrapperClassName="md:col-span-2"
          />
        </FormSection>
      </BaseFormView>
    </FormProvider>
  );
};

export default ChuyenDeNhomFormView;

