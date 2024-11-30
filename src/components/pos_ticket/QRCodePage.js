


import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINT, PRINTER_ENDPOINT } from '../config/config';
import Swal from 'sweetalert2';
function QRCodePage() {
    const location = useLocation();
    const { ticketSummary } = location.state || {};
    const [odid, setOdid] = useState(null);
    const [odderid, setOdderid] = useState('');
    const [Ioall, setIoall] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [countdown, setCountdown] = useState(300); // 5 minutes in seconds
    const [isDisabled, setIsDisabled] = useState(false);
    const token = localStorage.getItem('token');
    const [remainingTime, setRemainingTime] = useState(300); // 5 minutes in seconds
    const [isExpired, setIsExpired] = useState(false);
    const user = localStorage.getItem('user');
    const id = localStorage.getItem('id');

    const [checkingPayment, setCheckingPayment] = useState(false);
    const [paymentMessage, setPaymentMessage] = useState('');
    const [showCancelAndCheckButtons, setShowCancelAndCheckButtons] = useState(false);
    const [isCheckPaymentEnabled, setIsCheckPaymentEnabled] = useState(true);

    const [isProcessing, setisProcessing] = useState(false);
    const [printWindow, setPrintWindow] = useState(null); // ตัวแปรเก็บหน้าต่างพิมพ์
    const [Ref1, setRef1] = useState('');
    const [Ref2, setRef2] = useState('');
    const [IDprint, setIDprint] = useState('');
    const [ID, setID] = useState('');
    const navigate = useNavigate();
    let timer;
    useEffect(() => {
        let timer;
        if (countdown > 0 && isDisabled) {
            timer = setInterval(() => {
                setCountdown(prev => prev - 1);
            }, 1000);
        } else if (countdown === 0) {
            setIsDisabled(false);
            setCountdown(300); // Reset countdown
        }
        return () => clearInterval(timer);
    }, [countdown, isDisabled]);

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/posa/login';
    };
    const handlePrint = async (isGroupPrint, idprint) => {
        if (isProcessing) return;
        setisProcessing(true)
        setShowCancelAndCheckButtons(true);
        const summaryToPrint = { ...ticketSummary };

        summaryToPrint.group = isGroupPrint ? 2 : 1; // Group or single ticket print
        console.log("Summary to print:", summaryToPrint);
        const fetchData = async () => {
            setLoading(true);
            setErrorMessage('');

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

                    if (responseData.status === 'success') {
                        setOdid(responseData.id);
                        setOdderid(responseData.id);
                        setID(responseData.id);
                        setRef1(responseData.order.ref1);
                        setRef2(responseData.order.ref2);
                        setIDprint(idprint);
                        setIoall(responseData.order.amount);


                        time_check(responseData.order.ref1, responseData.order.ref2, idprint, responseData.id)
                        console.log(responseData.order.ref1);
                        console.log(responseData.order.ref2);
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

        // Disable buttons and start countdown after initiating print
        setIsDisabled(true);
        setCountdown(300); // Reset countdown
        await fetchData();
    };

    const check_payment = (ref1, ref2, timer, idprint, id_order) => {


        if (!isCheckPaymentEnabled) return;


        setIsCheckPaymentEnabled(false);
        setCheckingPayment(true); // เริ่มต้นการตรวจสอบ
        setPaymentMessage('กำลังเช็คข้อมูล...'); // แสดงข้อความกำลังเช็คข้อมูล


        setTimeout(() => {
            setIsCheckPaymentEnabled(true);
            setCheckingPayment(false);
        }, 8000);



        const myHeaders = new Headers();
        myHeaders.append("Accept", "application/json");
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("X-API-KEY", token);

        const raw = JSON.stringify({
            "ref1": ref1,
            "ref2": ref2
        });

        const requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: raw,
            redirect: "follow"
        };

        fetch(`${API_ENDPOINT}/api/v1/zoo/pos/check_payment`, requestOptions)
            .then((response) => response.json())
            .then((result) => {
                if (result.respMsg === "Unsuccess") {

                    setPaymentMessage('ยังไม่มีไม่มีการชำระเงิน'); // แสดงข้อความเมื่อไม่สำเร็จ
                    console.log(result)
                    console.log(idprint)


                } else if (result.respMsg === "Success") {
                    scan_success()
                    // clearInterval(timer);
                    const printUrl = idprint === 2
                        ? `http://localhost/pos_client_print/print_group.php?id=${id_order}&r=0&ep=${PRINTER_ENDPOINT}`
                        : `http://localhost/pos_client_print/index.php?id=${id_order}&r=0&ep=${PRINTER_ENDPOINT}`;
                    const printWindow = window.open(printUrl, '_blank', 'width=600,height=400');
                    setPrintWindow(printWindow);
                    const checkWindowClosed = setInterval(() => {
                        if (printWindow && printWindow.closed) { // ตรวจสอบว่า printWindow ไม่เป็น null
                            // alert("พิมพ์เสร็จสิ้น");
                            // clearInterval(timer); // หยุด timer ถ้าต้องการ
                            setCheckingPayment(false);
                            clearInterval(checkWindowClosed); // หยุดตรวจสอบ
                            // navigate('/pos'); // เปลี่ยนเส้นทาง
                            window.location = '/posa/pos';
                        }
                    }, 3000); // ทุก 3 วินาที
                    console.log('Printing URL:', printUrl);


                } else {
                    setPaymentMessage('มีข้อผิดพลาดกรุณาติดต่อ Admin'); // แสดงข้อความเมื่อไม่สำเร็จ
                }
            })
            .catch((error) => console.error(error));
    };



    const check_paymentre = (ref1, ref2, timer, idprint, id_order) => {


        if (!isCheckPaymentEnabled) return;


        setIsCheckPaymentEnabled(false);
        setCheckingPayment(true); // เริ่มต้นการตรวจสอบ
        setPaymentMessage('กำลังเช็คข้อมูล...'); // แสดงข้อความกำลังเช็คข้อมูล


        setTimeout(() => {
            setIsCheckPaymentEnabled(true);
            setCheckingPayment(false);
        }, 5000);



        const myHeaders = new Headers();
        myHeaders.append("Accept", "application/json");
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("X-API-KEY", token);

        const raw = JSON.stringify({
            "ref1": ref1,
            "ref2": ref2
        });

        const requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: raw,
            redirect: "follow"
        };

        fetch(`${API_ENDPOINT}/api/v1/zoo/pos/check_payment`, requestOptions)
            .then((response) => response.json())
            .then((result) => {
                if (result.respMsg === "Unsuccess") {
                    Order_cancel(ref1, ref2);
                    console.log(result)
                    console.log(idprint)


                } else {
                    scan_success()
                    // clearInterval(timer);
                    const printUrl = idprint === 2
                        ? `http://localhost/pos_client_print/print_group.php?id=${id_order}&r=0&ep=${PRINTER_ENDPOINT}`
                        : `http://localhost/pos_client_print/index.php?id=${id_order}&r=0&ep=${PRINTER_ENDPOINT}`;
                    const printWindow = window.open(printUrl, '_blank', 'width=600,height=400');

                    const checkWindowClosed = setInterval(() => {
                        if (printWindow && printWindow.closed) { // ตรวจสอบว่า printWindow ไม่เป็น null
                            // alert("พิมพ์เสร็จสิ้น");
                            // clearInterval(timer); // หยุด timer ถ้าต้องการ
                            setCheckingPayment(false);
                            clearInterval(checkWindowClosed); // หยุดตรวจสอบ
                            window.location = '/posa/pos';
                            // navigate('/pos'); // เปลี่ยนเส้นทาง
                        }
                    }, 3000); // ทุก 3 วินาที
                    console.log('Printing URL:', printUrl);


                }
            })
            .catch((error) => console.error(error));
    };


    const scan_success = () => {
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("X-API-KEY", token);

        const raw = JSON.stringify({
            "order_id": odderid,
            "user": JSON.parse(user),
        });

        const requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: raw,
            redirect: "follow"
        };

        fetch(`${API_ENDPOINT}/api/v1/zoo/pos/scan_success_boardcash`, requestOptions)
            .then((response) => response.json())
            .then((result) => { console.log(result) })
            .catch((error) => console.error(error));
    }

    const time_check = (ref1, ref2, idprint, id_order) => {
        console.log(ref1, ref2)


        setRemainingTime(300);
        timer = setInterval(() => {
            // check_payment(ref1, ref2, timer, idprint, id_order);

            setRemainingTime(prevTime => {
                console.log(prevTime)
                if (prevTime === 0) {
                    check_paymentre(ref1, ref2, timer, idprint, id_order);
                    clearInterval(timer);



                    setIsDisabled(false);
                    return 0;
                }
                return prevTime - 1;
            });
        }, 1000);



        return () => clearInterval(timer);
    };

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    };

    const cancelOrder = () => {
        Swal.fire({
            title: 'ยืนยันการยกเลิกรายการ',
            text: "คุณต้องการยกเลิกรายการนี้ใช่ไหม?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'ใช่',
            cancelButtonText: 'ไม่'
        }).then((result) => {
            if (result.isConfirmed) {
                Order_cancel(Ref1, Ref2); // เรียกใช้ฟังก์ชันหากกดยืนยัน
                Swal.fire(
                    'ยกเลิกเรียบร้อย!',
                    'รายการของคุณถูกยกเลิกแล้ว.',
                    'success'
                );
            }
        });
    };

    const Order_cancel = (ref1, ref2) => {
        console.log(ref1, ref2)
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("X-API-KEY", token);

        const raw = JSON.stringify({
            "ref1": String(ref1), // แปลงเป็นสตริง
            "ref2": String(ref2), // แปลงเป็นสตริง
            "user": JSON.parse(user),
        });
        console.log(raw)
        const requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: raw,
            redirect: "follow"
        };

        fetch(`${API_ENDPOINT}/api/v1/zoo/pos/ticket_order_cancel`, requestOptions)
            .then((response) => response.json())
            .then((result) => {
                console.log(result)
                if (result.status === "cancel") {
                    // alert("รายการนี้ถูกยกเลิกแล้วกรุณาทำรายการใหม่")
                    setTimeout(() => {
                        // navigate('/pos');
                        window.location = '/posa/pos'; // เปลี่ยนเส้นทางไปยัง /pos หลังจาก 3 วินาที
                    }, 2000); // 3000 มิลลิวินาที = 3 วินาที
                }
            })
            .catch((error) => console.error(error));
    }
    const reOrder = () => {
        window.location.reload();
    }



    const qrcode_approve = (r1, r2) => {
        Swal.fire({
            title: "ยืนยันการอนุมัติ",
            text: "คุณต้องการยืนยันการอนุมัติรายการนี้หรือไม่?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "ยืนยัน",
            cancelButtonText: "ยกเลิก",
        }).then((result) => {
            if (result.isConfirmed) {
                const myHeaders = new Headers();
                myHeaders.append("Content-Type", "application/json");
                myHeaders.append("X-API-KEY", token);

                const raw = JSON.stringify({
                    "ref1": r1,
                    "ref2": r2,
                    "approve_by": id
                });

                const requestOptions = {
                    method: "POST",
                    headers: myHeaders,
                    body: raw,
                    redirect: "follow"
                };

                fetch(`${API_ENDPOINT}/api/v1/zoo/pos/qrcode_approve`, requestOptions)
                    .then((response) => response.json())
                    .then((result) => {
                        if (result.status === 'approved') {
                            Swal.fire({
                                title: "อนุมัติสำเร็จ!",
                                text: "กดตรวจสอบการชำระเงินอีกครั้ง.",
                                icon: "success",
                            });
                        } else {
                            Swal.fire({
                                title: "เกิดข้อผิดพลาด!",
                                text: result.message || "โปรดลองอีกครั้ง หรือติดต่อ Admin.",
                                icon: "error",
                            });
                        }
                    })
                    .catch((error) => {
                        console.error(error);
                        Swal.fire({
                            title: "เกิดข้อผิดพลาด!",
                            text: "โปรดลองอีกครั้ง หรือติดต่อ Admin.",
                            icon: "error",
                        });
                    });
            }
        });
    };



    return (
        <div className="container mt-4 py-2">
            <div className="row">
                {/* Ticket Information Section */}
                <div className="col-md-6 mb-4">
                    <div className="card">
                        <div className="card-header">
                            <h5>ตั๋วเข้าชมสวนสัตว์ : {localStorage.getItem('zooname') || ''}</h5>
                            <h6>วันที่เข้าชม : {new Date().toLocaleDateString('th-TH', {
                                year: 'numeric', month: 'long', day: 'numeric'
                            })}</h6>
                        </div>
                        {ticketSummary ? (
                            <div className="card-body">
                                <h2>รายการ {odderid || ''}</h2>
                                <table className="table table-bordered">
                                    <thead>
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
                                    <h6>รวมรายการตั๋ว : {ticketSummary.data.length} ใบ</h6>
                                    <h6>ยอดรวม : {ticketSummary.amount} บาท</h6>
                                </div>
                            </div>
                        ) : (
                            <p className="card-body">No ticket summary available.</p>
                        )}
                    </div>

                    {/* Order Details */}
                    <div className="card mt-3" style={{ backgroundColor: '#fff2e7' }}>
                        <div className="card-header">รายละเอียดคำสั่งซื้อ</div>
                        <div className="card-body">
                            <p>หมายเลขคำสั่งซื้อ : {odderid}</p>
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
                    <div className="bd-callout bd-callout-warning mt-3">
                        <h5>วิธีการชำระ : <b className="text-success">ชำระด้วย QR-CODE</b> / <b className="text-primary">QR CODE</b></h5>
                    </div>

                    {isDisabled && (
                        <div className="alert alert-info mt-3">
                            <strong>ดำเนินการสแกน QR-CODE :</strong> {formatTime(remainingTime)}
                        </div>
                    )}

                    <div className="alert alert-primary mt-3">
                        <p>กดตรวจสอบทุกครั้งหลังลูกค้าสแกนจ่ายเงินแล้ว</p>
                        <button onClick={() => check_payment(Ref1, Ref2, timer, IDprint, ID)} disabled={!isCheckPaymentEnabled} id="check-payment-button" className="btn btn-primary w-100"><b>ตรวจสอบการชำระเงิน</b></button>
                    </div>
                    {checkingPayment && <p className="alert alert-info mt-3" >{paymentMessage}</p>} {/* แสดงข้อความ */}
                    {loading && <p>กำลังโหลด...</p>}
                    {errorMessage && <div className="alert alert-danger">
                        <p>{errorMessage}</p>
                    </div>}

                    {/* {showCancelAndCheckButtons && (
                        <div className="alert alert-warning mt-3">
                            <p>มีหลักฐานการโอนแล้ว ตรวจสอบการชำระเงินไม่สำเร็จ</p>
                            <button onClick={() => qrcode_approve(Ref1, Ref2)} disabled={!isCheckPaymentEnabled} className="btn btn-warning w-100"><b>Approve รายการ</b></button>
                        </div>
                    )} */}

                    <div className="mt-4">
                        <div className="row">
                            <div className="col-6">
                                <button className="btn btn-primary w-100" onClick={() => handlePrint(false, 1)} disabled={isDisabled}>
                                    พิมพ์ตั๋วเดียว
                                </button>
                            </div>
                            <div className="col-6">
                                <button className="btn btn-secondary w-100" onClick={() => handlePrint(true, 2)} disabled={isDisabled}>
                                    พิมพ์ตั๋วกลุ่ม
                                </button>
                            </div>
                        </div>

                        <div className="row mt-3">
                            <div className="col-4">
                                <button className="btn btn-danger w-100" onClick={() => cancelOrder()}>
                                    ยกเลิก
                                </button>
                            </div>
                            <div className="col-8">
                                <button className="btn btn-info w-100" onClick={reOrder}>
                                    QR Code สแกนไม่ได้ทำรายการอีกครั้ง
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );


    // return (
    //     <div className="container mt-4 py-2">
    //         <div className='row'>
    //             <div className='col-6'>
    //                 <h3>ตั๋วเข้าชมสวนสัตว์ : {localStorage.getItem('zooname') || ''}</h3>
    //                 <h3>วันที่เข้าชม : {new Date().toLocaleDateString('th-TH', {
    //                     year: 'numeric', month: 'long', day: 'numeric'
    //                 })}</h3>

    //                 {ticketSummary ? (
    //                     <div>
    //                         <h2>รายการ {odderid || ''}</h2>
    //                         <table className="table table-bordered">
    //                             <thead>
    //                                 <tr>
    //                                     <th>รายการ</th>
    //                                     <th>ราคา</th>
    //                                     <th>จำนวน</th>
    //                                     <th>ราคารวม</th>
    //                                 </tr>
    //                             </thead>
    //                             <tbody>
    //                                 {ticketSummary.data.map(ticket => (
    //                                     <tr key={ticket.elid}>
    //                                         <td>{ticket.name}</td>
    //                                         <td>{ticket.amount} บาท</td>
    //                                         <td>{ticket.input_val}</td>
    //                                         <td>{ticket.total_amount} บาท</td>
    //                                     </tr>
    //                                 ))}
    //                             </tbody>
    //                         </table>

    //                         <div className="mt-3">
    //                             <h4>รวมรายการตั๋ว : {ticketSummary.data.length} ใบ</h4>
    //                             <h4>ยอดรวม : {ticketSummary.amount} บาท</h4>
    //                         </div>




    //                         {/* {loading && <p>กำลังโหลด...</p>}
    //                 {errorMessage && <div className="alert alert-danger">{errorMessage}</div>} */}
    //                     </div>
    //                 ) : (
    //                     <p>No ticket summary available.</p>
    //                 )}
    //             </div>

    //             <div className='col-6'>

    //                 <div className="mt-3">
    //                     <h4>วิธีการชำระ</h4>
    //                     <p>ชำระด้วย QR-CODE</p>
    //                 </div>
    //                 {isDisabled && (
    //                     <div className="alert alert-info mt-3">
    //                         <strong>ดำเนินการสแกน QR-CODE :</strong> {formatTime(remainingTime)}
    //                     </div>
    //                 )}
    //                 {showCancelAndCheckButtons && (
    //                     <div className="alert alert-warning mt-3">
    //                         <p>หากลูกค้าได้มีการชำระเงินแล้วรายการขึ้น Pending กรุณาตรวจสอบสลิปการโอนก่อนกด Approved *ให้กดตรวจสอบการชำระก่อนทุกครั้ง*</p>
    //                         <button onClick={() => qrcode_approve(Ref1, Ref2)}
    //                             id="check-payment-button"
    //                             className="btn btn-success mx-3"
    //                             disabled={!isCheckPaymentEnabled} // Disable if not enabled
    //                         >
    //                             Approved
    //                         </button>
    //                     </div>
    //                 )}
    //                 {checkingPayment && <p className="alert alert-info mt-3" >{paymentMessage}</p>} {/* แสดงข้อความ */}
    //                 {loading && <p>กำลังโหลด...</p>}
    //                 {errorMessage && <div className="alert alert-danger">
    //                     <p>{errorMessage}</p>
    //                 </div>}
    //                 {isExpired ? (
    //                     <div className="mt-4">
    //                         <Link to='/pos' className="btn btn-danger py-2 mx-3" >
    //                             รายการถูกยกเลิกยกเลิก
    //                         </Link>
    //                     </div>

    //                 ) : (
    //                     <div className="mt-4">
    //                         <button className="btn btn-primary py-2 mx-3" onClick={() => handlePrint(false, 1)} disabled={isDisabled}>
    //                             พิมพ์ตั๋วเดียว
    //                         </button>
    //                         <button className="btn btn-secondary py-2 mx-3" onClick={() => handlePrint(true, 2)} disabled={isDisabled}>
    //                             พิมพ์ตั๋วกลุ่ม
    //                         </button>

    //                         {showCancelAndCheckButtons && (
    //                             <>
    //                                 <button onClick={reOrder} className="btn btn-info">
    //                                     QR Code สแกนไม่ได้ทำรายการอีกครั้ง
    //                                 </button>
    //                                 <button className="btn btn-danger py-2 mx-3 mt-3" onClick={() => cancelOrder()}>
    //                                     ยกเลิก
    //                                 </button>
    //                                 <button onClick={() => check_payment(Ref1, Ref2, timer, IDprint, ID)}
    //                                     id="check-payment-button"
    //                                     className="btn btn-success mx-3 mt-3"
    //                                     disabled={!isCheckPaymentEnabled} // Disable if not enabled
    //                                 >
    //                                     ตรวจสอบการชำระเงิน
    //                                 </button>


    //                             </>
    //                         )}
    //                         {errorMessage &&
    //                             <button onClick={reOrder} className="btn btn-warning">
    //                                 เกิดข้อผิดพลาดกรุณาทำรายการใหม่
    //                             </button>
    //                         }
    //                     </div>
    //                 )}


    //             </div>

    //         </div>



    //     </div>
    // );

}

export default QRCodePage;
