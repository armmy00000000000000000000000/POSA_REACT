import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../navbar/nav';
import { API_ENDPOINT } from '../config/config';

function Home() {

  const userZooId = localStorage.getItem('user_profilezoo_id');
  const machineZooId = localStorage.getItem('machine_zoo_id');
  const isMatchedZoo = userZooId && machineZooId && userZooId === machineZooId;

  const imgzoos = [
    { id: 1, name: "สวนสัตว์เปิดเขาเขียว" },
    { id: 2, name: "สวนสัตว์เชียงใหม่" },
    { id: 3, name: "สวนสัตว์นครราชสีมา" },
    { id: 4, name: "สวนสัตว์อุบลราชธานี" },
    { id: 5, name: "สวนสัตว์ขอนแก่น" },
    { id: 6, name: "สวนสัตว์สงขลา" },
  ];


  const selectedZoo = imgzoos.find(zoo => zoo.id === parseInt(machineZooId));
  const machine = JSON.parse(localStorage.getItem('machine'));


  const [isOpen, setIsOpen] = useState(true);

  const handleClick = () => {
    const empCode = localStorage.getItem('emp_code');
    // window.open(`${API_ENDPOINT}/monitor/?bc_chanel=${empCode}${machine.id}${machine.zoo_id}${machine.code}${machine.number}`, '_blank');
    window.open(`${API_ENDPOINT}/monitor/?bc_chanel=${empCode}`, '_blank');
  };
  const Openlike = () => {
    const requestOptions = {
      method: "GET",
      redirect: "follow"
    };

    fetch("http://127.0.0.1:5000/print_service/test", requestOptions)
      .then((response) => response.text())
      .then((result) => {
        if (result.success === "print success") {
          alert(result.success);
        } else {
          alert(result.error);
        }
      })
      .catch((error) => console.error(error));
  };

  return (
    <div className="Dashboard bg-light min-vh-100">
      <Navbar />
      <div className="container-fluid py-4">
        <div className="row g-4">
          {/* Sidebar */}
          <div className="col-md-3">
            {isOpen && !isMatchedZoo && (
              <div className="alert alert-danger shadow-sm rounded-4 p-3">
                🚫 <strong>ไม่สามารถแสดงเมนูได้:</strong> รหัสสวนสัตว์ของผู้ใช้ไม่ตรงกับเครื่องที่กำลังใช้งาน
              </div>
            )}
            {isOpen && isMatchedZoo && (
              <div className="accordion shadow-sm rounded-4 overflow-hidden border border-primary" id="accordionMenu">
                <div className="accordion-item">
                  <h2 className="accordion-header" id="headingOne">
                    <button
                      className="accordion-button bg-gradient text-white fw-bold bg-primary"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#collapseOne"
                      aria-expanded="true"
                      aria-controls="collapseOne"
                    >
                      เมนู {localStorage.getItem('user_role')}
                    </button>
                  </h2>
                  <div
                    id="collapseOne"
                    className="accordion-collapse collapse show"
                    aria-labelledby="headingOne"
                    data-bs-parent="#accordionMenu"
                  >
                    <div className="accordion-body bg-white">
                      <ul className="list-group list-group-flush">
                        <li className="list-group-item"><Link to="/home" className="text-decoration-none">🏠 หน้าแรก</Link></li>
                        <li className="list-group-item"><Link to="/order_report" className="text-decoration-none">📋 รายงานประจำวัน</Link></li>
                        <li className="list-group-item"><Link to="/pos" className="text-decoration-none">🧾 POS</Link></li>
                        <li className="list-group-item"><Link onClick={handleClick} className="text-decoration-none">🖥️ MONITOR 2</Link></li>
                        <li className="list-group-item"><Link to="/order_report" className="text-decoration-none">📦 รายงานคำสั่งซื้อ</Link></li>
                        <li className="list-group-item"><Link to="/ticket_report" className="text-decoration-none">🎟️ รายงานยอดจำหน่ายบัตร</Link></li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="col-md-9">
            <div className="card border-0 shadow-lg rounded-4">
              <div className="card-body p-4">
                <h4 className="text-primary fw-bold mb-3">👤 ข้อมูลผู้ใช้งาน</h4>
                <div className="row g-3">
                  <div className="col-md-6">
                    <p><strong>ชื่อผู้ใช้งาน:</strong> {localStorage.getItem('name')}</p>
                    <p><strong>ตำแหน่ง:</strong> {localStorage.getItem('user_role')}</p>
                    <p><strong>ชื่อเครื่อง:</strong> {localStorage.getItem('pc_name') || ''}</p>
                    <p><strong>userZooId:</strong> {userZooId || ''}</p>
                    <p><strong>machineZooId:</strong> {machineZooId || ''}</p>
                  </div>
                  <div className="col-md-6">
                    <p><strong>ประจำสวนสัตว์:</strong> {selectedZoo?.name || localStorage.getItem('zooname') || ''}</p>
                    <p><strong>รหัสเครื่อง:</strong> {localStorage.getItem('emp_code') || ''}</p>
                    <p><strong>API Endpoint:</strong> {API_ENDPOINT || ''}</p>
                  </div>
                </div>
              </div>
              <div className="card-footer bg-transparent border-top-0 text-end px-4 pb-4">
                <button className="btn btn-outline-primary btn-lg px-4" onClick={Openlike}>🖨️ ทดสอบพิมพ์</button>
              </div>
            </div>

            <div className="mt-4">
              <div className="alert alert-info shadow-sm rounded-4 p-3 fs-6">
                <strong>📢 ประกาศ:</strong> กรุณาตรวจสอบข้อมูลของคุณให้ถูกต้อง
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ui เดิม 
  // return (
  //   <div className="Dashboard bg-light vh-100">
  //     <Navbar />
  //     <div className="d-flex flex-column flex-md-row">
  //       <div className="container mt-4 flex-grow-1">
  //         <div className="row">
  //           {/* Sidebar */}
  //           <div className="col-md-3">
  //             {isOpen && (
  //               <div className="accordion shadow rounded" id="accordionExample">
  //                 <div className="accordion-item">
  //                   <h2 className="accordion-header" id="headingOne">
  //                     <button
  //                       className="accordion-button bg-primary text-white"
  //                       type="button"
  //                       data-bs-toggle="collapse"
  //                       data-bs-target="#collapseOne"
  //                       aria-expanded="true"
  //                       aria-controls="collapseOne"
  //                     >
  //                       เมนู {localStorage.getItem('user_role')}
  //                     </button>
  //                   </h2>
  //                   <div
  //                     id="collapseOne"
  //                     className="accordion-collapse collapse show"
  //                     aria-labelledby="headingOne"
  //                     data-bs-parent="#accordionExample"
  //                   >
  //                     <div className="accordion-body bg-white shadow-sm">
  //                       <ul className="list-group">
  //                         <li className="list-group-item">
  //                           <Link to="/home" className="text-decoration-none">หน้าแรก</Link>
  //                         </li>
  //                         <li className="list-group-item">
  //                           <Link to="/order_report" className="text-decoration-none">รายงานประจำวัน</Link>
  //                         </li>
  //                         <li className="list-group-item">
  //                           <Link to="/pos" className="text-decoration-none">POS</Link>
  //                         </li>
  //                         <li className="list-group-item">
  //                           <Link onClick={handleClick} className="text-decoration-none">MONITOR 2</Link>
  //                         </li>
  //                         <li className="list-group-item">
  //                           <Link to="/order_report" className="text-decoration-none">รายงานคำสั่งซื้อ</Link>
  //                         </li>
  //                         <li className="list-group-item">
  //                           <Link to="/ticket_report" className="text-decoration-none">รายงานยอดจำหน่ายบัตร</Link>
  //                         </li>
  //                       </ul>
  //                     </div>
  //                   </div>
  //                 </div>
  //               </div>
  //             )}
  //           </div>

  //           {/* Main Content */}
  //           <div className="col-md-9">
  //             <div className="card shadow-lg rounded">
  //               <div className="card-body">
  //                 <h5 className="card-title text-primary fw-bold">ข้อมูลผู้ใช้งาน</h5>
  //                 <p><strong>ชื่อผู้ใช้งาน:</strong> {localStorage.getItem('name')}</p>
  //                 <p><strong>ตำแหน่ง:</strong> {localStorage.getItem('user_role')}</p>
  //                 <p><strong>ชื่อเครื่อง:</strong> {localStorage.getItem('pc_name') || ''}</p>
  //                 <p><strong>ประจำสวนสัตว์:</strong> {selectedZoo?.name || localStorage.getItem('zooname') || ''}</p>
  //                 <p><strong>รหัสเครื่อง:</strong> {localStorage.getItem('emp_code') || ''}</p>
  //                 <p><strong>API_ENDPOINT:</strong> {API_ENDPOINT || ''}</p>
  //               </div>

  //             </div>
  //             <button
  //               className="btn btn-primary m-3"
  //               onClick={() => Openlike()}>ทดสอบพิมพ์</button>

  //             <div className="mt-4">
  //               <div className="alert alert-info shadow-sm rounded">
  //                 <strong>ประกาศ:</strong> กรุณาตรวจสอบข้อมูลของคุณให้ถูกต้อง
  //               </div>
  //             </div>
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //   </div>
  // );
}

export default Home;
