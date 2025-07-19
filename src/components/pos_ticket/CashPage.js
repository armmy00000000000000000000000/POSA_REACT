import React, { useState, useEffect } from 'react';
import { json, useLocation, useNavigate } from 'react-router-dom';
import { API_ENDPOINT, PRINTER_ENDPOINT } from '../config/config';
import Swal from 'sweetalert2';
import redcard from '../image/redcard.gif';
function CashPage() {
    const location = useLocation();
    const { ticketSummary } = location.state || {}; // Access the passed data
    const [odid, setOdid] = useState(null);
    const [idPrint, setidPrint] = useState(null);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const token = localStorage.getItem('token');
    const navigate = useNavigate();
    const [isProcessing, setisProcessing] = useState(false);
    const [loadingbtn, setLoadingbtn] = useState(false);
    const [Ref1, setRef1] = useState('');
    const [Ref2, setRef2] = useState('');
    const [Order, setOrder] = useState('');
    const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : {};
    const machine = localStorage.getItem('machine') ? JSON.parse(localStorage.getItem('machine')) : {};
    const machine_id = localStorage.getItem('machine_id');
    const [Ioall, setIoall] = useState('');
    const [printWindow, setPrintWindow] = useState(null); // ตัวแปรเก็บหน้าต่างพิมพ์
    const [gate, setGate] = useState(0);
    const [isPrinting, setIsPrinting] = useState(false);
    const [loadingprin, setLoadingprin] = useState(false);


    const [cashReceived, setCashReceived] = useState('');
    const [showKeypad, setShowKeypad] = useState(false);
    const [change, setChange] = useState(0);
    const [showResult, setShowResult] = useState(false);

    const keypadButtons = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '.', '←', 'C'];

    const handleKeypadClick = (value) => {
        if (value === 'C') {
            setCashReceived('');
        } else if (value === '←') {
            setCashReceived(cashReceived.slice(0, -1));
        } else {
            setCashReceived(cashReceived + value);
        }
    };

    const handleCheckboxChange = (e) => {
        setGate(e.target.checked ? 1 : 0);
    };

    const calculateChange = () => {
        const total = parseFloat(ticketSummary.amount || 0);
        const cash = parseFloat(cashReceived || 0);
        const result = cash - total;
        setChange(result);
        setShowKeypad(false);
        setShowResult(true);
    };
    useEffect(() => {
        // ล้างค่าเงินทอนและปิดหน้าต่างผลลัพธ์เมื่อมีการกรอกยอดเงินใหม่
        setChange(0);
        setShowResult(false);
    }, [cashReceived]);


    const closeModal = () => setShowResult(false);

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/pose/login';
    };

    const handlePrint = async (isGroupPrint, idprint) => {
        // if (isPrinting) {
        //     console.log('กำลังพิมพ์อยู่ กรุณารอสักครู่');
        //     return;
        // }

        if (isProcessing) return;
        setisProcessing(true)
        setLoadingbtn(true);
        const summaryToPrint = { ...ticketSummary };


        // ตั้งสถานะเป็นกำลังพิมพ์

        setIsPrinting(true);
        summaryToPrint.group = isGroupPrint ? 2 : 1;
        summaryToPrint.gate = gate;

        console.log("Summary to print:", summaryToPrint);
        const fetchData = async () => {
            setLoading(true);
            setLoadingprin(true);
            setErrorMessage('');
            localStorage.setItem('idPrint', idprint);
            try {
                if (odid === null) {
                    const url = `${API_ENDPOINT}/api/v1/zoo/pos/ticket_order`;
                    const myHeaders = new Headers();
                    myHeaders.append("X-API-KEY", token);
                    myHeaders.append("Content-Type", "application/json");

                    const raw = JSON.stringify(summaryToPrint);

                    const requestOptions = {
                        method: "POST",
                        headers: myHeaders,
                        body: raw,
                        redirect: "follow"
                    };

                    const response = await fetch(url, requestOptions);
                    const responseData = await response.json();
                    if (response.status === 401) {
                        // แจ้งเตือนให้ผู้ใช้ล็อกเอาท์เมื่อได้รับสถานะ 401
                        Swal.fire({
                            title: 'Token หมดอายุ',
                            text: 'กรุณาเข้าสู่ระบบใหม่',
                            icon: 'warning',
                            confirmButtonText: 'ล็อกเอาท์',
                        }).then((result) => {
                            if (result.isConfirmed) {
                                handleLogout();
                            }
                        });
                        throw new Error('Unauthorized');
                    }
                    // console.log(responseData)
                    setRef1(responseData.order.ref1);
                    setRef2(responseData.order.ref2);
                    // console.log(responseData.order);
                    setIoall(responseData.order.amount);
                    setOrder(responseData.order);
                    if (responseData.status === 'success') {
                        setOdid(responseData.id);

                        // console.log(idprint)
                        setidPrint(idprint)
                        if (idprint === 1) {
                            Printsingle(responseData.id, 1, PRINTER_ENDPOINT, 'single')


                            // const printUrl = `http://localhost/pos_client_print/index2.php?id=${responseData.id}&r=1&ep=${PRINTER_ENDPOINT}&type=single`;
                            // const printWindow = window.open(printUrl, '_blank', 'width=600,height=400');
                            // setPrintWindow(printWindow);
                            // const checkWindowClosed = setInterval(() => {
                            //     if (printWindow && printWindow.closed) { // ตรวจสอบว่า printWindow ไม่เป็น null
                            //         setIsPrinting(false);  // รีเซ็ตสถานะหลังพิมพ์เสร็จ
                            //         clearInterval(checkWindowClosed);
                            //         // navigate('/pos');
                            //         // กลับไปที่หน้า /pos
                            //         window.location = '/pose/pos'
                            //     }
                            // }, 3000);


                        } else {
                            // Approved(responseData.order);
                            Printgroup(responseData.id, 1, PRINTER_ENDPOINT, 'group')

                            // const printUrl = `http://localhost/pos_client_print/index2.php?id=${responseData.id}&r=1&ep=${PRINTER_ENDPOINT}&type=group`;
                            // const printWindow = window.open(printUrl, '_blank', 'width=600,height=400');

                            // const checkWindowClosed = setInterval(() => {
                            //     if (printWindow && printWindow.closed) { // ตรวจสอบว่า printWindow ไม่เป็น null
                            //         setIsPrinting(false);
                            //         clearInterval(checkWindowClosed);
                            //         // navigate('/pos');
                            //         window.location = '/pose/pos'
                            //     }
                            // }, 3000);


                        }


                        console.log(responseData)
                        // Additional UI updates can be added here
                    } else {
                        throw new Error(responseData.message);
                    }
                } else {
                    // Logic for when odid is already set
                }
            } catch (error) {
                console.error("Fetch Error:", error);
                setErrorMessage(`Error: ${error.message}`);
            } finally {
                setisProcessing(false)
                setLoading(false);
            }
        };

        await fetchData();
    };
    const cancelOrder = () => {
        // navigate('/pos');
        window.location = '/pose/pos'
    };

    const Printsingle = (id, r, ep, type) => {
        const requestOptions = {
            method: "GET",
            redirect: "follow"
        };

        //   fetch( `https://localhost/pos_client_print/index2.php?id=${id}&r=${r}&ep=${ep}&type=${type}`, requestOptions)
        fetch(`http://127.0.0.1:5000/ticket/${ep}/order/${id}/${r}/${type}`, requestOptions)
            .then((response) => response.json())
            .then((result) => {
                if (result.status === "success") {
                    console.log(result);
                    setInterval(() => {
                        // navigate('/pos');
                        setIsPrinting(false);
                        window.location = '/pose/pos';
                    }, 3000);

                }
                else {
                    console.log(result);
                }
            })
            .catch((error) => console.error(error));

    }

    const Printgroup = (id, r, ep, type) => {
        console.log(2 + 2)
        const requestOptions = {
            method: "GET",
            redirect: "follow"
        };

        // fetch(`https://localhost/pos_client_print/index2.php?id=${id}&r=${r}&ep=${ep}&type=${type}`, requestOptions)
        // http://127.0.0.1:5000/ticket/${ep}/order/${id}/${r}/${type}
        fetch(`http://127.0.0.1:5000/ticket/${ep}/order/${id}/${r}/${type}`, requestOptions)
            .then((response) => response.json())
            .then((result) => {
                if (result.status === "success") {
                    setInterval(() => {
                        // navigate('/pos');

                        window.location = '/pose/pos';
                    }, 2000);

                }
                else {
                    console.log(result);
                }
            })
            .catch((error) => console.error(error));

    }









    const checkOrder = () => {


        const idPrintS = localStorage.getItem('idPrint')


        const myHeaders = new Headers();
        myHeaders.append("Accept", "application/json");
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("X-API-KEY", token);

        const raw = JSON.stringify({
            amount: ticketSummary.amount,
            payment_method: ticketSummary.payment_method,
            machine_id: machine_id,
            user,
            machine
        });
        console.log(raw)
        const requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: raw,
            redirect: "follow"
        };

        fetch(`${API_ENDPOINT}/api/v1/zoo/pos/last_order`, requestOptions)
            .then((response) => response.json())
            .then((result) => {
                if (result.status === "success") {
                    // clearInterval(timer);
                    // const printUrl = idPrint === 2
                    //     ? `http://localhost/pos_client_print/print_group.php?id=${result.order.id}&r=0&ep=${PRINTER_ENDPOINT}`
                    //     : `http://localhost/pos_client_print/index.php?id=${result.order.id}&r=0&ep=${PRINTER_ENDPOINT}`;

                    const printUrl = localStorage.getItem('idPrint') === '2'
                        ? `http://localhost/pos_client_print/print_group.php?id=${result.order.id}&r=0&ep=${PRINTER_ENDPOINT}`
                        : localStorage.getItem('idPrint') === '1'
                            ? `http://localhost/pos_client_print/index.php?id=${result.order.id}&r=0&ep=${PRINTER_ENDPOINT}`
                            : `http://localhost/pos_client_print/print_group.php?id=${result.order.id}&r=0&ep=${PRINTER_ENDPOINT}`;

                    const printWindow = window.open(printUrl, '_blank', 'width=600,height=400');
                    setPrintWindow(printWindow);
                    const checkWindowClosed = setInterval(() => {
                        if (printWindow && printWindow.closed) { // ตรวจสอบว่า printWindow ไม่เป็น null


                            clearInterval(checkWindowClosed); // หยุดตรวจสอบ

                            window.location = '/pose/pos'
                        }
                    }, 3000); // ทุก 3 วินาที
                    console.log('Printing URL:', printUrl);
                } else {
                    console.log(result)

                    Swal.fire({
                        title: result.status,
                        text: result.message,
                        icon: 'warning',
                        confirmButtonText: 'ตกลง',
                    }).then((result) => {
                        if (result.isConfirmed) {
                            window.location = '/pose/pos'
                        }
                    });

                }
            })
            .catch((error) => console.error(error));
    };

    const approve_order = {
        order: Order
    }

    // const Approved = (r) => {
    //     const jsonOrder = JSON.stringify(r);
    //     const jsonObject = JSON.parse(jsonOrder);
    //     console.log(jsonObject);

    //     const myHeaders = new Headers();
    //     myHeaders.append("Content-Type", "application/json");
    //     myHeaders.append("X-API-KEY", token);

    //     const raw = JSON.stringify({
    //         "order": jsonObject,
    //         "user": user,
    //         "machine": machine
    //     });
    //     console.log(raw)
    //     const requestOptions = {
    //         method: "POST",
    //         headers: myHeaders,
    //         body: raw,
    //         redirect: "follow"
    //     };

    //     fetch(`${API_ENDPOINT}/api/v1/zoo/pos/cash_approved`, requestOptions)
    //         .then((response) => response.json())
    //         .then((result) => console.log(result))
    //         .catch((error) => console.error(error));
    // }

    return (
        <div className="container mt-4 py-3">
            <div className="row">
                {/* Ticket Information Section */}
                <div className="col-md-6 mb-4">
                    <div className="card shadow-sm rounded-4">
                        <div className="card-header bg-gradient text-white bg-primary rounded-top-4">
                            <h5 className="mb-1">🎟️ ตั๋วเข้าชมสวนสัตว์: {localStorage.getItem('zooname') || ''}</h5>
                            <h6 className="text-light">
                                📅 วันที่เข้าชม: {new Date().toLocaleDateString('th-TH', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                })}
                            </h6>
                        </div>
                        {ticketSummary ? (
                            <div className="card-body">
                                <h5 className="mb-3 text-secondary">🧾 รายการคำสั่งซื้อ: {odid || ''}</h5>
                                <table className="table table-bordered table-striped table-hover">
                                    <thead className="table-light text-center">
                                        <tr>
                                            <th>รายการ</th>
                                            <th>ราคา</th>
                                            <th>จำนวน</th>
                                            <th>ราคารวม</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {ticketSummary.data.map((ticket) => (
                                            <tr key={ticket.elid}>
                                                <td>{ticket.name}</td>
                                                <td>{ticket.amount} บาท</td>
                                                <td>{ticket.input_val}</td>
                                                <td>{ticket.total_amount} บาท</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <div className="mt-3 text-end">
                                    <p className="mb-1">🧾 รวมรายการตั๋ว: <strong>{ticketSummary.data.reduce((sum, ticket) => sum + Number(ticket.input_val), 0)}</strong> ใบ</p>
                                    <p className="mb-0">💰 ยอดรวม: <strong>{ticketSummary.amount}</strong> บาท</p>
                                </div>
                            </div>
                        ) : (
                            <p className="card-body text-muted">ไม่มีข้อมูลสรุปการจองตั๋ว</p>
                        )}
                    </div>

                    <div className="card mt-3 bg-light shadow-sm rounded-4">
                        <div className="card-header bg-warning bg-gradient rounded-top-4">
                            <strong>📌 รายละเอียดคำสั่งซื้อ</strong>
                        </div>
                        <div className="card-body">
                            <p>🧾 หมายเลขคำสั่งซื้อ: {odid}</p>
                            <p>🔖 หมายเลขอ้างอิง 1: {Ref1}</p>
                            <p>🔖 หมายเลขอ้างอิง 2: {Ref2}</p>
                            <p>💰 จำนวนเงิน: {Ioall} บาท</p>
                        </div>
                        <div className="card-footer text-end">
                            วันที่ทำรายการ: {new Date().toLocaleDateString('th-TH', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            })}
                        </div>
                    </div>
                </div>

                {/* Payment and Actions Section */}
                <div className="col-md-6">
                    <div className="alert alert-info text-center fs-5 rounded-4">
                        💳 วิธีการชำระ: <strong className="text-primary">เงินสด</strong>
                    </div>

                    <div className="row mt-4 text-center">
                        {loadingprin ? (
                            <div className="col-12">
                                <img width={150} src={redcard} alt="Loading..." />
                                <p className="fw-bold text-primary">
                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                    กำลังพิมพ์...
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="card">
                                    <div className="row">
                                        <div className="col-12 mb-3">
                                            <div className="mt-3 alert alert-info p-2 rounded-3">
                                                <div className="d-flex align-items-center gap-3 p-2 rounded-3">
                                                    <div className="form-check form-switch m-0">
                                                        <input
                                                            className="form-check-input"
                                                            type="checkbox"
                                                            id="gateCheck"
                                                            checked={gate === 1}
                                                            onChange={handleCheckboxChange}
                                                            style={{
                                                                transform: 'scale(1.8)',         // ขยายขนาด
                                                                cursor: 'pointer',
                                                                boxShadow: '0 0 5px rgba(0,0,0,0.3)', // เงารอบ checkbox
                                                                accentColor: '#0d6efd'            // เปลี่ยนสีติ๊กเป็น Bootstrap primary
                                                            }}
                                                        />
                                                    </div>
                                                    <label className="form-check-label mb-0" htmlFor="gateCheck">
                                                        <strong>เปิดใช้งานบัตรผ่านประตูขาเข้า</strong><br />

                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>


                                </div>

                                <div className='mt-3'></div>
                                <div className="col-6 mb-2">
                                    <button className="btn btn-primary w-100 shadow" onClick={() => handlePrint(false, 1)}>
                                        พิมพ์ตั๋วเดียว
                                    </button>
                                </div>
                                <div className="col-6 mb-2">
                                    <button className="btn btn-secondary w-100 shadow" onClick={() => handlePrint(true, 2)}>
                                        พิมพ์ตั๋วกลุ่ม
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="row mt-3">
                        <div className="col-4">
                            <button
                                className="btn btn-danger w-100"
                                onClick={cancelOrder}
                                disabled={loadingbtn}
                            >
                                {loadingbtn && (
                                    <span className="spinner-border spinner-border-sm me-1"></span>
                                )}
                                ยกเลิก
                            </button>
                        </div>
                    </div>

                    <div className="alert alert-warning text-center mt-3 rounded-4">
                        🧮 <strong>กรอกยอดเงินสดที่รับมาเพื่อคำนวณเงินทอน</strong>
                    </div>

                    <button
                        className="btn btn-warning rounded-circle shadow-lg"
                        style={{
                            position: 'fixed',
                            bottom: '20px',
                            right: '250px',
                            width: '60px',
                            height: '60px',
                            zIndex: 1050,
                            fontSize: '18px',
                        }}
                        onClick={() => setShowKeypad(true)}
                        title="คำนวณเงินทอน"
                    >
                        💰
                    </button>

                    {cashReceived && (
                        <div className="card bg-light border-success shadow-sm mt-3">
                            <div className="card-body">
                                <h5 className="card-title text-success mb-3">📋 สรุปรายการ</h5>

                                <p className="fs-5">
                                    💰 <strong className="text-primary">ยอดที่ต้องจ่าย:</strong>
                                    <span className="float-end">{parseFloat(ticketSummary.amount || 0).toFixed(2)} บาท</span>
                                </p>

                                <p className="fs-5">
                                    💵 <strong className="text-info">เงินที่รับมา:</strong>
                                    <span className="float-end">{parseFloat(cashReceived || 0).toFixed(2)} บาท</span>
                                </p>

                                <p className={`fs-5 ${change >= 0 ? 'text-success' : 'text-danger'}`}>
                                    🔄 <strong>เงินทอน:</strong>
                                    <span className="float-end fw-bold">
                                        {change >= 0 ? `${change.toFixed(2)} บาท` : 'ไม่พอจ่าย'}
                                    </span>
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Modal Keypad */}
                    {showKeypad && (
                        <div className="modal fade show d-block" tabIndex="-1" role="dialog">
                            <div className="modal-dialog modal-sm" role="document">
                                <div className="modal-content text-center p-3">
                                    <div className="modal-header">
                                        <h5 className="modal-title">💵 กรอกเงินที่รับมา</h5>
                                        <button
                                            type="button"
                                            className="btn-close"
                                            onClick={() => setShowKeypad(false)}
                                        ></button>
                                    </div>
                                    <div className="modal-body">
                                        <input
                                            type="text"
                                            className="form-control mb-3 text-center fs-5"
                                            value={cashReceived}
                                            readOnly
                                        />
                                        <div className="row g-2">
                                            {keypadButtons.map((btn, idx) => (
                                                <div className="col-4" key={idx}>
                                                    <button
                                                        className="btn btn-outline-primary w-100"
                                                        onClick={() => handleKeypadClick(btn)}
                                                    >
                                                        {btn}
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="modal-footer">
                                        <button className="btn btn-success w-100" onClick={calculateChange}>
                                            ตกลง
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

}

export default CashPage;



/// ui เดิม


// return (
//     <div className="container mt-4 py-2">
//         <div className="row">
//             {/* Ticket Information Section */}
//             <div className="col-md-6 mb-4">
//                 <div className="card">
//                     <div className="card-header bg-primary text-white">
//                         <h5>ตั๋วเข้าชมสวนสัตว์ : {localStorage.getItem('zooname') || ''}</h5>
//                         <h6>วันที่เข้าชม : {new Date().toLocaleDateString('th-TH', {
//                             year: 'numeric', month: 'long', day: 'numeric'
//                         })}</h6>
//                     </div>
//                     {ticketSummary ? (
//                         <div className="card-body">
//                             <h5>รายการ: {odid || ''}</h5>
//                             <table className="table table-bordered mt-3">
//                                 <thead className="table-light">
//                                     <tr>
//                                         <th>รายการ</th>
//                                         <th>ราคา</th>
//                                         <th>จำนวน</th>
//                                         <th>ราคารวม</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody>
//                                     {ticketSummary.data.map(ticket => (
//                                         <tr key={ticket.elid}>
//                                             <td>{ticket.name}</td>
//                                             <td>{ticket.amount} บาท</td>
//                                             <td>{ticket.input_val}</td>
//                                             <td>{ticket.total_amount} บาท</td>
//                                         </tr>
//                                     ))}
//                                 </tbody>
//                             </table>
//                             <div className="mt-3">
//                                 <h6>รวมรายการตั๋ว: {ticketSummary.data.reduce((sum, ticket) => sum + Number(ticket.input_val), 0)} ใบ</h6>
//                                 <h6>ยอดรวม: {ticketSummary.amount} บาท</h6>
//                             </div>
//                         </div>
//                     ) : (
//                         <p className="card-body text-muted">ไม่มีข้อมูลสรุปการจองตั๋ว</p>
//                     )}
//                 </div>

//                 {/* Order Details */}
//                 <div className="card mt-3" style={{ backgroundColor: '#fff2e7' }}>
//                     <div className="card-header">รายละเอียดคำสั่งซื้อ</div>
//                     <div className="card-body">
//                         <p>หมายเลขคำสั่งซื้อ : {odid}</p>
//                         <p>หมายเลขอ้างอิง 1 : {Ref1}</p>
//                         <p>หมายเลขอ้างอิง 2 : {Ref2}</p>
//                         <p>จำนวนเงิน : {Ioall} บาท</p>
//                     </div>
//                     <div className="card-footer text-end">
//                         วันที่ทำรายการ : {new Date().toLocaleDateString('th-TH', {
//                             year: 'numeric', month: 'long', day: 'numeric'
//                         })}
//                     </div>
//                 </div>
//             </div>

//             {/* Payment and Actions Section */}
//             <div className="col-md-6">
//                 <div className="alert alert-info text-center">
//                     <strong>วิธีการชำระ: ชำระด้วย / เงินสด</strong>
//                 </div>






//                 {/* อันดิมปุ่มพิมพ์ */}
//                 {/* <div className="row mt-4">
//                     <div className="col-6">
//                         <button
//                             className="btn btn-primary w-100"
//                             onClick={() => handlePrint(false, 1)}
//                             disabled={loadingbtn}
//                         >
//                             {loadingbtn && <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>}
//                             พิมพ์ตั๋วเดียว
//                         </button>
//                     </div>
//                     <div className="col-6">
//                         <button
//                             className="btn btn-secondary w-100"
//                             onClick={() => handlePrint(true, 2)}
//                             disabled={loadingbtn}
//                         >
//                             {loadingbtn && <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>}
//                             พิมพ์ตั๋วกลุ่ม
//                         </button>
//                     </div>
//                 </div> */}

//                 <div className="row mt-4 text-center">
//                     {loadingprin ? (
//                         // 🔹 ถ้ากำลังพิมพ์ ให้ซ่อนปุ่มทั้งหมดและแสดงข้อความแทน
//                         <div className="col-12">

//                             <img width={150} src={redcard} alt="Loading..." />
//                             <p className="fw-bold text-primary">
//                                 <span className="spinner-border spinner-border-sm me-2"></span>
//                                 กำลังพิมพ์...
//                             </p>
//                         </div>
//                     ) : (
//                         <>
//                             <div className="col-6">
//                                 <button
//                                     className="btn btn-primary w-100"
//                                     onClick={() => handlePrint(false, 1)}
//                                 >
//                                     พิมพ์ตั๋วเดียว
//                                 </button>
//                             </div>
//                             <div className="col-6">
//                                 <button
//                                     className="btn btn-secondary w-100"
//                                     onClick={() => handlePrint(true, 2)}
//                                 >
//                                     พิมพ์ตั๋วกลุ่ม
//                                 </button>
//                             </div>
//                         </>
//                     )}
//                 </div>


//                 <div className="row mt-3">

//                     <div className="col-4">
//                         <button className="btn btn-danger w-100" onClick={cancelOrder} disabled={loadingbtn}>
//                             {loadingbtn && <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>}
//                             ยกเลิก
//                         </button>
//                     </div>

//                     {/* <div className="col-8">
//                         {errorMessage && (
//                             <button onClick={checkOrder} className="btn btn-warning w-100">
//                                 ตรวจสอบรายการอีกครั้ง
//                             </button>
//                         )}
//                     </div> */}
//                 </div>
//                 <div className="alert alert-warning text-center mt-2">
//                     <strong>กรอกยอดเงินสดที่รับมาเพื่อคำนวณเงินทอน</strong>
//                 </div>
//                 <div className="col-12">
//                     <button
//                         className="btn btn-warning rounded-circle shadow-lg"
//                         style={{
//                             position: 'fixed',
//                             bottom: '20px',
//                             right: '250px',
//                             width: '60px',
//                             height: '60px',
//                             zIndex: 1050, // อยู่เหนือ modal
//                             fontSize: '14px',
//                         }}
//                         onClick={() => setShowKeypad(true)}
//                         title="คำนวณเงินทอน"
//                     >
//                         💰
//                     </button>


//                     {cashReceived && (
//                         <div className="card bg-light border-success shadow-sm">
//                             <div className="card-body">
//                                 <h5 className="card-title text-success mb-3">📋 สรุปรายการ</h5>

//                                 <p className="fs-5">
//                                     💰 <strong className="text-primary">ยอดที่ต้องจ่าย:</strong>
//                                     <span className="float-end text-dark">
//                                         {parseFloat(ticketSummary.amount || 0).toFixed(2)} บาท
//                                     </span>
//                                 </p>

//                                 <p className="fs-5">
//                                     💵 <strong className="text-info">เงินที่รับมา:</strong>
//                                     <span className="float-end text-dark">
//                                         {parseFloat(cashReceived || 0).toFixed(2)} บาท
//                                     </span>
//                                 </p>

//                                 <p className={`fs-5 ${change >= 0 ? 'text-success' : 'text-danger'}`}>
//                                     🔄 <strong>เงินทอน:</strong>
//                                     <span className="float-end fw-bold">
//                                         {change >= 0 ? `${change.toFixed(2)} บาท` : 'ไม่พอจ่าย'}
//                                     </span>
//                                 </p>
//                             </div>
//                         </div>
//                     )}


//                     {/* Modal Keypad */}
//                     {showKeypad && (
//                         <div className="modal fade show d-block" tabIndex="-1" role="dialog">
//                             <div className="modal-dialog modal-sm" role="document">
//                                 <div className="modal-content text-center p-3">
//                                     <div className="modal-header">
//                                         <h5 className="modal-title">กรอกเงินที่รับมา</h5>
//                                         <button type="button" className="btn-close" onClick={() => setShowKeypad(false)}></button>
//                                     </div>
//                                     <div className="modal-body">
//                                         <input
//                                             type="text"
//                                             className="form-control mb-3 text-center"
//                                             value={cashReceived}
//                                             readOnly
//                                         />
//                                         <div className="row g-2">
//                                             {keypadButtons.map((btn, idx) => (
//                                                 <div className="col-4" key={idx}>
//                                                     <button
//                                                         className="btn btn-outline-primary w-100"
//                                                         onClick={() => handleKeypadClick(btn)}
//                                                     >
//                                                         {btn}
//                                                     </button>
//                                                 </div>
//                                             ))}
//                                         </div>
//                                     </div>
//                                     <div className="modal-footer">
//                                         <button className="btn btn-success w-100" onClick={calculateChange}>
//                                             ตกลง
//                                         </button>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     )}

//                     {/* Modal แสดงผลลัพธ์ */}
//                     {/* {showResult && (
//                         <div className="modal fade show d-block" tabIndex="-1" role="dialog">
//                             <div className="modal-dialog" role="document">
//                                 <div className="modal-content p-3 border-success border-3 shadow-lg">
//                                     <div className="modal-header bg-success text-white">
//                                         <h5 className="modal-title">ผลลัพธ์</h5>
//                                         <button type="button" className="btn-close" onClick={closeModal}></button>
//                                     </div>
//                                     <div className="modal-body">
//                                         <div className="card bg-light border-success mb-3 shadow-sm">
//                                             <div className="card-body">
//                                                 <h5 className="card-title text-success mb-3">📋 สรุปรายการ</h5>

//                                                 <p className="fs-5">
//                                                     💰 <strong className="text-primary">ยอดที่ต้องจ่าย:</strong>
//                                                     <span className="float-end text-dark">
//                                                         {parseFloat(ticketSummary.amount || 0).toFixed(2)} บาท
//                                                     </span>
//                                                 </p>

//                                                 <p className="fs-5">
//                                                     💵 <strong className="text-info">เงินที่รับมา:</strong>
//                                                     <span className="float-end text-dark">
//                                                         {parseFloat(cashReceived || 0).toFixed(2)} บาท
//                                                     </span>
//                                                 </p>

//                                                 <p className={`fs-5 ${change >= 0 ? 'text-success' : 'text-danger'}`}>
//                                                     🔄 <strong>เงินทอน:</strong>
//                                                     <span className="float-end fw-bold">
//                                                         {change >= 0 ? `${change.toFixed(2)} บาท` : 'ไม่พอจ่าย'}
//                                                     </span>
//                                                 </p>
//                                             </div>
//                                         </div>
//                                     </div>
//                                     <div className="modal-footer">
//                                         <button className="btn btn-secondary w-100" onClick={closeModal}>ปิด</button>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     )} */}
//                 </div>

//             </div>
//         </div>
//     </div>
// );