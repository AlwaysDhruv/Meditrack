import PatientSidebar from "./PatientSidebar"
import { Outlet } from "react-router-dom"
import "./patient.css"

export default function PatientLayout() {
  return (
    <div className="patient-panel">
      <PatientSidebar />
      <div className="patient-content">
        <Outlet />
      </div>
    </div>
  )
}
