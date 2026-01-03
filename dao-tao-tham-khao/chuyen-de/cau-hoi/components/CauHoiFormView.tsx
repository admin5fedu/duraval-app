/**
 * CauHoiFormView Component
 * 
 * Form view for CauHoi sub-module using React Hook Form
 */

import React, { useMemo } from 'react';
import { FormProvider } from 'react-hook-form';
import { type CauHoi, type ChuyenDe, type ChuyenDeNhom } from '@src/types';
import { BaseFormView } from '@components/foundation/views';
import FormSection from '@components/ui/forms/FormSection';
import {
  FormInputRHF,
  FormSelectRHF,
  MultipleImagesUploadRHF,
  DapAnDungSelectorRHF,
} from '@components/ui/forms';
import { useFormValidation } from '@lib/hooks/useFormValidation';
import {
  cauHoiFormSchema,
  type CauHoiFormData,
} from '@features/cong-viec/dao-tao/cau-hoi/schemas/cauHoi.schema';

interface CauHoiFormViewProps {
  onBack: () => void;
  onSave: (item: Partial<CauHoi>) => Promise<CauHoi | null>;
  itemToEdit: Partial<CauHoi> | null;
  topicList: ChuyenDe[];
  groupList: ChuyenDeNhom[];
}

const CauHoiFormView: React.FC<CauHoiFormViewProps> = ({
  onBack,
  onSave,
  itemToEdit,
  topicList,
  groupList,
}) => {
  const isEditing = !!itemToEdit?.id;

  const groupedTopics = useMemo(() => {
    const groups: { groupName: string; topics: ChuyenDe[] }[] = [];
    const topicMap = new Map<number, ChuyenDe>(topicList.map((t) => [t.id, t]));

    groupList.forEach((group) => {
      const topicsInGroup = topicList.filter((t) => t.nhom_id === group.id);
      if (topicsInGroup.length > 0) {
        groups.push({ groupName: group.ten_nhom, topics: topicsInGroup });
        topicsInGroup.forEach((t) => topicMap.delete(t.id));
      }
    });

    if (topicMap.size > 0) {
      const remainingTopics = Array.from(topicMap.values());
      groups.push({ groupName: 'Chưa phân loại', topics: remainingTopics });
    }

    return groups;
  }, [groupList, topicList]);

  const defaultValues = useMemo<CauHoiFormData>(() => ({
    chuyen_de_id: itemToEdit?.chuyen_de_id || undefined as any, // Schema will validate (must be positive integer > 0)
    cau_hoi: itemToEdit?.cau_hoi || '',
    dap_an_1: itemToEdit?.dap_an_1 || '',
    dap_an_2: itemToEdit?.dap_an_2 || '',
    dap_an_3: itemToEdit?.dap_an_3 || '',
    dap_an_4: itemToEdit?.dap_an_4 || '',
    dap_an_dung: itemToEdit?.dap_an_dung || 1,
    hinh_anh: itemToEdit?.hinh_anh || [],
  }), [itemToEdit]);

  const { form, handleSubmit, isSubmitting, isValid } =
    useFormValidation<CauHoiFormData>({
      schema: cauHoiFormSchema,
      defaultValues,
      onSubmit: async (data) => {
        await onSave({
          ...(itemToEdit?.id ? { id: itemToEdit.id } : {}),
          ...data,
        });
      },
      successMessage: isEditing
        ? 'Cập nhật câu hỏi thành công!'
        : 'Thêm câu hỏi thành công!',
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
        <FormSection title="Thông tin câu hỏi">
          <FormSelectRHF
            name="chuyen_de_id"
            label="Thuộc chuyên đề"
            required
            wrapperClassName="md:col-span-2"
          >
            <option value="">-- Chọn chuyên đề --</option>
            {groupedTopics.map((group) => (
              <optgroup key={group.groupName} label={group.groupName}>
                {group.topics.map((topic) => (
                  <option key={topic.id} value={topic.id}>
                    {topic.ten_chuyen_de}
                  </option>
                ))}
              </optgroup>
            ))}
          </FormSelectRHF>

          <FormInputRHF
            name="cau_hoi"
            label="Nội dung câu hỏi"
            as="textarea"
            required
            wrapperClassName="md:col-span-2"
          />
        </FormSection>

        <FormSection title="Hình ảnh đính kèm (tùy chọn)">
          <MultipleImagesUploadRHF
            name="hinh_anh"
            folder="questions"
            label=""
            wrapperClassName="md:col-span-2"
          />
        </FormSection>

        <FormSection title="Các đáp án">
          <FormInputRHF
            name="dap_an_1"
            label="Đáp án 1"
            as="textarea"
            required
            wrapperClassName="md:col-span-2"
          />
          <FormInputRHF
            name="dap_an_2"
            label="Đáp án 2"
            as="textarea"
            required
            wrapperClassName="md:col-span-2"
          />
          <FormInputRHF
            name="dap_an_3"
            label="Đáp án 3"
            as="textarea"
            required
            wrapperClassName="md:col-span-2"
          />
          <FormInputRHF
            name="dap_an_4"
            label="Đáp án 4"
            as="textarea"
            required
            wrapperClassName="md:col-span-2"
          />
          <DapAnDungSelectorRHF
            name="dap_an_dung"
            wrapperClassName="md:col-span-2"
          />
        </FormSection>
      </BaseFormView>
    </FormProvider>
  );
};

export default CauHoiFormView;

