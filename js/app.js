// Stomatologiya CRM - Asosiy Dastur Logikasi (Dashboard, Bemorlar, Xodimlar va Xizmatlar)

document.addEventListener("DOMContentLoaded", () => {
    // 1. Avtorizatsiyani tekshirish (Auth Guard)
    const currentUserStr = localStorage.getItem("dentacare_current_user");
    if (!currentUserStr) {
        window.location.href = "login.html";
        return;
    }

    const currentUser = JSON.parse(currentUserStr);
    initUserProfile(currentUser);

    // 2. Global Holat (State)
    let patients = getPatientsFromStorage();
    let services = getServicesFromStorage();
    let doctors = getDoctorsFromStorage();

    let currentFilterStatus = "all";
    let searchQuery = "";
    let reportSelectedMonth = "2026-09";
    let reportSelectedDoctor = "all";
    let reportSelectedStatus = "all";

    // 3. UI Elementlari
    const patientsTableBody = document.getElementById("patientsTableBody");
    const patientSearchInput = document.getElementById("patientSearchInput");
    const btnClearSearch = document.getElementById("btnClearSearch");
    const statusFilter = document.getElementById("statusFilter");
    const tableRecordInfo = document.getElementById("tableRecordInfo");
    const navPatientsCount = document.getElementById("navPatientsCount");
    const navServicesCount = document.getElementById("navServicesCount");
    const navDoctorsCount = document.getElementById("navDoctorsCount");

    // Bemor Modal elementlari
    const patientModal = document.getElementById("patientModal");
    const patientForm = document.getElementById("patientForm");
    const patientModalTitle = document.getElementById("patientModalTitle");
    const patientModalIcon = document.getElementById("patientModalIcon");
    const patientEditId = document.getElementById("patientEditId");
    const btnOpenAddPatientModal = document.getElementById("btnOpenAddPatientModal");
    const btnClosePatientModal = document.getElementById("btnClosePatientModal");
    const btnCancelPatient = document.getElementById("btnCancelPatient");

    // View Modal elementlari
    const viewPatientModal = document.getElementById("viewPatientModal");
    const viewModalPatientName = document.getElementById("viewModalPatientName");
    const viewModalPatientId = document.getElementById("viewModalPatientId");
    const viewPatientContent = document.getElementById("viewPatientContent");
    const btnCloseViewModal = document.getElementById("btnCloseViewModal");
    const btnCloseViewBtn = document.getElementById("btnCloseViewBtn");
    const btnEditFromView = document.getElementById("btnEditFromView");
    let activeViewingPatientId = null;

    // Yangi Xizmat Modal elementlari
    const serviceModal = document.getElementById("serviceModal");
    const serviceForm = document.getElementById("serviceForm");
    const btnOpenAddServiceModal = document.getElementById("btnOpenAddServiceModal");
    const btnCloseServiceModal = document.getElementById("btnCloseServiceModal");
    const btnCancelService = document.getElementById("btnCancelService");

    // Yangi Ishchi / Shifokor Modal elementlari
    const doctorModal = document.getElementById("doctorModal");
    const doctorForm = document.getElementById("doctorForm");
    const btnOpenAddDoctorModal = document.getElementById("btnOpenAddDoctorModal");
    const btnCloseDoctorModal = document.getElementById("btnCloseDoctorModal");
    const btnCancelDoctor = document.getElementById("btnCancelDoctor");

    // Chiqish (Logout)
    const btnLogout = document.getElementById("btnLogout");
    if (btnLogout) {
        btnLogout.addEventListener("click", () => {
            if (confirm("Haqiqatan ham tizimdan chiqmoqchimisiz?")) {
                localStorage.removeItem("dentacare_current_user");
                window.location.href = "login.html";
            }
        });
    }

    // Initsializatsiya
    initNavigation();
    initDateTime();
    populateFormSelects();

    // Dastlabki renderlar
    renderStats();
    renderPatientsTable();
    renderToothChart();
    renderServicesTab();
    renderDoctorsTab();
    initReportControls();
    renderMonthlyReports();

    // ==========================================================
    // FOYDALANUVCHI PROFILI
    // ==========================================================
    function initUserProfile(user) {
        const topHeaderUser = document.getElementById("topHeaderUser");
        const sidebarDoctorName = document.getElementById("sidebarDoctorName");

        if (topHeaderUser) topHeaderUser.textContent = user.fullName || user.username;
        if (sidebarDoctorName) sidebarDoctorName.textContent = user.fullName || "Dr. Ahmadbek";
    }

    // ==========================================================
    // STATISTIKA HISOBLASH VA CHIQARISH
    // ==========================================================
    function renderStats() {
        const statTotalPatients = document.getElementById("statTotalPatients");
        const statTodayVisits = document.getElementById("statTodayVisits");
        const statInTreatment = document.getElementById("statInTreatment");
        const statTotalRevenue = document.getElementById("statTotalRevenue");

        // Jami bemorlar soni
        const total = patients.length;
        if (statTotalPatients) statTotalPatients.textContent = total;
        if (navPatientsCount) navPatientsCount.textContent = total;

        // Bugungi sana bo'yicha qabullar
        const todayStr = new Date().toISOString().split("T")[0];
        const todayVisits = patients.filter(p => p.appointmentDate && p.appointmentDate.startsWith(todayStr)).length;
        if (statTodayVisits) statTodayVisits.textContent = todayVisits;

        // Davolanayotgan bemorlar
        const inTreatment = patients.filter(p => p.status === "Davolanmoqda").length;
        if (statInTreatment) statInTreatment.textContent = inTreatment;

        // Jami tushum summasi
        const totalRevenue = patients.reduce((acc, curr) => acc + (Number(curr.paidAmount) || 0), 0);
        if (statTotalRevenue) statTotalRevenue.textContent = formatCurrency(totalRevenue);

        // Dashboard Oylik Ko'rsatkichi (Joriy oy uchun)
        const currentMonthKey = "2026-09";
        const currentMonthPatients = patients.filter(p => {
            const dateStr = p.appointmentDate || p.createdAt || "";
            return dateStr.startsWith(currentMonthKey);
        });
        const currentMonthRev = currentMonthPatients.reduce((acc, curr) => acc + (Number(curr.paidAmount) || 0), 0);

        const dashMonthBannerTitle = document.getElementById("dashMonthBannerTitle");
        const dashMonthPatientsCount = document.getElementById("dashMonthPatientsCount");
        const dashMonthRevenueSum = document.getElementById("dashMonthRevenueSum");

        if (dashMonthBannerTitle) dashMonthBannerTitle.textContent = "2026-yil Sentabr Oyi";
        if (dashMonthPatientsCount) dashMonthPatientsCount.textContent = `${currentMonthPatients.length} ta bemor`;
        if (dashMonthRevenueSum) dashMonthRevenueSum.textContent = formatCurrency(currentMonthRev);
    }

    // ==========================================================
    // BEMORLAR JADVALINI RENDER QILISH
    // ==========================================================
    function renderPatientsTable() {
        if (!patientsTableBody) return;

        // Filtrlash
        let filtered = patients.filter(p => {
            const matchesStatus = (currentFilterStatus === "all") || (p.status === currentFilterStatus);
            const query = searchQuery.toLowerCase().trim();
            const matchesSearch = !query || 
                p.fullName.toLowerCase().includes(query) ||
                p.phone.toLowerCase().includes(query) ||
                p.diagnosis.toLowerCase().includes(query) ||
                p.id.toLowerCase().includes(query) ||
                (p.toothNumber && p.toothNumber.toLowerCase().includes(query));

            return matchesStatus && matchesSearch;
        });

        if (filtered.length === 0) {
            patientsTableBody.innerHTML = `
                <tr>
                    <td colspan="10" style="text-align: center; padding: 40px; color: #94a3b8;">
                        <i class="fa-regular fa-folder-open" style="font-size: 38px; margin-bottom: 12px; display: block; color: #cbd5e1;"></i>
                        <p style="font-size: 15px; font-weight: 600; color: #64748b;">Hech qanday bemor ma'lumoti topilmadi</p>
                        <small>Qidiruv shartlarini o'zgartiring yoki yangi bemor qo'shing</small>
                    </td>
                </tr>
            `;
            if (tableRecordInfo) tableRecordInfo.textContent = `Ko'rsatilmoqda: 0 ta bemor`;
            return;
        }

        patientsTableBody.innerHTML = filtered.map(patient => {
            const statusClass = getStatusClass(patient.status);
            const payClass = getPaymentClass(patient.paymentStatus);
            const formattedDate = formatDateTime(patient.appointmentDate);

            return `
                <tr>
                    <td><span class="id-badge">${patient.id}</span></td>
                    <td>
                        <div class="patient-cell">
                            <span class="patient-name">${escapeHtml(patient.fullName)}</span>
                            <span class="patient-sub">${patient.age} yosh &bull; ${patient.gender}</span>
                        </div>
                    </td>
                    <td>
                        <a href="tel:${patient.phone}" style="color: var(--primary); font-weight: 500;">
                            <i class="fa-solid fa-phone" style="font-size: 11px; margin-right: 4px;"></i>${escapeHtml(patient.phone)}
                        </a>
                    </td>
                    <td>
                        <span style="font-weight: 500;">${escapeHtml(patient.diagnosis)}</span>
                        ${patient.toothNumber ? `<span class="tooth-badge">Tish: ${escapeHtml(patient.toothNumber)}</span>` : ''}
                    </td>
                    <td><span style="color: #475569;">${escapeHtml(patient.serviceName || patient.serviceId || 'Konsultatsiya')}</span></td>
                    <td><span style="font-weight: 500; color: #334155;">${escapeHtml(patient.doctor)}</span></td>
                    <td style="white-space: nowrap;"><i class="fa-regular fa-clock" style="font-size: 12px; color: #94a3b8; margin-right: 4px;"></i>${formattedDate}</td>
                    <td>
                        <div>
                            <span class="pay-badge ${payClass}">${patient.paymentStatus || 'To\'langan'}</span>
                            <div style="font-size: 11.5px; color: #64748b; margin-top: 3px;">
                                ${formatCurrency(patient.paidAmount)} / ${formatCurrency(patient.totalAmount)}
                            </div>
                        </div>
                    </td>
                    <td>
                        <span class="status-pill ${statusClass}">${patient.status}</span>
                    </td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-icon view" title="Bemor kartasini ko'rish" data-id="${patient.id}">
                                <i class="fa-regular fa-eye"></i>
                            </button>
                            <button class="btn-icon edit" title="Tahrirlash" data-id="${patient.id}">
                                <i class="fa-regular fa-pen-to-square"></i>
                            </button>
                            <button class="btn-icon delete" title="O'chirish" data-id="${patient.id}">
                                <i class="fa-regular fa-trash-can"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join("");

        if (tableRecordInfo) {
            tableRecordInfo.textContent = `Ko'rsatilmoqda: ${filtered.length} ta bemor (Jami: ${patients.length} ta)`;
        }

        attachTableActionListeners();
    }

    function attachTableActionListeners() {
        document.querySelectorAll(".btn-icon.view").forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                openPatientViewModal(btn.getAttribute("data-id"));
            };
        });

        document.querySelectorAll(".btn-icon.edit").forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                openEditPatientModal(btn.getAttribute("data-id"));
            };
        });

        document.querySelectorAll(".btn-icon.delete").forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                deletePatient(btn.getAttribute("data-id"));
            };
        });
    }

    // ==========================================================
    // QIDIRUV VA STATUS FILTR
    // ==========================================================
    if (patientSearchInput) {
        patientSearchInput.addEventListener("input", (e) => {
            searchQuery = e.target.value;
            if (btnClearSearch) {
                if (searchQuery.length > 0) {
                    btnClearSearch.classList.remove("d-none");
                } else {
                    btnClearSearch.classList.add("d-none");
                }
            }
            renderPatientsTable();
        });
    }

    if (btnClearSearch) {
        btnClearSearch.addEventListener("click", () => {
            patientSearchInput.value = "";
            searchQuery = "";
            btnClearSearch.classList.add("d-none");
            renderPatientsTable();
            patientSearchInput.focus();
        });
    }

    if (statusFilter) {
        statusFilter.addEventListener("change", (e) => {
            currentFilterStatus = e.target.value;
            renderPatientsTable();
        });
    }

    // ==========================================================
    // FORMA SELECTLARINI TO'LDIRISH
    // ==========================================================
    function populateFormSelects() {
        const pDoctor = document.getElementById("pDoctor");
        const pService = document.getElementById("pService");

        if (pDoctor) {
            pDoctor.innerHTML = doctors.map(doc => 
                `<option value="${doc.name}">${doc.name} (${doc.specialty})</option>`
            ).join("");
        }

        if (pService) {
            pService.innerHTML = services.map(srv => 
                `<option value="${srv.name}" data-price="${srv.price}">${srv.name} — ${formatCurrency(srv.price)}</option>`
            ).join("");

            pService.onchange = () => {
                const selectedOpt = pService.selectedOptions[0];
                if (selectedOpt) {
                    const price = selectedOpt.getAttribute("data-price");
                    const pTotalAmount = document.getElementById("pTotalAmount");
                    const pPaidAmount = document.getElementById("pPaidAmount");
                    if (pTotalAmount && !patientEditId.value) {
                        pTotalAmount.value = price || "";
                        if (pPaidAmount) pPaidAmount.value = price || "";
                    }
                }
            };
        }
    }

    // ==========================================================
    // BEMOR QO'SHISH VA TAHRIRLASH
    // ==========================================================
    if (btnOpenAddPatientModal) {
        btnOpenAddPatientModal.addEventListener("click", () => {
            openAddPatientModal();
        });
    }

    function openAddPatientModal() {
        if (!patientModal) return;
        patientForm.reset();
        patientEditId.value = "";
        patientModalTitle.textContent = "Yangi Bemor Qo'shish";
        if (patientModalIcon) patientModalIcon.className = "fa-solid fa-user-plus";

        const pAppointmentDate = document.getElementById("pAppointmentDate");
        if (pAppointmentDate) {
            const now = new Date();
            now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
            pAppointmentDate.value = now.toISOString().slice(0, 16);
        }

        const pService = document.getElementById("pService");
        if (pService && pService.selectedOptions[0]) {
            const price = pService.selectedOptions[0].getAttribute("data-price");
            document.getElementById("pTotalAmount").value = price || 450000;
            document.getElementById("pPaidAmount").value = price || 450000;
        }

        patientModal.classList.remove("d-none");
    }

    function openEditPatientModal(id) {
        const patient = patients.find(p => p.id === id);
        if (!patient) return;

        patientEditId.value = patient.id;
        patientModalTitle.textContent = `Bemorni Tahrirlash: ${patient.id}`;
        if (patientModalIcon) patientModalIcon.className = "fa-solid fa-user-pen";

        document.getElementById("pFullName").value = patient.fullName || "";
        document.getElementById("pAge").value = patient.age || "";
        document.getElementById("pPhone").value = patient.phone || "";
        document.getElementById("pGender").value = patient.gender || "Erkak";
        document.getElementById("pDoctor").value = patient.doctor || "";
        document.getElementById("pService").value = patient.serviceName || "";
        document.getElementById("pToothNumber").value = patient.toothNumber || "";
        document.getElementById("pDiagnosis").value = patient.diagnosis || "";
        document.getElementById("pTotalAmount").value = patient.totalAmount || 0;
        document.getElementById("pPaidAmount").value = patient.paidAmount || 0;
        document.getElementById("pStatus").value = patient.status || "Davolanmoqda";
        document.getElementById("pPaymentStatus").value = patient.paymentStatus || "To'langan";
        document.getElementById("pNotes").value = patient.notes || "";

        if (patient.appointmentDate) {
            document.getElementById("pAppointmentDate").value = patient.appointmentDate.replace(" ", "T");
        }

        patientModal.classList.remove("d-none");
    }

    function closePatientModal() {
        if (patientModal) patientModal.classList.add("d-none");
    }

    if (btnClosePatientModal) btnClosePatientModal.addEventListener("click", closePatientModal);
    if (btnCancelPatient) btnCancelPatient.addEventListener("click", closePatientModal);

    if (patientForm) {
        patientForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const isEdit = Boolean(patientEditId.value);
            const rawDate = document.getElementById("pAppointmentDate").value;
            const formattedDate = rawDate.replace("T", " ");

            const totalAmount = Number(document.getElementById("pTotalAmount").value) || 0;
            const paidAmount = Number(document.getElementById("pPaidAmount").value) || 0;

            let paymentStatus = document.getElementById("pPaymentStatus").value;
            if (paidAmount >= totalAmount && totalAmount > 0) {
                paymentStatus = "To'langan";
            } else if (paidAmount > 0 && paidAmount < totalAmount) {
                paymentStatus = "Qisman to'langan";
            } else if (paidAmount === 0) {
                paymentStatus = "To'lanmagan";
            }

            if (isEdit) {
                const index = patients.findIndex(p => p.id === patientEditId.value);
                if (index !== -1) {
                    patients[index] = {
                        ...patients[index],
                        fullName: document.getElementById("pFullName").value.trim(),
                        age: Number(document.getElementById("pAge").value),
                        phone: document.getElementById("pPhone").value.trim(),
                        gender: document.getElementById("pGender").value,
                        doctor: document.getElementById("pDoctor").value,
                        serviceName: document.getElementById("pService").value,
                        toothNumber: document.getElementById("pToothNumber").value.trim(),
                        appointmentDate: formattedDate,
                        diagnosis: document.getElementById("pDiagnosis").value.trim(),
                        totalAmount: totalAmount,
                        paidAmount: paidAmount,
                        status: document.getElementById("pStatus").value,
                        paymentStatus: paymentStatus,
                        notes: document.getElementById("pNotes").value.trim()
                    };
                    showToast("Bemor ma'lumotlari muvaffaqiyatli yangilandi!", "success");
                }
            } else {
                const nextId = "DENT-" + (100 + patients.length + 1);
                const newPatientObj = {
                    id: nextId,
                    fullName: document.getElementById("pFullName").value.trim(),
                    age: Number(document.getElementById("pAge").value),
                    phone: document.getElementById("pPhone").value.trim(),
                    gender: document.getElementById("pGender").value,
                    doctor: document.getElementById("pDoctor").value,
                    serviceName: document.getElementById("pService").value,
                    toothNumber: document.getElementById("pToothNumber").value.trim(),
                    appointmentDate: formattedDate,
                    diagnosis: document.getElementById("pDiagnosis").value.trim(),
                    totalAmount: totalAmount,
                    paidAmount: paidAmount,
                    status: document.getElementById("pStatus").value,
                    paymentStatus: paymentStatus,
                    notes: document.getElementById("pNotes").value.trim(),
                    createdAt: new Date().toISOString().split("T")[0]
                };

                patients.unshift(newPatientObj);
                showToast(`Yangi bemor (${newPatientObj.fullName}) qo'shildi!`, "success");
            }

            savePatientsToStorage(patients);
            closePatientModal();
            renderStats();
            renderPatientsTable();
            renderToothChart();
            renderMonthlyReports();
        });
    }

    function deletePatient(id) {
        const patient = patients.find(p => p.id === id);
        if (!patient) return;

        if (confirm(`Haqiqatan ham ${patient.fullName} (${patient.id}) bemorini o'chirmoqchimisiz?`)) {
            patients = patients.filter(p => p.id !== id);
            savePatientsToStorage(patients);
            renderStats();
            renderPatientsTable();
            renderToothChart();
            renderMonthlyReports();
            showToast("Bemor o'chirildi", "danger");
        }
    }

    // ==========================================================
    // BEMOR TO'LIQ KARTASINI KO'RISH (VIEW MODAL)
    // ==========================================================
    function openPatientViewModal(id) {
        const patient = patients.find(p => p.id === id);
        if (!patient || !viewPatientModal) return;

        activeViewingPatientId = patient.id;
        viewModalPatientName.textContent = patient.fullName;
        viewModalPatientId.textContent = `ID: ${patient.id} &bull; Ro'yxatga olingan: ${patient.createdAt || 'Noma\'lum'}`;

        const statusClass = getStatusClass(patient.status);
        const payClass = getPaymentClass(patient.paymentStatus);
        const qoldiq = Math.max(0, patient.totalAmount - patient.paidAmount);

        viewPatientContent.innerHTML = `
            <div class="view-card-grid">
                <div class="view-item">
                    <div class="view-item-label"><i class="fa-solid fa-user"></i> Shaxsiy ma'lumotlar</div>
                    <div class="view-item-value">${patient.fullName} (${patient.age} yosh, ${patient.gender})</div>
                </div>

                <div class="view-item">
                    <div class="view-item-label"><i class="fa-solid fa-phone"></i> Telefon raqami</div>
                    <div class="view-item-value">
                        <a href="tel:${patient.phone}" style="color: var(--primary);">${patient.phone}</a>
                    </div>
                </div>

                <div class="view-item">
                    <div class="view-item-label"><i class="fa-solid fa-user-doctor"></i> Mas'ul shifokor</div>
                    <div class="view-item-value">${patient.doctor}</div>
                </div>

                <div class="view-item">
                    <div class="view-item-label"><i class="fa-regular fa-calendar-days"></i> Qabul vaqti</div>
                    <div class="view-item-value">${formatDateTime(patient.appointmentDate)}</div>
                </div>

                <div class="view-item">
                    <div class="view-item-label"><i class="fa-solid fa-stethoscope"></i> Tashxis</div>
                    <div class="view-item-value">${escapeHtml(patient.diagnosis)}</div>
                </div>

                <div class="view-item">
                    <div class="view-item-label"><i class="fa-solid fa-tooth"></i> Muolaja qilinayotgan tish raqami</div>
                    <div class="view-item-value">${patient.toothNumber || "Umumiy ko'rik"}</div>
                </div>

                <div class="view-item">
                    <div class="view-item-label"><i class="fa-solid fa-shield-halved"></i> Muolaja holati</div>
                    <div class="view-item-value">
                        <span class="status-pill ${statusClass}">${patient.status}</span>
                    </div>
                </div>

                <div class="view-item">
                    <div class="view-item-label"><i class="fa-solid fa-receipt"></i> To'lov holati</div>
                    <div class="view-item-value">
                        <span class="pay-badge ${payClass}">${patient.paymentStatus}</span>
                    </div>
                </div>
            </div>

            <div style="background: #f8fafc; border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 16px; margin-bottom: 16px;">
                <h4 style="font-size: 13.5px; font-weight: 700; margin-bottom: 10px; color: var(--text-primary);">
                    <i class="fa-solid fa-wallet" style="color: var(--primary);"></i> Moliyaviy Balans
                </h4>
                <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 6px;">
                    <span>Umumiy xizmat narxi:</span>
                    <strong>${formatCurrency(patient.totalAmount)}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 6px; color: #16a34a;">
                    <span>To'langan summa:</span>
                    <strong>${formatCurrency(patient.paidAmount)}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 13px; color: #dc2626; border-top: 1px dashed #cbd5e1; padding-top: 6px;">
                    <span>Qarz / Qoldiq summa:</span>
                    <strong>${formatCurrency(qoldiq)}</strong>
                </div>
            </div>

            ${patient.notes ? `
                <div class="view-notes-box">
                    <h4><i class="fa-regular fa-comment-dots"></i> Shifokor Eslatmasi va Muolaja Tavsifi:</h4>
                    <p>${escapeHtml(patient.notes)}</p>
                </div>
            ` : ''}
        `;

        viewPatientModal.classList.remove("d-none");
    }

    function closeViewModal() {
        if (viewPatientModal) viewPatientModal.classList.add("d-none");
        activeViewingPatientId = null;
    }

    if (btnCloseViewModal) btnCloseViewModal.addEventListener("click", closeViewModal);
    if (btnCloseViewBtn) btnCloseViewBtn.addEventListener("click", closeViewModal);

    if (btnEditFromView) {
        btnEditFromView.addEventListener("click", () => {
            if (activeViewingPatientId) {
                const id = activeViewingPatientId;
                closeViewModal();
                openEditPatientModal(id);
            }
        });
    }

    // ==========================================================
    // YANGI XIZMAT TURINI QO'SHISH & BOSHQARISH
    // ==========================================================
    if (btnOpenAddServiceModal) {
        btnOpenAddServiceModal.addEventListener("click", () => {
            if (serviceModal) {
                serviceForm.reset();
                serviceModal.classList.remove("d-none");
            }
        });
    }

    function closeServiceModal() {
        if (serviceModal) serviceModal.classList.add("d-none");
    }

    if (btnCloseServiceModal) btnCloseServiceModal.addEventListener("click", closeServiceModal);
    if (btnCancelService) btnCancelService.addEventListener("click", closeServiceModal);

    if (serviceForm) {
        serviceForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const name = document.getElementById("serviceNameInput").value.trim();
            const price = Number(document.getElementById("servicePriceInput").value) || 0;
            const duration = document.getElementById("serviceDurationInput").value.trim();

            if (!name) return;

            const newService = {
                id: "S-" + (services.length + 1) + "_" + Date.now().toString().slice(-4),
                name: name,
                price: price,
                duration: duration
            };

            services.push(newService);
            saveServicesToStorage(services);
            populateFormSelects();
            renderServicesTab();
            closeServiceModal();
            showToast(`Yangi xizmat turi ("${name}") qo'shildi!`, "success");
        });
    }

    function renderServicesTab() {
        const servicesGrid = document.getElementById("servicesGrid");
        if (!servicesGrid) return;

        if (navServicesCount) navServicesCount.textContent = services.length;

        if (services.length === 0) {
            servicesGrid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #94a3b8;">Xizmatlar mavjud emas</div>`;
            return;
        }

        servicesGrid.innerHTML = services.map(srv => `
            <div class="service-card">
                <div class="service-card-top">
                    <div class="service-icon-box">
                        <i class="fa-solid fa-tooth"></i>
                    </div>
                    <div style="flex: 1;">
                        <h4>${escapeHtml(srv.name)}</h4>
                        <span class="service-duration">
                            <i class="fa-regular fa-clock"></i> Davomiyligi: ${escapeHtml(srv.duration)}
                        </span>
                    </div>
                    <button class="btn-icon delete btn-del-service" title="Xizmatni o'chirish" data-id="${srv.id}">
                        <i class="fa-regular fa-trash-can"></i>
                    </button>
                </div>
                <div class="service-card-bottom">
                    <span style="font-size: 13px; color: var(--text-secondary);">Standart narx:</span>
                    <span class="service-price">${formatCurrency(srv.price)}</span>
                </div>
            </div>
        `).join("");

        // Xizmatni o'chirish
        document.querySelectorAll(".btn-del-service").forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                const id = btn.getAttribute("data-id");
                const srv = services.find(s => s.id === id);
                if (srv && confirm(`"${srv.name}" xizmat turini o'chirmoqchimisiz?`)) {
                    services = services.filter(s => s.id !== id);
                    saveServicesToStorage(services);
                    populateFormSelects();
                    renderServicesTab();
                    showToast("Xizmat turi o'chirildi", "danger");
                }
            };
        });
    }

    // ==========================================================
    // YANGI ISHCHI / SHIFOKOR QO'SHISH & BOSHQARISH
    // ==========================================================
    if (btnOpenAddDoctorModal) {
        btnOpenAddDoctorModal.addEventListener("click", () => {
            if (doctorModal) {
                doctorForm.reset();
                doctorModal.classList.remove("d-none");
            }
        });
    }

    function closeDoctorModal() {
        if (doctorModal) doctorModal.classList.add("d-none");
    }

    if (btnCloseDoctorModal) btnCloseDoctorModal.addEventListener("click", closeDoctorModal);
    if (btnCancelDoctor) btnCancelDoctor.addEventListener("click", closeDoctorModal);

    if (doctorForm) {
        doctorForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const name = document.getElementById("doctorNameInput").value.trim();
            const specialty = document.getElementById("doctorSpecialtyInput").value.trim();
            const experience = document.getElementById("doctorExpInput").value.trim();
            const phone = document.getElementById("doctorPhoneInput").value.trim();
            const avatar = document.getElementById("doctorAvatarSelect").value;

            if (!name) return;

            const newDoctor = {
                id: "DOC-" + (doctors.length + 1) + "_" + Date.now().toString().slice(-4),
                name: name,
                specialty: specialty,
                experience: experience,
                phone: phone,
                avatar: avatar
            };

            doctors.push(newDoctor);
            saveDoctorsToStorage(doctors);
            populateFormSelects();
            renderDoctorsTab();
            closeDoctorModal();
            showToast(`Yangi xodim ("${name}") muvaffaqiyatli qo'shildi!`, "success");
        });
    }

    function renderDoctorsTab() {
        const doctorsGrid = document.getElementById("doctorsGrid");
        if (!doctorsGrid) return;

        if (navDoctorsCount) navDoctorsCount.textContent = doctors.length;

        if (doctors.length === 0) {
            doctorsGrid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #94a3b8;">Xodimlar mavjud emas</div>`;
            return;
        }

        doctorsGrid.innerHTML = doctors.map(doc => `
            <div class="doctor-card">
                <img src="${doc.avatar || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80'}" alt="${doc.name}">
                <div class="doctor-card-info" style="flex: 1;">
                    <h4>${escapeHtml(doc.name)}</h4>
                    <p class="doctor-spec">${escapeHtml(doc.specialty)}</p>
                    <p class="doctor-exp"><i class="fa-solid fa-award"></i> Tajriba: ${escapeHtml(doc.experience)}</p>
                    <p class="doctor-exp" style="margin-top: 4px;">
                        <a href="tel:${doc.phone}" style="color: var(--primary);"><i class="fa-solid fa-phone"></i> ${escapeHtml(doc.phone)}</a>
                    </p>
                </div>
                <button class="btn-icon delete btn-del-doctor" title="Ishchini o'chirish" data-id="${doc.id}">
                    <i class="fa-regular fa-trash-can"></i>
                </button>
            </div>
        `).join("");

        // Ishchini o'chirish
        document.querySelectorAll(".btn-del-doctor").forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                const id = btn.getAttribute("data-id");
                const doc = doctors.find(d => d.id === id);
                if (doc && confirm(`"${doc.name}" xodimini o'chirmoqchimisiz?`)) {
                    doctors = doctors.filter(d => d.id !== id);
                    saveDoctorsToStorage(doctors);
                    populateFormSelects();
                    renderDoctorsTab();
                    showToast("Xodim ro'yxatdan o'chirildi", "danger");
                }
            };
        });
    }

    // ==========================================================
    // INTERAKTIV TISHLAR XARITASI (FDI Standarti: 11-48)
    // ==========================================================
    function renderToothChart() {
        const upperTeethRow = document.getElementById("upperTeethRow");
        const lowerTeethRow = document.getElementById("lowerTeethRow");
        if (!upperTeethRow || !lowerTeethRow) return;

        const upperTeeth = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
        const lowerTeeth = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];

        upperTeethRow.innerHTML = upperTeeth.map(num => renderToothItem(num)).join("");
        lowerTeethRow.innerHTML = lowerTeeth.map(num => renderToothItem(num)).join("");

        document.querySelectorAll(".tooth-item").forEach(item => {
            item.onclick = () => {
                const toothNum = item.getAttribute("data-tooth");
                if (patientSearchInput) {
                    switchToTab("dashboard");
                    patientSearchInput.value = toothNum;
                    searchQuery = toothNum;
                    if (btnClearSearch) btnClearSearch.classList.remove("d-none");
                    renderPatientsTable();
                    showToast(`${toothNum}-raqamli tish bo'yicha bemorlar qidirildi`, "info");
                }
            };
        });
    }

    function renderToothItem(toothNum) {
        const related = patients.filter(p => p.toothNumber && p.toothNumber.includes(toothNum.toString()));

        let toothState = "healthy";
        let stateTag = "Sog'lom";

        if (related.length > 0) {
            const hasTreatment = related.some(p => p.status === "Davolanmoqda");
            const hasCompleted = related.some(p => p.status === "Tugatildi");
            const hasCrown = related.some(p => p.serviceName && (p.serviceName.includes("Implant") || p.serviceName.includes("tojburchak")));

            if (hasCrown) {
                toothState = "crown";
                stateTag = "Implant/Toj";
            } else if (hasTreatment) {
                toothState = "treatment";
                stateTag = "Muolajada";
            } else if (hasCompleted) {
                toothState = "done";
                stateTag = "Davolangan";
            }
        }

        return `
            <div class="tooth-item ${toothState}" data-tooth="${toothNum}" title="${toothNum}-tish: ${stateTag}">
                <i class="fa-solid fa-tooth"></i>
                <div class="tooth-num">#${toothNum}</div>
                <div class="tooth-state-tag">${stateTag}</div>
            </div>
        `;
    }

    // ==========================================================
    // NAVIGATSIYA VA TABLARNI O'ZGARTIRISH
    // ==========================================================
    function initNavigation() {
        const navLinks = document.querySelectorAll(".sidebar-nav .nav-link");
        const btnToggleSidebar = document.getElementById("btnToggleSidebar");
        const btnCloseSidebar = document.getElementById("btnCloseSidebar");
        const sidebar = document.getElementById("sidebar");

        navLinks.forEach(link => {
            link.addEventListener("click", (e) => {
                e.preventDefault();
                const targetTab = link.getAttribute("data-tab");
                switchToTab(targetTab);

                if (window.innerWidth <= 1024 && sidebar) {
                    sidebar.classList.remove("open");
                }
            });
        });

        if (btnToggleSidebar && sidebar) {
            btnToggleSidebar.addEventListener("click", () => {
                sidebar.classList.toggle("open");
            });
        }

        if (btnCloseSidebar && sidebar) {
            btnCloseSidebar.addEventListener("click", () => {
                sidebar.classList.remove("open");
            });
        }

        const btnDashToReports = document.getElementById("btnDashToReports");
        if (btnDashToReports) {
            btnDashToReports.addEventListener("click", (e) => {
                e.preventDefault();
                switchToTab("reports");
            });
        }
    }

    function switchToTab(tabId) {
        document.querySelectorAll(".sidebar-nav .nav-link").forEach(link => {
            if (link.getAttribute("data-tab") === tabId || (tabId === "patients" && link.getAttribute("data-tab") === "patients")) {
                link.classList.add("active");
            } else {
                link.classList.remove("active");
            }
        });

        document.querySelectorAll(".tab-pane").forEach(pane => {
            pane.classList.remove("active");
        });

        const activePane = document.getElementById(`tab-${tabId}`) || document.getElementById("tab-dashboard");
        if (activePane) activePane.classList.add("active");

        const headerPageTitle = document.getElementById("headerPageTitle");
        if (headerPageTitle) {
            const titles = {
                dashboard: "Stomatologiya Boshqaruv Markazi",
                patients: "Bemorlar va Mijozlar Ro'yxati",
                "tooth-chart": "Interaktiv Tishlar Xaritasi (Dental Chart)",
                services: "Klinika Xizmat Turlari va Narxnomasi",
                doctors: "Ishchilar va Shifokorlar Jamoasi",
                reports: "Oylik Moliyaviy va Qabullar Hisoboti"
            };
            headerPageTitle.textContent = titles[tabId] || "Boshqaruv Markazi";
        }

        const mainContent = document.querySelector(".main-content");
        if (mainContent) mainContent.scrollTop = 0;
        window.scrollTo(0, 0);

        if (tabId === "reports") {
            renderMonthlyReports();
        }
    }

    // ==========================================================
    // SANA VA VAQT DISPLAY
    // ==========================================================
    function initDateTime() {
        const headerCurrentDate = document.getElementById("headerCurrentDate");
        function updateDate() {
            if (!headerCurrentDate) return;
            const now = new Date();
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
            headerCurrentDate.textContent = now.toLocaleDateString('uz-UZ', options);
        }
        updateDate();
        setInterval(updateDate, 30000);
    }

    // ==========================================================
    // YORDAMCHI FUNKSIYALAR
    // ==========================================================
    function formatCurrency(amount) {
        const num = Number(amount) || 0;
        return num.toLocaleString("uz-UZ") + " so'm";
    }

    function formatDateTime(dtStr) {
        if (!dtStr) return "Belgilanmagan";
        return dtStr;
    }

    function getStatusClass(status) {
        switch (status) {
            case "Davolanmoqda": return "status-davolanmoqda";
            case "Tugatildi": return "status-tugatildi";
            case "Kutilmoqda": return "status-kutilmoqda";
            case "Bekor qilindi": return "status-bekor";
            default: return "status-davolanmoqda";
        }
    }

    function getPaymentClass(status) {
        switch (status) {
            case "To'langan": return "pay-paid";
            case "Qisman to'langan": return "pay-partial";
            case "To'lanmagan": return "pay-unpaid";
            default: return "pay-paid";
        }
    }

    function escapeHtml(text) {
        if (!text) return "";
        return text
            .toString()
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function showToast(message, type = "info") {
        const container = document.getElementById("toastContainer");
        if (!container) return;

        const toast = document.createElement("div");
        toast.className = `toast toast-${type}`;
        
        const icons = {
            success: "fa-solid fa-circle-check",
            danger: "fa-solid fa-circle-xmark",
            info: "fa-solid fa-circle-info"
        };

        toast.innerHTML = `
            <i class="${icons[type] || icons.info}" style="font-size: 18px; color: var(--${type});"></i>
            <span style="font-size: 13.5px; font-weight: 500;">${message}</span>
        `;

        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = "0";
            toast.style.transform = "translateX(100%)";
            toast.style.transition = "all 0.3s ease";
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // ==========================================================
    // OYLIK HISOBOTLAR VA MOLIYAVIY TAHLIL LOGIKASI
    // ==========================================================

    // Dashboard Banner orqali hisobotlarga o'tish
    const btnDashToReports = document.getElementById("btnDashToReports");
    if (btnDashToReports) {
        btnDashToReports.addEventListener("click", (e) => {
            if (e) e.preventDefault();
            switchToTab("reports");
        });
    }

    // Helper: bemor sanasidan YYYY-MM oy kalitini ajratish
    function getPatientMonthKey(patient) {
        const rawDate = patient.appointmentDate || patient.createdAt || "";
        if (rawDate && rawDate.length >= 7) {
            return rawDate.slice(0, 7);
        }
        return "2026-09";
    }

    // Helper: oy nomini o'zbekcha chiroyli formatlash
    function getMonthDisplayName(monthKey) {
        if (!monthKey || monthKey === "all") return "Barcha davrlar (Umumiy)";
        const parts = monthKey.split("-");
        if (parts.length < 2) return monthKey;
        const year = parts[0];
        const monthStr = parts[1];
        const monthsMap = {
            "01": "Yanvar", "02": "Fevral", "03": "Mart", "04": "Aprel",
            "05": "May", "06": "Iyun", "07": "Iyul", "08": "Avgust",
            "09": "Sentabr", "10": "Oktabr", "11": "Noyabr", "12": "Dekabr"
        };
        const mName = monthsMap[monthStr] || monthStr;
        return `${year}-yil ${mName}`;
    }

    function initReportControls() {
        const reportMonthSelect = document.getElementById("reportMonthSelect");
        const reportDoctorSelect = document.getElementById("reportDoctorSelect");
        const reportStatusSelect = document.getElementById("reportStatusSelect");
        const btnRefreshReport = document.getElementById("btnRefreshReport");
        const btnPrintReport = document.getElementById("btnPrintReport");
        const btnExportReportCSV = document.getElementById("btnExportReportCSV");

        if (reportMonthSelect) {
            reportMonthSelect.addEventListener("change", (e) => {
                reportSelectedMonth = e.target.value;
                renderMonthlyReports();
            });
        }

        if (reportDoctorSelect) {
            reportDoctorSelect.addEventListener("change", (e) => {
                reportSelectedDoctor = e.target.value;
                renderMonthlyReports();
            });
        }

        if (reportStatusSelect) {
            reportStatusSelect.addEventListener("change", (e) => {
                reportSelectedStatus = e.target.value;
                renderMonthlyReports();
            });
        }

        if (btnRefreshReport) {
            btnRefreshReport.addEventListener("click", () => {
                renderMonthlyReports();
                showToast("Oylik hisobotlar muvaffaqiyatli yangilandi!", "info");
            });
        }

        if (btnPrintReport) {
            btnPrintReport.addEventListener("click", () => {
                window.print();
            });
        }

        if (btnExportReportCSV) {
            btnExportReportCSV.addEventListener("click", exportMonthlyReportCSV);
        }
    }

    function updateMonthSelectOptions() {
        const reportMonthSelect = document.getElementById("reportMonthSelect");
        if (!reportMonthSelect) return;

        // Barcha bemorlardan mavjud barcha oylarni to'plash
        const monthsSet = new Set();
        monthsSet.add("2026-09"); // joriy oy kafolatlangan holda
        patients.forEach(p => {
            const mKey = getPatientMonthKey(p);
            if (mKey && mKey.length === 7) monthsSet.add(mKey);
        });

        const sortedMonths = Array.from(monthsSet).sort().reverse();

        // Agar tanlangan oy ro'yxatda bo'lmasa, birinchisiga o'tamiz
        if (!reportSelectedMonth || (!monthsSet.has(reportSelectedMonth) && reportSelectedMonth !== "all")) {
            reportSelectedMonth = sortedMonths[0] || "2026-09";
        }

        let optionsHtml = sortedMonths.map(m => {
            const isCurrent = (m === "2026-09") ? " (Joriy oy)" : "";
            const isSelected = (m === reportSelectedMonth) ? "selected" : "";
            return `<option value="${m}" ${isSelected}>${getMonthDisplayName(m)}${isCurrent}</option>`;
        }).join("");

        optionsHtml += `<option value="all" ${reportSelectedMonth === "all" ? "selected" : ""}>Barcha Oylar (Umumiy Arxiv)</option>`;
        reportMonthSelect.innerHTML = optionsHtml;

        // Shifokorlar selectini ham to'ldirish
        const reportDoctorSelect = document.getElementById("reportDoctorSelect");
        if (reportDoctorSelect) {
            const currentDocVal = reportSelectedDoctor;
            let docOptionsHtml = `<option value="all" ${currentDocVal === "all" ? "selected" : ""}>Barcha Xodimlar (Umumiy hisobot)</option>`;
            doctors.forEach(doc => {
                const isDocSelected = (doc.name === currentDocVal) ? "selected" : "";
                docOptionsHtml += `<option value="${doc.name}" ${isDocSelected}>${doc.name} (${doc.specialty})</option>`;
            });
            reportDoctorSelect.innerHTML = docOptionsHtml;
        }
    }

    function renderMonthlyReports() {
        updateMonthSelectOptions();

        // 1. Filtrlash
        let filteredPatients = patients.filter(p => {
            const pMonth = getPatientMonthKey(p);
            const matchesMonth = (reportSelectedMonth === "all") || (pMonth === reportSelectedMonth);
            const matchesDoctor = (reportSelectedDoctor === "all") || (p.doctor === reportSelectedDoctor);
            const matchesStatus = (reportSelectedStatus === "all") || (p.status === reportSelectedStatus);
            return matchesMonth && matchesDoctor && matchesStatus;
        });

        // 2. Asosiy KPI ko'rsatkichlarini hisoblash
        const totalPatients = filteredPatients.length;
        const totalRevenue = filteredPatients.reduce((sum, p) => sum + (Number(p.paidAmount) || 0), 0);
        const totalServiceValue = filteredPatients.reduce((sum, p) => sum + (Number(p.totalAmount) || 0), 0);
        const totalDebt = filteredPatients.reduce((sum, p) => sum + Math.max(0, (Number(p.totalAmount) || 0) - (Number(p.paidAmount) || 0)), 0);
        const completedCount = filteredPatients.filter(p => p.status === "Tugatildi").length;
        const avgCheck = totalPatients > 0 ? Math.round(totalRevenue / totalPatients) : 0;

        // UI KPI elementlarini yangilash
        const kpiMonthPatients = document.getElementById("kpiMonthPatients");
        const kpiMonthRevenue = document.getElementById("kpiMonthRevenue");
        const kpiMonthTotal = document.getElementById("kpiMonthTotal");
        const kpiMonthDebt = document.getElementById("kpiMonthDebt");
        const kpiMonthCompleted = document.getElementById("kpiMonthCompleted");
        const kpiMonthAvg = document.getElementById("kpiMonthAvg");

        if (kpiMonthPatients) kpiMonthPatients.textContent = totalPatients + " ta";
        if (kpiMonthRevenue) kpiMonthRevenue.textContent = formatCurrency(totalRevenue);
        if (kpiMonthTotal) kpiMonthTotal.textContent = formatCurrency(totalServiceValue);
        if (kpiMonthDebt) kpiMonthDebt.textContent = formatCurrency(totalDebt);
        if (kpiMonthCompleted) kpiMonthCompleted.textContent = completedCount + " ta";
        if (kpiMonthAvg) kpiMonthAvg.textContent = formatCurrency(avgCheck);

        // Sarlavhalarni yangilash
        const reportMainHeading = document.getElementById("reportMainHeading");
        const monthTitleStr = getMonthDisplayName(reportSelectedMonth);
        const doctorTitleStr = reportSelectedDoctor !== "all" ? ` — ${reportSelectedDoctor}` : "";
        if (reportMainHeading) reportMainHeading.textContent = `${monthTitleStr}${doctorTitleStr} Hisoboti`;

        const printReportTitle = document.getElementById("printReportTitle");
        if (printReportTitle) printReportTitle.textContent = `${monthTitleStr}${doctorTitleStr} Hisoboti`;

        const doctorTableMonthLabel = document.getElementById("doctorTableMonthLabel");
        if (doctorTableMonthLabel) doctorTableMonthLabel.textContent = monthTitleStr;

        // Dashboard oylik bannerini yangilash (Joriy oy uchun)
        const currentMonthKey = "2026-09";
        const currentMonthPatients = patients.filter(p => getPatientMonthKey(p) === currentMonthKey);
        const currentMonthRev = currentMonthPatients.reduce((sum, p) => sum + (Number(p.paidAmount) || 0), 0);
        const dashMonthBannerTitle = document.getElementById("dashMonthBannerTitle");
        const dashMonthPatientsCount = document.getElementById("dashMonthPatientsCount");
        const dashMonthRevenueSum = document.getElementById("dashMonthRevenueSum");

        if (dashMonthBannerTitle) dashMonthBannerTitle.textContent = getMonthDisplayName(currentMonthKey) + " Oyi";
        if (dashMonthPatientsCount) dashMonthPatientsCount.textContent = currentMonthPatients.length + " ta bemor";
        if (dashMonthRevenueSum) dashMonthRevenueSum.textContent = formatCurrency(currentMonthRev);

        // 3. Shifokorlar va Ishchilar kesimidagi oylik hisobot jadvali
        renderDoctorMonthlyReportTable();

        // 4. Oylar bo'yicha tushumlar va bemorlar soni dinamikasi
        renderMonthlyHistoryTable();

        // 5. Xizmat turlari bo'yicha oylik taqsimot
        renderServicesMonthlyDistribution(filteredPatients);

        // 6. Tanlangan oydagi bemorlar ro'yxati (Reestr)
        renderReportPatientsList(filteredPatients);
    }

    // Shifokorlar va ishchilar oylik hisoboti
    function renderDoctorMonthlyReportTable() {
        const tbody = document.getElementById("doctorMonthlyTableBody");
        if (!tbody) return;

        // Ushbu oyga tegishli barcha bemorlar
        const monthPatients = patients.filter(p => {
            const pMonth = getPatientMonthKey(p);
            return (reportSelectedMonth === "all") || (pMonth === reportSelectedMonth);
        });

        if (doctors.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 24px; color: #94a3b8;">Ishchilar ro'yxati bo'sh</td></tr>`;
            return;
        }

        tbody.innerHTML = doctors.map(doc => {
            const docPatients = monthPatients.filter(p => p.doctor === doc.name);
            const count = docPatients.length;
            const totalVal = docPatients.reduce((sum, p) => sum + (Number(p.totalAmount) || 0), 0);
            const paidVal = docPatients.reduce((sum, p) => sum + (Number(p.paidAmount) || 0), 0);
            const debtVal = Math.max(0, totalVal - paidVal);
            const percentage = totalVal > 0 ? Math.min(100, Math.round((paidVal / totalVal) * 100)) : 100;

            const isSelectedDoc = (reportSelectedDoctor === doc.name);

            return `
                <tr style="${isSelectedDoc ? 'background-color: #f0fdf4;' : ''}">
                    <td>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <img src="${doc.avatar || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80'}" alt="${doc.name}" style="width: 38px; height: 38px; border-radius: 50%; object-fit: cover;">
                            <div>
                                <strong style="color: var(--text-primary); display: block;">${escapeHtml(doc.name)}</strong>
                                <small style="color: #64748b;">${doc.phone || ''}</small>
                            </div>
                        </div>
                    </td>
                    <td><span style="font-weight: 500; color: #475569;">${escapeHtml(doc.specialty)}</span></td>
                    <td>
                        <span style="font-weight: 700; font-size: 14px; color: var(--primary);">
                            <i class="fa-solid fa-user-check" style="font-size: 11px; margin-right: 4px;"></i>${count} ta bemor
                        </span>
                    </td>
                    <td><strong>${formatCurrency(totalVal)}</strong></td>
                    <td><strong style="color: #16a34a;">${formatCurrency(paidVal)}</strong></td>
                    <td><span style="color: ${debtVal > 0 ? '#dc2626' : '#64748b'}; font-weight: ${debtVal > 0 ? '700' : '500'};">${formatCurrency(debtVal)}</span></td>
                    <td>
                        <div class="rate-wrapper">
                            <div style="display: flex; justify-content: space-between; font-size: 11px;">
                                <span>Undirish:</span>
                                <strong>${percentage}%</strong>
                            </div>
                            <div class="rate-bar-bg">
                                <div class="rate-bar-fill" style="width: ${percentage}%;"></div>
                            </div>
                        </div>
                    </td>
                    <td class="text-center">
                        <button class="btn-action-outline btn-filter-doc" data-doc="${escapeHtml(doc.name)}" style="padding: 5px 12px; font-size: 12px;" title="Faqat ushbu xodim hisobotini ko'rish">
                            <i class="fa-solid fa-filter"></i> ${isSelectedDoc ? "Tanlangan" : "Filtrlash"}
                        </button>
                    </td>
                </tr>
            `;
        }).join("");

        // Filtrlash tugmalari hodisasi
        document.querySelectorAll(".btn-filter-doc").forEach(btn => {
            btn.onclick = () => {
                const docName = btn.getAttribute("data-doc");
                if (reportSelectedDoctor === docName) {
                    reportSelectedDoctor = "all";
                } else {
                    reportSelectedDoctor = docName;
                }
                const sel = document.getElementById("reportDoctorSelect");
                if (sel) sel.value = reportSelectedDoctor;
                renderMonthlyReports();
            };
        });
    }

    // Oylar bo'yicha tushumlar va bemorlar soni dinamikasi
    function renderMonthlyHistoryTable() {
        const tbody = document.getElementById("monthlyHistoryTableBody");
        if (!tbody) return;

        // Barcha mavjud oylarni to'plash
        const monthGroups = {};
        patients.forEach(p => {
            const mKey = getPatientMonthKey(p);
            if (!monthGroups[mKey]) {
                monthGroups[mKey] = [];
            }
            monthGroups[mKey].push(p);
        });

        // Agar 2026-09 bo'lmasa, qo'shamiz
        if (!monthGroups["2026-09"]) monthGroups["2026-09"] = [];

        const sortedMonthKeys = Object.keys(monthGroups).sort().reverse();

        tbody.innerHTML = sortedMonthKeys.map(mKey => {
            const mPatients = monthGroups[mKey];
            const pCount = mPatients.length;
            const completed = mPatients.filter(p => p.status === "Tugatildi").length;
            const totalVal = mPatients.reduce((sum, p) => sum + (Number(p.totalAmount) || 0), 0);
            const paidVal = mPatients.reduce((sum, p) => sum + (Number(p.paidAmount) || 0), 0);
            const debtVal = Math.max(0, totalVal - paidVal);
            const avg = pCount > 0 ? Math.round(paidVal / pCount) : 0;
            const isSelected = (reportSelectedMonth === mKey);

            return `
                <tr style="${isSelected ? 'background-color: #eff6ff;' : ''}">
                    <td>
                        <strong style="color: var(--primary); font-size: 14px;">
                            <i class="fa-solid fa-calendar-check" style="margin-right: 6px;"></i>${getMonthDisplayName(mKey)}
                        </strong>
                        ${mKey === "2026-09" ? '<span class="badge-pill-soft" style="margin-left: 6px; font-size: 11px;">Joriy oy</span>' : ''}
                    </td>
                    <td><strong>${pCount} ta</strong></td>
                    <td><span class="pay-badge pay-paid" style="font-size: 11.5px;">${completed} ta yakunlangan</span></td>
                    <td>${formatCurrency(totalVal)}</td>
                    <td><strong style="color: #16a34a; font-size: 14px;">${formatCurrency(paidVal)}</strong></td>
                    <td><span style="color: ${debtVal > 0 ? '#dc2626' : '#64748b'}; font-weight: 600;">${formatCurrency(debtVal)}</span></td>
                    <td><span style="color: #475569;">${formatCurrency(avg)}</span></td>
                    <td class="text-center">
                        <button class="btn-action-primary btn-select-month" data-month="${mKey}" style="padding: 6px 14px; font-size: 12px;">
                            ${isSelected ? '<i class="fa-solid fa-check"></i> Ko\'rilmoqda' : '<i class="fa-regular fa-folder-open"></i> Hisobotni Ochish'}
                        </button>
                    </td>
                </tr>
            `;
        }).join("");

        document.querySelectorAll(".btn-select-month").forEach(btn => {
            btn.onclick = () => {
                const targetM = btn.getAttribute("data-month");
                reportSelectedMonth = targetM;
                const sel = document.getElementById("reportMonthSelect");
                if (sel) sel.value = targetM;
                renderMonthlyReports();
                showToast(`${getMonthDisplayName(targetM)} oyi hisoboti tanlandi`, "info");
            };
        });
    }

    // Xizmat turlari bo'yicha taqsimot
    function renderServicesMonthlyDistribution(filteredPatients) {
        const grid = document.getElementById("servicesReportGrid");
        if (!grid) return;

        const srvCounts = {};
        filteredPatients.forEach(p => {
            const sName = p.serviceName || "Konsultatsiya & Ko'rik";
            if (!srvCounts[sName]) {
                srvCounts[sName] = { count: 0, revenue: 0 };
            }
            srvCounts[sName].count++;
            srvCounts[sName].revenue += (Number(p.paidAmount) || 0);
        });

        const sortedServices = Object.entries(srvCounts).sort((a, b) => b[1].revenue - a[1].revenue);

        if (sortedServices.length === 0) {
            grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 24px; color: #94a3b8;">Ushbu davrda xizmatlar mavjud emas</div>`;
            return;
        }

        grid.innerHTML = sortedServices.map(([sName, data]) => `
            <div class="service-report-item">
                <div class="service-report-top">
                    <h4>${escapeHtml(sName)}</h4>
                    <span class="srv-count-pill">${data.count} ta bemor</span>
                </div>
                <div class="service-report-bottom">
                    <span>Oylik Tushum:</span>
                    <strong style="color: #16a34a;">${formatCurrency(data.revenue)}</strong>
                </div>
            </div>
        `).join("");
    }

    // Tanlangan oydagi bemorlar ro'yxati
    function renderReportPatientsList(filteredPatients) {
        const tbody = document.getElementById("reportPatientsListTableBody");
        const countInfo = document.getElementById("reportPatientsCountInfo");

        if (countInfo) {
            countInfo.textContent = `Ko'rsatilmoqda: ${filteredPatients.length} ta bemor`;
        }

        if (!tbody) return;

        if (filteredPatients.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="10" style="text-align: center; padding: 30px; color: #94a3b8;">
                        <i class="fa-regular fa-folder-open" style="font-size: 32px; margin-bottom: 8px; display: block; color: #cbd5e1;"></i>
                        Ushbu oy va tanlangan shartlar bo'yicha bemorlar topilmadi
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = filteredPatients.map(p => {
            const statusClass = getStatusClass(p.status);
            const payClass = getPaymentClass(p.paymentStatus);
            return `
                <tr>
                    <td><span class="id-badge">${p.id}</span></td>
                    <td style="white-space: nowrap;"><i class="fa-regular fa-calendar" style="font-size: 11px; margin-right: 4px; color: #94a3b8;"></i>${p.appointmentDate || p.createdAt || 'Noma\'lum'}</td>
                    <td><strong>${escapeHtml(p.fullName)}</strong></td>
                    <td><a href="tel:${p.phone}" style="color: var(--primary);">${escapeHtml(p.phone)}</a></td>
                    <td><span style="font-weight: 500; color: #334155;">${escapeHtml(p.doctor)}</span></td>
                    <td>${escapeHtml(p.serviceName || 'Stomatologiya')}</td>
                    <td>${formatCurrency(p.totalAmount)}</td>
                    <td><strong style="color: #16a34a;">${formatCurrency(p.paidAmount)}</strong></td>
                    <td><span class="pay-badge ${payClass}">${p.paymentStatus || 'To\'langan'}</span></td>
                    <td><span class="status-pill ${statusClass}">${p.status}</span></td>
                </tr>
            `;
        }).join("");
    }

    // Excel (CSV) fayl sifatida eksport qilish
    function exportMonthlyReportCSV() {
        const filtered = patients.filter(p => {
            const pMonth = getPatientMonthKey(p);
            const matchesMonth = (reportSelectedMonth === "all") || (pMonth === reportSelectedMonth);
            const matchesDoctor = (reportSelectedDoctor === "all") || (p.doctor === reportSelectedDoctor);
            const matchesStatus = (reportSelectedStatus === "all") || (p.status === reportSelectedStatus);
            return matchesMonth && matchesDoctor && matchesStatus;
        });

        if (filtered.length === 0) {
            showToast("Yuklab olish uchun ma'lumot mavjud emas!", "danger");
            return;
        }

        // CSV Header with UTF-8 BOM
        let csvContent = "\uFEFF";
        csvContent += "T/r,Bemor ID,Qabul Sanasi,Bemor F.I.Sh,Telefon,Mas'ul Shifokor,Xizmat Turi,Tashxis,Umumiy Narx (so'm),To'langan Summa (so'm),Qoldiq Qarz (so'm),To'lov Holati,Muolaja Holati\n";

        filtered.forEach((p, idx) => {
            const total = Number(p.totalAmount) || 0;
            const paid = Number(p.paidAmount) || 0;
            const debt = Math.max(0, total - paid);

            const row = [
                idx + 1,
                `"${p.id}"`,
                `"${p.appointmentDate || p.createdAt || ''}"`,
                `"${(p.fullName || '').replace(/"/g, '""')}"`,
                `"${p.phone || ''}"`,
                `"${(p.doctor || '').replace(/"/g, '""')}"`,
                `"${(p.serviceName || '').replace(/"/g, '""')}"`,
                `"${(p.diagnosis || '').replace(/"/g, '""')}"`,
                total,
                paid,
                debt,
                `"${p.paymentStatus || ''}"`,
                `"${p.status || ''}"`
            ];
            csvContent += row.join(",") + "\n";
        });

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        const monthLabel = reportSelectedMonth.replace("-", "_");
        link.setAttribute("href", url);
        link.setAttribute("download", `DentaCare_Oylik_Hisobot_${monthLabel}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        showToast("Oylik hisobot Excel (CSV) fayli yuklab olindi!", "success");
    }
});
