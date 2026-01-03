"use client"

import { useParams } from "react-router-dom"
import { BaiThiFormView } from "../components/bai-thi-form-view"

export default function BaiThiFormRoute() {
  const { id } = useParams<{ id: string }>()
  const baiThiId = id ? parseInt(id, 10) : undefined

  return <BaiThiFormView id={baiThiId} />
}

