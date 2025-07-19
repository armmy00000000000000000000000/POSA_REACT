import React from "react";
import { Link } from "react-router-dom";
import { API_ENDPOINT } from "../config/config";
import { FaSignOutAlt, FaHome, FaTicketAlt, FaClipboardList, FaCashRegister, FaTv } from "react-icons/fa";

function Nav() {
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/pose/login";
  };

  const machine = JSON.parse(localStorage.getItem("machine"));

  const handleClick = () => {
    const empCode = localStorage.getItem("emp_code");
    window.open(`${API_ENDPOINT}/monitor/?bc_chanel=${empCode}`, "_blank");
  };

  const userZooId = localStorage.getItem("user_profilezoo_id");
  const machinezooId = localStorage.getItem('machine_zoo_id');
  const isMatchedZoo = userZooId && machinezooId && userZooId === machinezooId;

  //   หากต้องการให้ redirect หรือบล็อกการเข้าถึงหน้าเลยก็สามารถทำได้เพิ่ม เช่น:

  // js
  // คัดลอก
  // แก้ไข
  // if (!isMatchedZoo) {
  //   return (
  //     <div className="container mt-5">
  //       <div className="alert alert-danger fs-5 shadow rounded">
  //         🔐 ผู้ใช้ไม่มีสิทธิ์เข้าใช้งานหน้านี้ เพราะรหัสสวนสัตว์ไม่ตรงกับเครื่องที่ใช้งานอยู่
  //       </div>
  //     </div>
  //   );
  // }
  return (
    <nav className="navbar navbar-expand-lg bg-white shadow-sm border-bottom sticky-top">
      <div className="container-fluid px-4">



  
        <Link to="/home" className="navbar-brand fw-bold text-primary">
          🐾 ZOO E-Ticket (POSE)
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarMenu"
          aria-controls="navbarMenu"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarMenu">
      {!isMatchedZoo && (
          <div className=" mx-auto mb-2 mb-lg-0 gap-2 ">
            🚫 <strong>ไม่สามารถแสดงเมนูได้:</strong> รหัสสวนสัตว์ของผู้ใช้ไม่ตรงกับเครื่องที่กำลังใช้งาน
          </div>
        )}

          {isMatchedZoo && (
            <ul className="navbar-nav mx-auto mb-2 mb-lg-0 gap-2">
              <li className="nav-item">
                <Link to="/home" className="nav-link">
                  <FaHome className="me-1" /> หน้าแรก
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/order_report" className="nav-link">
                  <FaClipboardList className="me-1" /> รายงานคำสั่งซื้อ
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/ticket_report" className="nav-link">
                  <FaTicketAlt className="me-1" /> รายงานยอดจำหน่ายบัตร
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/pos" className="nav-link">
                  <FaCashRegister className="me-1" /> POS
                </Link>
              </li>
              <li className="nav-item">
                <span onClick={handleClick} className="nav-link" style={{ cursor: "pointer" }}>
                  <FaTv className="me-1" /> Monitor
                </span>
              </li>
            </ul>
          )}
          <div className="d-flex">
            <button onClick={handleLogout} className="btn btn-outline-danger">
              <FaSignOutAlt className="me-1" /> ออกจากระบบ
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Nav;
