let scanner = null;
const teacherPassword = "secure123"; // Set the teacher's password

function setupQRScanner() {
    scanner = new Instascan.Scanner({ video: document.getElementById('preview') });
    scanner.addListener('scan', function(content) {
        const studentName = content.trim();
        alert(`QR Code Scanned! Marking attendance for: ${studentName}`);
        addAttendanceRecord(studentName);
        captureAndRecognizeFace(studentName);
    });

    Instascan.Camera.getCameras().then(function(cameras) {
        if (cameras.length > 0) {
            scanner.start(cameras[0]);
        } else {
            alert('No cameras found.');
        }
    }).catch(e => console.error(e));
}

function stopQRScanner() {
    const enteredPassword = prompt("Enter the teacher's password to stop the scanner:");
    if (enteredPassword === teacherPassword) {
        if (scanner) {
            scanner.stop();
            alert('Scanner stopped.');
        }
    } else {
        alert("Incorrect password! Access denied.");
    }
}

function addAttendanceRecord(name) {
    const table = document.getElementById("attendanceTable").getElementsByTagName('tbody')[0];
    const row = table.insertRow();
    row.insertCell(0).innerText = name;
    row.insertCell(1).innerText = new Date().toLocaleString();
    row.insertCell(2).innerHTML = `<img id="${name}" width="100" height="100">`;
}

async function captureAndRecognizeFace(studentName) {
    const video = document.getElementById('preview');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = canvas.toDataURL('image/png');
    document.getElementById(studentName).src = imageData;
}

function exportToPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    let y = 20;
    doc.setFontSize(16);
    doc.text("Attendance Report", 80, 10);

    const table = document.getElementById("attendanceTable");
    const rows = table.getElementsByTagName("tbody")[0].getElementsByTagName("tr");

    for (let i = 0; i < rows.length; i++) {
        const cells = rows[i].getElementsByTagName("td");
        const name = cells[0].innerText;
        const time = cells[1].innerText;
        const img = cells[2].getElementsByTagName("img")[0].src;

        doc.text(`Name: ${name}`, 20, y);
        doc.text(`Time: ${time}`, 20, y + 10);
        doc.addImage(img, 'PNG', 20, y + 15, 40, 40);
        y += 60;
    }

    doc.save("attendance.pdf");
}

function clearAttendance() {
    const enteredPassword = prompt("Enter the teacher's password to clear attendance:");
    if (enteredPassword === teacherPassword) {
        const table = document.getElementById("attendanceTable").getElementsByTagName('tbody')[0];
        table.innerHTML = ""; // Clears all rows
        alert("Attendance records cleared.");
    } else {
        alert("Incorrect password! Access denied.");
    }
}
function exportToExcel() {
    let table = document.getElementById("attendanceTable");
    let wb = XLSX.utils.book_new();
    let ws = XLSX.utils.table_to_sheet(table);
    XLSX.utils.book_append_sheet(wb, ws, "Attendance");
    XLSX.writeFile(wb, "Attendance.xlsx");
}
