"use client"

import { useParams } from "react-router-dom"
import { XetDuyetCongNoFormView } from "../components/xet-duyet-cong-no-form-view"

export default function XetDuyetCongNoFormRoute() {
  const params = useParams<{ id?: string }>()
  const id = params.id === "moi" ? undefined : (params.id ? Number(params.id) : undefined)
  
  return <XetDuyetCongNoFormView id={id} />
}

