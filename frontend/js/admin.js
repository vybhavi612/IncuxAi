async function loadAttendance(){

    try {

        const response = await fetch(

            "http://localhost:5000/api/admin/attendance"

        );

        const records =
        await response.json();

        console.log(records);

        const tableBody =
        document.querySelector(
            "#attendanceTable tbody"
        );

        tableBody.innerHTML = "";

        let lateCount = 0;

        const uniqueStudents =
        new Set();

        records.forEach(record => {

            uniqueStudents.add(
                record.studentId
            );

            if(record.status === "Late"){

                lateCount++;

            }

            const loginHistory =

            record.loginHistory

            ?

            record.loginHistory.join(
                "<br>"
            )

            :

            record.loginTime;

            const row = `

                <tr>

                    <td>

                        ${record.fullName}

                    </td>

                    <td class="${
                        record.status === "Late"
                        ? "red"
                        : "green"
                    }">

                        ${record.status}

                    </td>

                    <td>

                        ${record.loginTime || "-"}

                    </td>

                    <td>

                        ${
                            record.lastLoginTime
                            || record.loginTime
                            || "-"
                        }

                    </td>

                    <td>

                        ${
                            record.loginCount
                            || 1
                        }

                    </td>

                    <td>

                        ${
                            record.delayMinutes
                        } mins

                    </td>

                    <td>

                        ${
                            record.logoutTime
                            || "-"
                        }

                    </td>

                    <td>

                        ${
                            record.totalSessionMinutes
                            || "-"
                        } mins

                    </td>

                    <td class="${
                        record.workStatus === "Completed"
                        ? "green"
                        : "red"
                    }">

                        ${
                            record.workStatus
                            || "Working"
                        }

                    </td>

                    <td class="history-cell">

                        ${loginHistory}

                    </td>

                </tr>

            `;

            tableBody.innerHTML += row;

        });

        document.getElementById(
            "totalStudents"
        ).innerText =
        uniqueStudents.size;

        document.getElementById(
            "presentStudents"
        ).innerText =
        records.length - lateCount;

        document.getElementById(
            "lateStudents"
        ).innerText =
        lateCount;

        document.getElementById(
            "totalRecords"
        ).innerText =
        records.length;

    } catch(error){

        console.log(error);

    }

}

setInterval(() => {

    loadAttendance();

}, 5000);

loadAttendance();