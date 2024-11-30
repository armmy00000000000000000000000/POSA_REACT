import React, { useState } from 'react';
import { json, useLocation, useNavigate } from 'react-router-dom';
import { API_ENDPOINT, PRINTER_ENDPOINT } from '../config/config';
import Swal from 'sweetalert2';
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
    const [isPrinting, setIsPrinting] = useState(false);
    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/posa/login';
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

        console.log("Summary to print:", summaryToPrint);
        const fetchData = async () => {
            setLoading(true);
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
                            // Approved(responseData.order);
                            const printUrl = `http://localhost/pos_client_print/index.php?id=${responseData.id}&r=0&ep=${PRINTER_ENDPOINT}`;
                            const printWindow = window.open(printUrl, '_blank', 'width=600,height=400');
                            setPrintWindow(printWindow);
                            const checkWindowClosed = setInterval(() => {
                                if (printWindow && printWindow.closed) { // ตรวจสอบว่า printWindow ไม่เป็น null
                                    setIsPrinting(false);  // รีเซ็ตสถานะหลังพิมพ์เสร็จ
                                    clearInterval(checkWindowClosed);
                                    // navigate('/pos');
                                    // กลับไปที่หน้า /pos
                                    window.location = '/posa/pos'
                                }
                            }, 3000);

                        } else {
                            // Approved(responseData.order);
                            const printUrl = `http://localhost/pos_client_print/print_group.php?id=${responseData.id}&r=0&ep=${PRINTER_ENDPOINT}`;
                            const printWindow = window.open(printUrl, '_blank', 'width=600,height=400');

                            const checkWindowClosed = setInterval(() => {
                                if (printWindow && printWindow.closed) { // ตรวจสอบว่า printWindow ไม่เป็น null
                                    setIsPrinting(false);
                                    clearInterval(checkWindowClosed);
                                    // navigate('/pos');
                                    window.location = '/posa/pos'
                                }
                            }, 3000);

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
        window.location = '/posa/pos'
    };

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

                            window.location = '/posa/pos'
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
                            window.location = '/posa/pos'
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
        <div className="container mt-4 py-2">
            <div className="row">
                {/* Ticket Information Section */}
                <div className="col-md-6 mb-4">
                    <div className="card">
                        <div className="card-header bg-primary text-white">
                            <h5>ตั๋วเข้าชมสวนสัตว์ : {localStorage.getItem('zooname') || ''}</h5>
                            <h6>วันที่เข้าชม : {new Date().toLocaleDateString('th-TH', {
                                year: 'numeric', month: 'long', day: 'numeric'
                            })}</h6>
                        </div>
                        {ticketSummary ? (
                            <div className="card-body">
                                <h5>รายการ: {odid || ''}</h5>
                                <table className="table table-bordered mt-3">
                                    <thead className="table-light">
                                        <tr>
                                            <th>รายการ</th>
                                            <th>ราคา</th>
                                            <th>จำนวน</th>
                                            <th>ราคารวม</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {ticketSummary.data.map(ticket => (
                                            <tr key={ticket.elid}>
                                                <td>{ticket.name}</td>
                                                <td>{ticket.amount} บาท</td>
                                                <td>{ticket.input_val}</td>
                                                <td>{ticket.total_amount} บาท</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <div className="mt-3">
                                    <h6>รวมรายการตั๋ว: {ticketSummary.data.length} ใบ</h6>
                                    <h6>ยอดรวม: {ticketSummary.amount} บาท</h6>
                                </div>
                            </div>
                        ) : (
                            <p className="card-body text-muted">ไม่มีข้อมูลสรุปการจองตั๋ว</p>
                        )}
                    </div>

                    {/* Order Details */}
                    <div className="card mt-3" style={{ backgroundColor: '#fff2e7' }}>
                        <div className="card-header">รายละเอียดคำสั่งซื้อ</div>
                        <div className="card-body">
                            <p>หมายเลขคำสั่งซื้อ : {odid}</p>
                            <p>หมายเลขอ้างอิง 1 : {Ref1}</p>
                            <p>หมายเลขอ้างอิง 2 : {Ref2}</p>
                            <p>จำนวนเงิน : {Ioall} บาท</p>
                        </div>
                        <div className="card-footer text-end">
                            วันที่ทำรายการ : {new Date().toLocaleDateString('th-TH', {
                                year: 'numeric', month: 'long', day: 'numeric'
                            })}
                        </div>
                    </div>
                </div>

                {/* Payment and Actions Section */}
                <div className="col-md-6">
                    <div className="alert alert-info text-center">
                        <strong>วิธีการชำระ: ชำระด้วย / เงินสด</strong>
                    </div>






                    {/* Action Buttons */}
                    <div className="row mt-4">
                        <div className="col-6">
                            <button
                                className="btn btn-primary w-100"
                                onClick={() => handlePrint(false, 1)}
                                disabled={loadingbtn}
                            >
                                {loadingbtn && <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>}
                                พิมพ์ตั๋วเดียว
                            </button>
                        </div>
                        <div className="col-6">
                            <button
                                className="btn btn-secondary w-100"
                                onClick={() => handlePrint(true, 2)}
                                disabled={loadingbtn}
                            >
                                {loadingbtn && <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>}
                                พิมพ์ตั๋วกลุ่ม
                            </button>
                        </div>
                    </div>

                    <div className="row mt-3">
                        <div className="col-4">
                            <button className="btn btn-danger w-100" onClick={cancelOrder} disabled={loadingbtn}>
                                {loadingbtn && <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>}
                                ยกเลิก
                            </button>
                        </div>
                        <div className="col-8">
                            {errorMessage && (
                                <button onClick={checkOrder} className="btn btn-warning w-100">
                                    ตรวจสอบรายการอีกครั้ง
                                </button>
                            )}
                        </div>
                    </div>

                    {/* {errorMessage && (
                        <div className="mt-4">
                         
                        </div>
                    )} */}
                </div>
            </div>
        </div>
    );

    // return (
    //     <div className="container mt-4 py-2">

    //         <div className='row'>
    //             <div className='col-6'>
    //                 <h3>ตั๋วเข้าชมสวนสัตว์ : {localStorage.getItem('zooname') || ''}</h3>
    //                 {/* {odid} {Ref1} {Ref2}      {idPrint}   {token} */}
    //                 <h3>วันที่เข้าชม : {new Date().toLocaleDateString('th-TH', {
    //                     year: 'numeric', month: 'long', day: 'numeric'
    //                 })}</h3>

    //         {ticketSummary ? (
    //             <div>
    //                 {/* <pre>{JSON.stringify(Order)}</pre> */}
    //                 <h2>รายการ {odid || ''}  {localStorage.getItem('idPrint')}</h2>
    //                 <table className="table table-bordered">
    //                     <thead>
    //                         <tr>
    //                             <th>รายการ</th>
    //                             <th>ราคา</th>
    //                             <th>จำนวน</th>
    //                             <th>ราคารวม</th>
    //                         </tr>
    //                     </thead>
    //                     <tbody>
    //                         {ticketSummary.data.map(ticket => (
    //                             <tr key={ticket.elid}>
    //                                 <td>{ticket.name}</td>
    //                                 <td>{ticket.amount} บาท</td>
    //                                 <td>{ticket.input_val}</td>
    //                                 <td>{ticket.total_amount} บาท</td>
    //                             </tr>
    //                         ))}
    //                     </tbody>
    //                 </table>

    //                 <div className="mt-3">
    //                     <h4>รวมรายการตั๋ว : {ticketSummary.data.length} ใบ</h4>
    //                     <h4>ยอดรวม : {ticketSummary.amount} บาท</h4>
    //                 </div>




    //             </div>
    //         ) : (
    //             <p>No ticket summary available.</p>
    //         )}

    //             </div>



    //             <div className='col-6'>

    //             <div className="mt-3">
    //                     <h4>วิธีการชำระ</h4>
    //                     <p>ชำระด้วย เงินสด</p>
    //                 </div>

    //                 <div className="alert alert-warning mt-3">
    //                     <strong>เงินสด Section:</strong>
    //                     <p>หากข้อมูลบันทึกเข้าสู่ระบบแล้วจะไม่สามารถกดปุ่มยกเลิกได้</p>
    //                 </div>
    //                 {loading && <p>กำลังโหลด...</p>}
    //                 {errorMessage && <div className="alert alert-danger">
    //                     <p>{'เกิดข้อผิดพลาด กรุณาลองทำรายการใหม่อีกครั้ง ตรวจสอบรายการอีกครั้ง'}</p>
    //                 </div>}
    //                 <div className="mt-4">
    //                     <button
    //                         className="btn btn-primary py-2 mx-3"
    //                         onClick={() => handlePrint(false, 1)}
    //                         disabled={loadingbtn}
    //                     >
    //                         {loadingbtn && <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>}
    //                         พิมพ์ตั๋วเดียว
    //                     </button>
    //                     <button
    //                         className="btn btn-secondary py-2 mx-3"
    //                         onClick={() => handlePrint(true, 2)}
    //                         disabled={loadingbtn}
    //                     >
    //                         {loadingbtn && <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>}
    //                         พิมพ์ตั๋วกลุ่ม
    //                     </button>
    //                     <button
    //                         className="btn btn-danger py-2 mx-3"
    //                         onClick={cancelOrder}
    //                         disabled={loadingbtn}
    //                     >
    //                         {loadingbtn && <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>}
    //                         ยกเลิก
    //                     </button>
    //                     {errorMessage &&
    //                         <button onClick={checkOrder} className="btn btn-warning">
    //                             ตรวจสอบรายการอีกครั้ง
    //                         </button>
    //                     }
    //                     <button onClick={checkOrder} className="btn btn-warning">
    //                         ตรวจสอบรายการอีกครั้ง
    //                     </button>
    //                 </div>
    //             </div>

    //         </div>



    //     </div>
    // );
}

export default CashPage;
