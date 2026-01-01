import { useParams } from "react-router-dom"
import { DangKyDoanhSoFormView } from "../components"

export default function DangKyDoanhSoFormRoute() {
  const { id } = useParams<{ id?: string }>()
  
  // If id is "moi", create new
  // Otherwise, parse id as number for edit mode
  const idNumber = id && id !== "moi" ? parseInt(id, 10) : undefined

  return <DangKyDoanhSoFormView id={idNumber} />
}

