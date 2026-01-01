import { useParams } from "react-router-dom"
import { DangKyDoanhSoDetailView } from "../components"

export default function DangKyDoanhSoDetailRoute() {
  const { id } = useParams<{ id: string }>()
  const idNumber = id ? parseInt(id, 10) : 0

  if (!idNumber || isNaN(idNumber)) {
    return <div>Invalid ID</div>
  }

  return <DangKyDoanhSoDetailView id={idNumber} />
}

