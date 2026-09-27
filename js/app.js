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

    // ==========================================================
    // SAYT TILINI BOSHQARISH (MULTI-LANGUAGE: UZ / RU)
    // ==========================================================
    const btnLangUz = document.getElementById("btnLangUz");
    const btnLangRu = document.getElementById("btnLangRu");

    function applyAppLanguage(lang) {
        currentAppLang = lang;
        localStorage.setItem("dentacare_app_lang", lang);

        if (btnLangUz && btnLangRu) {
            btnLangUz.classList.toggle("active", lang === "uz");
            btnLangRu.classList.toggle("active", lang === "ru");
        }

        // Sidebar
        const navSectionTitle = document.querySelector(".nav-section-title");
        if (navSectionTitle) navSectionTitle.textContent = t("menuTitle");

        const navDash = document.querySelector('.nav-link[data-tab="dashboard"] span');
        if (navDash) navDash.textContent = t("navDashboard");
        const navPat = document.querySelector('.nav-link[data-tab="patients"] span');
        if (navPat) navPat.textContent = t("navPatients");
        const navTooth = document.querySelector('.nav-link[data-tab="tooth-chart"] span');
        if (navTooth) navTooth.textContent = t("navToothChart");
        const navServ = document.querySelector('.nav-link[data-tab="services"] span');
        if (navServ) navServ.textContent = t("navServices");
        const navDoc = document.querySelector('.nav-link[data-tab="doctors"] span');
        if (navDoc) navDoc.textContent = t("navDoctors");
        const navRep = document.querySelector('.nav-link[data-tab="reports"] span');
        if (navRep) navRep.textContent = t("navReports");

        const shiftSmall = document.querySelector(".clinic-shift small");
        if (shiftSmall) shiftSmall.innerHTML = `<i class="fa-solid fa-clock"></i> ${t("navShift")}`;
        const shiftP = document.querySelector(".clinic-shift p");
        if (shiftP) shiftP.textContent = t("navShiftVal");

        const btnLogoutSpan = document.querySelector("#btnLogout span");
        if (btnLogoutSpan) btnLogoutSpan.textContent = t("navLogout");

        // Header & Sidebar
        const badgeShiftText = document.getElementById("badgeShiftText");
        if (badgeShiftText) badgeShiftText.textContent = t("headerBadge247");
        const btnAddPatientText = document.getElementById("btnAddPatientText");
        if (btnAddPatientText) btnAddPatientText.textContent = t("btnAddPatient");
        const topHeaderRole = document.getElementById("topHeaderRole");
        if (topHeaderRole) topHeaderRole.textContent = t("roleAdmin");
        const sidebarRoleBadge = document.getElementById("sidebarRoleBadge");
        if (sidebarRoleBadge) sidebarRoleBadge.textContent = t("sidebarRoleHeadDoctor");

        // Stats Cards labels
        const statCards = document.querySelectorAll(".stat-card");
        if (statCards.length >= 4) {
            const sc0Title = statCards[0].querySelector(".stat-content span");
            const sc0Meta = statCards[0].querySelector(".stat-meta");
            if (sc0Title) sc0Title.textContent = t("statTotalPatients");
            if (sc0Meta) sc0Meta.innerHTML = `<i class="fa-solid fa-arrow-trend-up"></i> ${t("statTotalPatientsMeta")}`;

            const sc1Title = statCards[1].querySelector(".stat-content span");
            const sc1Meta = statCards[1].querySelector(".stat-meta");
            if (sc1Title) sc1Title.textContent = t("statTodayVisits");
            if (sc1Meta) sc1Meta.innerHTML = `<i class="fa-solid fa-calendar-check"></i> ${t("statTodayVisitsMeta")}`;

            const sc2Title = statCards[2].querySelector(".stat-content span");
            const sc2Meta = statCards[2].querySelector(".stat-meta");
            if (sc2Title) sc2Title.textContent = t("statInTreatment");
            if (sc2Meta) sc2Meta.innerHTML = `<i class="fa-solid fa-teeth"></i> ${t("statInTreatmentMeta")}`;

            const sc3Title = statCards[3].querySelector(".stat-content span");
            const sc3Meta = statCards[3].querySelector(".stat-meta");
            if (sc3Title) sc3Title.textContent = t("statTotalRevenue");
            if (sc3Meta) sc3Meta.innerHTML = `<i class="fa-solid fa-coins"></i> ${t("statTotalRevenueMeta")}`;
        }

        // Dashboard banner
        const bannerTag = document.querySelector(".banner-pill-tag");
        if (bannerTag) bannerTag.innerHTML = `<i class="fa-solid fa-calendar-check"></i> ${t("bannerTag")}`;
        const btnDashToReportsSpan = document.querySelector("#btnDashToReports span");
        if (btnDashToReportsSpan) btnDashToReportsSpan.textContent = t("bannerLink");

        // Patients Section Header
        const patHeader = document.querySelector(".patients-section .header-titles");
        if (patHeader) {
            const h3 = patHeader.querySelector("h3");
            const p = patHeader.querySelector("p");
            if (h3) h3.textContent = t("patientsTitle");
            if (p) p.textContent = t("patientsSubtitle");
        }

        if (patientSearchInput) patientSearchInput.placeholder = t("searchPlaceholder");
        if (statusFilter && statusFilter.options.length >= 5) {
            statusFilter.options[0].text = t("filterAll");
            statusFilter.options[1].text = t("filterTreating");
            statusFilter.options[2].text = t("filterDone");
            statusFilter.options[3].text = t("filterWaiting");
            statusFilter.options[4].text = t("filterCancelled");
        }

        // Patients Table headers
        const thList = document.querySelectorAll("#patientsTable thead th");
        if (thList.length >= 10) {
            thList[0].textContent = t("thId");
            thList[1].textContent = t("thPatient");
            thList[2].textContent = t("thPhone");
            thList[3].textContent = t("thDiagnosis");
            thList[4].textContent = t("thService");
            thList[5].textContent = t("thDoctor");
            thList[6].textContent = t("thTime");
            thList[7].textContent = t("thPayment");
            thList[8].textContent = t("thStatus");
            thList[9].textContent = t("thActions");
        }

        // Tooth chart
        const tcHeader = document.querySelector("#tab-tooth-chart .section-card-header");
        if (tcHeader) {
            const h3 = tcHeader.querySelector("h3");
            const p = tcHeader.querySelector("p");
            if (h3) h3.textContent = t("chartTitle");
            if (p) p.textContent = t("chartSubtitle");
        }
        const jawTitles = document.querySelectorAll(".jaw-title");
        if (jawTitles.length >= 2) {
            jawTitles[0].innerHTML = `<i class="fa-solid fa-arrow-up"></i> ${t("upperJaw")}`;
            jawTitles[1].innerHTML = `<i class="fa-solid fa-arrow-down"></i> ${t("lowerJaw")}`;
        }
        const cLine = document.querySelector(".chart-divider span");
        if (cLine) cLine.textContent = t("centerLine");

        // Tooth Legend items
        const legH = document.getElementById("legendHealthy");
        if (legH) legH.innerHTML = `<span class="legend-color healthy"></span> ${t("legendHealthy")}`;
        const legT = document.getElementById("legendTreatment");
        if (legT) legT.innerHTML = `<span class="legend-color treatment"></span> ${t("legendTreatment")}`;
        const legD = document.getElementById("legendDone");
        if (legD) legD.innerHTML = `<span class="legend-color done"></span> ${t("legendDone")}`;
        const legC = document.getElementById("legendCrown");
        if (legC) legC.innerHTML = `<span class="legend-color crown"></span> ${t("legendCrown")}`;

        // Services Tab
        const srvTitles = document.querySelector("#tab-services .section-card-header .header-titles");
        if (srvTitles) {
            const h3 = srvTitles.querySelector("h3");
            const p = srvTitles.querySelector("p");
            if (h3) h3.textContent = t("servicesTitle");
            if (p) p.textContent = t("servicesSubtitle");
        }
        const btnAddServSpan = document.querySelector("#btnOpenAddServiceModal span");
        if (btnAddServSpan) btnAddServSpan.textContent = t("btnAddService");

        // Doctors Tab
        const docNotice = document.querySelector(".shift-banner-notice .notice-text");
        if (docNotice) {
            const h4 = docNotice.querySelector("h4");
            const p = docNotice.querySelector("p");
            if (h4) h4.textContent = t("shiftBannerTitle");
            if (p) p.textContent = t("shiftBannerText");
        }
        const badgeActiveShift = document.getElementById("badgeActiveShift");
        if (badgeActiveShift) badgeActiveShift.innerHTML = `<span class="pulse-indicator-dot"></span> ${t("shiftBannerBadge")}`;

        const docTitles = document.querySelector("#tab-doctors .section-card-header .header-titles");
        if (docTitles) {
            const h3 = docTitles.querySelector("h3");
            const p = docTitles.querySelector("p");
            if (h3) h3.textContent = t("doctorsTitle");
            if (p) p.textContent = t("doctorsSubtitle");
        }
        const btnAddDocSpan = document.querySelector("#btnOpenAddDoctorModal span");
        if (btnAddDocSpan) btnAddDocSpan.textContent = t("btnAddDoctor");

        // Reports Tab - Header & Actions
        const repBadge = document.querySelector(".report-top-badge");
        if (repBadge) repBadge.innerHTML = `<i class="fa-solid fa-file-invoice-dollar"></i> ${t("reportTopBadge")}`;
        const repDesc = document.querySelector(".report-header-top .header-titles p");
        if (repDesc) repDesc.textContent = t("reportDesc");
        const btnCsvSpan = document.querySelector("#btnExportReportCSV span");
        if (btnCsvSpan) btnCsvSpan.textContent = t("btnExportCSV");
        const btnPrintSpan = document.querySelector("#btnPrintReport span");
        if (btnPrintSpan) btnPrintSpan.textContent = t("btnPrint");

        // Reports Tab - Filters Toolbar
        const lblReportMonth = document.getElementById("lblReportMonth");
        if (lblReportMonth) lblReportMonth.innerHTML = `<i class="fa-regular fa-calendar"></i> ${t("lblReportMonth")}`;
        const lblReportDoctor = document.getElementById("lblReportDoctor");
        if (lblReportDoctor) lblReportDoctor.innerHTML = `<i class="fa-solid fa-user-doctor"></i> ${t("lblReportDoctor")}`;
        const lblReportStatus = document.getElementById("lblReportStatus");
        if (lblReportStatus) lblReportStatus.innerHTML = `<i class="fa-solid fa-filter"></i> ${t("lblReportStatus")}`;
        const btnRefreshReportSpan = document.querySelector("#btnRefreshReport span");
        if (btnRefreshReportSpan) btnRefreshReportSpan.textContent = t("btnRefresh");
        const btnRefreshReport = document.getElementById("btnRefreshReport");
        if (btnRefreshReport) btnRefreshReport.title = t("btnRefreshTooltip");

        const reportStatusSelect = document.getElementById("reportStatusSelect");
        if (reportStatusSelect && reportStatusSelect.options.length >= 4) {
            reportStatusSelect.options[0].text = t("allStatusesOption");
            reportStatusSelect.options[1].text = t("statusOnlyDone");
            reportStatusSelect.options[2].text = t("statusTreatingOpt");
            reportStatusSelect.options[3].text = t("statusWaitingOpt");
        }

        // Reports Tab - KPI Cards Labels
        const lblKpiPatients = document.getElementById("lblKpiPatients");
        if (lblKpiPatients) lblKpiPatients.textContent = t("kpiPatients");
        const kpiMonthPatientsSub = document.getElementById("kpiMonthPatientsSub");
        if (kpiMonthPatientsSub) kpiMonthPatientsSub.innerHTML = `<i class="fa-solid fa-arrow-trend-up"></i> ${t("kpiPatientsSub")}`;

        const lblKpiRevenue = document.getElementById("lblKpiRevenue");
        if (lblKpiRevenue) lblKpiRevenue.textContent = t("kpiRevenue");
        const kpiMonthRevenueSub = document.getElementById("kpiMonthRevenueSub");
        if (kpiMonthRevenueSub) kpiMonthRevenueSub.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${t("kpiRevenueSub")}`;

        const lblKpiTotal = document.getElementById("lblKpiTotal");
        if (lblKpiTotal) lblKpiTotal.textContent = t("kpiTotal");
        const kpiMonthTotalSub = document.getElementById("kpiMonthTotalSub");
        if (kpiMonthTotalSub) kpiMonthTotalSub.innerHTML = `<i class="fa-solid fa-calculator"></i> ${t("kpiTotalSub")}`;

        const lblKpiDebt = document.getElementById("lblKpiDebt");
        if (lblKpiDebt) lblKpiDebt.textContent = t("kpiDebt");
        const kpiMonthDebtSub = document.getElementById("kpiMonthDebtSub");
        if (kpiMonthDebtSub) kpiMonthDebtSub.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> ${t("kpiDebtSub")}`;

        const lblKpiCompleted = document.getElementById("lblKpiCompleted");
        if (lblKpiCompleted) lblKpiCompleted.textContent = t("kpiCompleted");
        const kpiMonthCompletedSub = document.getElementById("kpiMonthCompletedSub");
        if (kpiMonthCompletedSub) kpiMonthCompletedSub.innerHTML = `<i class="fa-solid fa-check-double"></i> ${t("kpiCompletedSub")}`;

        const lblKpiAvg = document.getElementById("lblKpiAvg");
        if (lblKpiAvg) lblKpiAvg.textContent = t("kpiAvg");
        const kpiMonthAvgSub = document.getElementById("kpiMonthAvgSub");
        if (kpiMonthAvgSub) kpiMonthAvgSub.innerHTML = `<i class="fa-solid fa-user-tag"></i> ${t("kpiAvgSub")}`;

        // Reports Tab - Doctor Breakdown Table Headers
        const docTableTitle = document.getElementById("doctorTableTitle");
        if (docTableTitle) docTableTitle.innerHTML = `<i class="fa-solid fa-user-doctor" style="color: var(--primary);"></i> ${t("docTableTitle")}`;
        const docTableSub = document.getElementById("doctorTableSub");
        if (docTableSub) docTableSub.textContent = t("docTableSub");

        const docThs = document.querySelectorAll("#doctorMonthlyTable thead th");
        if (docThs.length >= 8) {
            docThs[0].textContent = t("docThName");
            docThs[1].textContent = t("docThSpec");
            docThs[2].textContent = t("docThPatients");
            docThs[3].textContent = t("docThServices");
            docThs[4].textContent = t("docThRevenue");
            docThs[5].textContent = t("docThDebt");
            docThs[6].textContent = t("docThRate");
            docThs[7].textContent = t("docThAction");
        }

        // Reports Tab - Monthly History Table Headers
        const histTableTitle = document.getElementById("historyTableTitle");
        if (histTableTitle) histTableTitle.innerHTML = `<i class="fa-solid fa-chart-column" style="color: var(--secondary);"></i> ${t("histTableTitle")}`;
        const historyTableSub = document.getElementById("historyTableSub");
        if (historyTableSub) historyTableSub.textContent = t("histTableSub");
        const badgeHistory = document.getElementById("badgeHistory");
        if (badgeHistory) badgeHistory.innerHTML = `<i class="fa-solid fa-clock-rotate-left"></i> ${t("histBadgeDynamic")}`;

        const histThs = document.querySelectorAll("#monthlyHistoryTable thead th");
        if (histThs.length >= 8) {
            histThs[0].textContent = t("histThMonth");
            histThs[1].textContent = t("histThPatients");
            histThs[2].textContent = t("histThCompleted");
            histThs[3].textContent = t("histThTotal");
            histThs[4].textContent = t("histThRevenue");
            histThs[5].textContent = t("histThDebt");
            histThs[6].textContent = t("histThAvg");
            histThs[7].textContent = t("histThAction");
        }

        // Reports Tab - Services Distribution
        const servicesReportTitle = document.getElementById("servicesReportTitle");
        if (servicesReportTitle) servicesReportTitle.innerHTML = `<i class="fa-solid fa-stethoscope" style="color: var(--primary);"></i> ${t("servicesReportTitle")}`;
        const servicesReportSub = document.getElementById("servicesReportSub");
        if (servicesReportSub) servicesReportSub.textContent = t("servicesReportSub");

        // Reports Tab - Patient Registry
        const reportListTitle = document.getElementById("reportListTitle");
        if (reportListTitle) reportListTitle.innerHTML = `<i class="fa-solid fa-list-check" style="color: var(--primary);"></i> ${t("reportListTitle")}`;
        const reportListDesc = document.getElementById("reportListDesc");
        if (reportListDesc) reportListDesc.textContent = t("reportListSub");

        const regThs = document.querySelectorAll("#reportPatientsListTable thead th");
        if (regThs.length >= 10) {
            regThs[0].textContent = t("thRegId");
            regThs[1].textContent = t("thRegDateTime");
            regThs[2].textContent = t("thRegPatient");
            regThs[3].textContent = t("thRegPhone");
            regThs[4].textContent = t("thRegDoctor");
            regThs[5].textContent = t("thRegService");
            regThs[6].textContent = t("thRegTotal");
            regThs[7].textContent = t("thRegPaid");
            regThs[8].textContent = t("thRegPayStatus");
            regThs[9].textContent = t("thRegStatus");
        }

        // Patient Modal
        const pModalTitle = document.getElementById("patientModalTitle");
        if (pModalTitle) pModalTitle.textContent = (patientEditId && patientEditId.value) ? t("modalEditPatientTitle") : t("modalAddPatientTitle");
        const patientModalSub = document.getElementById("patientModalSub");
        if (patientModalSub) patientModalSub.textContent = t("modalAddPatientSub");
        const lblPFullName = document.getElementById("lblPFullName");
        if (lblPFullName) lblPFullName.innerHTML = `${t("lblFullName")} <span class="required">*</span>`;
        const lblPAge = document.getElementById("lblPAge");
        if (lblPAge) lblPAge.innerHTML = `${t("lblAge")} <span class="required">*</span>`;
        const lblPPhone = document.getElementById("lblPPhone");
        if (lblPPhone) lblPPhone.innerHTML = `${t("lblPhone")} <span class="required">*</span>`;
        const lblPGender = document.getElementById("lblPGender");
        if (lblPGender) lblPGender.textContent = t("lblGender");
        const pGender = document.getElementById("pGender");
        if (pGender && pGender.options.length >= 2) {
            pGender.options[0].text = t("genderMale");
            pGender.options[1].text = t("genderFemale");
        }
        const lblPDoctor = document.getElementById("lblPDoctor");
        if (lblPDoctor) lblPDoctor.innerHTML = `${t("lblDoctor")} <span class="required">*</span>`;
        const lblPService = document.getElementById("lblPService");
        if (lblPService) lblPService.innerHTML = `${t("lblService")} <span class="required">*</span>`;
        const lblPTooth = document.getElementById("lblPTooth");
        if (lblPTooth) lblPTooth.textContent = t("lblToothNumber");
        const lblPDate = document.getElementById("lblPDate");
        if (lblPDate) lblPDate.innerHTML = `${t("lblAppointmentDate")} <span class="required">*</span>`;
        const lblPDiag = document.getElementById("lblPDiag");
        if (lblPDiag) lblPDiag.innerHTML = `${t("lblDiagnosis")} <span class="required">*</span>`;
        const lblPTotal = document.getElementById("lblPTotal");
        if (lblPTotal) lblPTotal.textContent = t("lblTotalAmount");
        const lblPPaid = document.getElementById("lblPPaid");
        if (lblPPaid) lblPPaid.textContent = t("lblPaidAmount");
        const lblPStatus = document.getElementById("lblPStatus");
        if (lblPStatus) lblPStatus.textContent = t("lblStatus");
        const pStatus = document.getElementById("pStatus");
        if (pStatus && pStatus.options.length >= 4) {
            pStatus.options[0].text = t("statusTreating");
            pStatus.options[1].text = t("statusDone");
            pStatus.options[2].text = t("statusWaiting");
            pStatus.options[3].text = t("statusCancelled");
        }
        const lblPPayStatus = document.getElementById("lblPPayStatus");
        if (lblPPayStatus) lblPPayStatus.textContent = t("lblPaymentStatus");
        const pPaymentStatus = document.getElementById("pPaymentStatus");
        if (pPaymentStatus && pPaymentStatus.options.length >= 3) {
            pPaymentStatus.options[0].text = t("payPaid");
            pPaymentStatus.options[1].text = t("payPartial");
            pPaymentStatus.options[2].text = t("payUnpaid");
        }
        const lblPPrescription = document.getElementById("lblPPrescription");
        if (lblPPrescription) lblPPrescription.innerHTML = `<i class="fa-solid fa-pills" style="color: #0284c7;"></i> ${t("lblPrescription")}`;
        const lblPNotes = document.getElementById("lblPNotes");
        if (lblPNotes) lblPNotes.textContent = t("lblNotes");
        const btnCancelPatient = document.getElementById("btnCancelPatient");
        if (btnCancelPatient) btnCancelPatient.textContent = t("btnCancel");
        const btnSavePatient = document.getElementById("btnSavePatient");
        if (btnSavePatient) btnSavePatient.innerHTML = `<i class="fa-solid fa-floppy-disk"></i> <span id="btnSavePatientText">${t("btnSave")}</span>`;

        // Telegram Connect Modal
        const tgModalHeading = document.getElementById("tgModalHeading");
        if (tgModalHeading) tgModalHeading.textContent = t("tgModalTitle");
        const tgModalStep1 = document.getElementById("tgModalStep1");
        if (tgModalStep1) tgModalStep1.textContent = t("tgStep1");
        const tgModalStep1Desc = document.getElementById("tgModalStep1Desc");
        if (tgModalStep1Desc) tgModalStep1Desc.innerHTML = t("tgStepDesc");
        const btnCopyTgLinkText = document.getElementById("btnCopyTgLinkText");
        if (btnCopyTgLinkText) btnCopyTgLinkText.textContent = t("btnCopyLink");
        const btnShareTgDirectText = document.getElementById("btnShareTgDirectText");
        if (btnShareTgDirectText) btnShareTgDirectText.textContent = t("btnShareTg");
        const btnCloseTgBtn = document.getElementById("btnCloseTgBtn");
        if (btnCloseTgBtn) btnCloseTgBtn.textContent = t("btnClose");

        // Service Modal
        const serviceModalHeading = document.getElementById("serviceModalHeading");
        if (serviceModalHeading) serviceModalHeading.textContent = t("modalAddServiceTitle");
        const serviceModalSub = document.getElementById("serviceModalSub");
        if (serviceModalSub) serviceModalSub.textContent = t("modalAddServiceSub");
        const lblServiceName = document.getElementById("lblServiceName");
        if (lblServiceName) lblServiceName.innerHTML = `${t("lblServiceName")} <span class="required">*</span>`;
        const lblServicePrice = document.getElementById("lblServicePrice");
        if (lblServicePrice) lblServicePrice.innerHTML = `${t("lblServicePrice")} <span class="required">*</span>`;
        const lblServiceDuration = document.getElementById("lblServiceDuration");
        if (lblServiceDuration) lblServiceDuration.innerHTML = `${t("lblServiceDuration")} <span class="required">*</span>`;
        const btnCancelService = document.getElementById("btnCancelService");
        if (btnCancelService) btnCancelService.textContent = t("btnCancel");
        const btnSaveServiceText = document.getElementById("btnSaveServiceText");
        if (btnSaveServiceText) btnSaveServiceText.textContent = t("btnAddServiceSubmit");

        // Doctor Modal
        const doctorModalHeading = document.getElementById("doctorModalHeading");
        const doctorModalSub = document.getElementById("doctorModalSub");
        if (doctorModalSub) doctorModalSub.textContent = t("modalAddDoctorSub");
        const lblDoctorName = document.getElementById("lblDoctorName");
        if (lblDoctorName) lblDoctorName.innerHTML = `${t("lblDoctorName")} <span class="required">*</span>`;
        const lblDoctorSpecialty = document.getElementById("lblDoctorSpecialty");
        if (lblDoctorSpecialty) lblDoctorSpecialty.innerHTML = `${t("lblDoctorSpecialty")} <span class="required">*</span>`;
        const lblDoctorExp = document.getElementById("lblDoctorExp");
        if (lblDoctorExp) lblDoctorExp.innerHTML = `${t("lblDoctorExp")} <span class="required">*</span>`;
        const lblDoctorPhone = document.getElementById("lblDoctorPhone");
        if (lblDoctorPhone) lblDoctorPhone.innerHTML = `${t("lblDoctorPhone")} <span class="required">*</span>`;
        const lblDoctorAvatar = document.getElementById("lblDoctorAvatar");
        if (lblDoctorAvatar) lblDoctorAvatar.innerHTML = `<i class="fa-solid fa-camera" style="color: var(--primary);"></i> ${t("lblDoctorAvatar")}`;
        const btnUploadDoctorPhotoText = document.getElementById("btnUploadDoctorPhotoText");
        if (btnUploadDoctorPhotoText) btnUploadDoctorPhotoText.textContent = t("btnUploadDoctorPhotoText");
        const btnResetDoctorPhotoText = document.getElementById("btnResetDoctorPhotoText");
        if (btnResetDoctorPhotoText) btnResetDoctorPhotoText.textContent = t("btnResetDoctorPhotoText");
        const lblDoctorAvatarHelp = document.getElementById("lblDoctorAvatarHelp");
        if (lblDoctorAvatarHelp) lblDoctorAvatarHelp.textContent = t("lblDoctorAvatarHelp");
        const lblOrChoosePreset = document.getElementById("lblOrChoosePreset");
        if (lblOrChoosePreset) lblOrChoosePreset.textContent = t("lblOrChoosePreset");
        const doctorAvatarSelect = document.getElementById("doctorAvatarSelect");
        if (doctorAvatarSelect && doctorAvatarSelect.options.length >= 5) {
            doctorAvatarSelect.options[0].text = currentAppLang === "ru" ? "Врач-мужчина 1" : "Erkak Shifokor 1";
            doctorAvatarSelect.options[1].text = currentAppLang === "ru" ? "Врач-мужчина 2" : "Erkak Shifokor 2";
            doctorAvatarSelect.options[2].text = currentAppLang === "ru" ? "Врач-женщина 1" : "Ayol Shifokor 1";
            doctorAvatarSelect.options[3].text = currentAppLang === "ru" ? "Врач-женщина 2" : "Ayol Shifokor 2";
            doctorAvatarSelect.options[4].text = currentAppLang === "ru" ? "Медсестра / Ассистент" : "Hamshira / Assistent";
        }
        const btnCancelDoctor = document.getElementById("btnCancelDoctor");
        if (btnCancelDoctor) btnCancelDoctor.textContent = t("btnCancel");
        const btnSaveDoctorText = document.getElementById("btnSaveDoctorText");
        const doctorEditId = document.getElementById("doctorEditId");
        if (btnSaveDoctorText) {
            btnSaveDoctorText.textContent = (doctorEditId && doctorEditId.value) ? t("btnSaveDoctorEdit") : t("btnAddDoctorSubmit");
        }
        if (doctorModalHeading) {
            doctorModalHeading.textContent = (doctorEditId && doctorEditId.value) ? t("modalEditDoctorTitle") : t("modalAddDoctorTitle");
        }

        // Re-render
        renderStats();
        renderPatientsTable();
        renderToothChart();
        renderServicesTab();
        renderDoctorsTab();
        renderMonthlyReports();
        initDateTime();
    }

    if (btnLangUz) btnLangUz.addEventListener("click", () => applyAppLanguage("uz"));
    if (btnLangRu) btnLangRu.addEventListener("click", () => applyAppLanguage("ru"));

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

    // Tanlangan tilni yuklash
    applyAppLanguage(currentAppLang);

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
        const dashMonthBannerDesc = document.getElementById("dashMonthBannerDesc");

        if (dashMonthBannerTitle) dashMonthBannerTitle.textContent = getMonthDisplayName(currentMonthKey);
        if (dashMonthBannerDesc) {
            dashMonthBannerDesc.innerHTML = t("bannerDesc", currentMonthPatients.length, formatCurrency(currentMonthRev));
        }
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
                        <p style="font-size: 15px; font-weight: 600; color: #64748b;">${t("noPatientsFound")}</p>
                        <small>${t("noPatientsSub")}</small>
                    </td>
                </tr>
            `;
            if (tableRecordInfo) tableRecordInfo.textContent = t("showingPatients", 0, patients.length);
            return;
        }

        patientsTableBody.innerHTML = filtered.map(patient => {
            const statusClass = getStatusClass(patient.status);
            const payClass = getPaymentClass(patient.paymentStatus);
            const formattedDate = formatDateTime(patient.appointmentDate);
            const genderLabel = patient.gender === "Ayol" 
                ? (currentAppLang === "ru" ? "Женский" : "Ayol") 
                : (currentAppLang === "ru" ? "Мужской" : "Erkak");

            return `
                <tr>
                    <td><span class="id-badge">${patient.id}</span></td>
                    <td>
                        <div class="patient-cell">
                            <span class="patient-name">${escapeHtml(patient.fullName)}</span>
                            <span class="patient-sub">${patient.age} ${t("ageSuffix")} &bull; ${genderLabel}</span>
                        </div>
                    </td>
                    <td>
                        <a href="tel:${patient.phone}" style="color: var(--primary); font-weight: 500;">
                            <i class="fa-solid fa-phone" style="font-size: 11px; margin-right: 4px;"></i>${escapeHtml(patient.phone)}
                        </a>
                    </td>
                    <td>
                        <span style="font-weight: 500;">${escapeHtml(patient.diagnosis)}</span>
                        ${patient.toothNumber ? `<span class="tooth-badge">${t("toothLabel")}: ${escapeHtml(patient.toothNumber)}</span>` : ''}
                    </td>
                    <td><span style="color: #475569;">${escapeHtml(patient.serviceName || patient.serviceId || 'Konsultatsiya')}</span></td>
                    <td><span style="font-weight: 500; color: #334155;">${escapeHtml(patient.doctor)}</span></td>
                    <td style="white-space: nowrap;"><i class="fa-regular fa-clock" style="font-size: 12px; color: #94a3b8; margin-right: 4px;"></i>${formattedDate}</td>
                    <td>
                        <div>
                            <span class="pay-badge ${payClass}">${getPaymentStatusDisplayName(patient.paymentStatus || 'To\'langan')}</span>
                            <div style="font-size: 11.5px; color: #64748b; margin-top: 3px;">
                                ${formatCurrency(patient.paidAmount)} / ${formatCurrency(patient.totalAmount)}
                            </div>
                        </div>
                    </td>
                    <td>
                        <span class="status-pill ${statusClass}">${getStatusDisplayName(patient.status)}</span>
                    </td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-icon view" title="${t("tooltipView")}" data-id="${patient.id}">
                                <i class="fa-regular fa-eye"></i>
                            </button>
                            <button class="btn-icon edit" title="${t("tooltipEdit")}" data-id="${patient.id}">
                                <i class="fa-regular fa-pen-to-square"></i>
                            </button>
                            <button class="btn-icon delete" title="${t("tooltipDelete")}" data-id="${patient.id}">
                                <i class="fa-regular fa-trash-can"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join("");

        if (tableRecordInfo) {
            tableRecordInfo.textContent = t("showingPatients", filtered.length, patients.length);
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

        const pPrescription = document.getElementById("pPrescription");
        if (pPrescription) pPrescription.value = "";

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

        const pPrescription = document.getElementById("pPrescription");
        if (pPrescription) pPrescription.value = patient.prescription || "";

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

            const prescriptionVal = document.getElementById("pPrescription") ? document.getElementById("pPrescription").value.trim() : "";

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
                        prescription: prescriptionVal,
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
                    prescription: prescriptionVal,
                    notes: document.getElementById("pNotes").value.trim(),
                    telegramChatId: null,
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
        viewModalPatientId.innerHTML = `ID: ${patient.id} &bull; ${t("registeredDateLabel")} ${patient.createdAt || (currentAppLang === 'ru' ? 'Не указано' : 'Noma\'lum')}`;

        const statusClass = getStatusClass(patient.status);
        const payClass = getPaymentClass(patient.paymentStatus);
        const qoldiq = Math.max(0, patient.totalAmount - patient.paidAmount);

        const genderLabel = patient.gender === "Ayol" 
            ? (currentAppLang === "ru" ? "Женский" : "Ayol") 
            : (currentAppLang === "ru" ? "Мужской" : "Erkak");

        viewPatientContent.innerHTML = `
            <div class="view-card-grid">
                <div class="view-item">
                    <div class="view-item-label"><i class="fa-solid fa-user"></i> ${t("viewPersonalInfo")}</div>
                    <div class="view-item-value">${escapeHtml(patient.fullName)} (${patient.age} ${t("ageSuffix")}, ${genderLabel})</div>
                </div>

                <div class="view-item">
                    <div class="view-item-label"><i class="fa-solid fa-phone"></i> ${t("viewPhone")}</div>
                    <div class="view-item-value">
                        <a href="tel:${patient.phone}" style="color: var(--primary);">${escapeHtml(patient.phone)}</a>
                    </div>
                </div>

                <div class="view-item">
                    <div class="view-item-label"><i class="fa-solid fa-user-doctor"></i> ${t("viewDoctor")}</div>
                    <div class="view-item-value">${escapeHtml(patient.doctor)}</div>
                </div>

                <div class="view-item">
                    <div class="view-item-label"><i class="fa-regular fa-calendar-days"></i> ${t("viewAppDate")}</div>
                    <div class="view-item-value">${formatDateTime(patient.appointmentDate)}</div>
                </div>

                <div class="view-item">
                    <div class="view-item-label"><i class="fa-solid fa-stethoscope"></i> ${t("viewDiagnosis")}</div>
                    <div class="view-item-value">${escapeHtml(patient.diagnosis)}</div>
                </div>

                <div class="view-item">
                    <div class="view-item-label"><i class="fa-solid fa-tooth"></i> ${t("viewTooth")}</div>
                    <div class="view-item-value">${patient.toothNumber || (currentAppLang === "ru" ? "Общий осмотр" : "Umumiy ko'rik")}</div>
                </div>

                <div class="view-item">
                    <div class="view-item-label"><i class="fa-solid fa-shield-halved"></i> ${t("viewStatus")}</div>
                    <div class="view-item-value">
                        <span class="status-pill ${statusClass}">${getStatusDisplayName(patient.status)}</span>
                    </div>
                </div>

                <div class="view-item">
                    <div class="view-item-label"><i class="fa-solid fa-receipt"></i> ${t("viewPayment")}</div>
                    <div class="view-item-value">
                        <span class="pay-badge ${payClass}">${getPaymentStatusDisplayName(patient.paymentStatus)}</span>
                    </div>
                </div>
            </div>

            <div style="background: #f8fafc; border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 16px; margin-bottom: 16px;">
                <h4 style="font-size: 13.5px; font-weight: 700; margin-bottom: 10px; color: var(--text-primary);">
                    <i class="fa-solid fa-wallet" style="color: var(--primary);"></i> ${t("viewBalanceTitle")}
                </h4>
                <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 6px;">
                    <span>${t("viewTotalSum")}</span>
                    <strong>${formatCurrency(patient.totalAmount)}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 6px; color: #16a34a;">
                    <span>${t("viewPaidSum")}</span>
                    <strong>${formatCurrency(patient.paidAmount)}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 13px; color: #dc2626; border-top: 1px dashed #cbd5e1; padding-top: 6px;">
                    <span>${t("viewDebtSum")}</span>
                    <strong>${formatCurrency(qoldiq)}</strong>
                </div>
            </div>

            <!-- Retsept va Dorilar Bo'limi -->
            <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: var(--radius-md); padding: 18px; margin-bottom: 16px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
                    <h4 style="font-size: 14px; font-weight: 700; color: #166534; margin: 0; display: flex; align-items: center; gap: 8px;">
                        <i class="fa-solid fa-pills" style="font-size: 16px; color: #15803d;"></i> ${t("viewPrescriptionTitle")}
                    </h4>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        ${patient.telegramChatId ? `
                            <span style="display: inline-flex; align-items: center; gap: 5px; font-size: 11.5px; font-weight: 600; padding: 4px 10px; background: #dcfce7; color: #15803d; border-radius: 999px; border: 1px solid #86efac;">
                                <i class="fa-brands fa-telegram"></i> ${t("viewTgConnected")} (${patient.telegramLang === 'ru' ? '🇷🇺 Ruscha' : '🇺🇿 O\'zbekcha'})
                            </span>
                            <button type="button" id="btnToggleTgLang" title="Telegram tilini o'zgartirish" style="font-size: 11px; padding: 3px 8px; border-radius: 4px; border: 1px solid #cbd5e1; background: #ffffff; cursor: pointer;">
                                🌐 ${patient.telegramLang === 'ru' ? '🇷🇺 RU &rarr; 🇺🇿 UZ' : '🇺🇿 UZ &rarr; 🇷🇺 RU'}
                            </button>
                        ` : `
                            <span style="display: inline-flex; align-items: center; gap: 5px; font-size: 11.5px; font-weight: 600; padding: 4px 10px; background: #fef3c7; color: #b45309; border-radius: 999px; border: 1px solid #fde68a;">
                                <i class="fa-brands fa-telegram"></i> ${t("viewTgNotConnected")}
                            </span>
                        `}
                    </div>
                </div>

                <div style="background: #ffffff; border: 1px solid #dcfce7; border-radius: 8px; padding: 14px; font-size: 13.5px; color: #1e293b; white-space: pre-wrap; line-height: 1.6; margin-bottom: 14px;">${escapeHtml(patient.prescription || t("viewNoPrescription"))}</div>

                <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                    ${patient.telegramChatId ? `
                        <button type="button" class="btn-primary" id="btnSendPrescriptionTg" style="background: #0284c7; font-size: 13px; padding: 9px 16px;">
                            <i class="fa-brands fa-telegram"></i> ${t("btnSendTgPrescription")}
                        </button>
                    ` : `
                        <button type="button" class="btn-primary" id="btnConnectPatientTg" style="background: #0284c7; font-size: 13px; padding: 9px 16px;">
                            <i class="fa-solid fa-qrcode"></i> ${t("btnConnectTg")}
                        </button>
                    `}
                </div>
            </div>

            ${patient.notes ? `
                <div class="view-notes-box">
                    <h4><i class="fa-regular fa-comment-dots"></i> ${t("viewDoctorNotes")}</h4>
                    <p>${escapeHtml(patient.notes)}</p>
                </div>
            ` : ''}
        `;

        const btnToggleTgLang = document.getElementById("btnToggleTgLang");
        if (btnToggleTgLang) {
            btnToggleTgLang.onclick = () => {
                patient.telegramLang = patient.telegramLang === "ru" ? "uz" : "ru";
                savePatientsToStorage(patients);
                openPatientViewModal(patient.id);
                showToast(`Telegram tili o'zgartirildi: ${patient.telegramLang === 'ru' ? '🇷🇺 Русский' : '🇺🇿 O\'zbekcha'}`, "info");
            };
        }

        const btnSendPrescriptionTg = document.getElementById("btnSendPrescriptionTg");
        if (btnSendPrescriptionTg) {
            btnSendPrescriptionTg.onclick = () => {
                sendPrescriptionToPatient(patient);
            };
        }

        const btnConnectPatientTg = document.getElementById("btnConnectPatientTg");
        if (btnConnectPatientTg) {
            btnConnectPatientTg.onclick = () => {
                openTelegramConnectModal(patient);
            };
        }

        const btnCloseViewBtn = document.getElementById("btnCloseViewBtn");
        if (btnCloseViewBtn) btnCloseViewBtn.textContent = t("btnClose");
        const btnEditFromView = document.getElementById("btnEditFromView");
        if (btnEditFromView) btnEditFromView.innerHTML = `<i class="fa-solid fa-pen-to-square"></i> ${t("btnEdit")}`;

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
    // TELEGRAM BOT TIZIMI (@ahmad_dentacare_bot)
    // ==========================================================
    const TELEGRAM_BOT_TOKEN = "8875532205:AAFHaFvr7Nof23j11qkFlHJLBlYJ9YkT7HU";
    const TELEGRAM_BOT_USERNAME = "ahmad_dentacare_bot";
    let tgLastUpdateId = 0;

    // Telegram chat tillarini saqlash va olish
    function getTgChatLang(chatId) {
        try {
            const map = JSON.parse(localStorage.getItem("dentacare_tg_chat_langs") || "{}");
            return map[chatId] || "uz";
        } catch (e) {
            return "uz";
        }
    }

    function setTgChatLang(chatId, lang) {
        try {
            const map = JSON.parse(localStorage.getItem("dentacare_tg_chat_langs") || "{}");
            map[chatId] = lang;
            localStorage.setItem("dentacare_tg_chat_langs", JSON.stringify(map));
        } catch (e) {}
    }

    // Inline tugmalar: Tilni tanlash
    function getTgLangInlineKeyboard(patientId = "") {
        const suffix = patientId ? `:${patientId}` : "";
        return {
            inline_keyboard: [
                [
                    { text: "🇺🇿 O'zbekcha", callback_data: `lang_uz${suffix}` },
                    { text: "🇷🇺 Русский", callback_data: `lang_ru${suffix}` }
                ]
            ]
        };
    }

    // Qulay pastki menyu (Reply Keyboard)
    function getTgReplyKeyboard(lang = "uz") {
        if (lang === "ru") {
            return {
                keyboard: [
                    [{ text: "📋 Мой рецепт" }, { text: "🌐 Сменить язык" }],
                    [{ text: "ℹ️ О клинике" }, { text: "📞 Контакты" }]
                ],
                resize_keyboard: true
            };
        }
        return {
            keyboard: [
                [{ text: "📋 Mening retseptim" }, { text: "🌐 Tilni o'zgartirish" }],
                [{ text: "ℹ️ Klinika haqida" }, { text: "📞 Kontaktlar" }]
            ],
            resize_keyboard: true
        };
    }

    // Telegramga xabar yuborish
    async function sendTelegramMessage(chatId, htmlText, replyMarkup = null) {
        try {
            const body = {
                chat_id: chatId,
                text: htmlText,
                parse_mode: "HTML"
            };
            if (replyMarkup) {
                body.reply_markup = replyMarkup;
            }
            const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });
            return await res.json();
        } catch (e) {
            console.error("Telegram send error:", e);
            return { ok: false, description: e.message };
        }
    }

    // Callback query tasdiqlash
    async function answerTelegramCallbackQuery(queryId, text = "") {
        try {
            await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/answerCallbackQuery`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ callback_query_id: queryId, text: text })
            });
        } catch (e) {}
    }

    // Bot matnlari: Xush kelibsiz (Uzbek)
    function getTgWelcomeMessageUz(patient) {
        let msg = `🏥 <b>DentaCare Stomatologiya Klinikasi</b>\n\nAssalomu alaykum, hurmatli <b>${escapeHtml(patient.fullName)}</b>!\nSiz klinikamizning rasmiy botiga muvaffaqiyatli ulandingiz. ✅\nTanlangan til: 🇺🇿 <b>O'zbekcha</b>\n\n👨‍⚕️ Mas'ul shifokoringiz: <b>${escapeHtml(patient.doctor || 'Dr. Ahmadbek')}</b>\n🦷 Tashxis: <b>${escapeHtml(patient.diagnosis || "Umumiy ko'rik")}</b>\n🩺 Shifokoringiz belgilagan barcha dorilar, retseptlar va qabul eslatmalari to'g'ridan-to'g'ri shu yerga yuboriladi.`;
        if (patient.prescription) {
            msg += `\n\n📋 <b>SIZGA BELGILANGAN RETSEPT VA DORILAR:</b>\n━━━━━━━━━━━━━━━━━━━━━━\n${patient.prescription}\n━━━━━━━━━━━━━━━━━━━━━━\n⚠️ <i>Iltimos, barcha dori vositalarini shifokor ko'rsatmasi bo'yicha o'z vaqtida qabul qiling!</i>`;
        }
        msg += `\n\n📞 Klinika: +998 90 777 01 01\n✨ <i>DentaCare — Sog'lom va chiroyli tabassum garovi!</i>`;
        return msg;
    }

    // Bot matnlari: Xush kelibsiz (Russian)
    function getTgWelcomeMessageRu(patient) {
        let msg = `🏥 <b>Стоматологическая Клиника DentaCare</b>\n\nЗдравствуйте, уважаемый(ая) <b>${escapeHtml(patient.fullName)}</b>!\nВы успешно подключились к официальному боту клиники. ✅\nВыбранный язык: 🇷🇺 <b>Русский</b>\n\n👨‍⚕️ Ваш лечащий врач: <b>${escapeHtml(patient.doctor || 'Dr. Ahmadbek')}</b>\n🦷 Диагноз: <b>${escapeHtml(patient.diagnosis || "Общий осмотр")}</b>\n🩺 Все назначенные врачом рецепты, лекарства и напоминания о визитах будут отправляться сюда.`;
        if (patient.prescription) {
            msg += `\n\n📋 <b>ВАШ НАЗНАЧЕННЫЙ РЕЦЕПТ И ЛЕКАРСТВА:</b>\n━━━━━━━━━━━━━━━━━━━━━━\n${patient.prescription}\n━━━━━━━━━━━━━━━━━━━━━━\n⚠️ <i>Пожалуйста, принимайте лекарства строго по назначению врача!</i>`;
        }
        msg += `\n\n📞 Клиника: +998 90 777 01 01\n✨ <i>DentaCare — Залог здоровой и красивой улыбки!</i>`;
        return msg;
    }

    // Bemorga retseptni bot orqali yuborish (Bemor tiliga qarab yuboriladi)
    async function sendPrescriptionToPatient(patient) {
        if (!patient.telegramChatId) {
            showToast(t("toastTgNotConnected"), "warning");
            openTelegramConnectModal(patient);
            return;
        }

        if (!patient.prescription) {
            showToast(t("toastNoPrescription"), "warning");
            return;
        }

        const pLang = patient.telegramLang || getTgChatLang(patient.telegramChatId) || "uz";
        const message = pLang === "ru" ? formatTgPrescriptionRu(patient) : formatTgPrescriptionUz(patient);

        showToast(currentAppLang === "ru" ? "Отправка рецепта в Telegram..." : "Retsept Telegramga yuborilmoqda...", "info");
        const res = await sendTelegramMessage(patient.telegramChatId, message, getTgReplyKeyboard(pLang));

        if (res.ok) {
            showToast(t("toastTgSent", patient.fullName), "success");
        } else {
            showToast(`${t("toastTgError")}: ${res.description || 'Xatolik'}`, "danger");
        }
    }

    function formatTgPrescriptionUz(patient) {
        return `🏥 <b>DentaCare Stomatologiya Klinikasi</b>
📋 <b>BEMORGA BELGILANGAN RETSEPT VA DORILAR</b>

👤 <b>Bemor:</b> ${escapeHtml(patient.fullName)} (${patient.age} yosh)
👨‍⚕️ <b>Mas'ul shifokor:</b> ${escapeHtml(patient.doctor)}
🦷 <b>Tashxis:</b> ${escapeHtml(patient.diagnosis || "Ko'rik")} ${patient.toothNumber ? `(Tish #${escapeHtml(patient.toothNumber)})` : ''}
📅 <b>Qabul vaqti:</b> ${formatDateTime(patient.appointmentDate)}

💊 <b>DORILAR VA QABUL QILISH TARTIBI:</b>
━━━━━━━━━━━━━━━━━━━━━━
${patient.prescription || "Hozircha dorilar yozilmagan."}
━━━━━━━━━━━━━━━━━━━━━━

⚠️ <i>Eslatma: Iltimos, barcha dori vositalarini shifokor ko'rsatmasi bo'yicha o'z vaqtida va belgilangan dozada qabul qiling!</i>

📞 Savollar bo'lsa: +998 90 777 01 01
✨ <i>DentaCare — Sog'lom va chiroyli tabassum garovi!</i>`;
    }

    function formatTgPrescriptionRu(patient) {
        return `🏥 <b>Стоматологическая Клиника DentaCare</b>
📋 <b>РЕЦЕПТ И НАЗНАЧЕННЫЕ ЛЕКАРСТВА ПАЦИЕНТА</b>

👤 <b>Пациент:</b> ${escapeHtml(patient.fullName)} (${patient.age} лет)
👨‍⚕️ <b>Лечащий врач:</b> ${escapeHtml(patient.doctor)}
🦷 <b>Диагноз:</b> ${escapeHtml(patient.diagnosis || "Осмотр")} ${patient.toothNumber ? `(Зуб #${escapeHtml(patient.toothNumber)})` : ''}
📅 <b>Время приёма:</b> ${formatDateTime(patient.appointmentDate)}

💊 <b>ЛЕКАРСТВА И ПОРЯДОК ПРИЁМА:</b>
━━━━━━━━━━━━━━━━━━━━━━
${patient.prescription || "На данный момент лекарств не назначено."}
━━━━━━━━━━━━━━━━━━━━━━

⚠️ <i>Внимание: Пожалуйста, принимайте все лекарственные препараты строго по назначению врача, вовремя и в указанной дозировке!</i>

📞 Вопросы по телефону: +998 90 777 01 01
✨ <i>DentaCare — Залог здоровой и красивой улыбки!</i>`;
    }

    // Bemorni botga ulash modali (QR-kod va link)
    const telegramConnectModal = document.getElementById("telegramConnectModal");
    const btnCloseTgModal = document.getElementById("btnCloseTgModal");
    const btnCloseTgBtn = document.getElementById("btnCloseTgBtn");
    const tgQrCodeImg = document.getElementById("tgQrCodeImg");
    const tgBotLinkBox = document.getElementById("tgBotLinkBox");
    const btnCopyTgLink = document.getElementById("btnCopyTgLink");
    const btnShareTgDirect = document.getElementById("btnShareTgDirect");
    const tgConnectionStatusText = document.getElementById("tgConnectionStatusText");
    const tgModalPatientTitle = document.getElementById("tgModalPatientTitle");

    function openTelegramConnectModal(patient) {
        if (!telegramConnectModal) return;

        const deepLink = `https://t.me/${TELEGRAM_BOT_USERNAME}?start=${patient.id}`;
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(deepLink)}`;

        if (tgQrCodeImg) tgQrCodeImg.src = qrUrl;
        if (tgBotLinkBox) tgBotLinkBox.textContent = deepLink;
        if (tgModalPatientTitle) tgModalPatientTitle.textContent = `${patient.fullName} (ID: ${patient.id})`;

        if (btnShareTgDirect) {
            const shareText = currentAppLang === "ru"
                ? `Здравствуйте, ${patient.fullName}! Откройте официальный бот стоматологии DentaCare для получения рецептов и нажмите "Start":`
                : `Assalomu alaykum, ${patient.fullName}! DentaCare klinikasidan retseptlaringizni olish uchun botimizni oching va Start tugmasini bosing:`;
            btnShareTgDirect.href = `https://t.me/share/url?url=${encodeURIComponent(deepLink)}&text=${encodeURIComponent(shareText)}`;
        }

        if (btnCopyTgLink) {
            btnCopyTgLink.onclick = () => {
                navigator.clipboard.writeText(deepLink);
                showToast(t("toastCopied"), "info");
            };
        }

        if (tgConnectionStatusText) {
            tgConnectionStatusText.innerHTML = patient.telegramChatId 
                ? `<span style="color: #16a34a;"><i class="fa-solid fa-circle-check"></i> ${t("tgConnectedStatus")} (${patient.telegramLang === 'ru' ? '🇷🇺 RU' : '🇺🇿 UZ'})</span>`
                : `<i class="fa-solid fa-spinner fa-spin"></i> ${t("tgWaitingStatus")}`;
        }

        telegramConnectModal.classList.remove("d-none");
    }

    function closeTelegramConnectModal() {
        if (telegramConnectModal) telegramConnectModal.classList.add("d-none");
    }

    if (btnCloseTgModal) btnCloseTgModal.addEventListener("click", closeTelegramConnectModal);
    if (btnCloseTgBtn) btnCloseTgBtn.addEventListener("click", closeTelegramConnectModal);

    // Botdan yangi Start bosgan bemorlarni avtomatik aniqlash (Polling)
    async function checkTelegramUpdates() {
        try {
            const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates?offset=${tgLastUpdateId + 1}`);
            const data = await res.json();
            if (data.ok && data.result && data.result.length > 0) {
                let hasChanges = false;
                for (const upd of data.result) {
                    tgLastUpdateId = upd.update_id;

                    // 1. TUGMA BOSILGANDA (INLINE CALLBACK QUERY - TIL TANLANGANDA)
                    if (upd.callback_query) {
                        const cq = upd.callback_query;
                        const cqId = cq.id;
                        const chatId = cq.message.chat.id;
                        const uName = cq.from.username ? `@${cq.from.username}` : (cq.from.first_name || '');
                        const cqData = (cq.data || '').trim();

                        if (cqData.startsWith("lang_uz") || cqData.startsWith("lang_ru")) {
                            const chosenLang = cqData.startsWith("lang_ru") ? "ru" : "uz";
                            setTgChatLang(chatId, chosenLang);
                            await answerTelegramCallbackQuery(cqId, chosenLang === "ru" ? "🇷🇺 Язык: Русский" : "🇺🇿 Til: O'zbekcha");

                            // Agar bemor ID biriktirilgan bo'lsa (masalan: lang_uz:DENT-101)
                            const parts = cqData.split(":");
                            const attachedId = parts.length > 1 ? parts[1].trim().toUpperCase() : null;

                            let patient = attachedId 
                                ? patients.find(p => p.id.toUpperCase() === attachedId)
                                : patients.find(p => p.telegramChatId === chatId);

                            if (patient) {
                                patient.telegramChatId = chatId;
                                patient.telegramUsername = uName;
                                patient.telegramLang = chosenLang;
                                hasChanges = true;

                                const welcomeMsg = chosenLang === "ru" ? getTgWelcomeMessageRu(patient) : getTgWelcomeMessageUz(patient);
                                await sendTelegramMessage(chatId, welcomeMsg, getTgReplyKeyboard(chosenLang));
                                showToast(`${patient.fullName} Telegram botga ulandi (${chosenLang.toUpperCase()})!`, "success");
                            } else {
                                const unlinkedMsg = chosenLang === "ru" 
                                    ? `🇷🇺 <b>Язык успешно выбран: Русский.</b>\n\n🏥 <b>Официальный бот стоматологии DentaCare</b>\n\nЧтобы получить свои рецепты, отправьте свой <b>ID пациента</b> (например: <code>DENT-101</code>) или отсканируйте QR-код, предоставленный лечащим врачом.`
                                    : `🇺🇿 <b>Til muvaffaqiyatli tanlandi: O'zbekcha.</b>\n\n🏥 <b>DentaCare Stomatologiya rasmiy boti</b>\n\nRetseptlaringizni olish uchun, shifokor bergan <b>Bemor ID</b> raqamingizni yuboring (Masalan: <code>DENT-101</code>) yoki shifokoringiz taqdim etgan QR-kodni skaner qiling.`;
                                await sendTelegramMessage(chatId, unlinkedMsg, getTgReplyKeyboard(chosenLang));
                            }
                        }
                        continue;
                    }

                    // 2. MATNLI XABARLARNI QAYTA ISHLASH (MESSAGE)
                    const msg = upd.message;
                    if (!msg) continue;

                    const text = (msg.text || '').trim();
                    const chatId = msg.from.id;
                    const uName = msg.from.username ? `@${msg.from.username}` : `${msg.from.first_name || ''}`;
                    let userLang = getTgChatLang(chatId);

                    // Tilni o'zgartirish yoki /start komandasi
                    if (text === "/start" || text === "/til" || text === "/lang" || text.includes("Tilni o'zgartirish") || text.includes("Сменить язык")) {
                        const promptMsg = `🏥 <b>DentaCare Stomatologiya Klinikasi | Стоматологическая Клиника</b>\n\n🇺🇿 <b>Assalomu alaykum!</b> Iltimos, muloqot tilini tanlang:\n🇷🇺 <b>Здравствуйте!</b> Пожалуйста, выберите язык общения:`;
                        await sendTelegramMessage(chatId, promptMsg, getTgLangInlineKeyboard());
                        continue;
                    }

                    // /start DENT-101 (QR-kod yoki link orqali kirganda)
                    if (text.startsWith("/start ")) {
                        const targetId = text.replace("/start ", "").trim().toUpperCase();
                        const p = patients.find(pat => pat.id.toUpperCase() === targetId);
                        if (p) {
                            const greetingPrompt = `🏥 <b>DentaCare Stomatologiya Klinikasi | Стоматология</b>\n\nAssalomu alaykum, <b>${escapeHtml(p.fullName)}</b>!\n\n🇺🇿 Iltimos, muloqot tilini tanlang:\n🇷🇺 Пожалуйста, выберите язык общения:`;
                            await sendTelegramMessage(chatId, greetingPrompt, getTgLangInlineKeyboard(p.id));
                        } else {
                            const promptMsg = `🏥 <b>DentaCare Stomatologiya Klinikasi</b>\n\nIltimos, tilni tanlang / Выберите язык:`;
                            await sendTelegramMessage(chatId, promptMsg, getTgLangInlineKeyboard(targetId));
                        }
                        continue;
                    }

                    // Menyu: Retseptni so'rash
                    if (text === "📋 Mening retseptim" || text === "📋 Мой рецепт" || text.toLowerCase() === "retsept" || text.toLowerCase() === "рецепт") {
                        const p = patients.find(pat => pat.telegramChatId === chatId);
                        if (p) {
                            const pLang = p.telegramLang || userLang;
                            const rMsg = pLang === "ru" ? formatTgPrescriptionRu(p) : formatTgPrescriptionUz(p);
                            await sendTelegramMessage(chatId, rMsg, getTgReplyKeyboard(pLang));
                        } else {
                            const notLinked = userLang === "ru"
                                ? `⚠️ Вы пока не подключены к карте пациента.\nПожалуйста, отправьте ваш <b>ID пациента</b> (например: <code>DENT-101</code>).`
                                : `⚠️ Siz hali bemor kartasiga ulanmagansiz.\nIltimos, shifokor bergan <b>Bemor ID</b> raqamingizni yuboring (Masalan: <code>DENT-101</code>).`;
                            await sendTelegramMessage(chatId, notLinked, getTgReplyKeyboard(userLang));
                        }
                        continue;
                    }

                    // Menyu: Klinika haqida
                    if (text === "ℹ️ Klinika haqida" || text === "ℹ️ О клинике") {
                        const clinicInfo = userLang === "ru"
                            ? `🏥 <b>Стоматологическая клиника DentaCare</b>\n\n🌟 Высококвалифицированные врачи, новейшее оборудование и безболезненное лечение!\n⏰ <b>Режим работы:</b> 24/7 (Круглосуточно без выходных)\n📍 <b>Адрес:</b> г. Ташкент, ул. Чиланзар, 15\n📞 <b>Телефон:</b> +998 90 777 01 01`
                            : `🏥 <b>DentaCare Stomatologiya Klinikasi</b>\n\n🌟 Malakali shifokorlar, zamonaviy uskunalar va og'riqsiz muolajalar kafolati!\n⏰ <b>Ish tartibi:</b> 24/7 (Kechayu-kunduz dam olishsiz)\n📍 <b>Manzil:</b> Toshkent sh., Chilonzor tumani, 15-mavze\n📞 <b>Telefon:</b> +998 90 777 01 01`;
                        await sendTelegramMessage(chatId, clinicInfo, getTgReplyKeyboard(userLang));
                        continue;
                    }

                    // Menyu: Kontaktlar
                    if (text === "📞 Kontaktlar" || text === "📞 Контакты") {
                        const contactInfo = userLang === "ru"
                            ? `📞 <b>Контакты клиники DentaCare:</b>\n\n☎️ Администрация: +998 90 777 01 01\n📱 Неотложная помощь: +998 90 123 45 67\n🌐 Сайт: DentaCare CRM Онлайн`
                            : `📞 <b>DentaCare Klinikasi Aloqa Ma'lumotlari:</b>\n\n☎️ Registratura: +998 90 777 01 01\n📱 Tezkor navbatchi: +998 90 123 45 67\n🌐 Sayt: DentaCare CRM Onlayn`;
                        await sendTelegramMessage(chatId, contactInfo, getTgReplyKeyboard(userLang));
                        continue;
                    }

                    // Bemor ID si yuborilganda (Masalan: DENT-101)
                    let matchedId = null;
                    if (text.toUpperCase().startsWith("DENT-")) {
                        matchedId = text.trim().toUpperCase();
                    }

                    let patient = matchedId ? patients.find(p => p.id.toUpperCase() === matchedId) : null;

                    // Agar telefon raqam orqali mos kelishi
                    if (!patient && msg.contact && msg.contact.phone_number) {
                        const cleanPhone = msg.contact.phone_number.replace(/\D/g, "");
                        patient = patients.find(p => (p.phone || "").replace(/\D/g, "").includes(cleanPhone.slice(-9)));
                    }

                    if (patient) {
                        if (patient.telegramChatId !== chatId || patient.telegramLang !== userLang) {
                            patient.telegramChatId = chatId;
                            patient.telegramUsername = uName;
                            patient.telegramLang = userLang;
                            hasChanges = true;

                            const welcome = userLang === "ru" ? getTgWelcomeMessageRu(patient) : getTgWelcomeMessageUz(patient);
                            await sendTelegramMessage(chatId, welcome, getTgReplyKeyboard(userLang));
                            showToast(`${patient.fullName} Telegram botga ulandi!`, "success");
                        } else {
                            const alreadyMsg = userLang === "ru"
                                ? `✅ Вы уже подключены к профилю: <b>${escapeHtml(patient.fullName)}</b>.`
                                : `✅ Siz allaqachon ulanib bo'lgansiz: <b>${escapeHtml(patient.fullName)}</b>.`;
                            await sendTelegramMessage(chatId, alreadyMsg, getTgReplyKeyboard(userLang));
                        }
                    } else if (matchedId) {
                        const notFound = userLang === "ru"
                            ? `⚠️ Пациент с ID <code>${matchedId}</code> не найден в базе данных. Пожалуйста, проверьте номер.`
                            : `⚠️ <code>${matchedId}</code> ID raqamli bemor bazada topilmadi. Iltimos, raqamni to'g'ri kiritganingizga ishonch hosil qiling.`;
                        await sendTelegramMessage(chatId, notFound, getTgReplyKeyboard(userLang));
                    }
                }

                if (hasChanges) {
                    savePatientsToStorage(patients);
                    renderPatientsTable();
                    if (activeViewingPatientId) {
                        openPatientViewModal(activeViewingPatientId);
                    }
                    if (tgConnectionStatusText) {
                        tgConnectionStatusText.innerHTML = `<span style="color: #16a34a;"><i class="fa-solid fa-circle-check"></i> ${t("tgConnectedStatus")}</span>`;
                    }
                }
            }
        } catch (e) {
            // Jim xatolik
        }
    }

    // Har 4 soniyada botni tekshirib turish
    setInterval(checkTelegramUpdates, 4000);
    setTimeout(checkTelegramUpdates, 1000);

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

    function formatDuration(duration) {
        if (!duration) return "";
        if (currentAppLang === "ru") {
            return duration
                .replace(/(\d+)\s*soat/gi, (match, p1) => {
                    const n = parseInt(p1, 10);
                    if (n % 10 === 1 && n % 100 !== 11) return `${n} час`;
                    if ([2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100)) return `${n} часа`;
                    return `${n} часов`;
                })
                .replace(/soat/gi, "час")
                .replace(/(\d+)\s*daqiqa/gi, (match, p1) => {
                    const n = parseInt(p1, 10);
                    if (n % 10 === 1 && n % 100 !== 11) return `${n} минута`;
                    if ([2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100)) return `${n} минуты`;
                    return `${n} минут`;
                })
                .replace(/daqiqa/gi, "мин.")
                .replace(/(\d+)\s*kun/gi, (match, p1) => {
                    const n = parseInt(p1, 10);
                    if (n === 1) return `${n} день`;
                    if ([2, 3, 4].includes(n)) return `${n} дня`;
                    return `${n} дней`;
                })
                .replace(/kun/gi, "дн.");
        }
        return duration;
    }

    function formatExperience(exp) {
        if (!exp) return "";
        if (currentAppLang === "ru") {
            return exp
                .replace(/(\d+)\s*yil/gi, (match, p1) => {
                    const n = parseInt(p1, 10);
                    if (n % 10 === 1 && n % 100 !== 11) return `${n} год`;
                    if ([2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100)) return `${n} года`;
                    return `${n} лет`;
                })
                .replace(/yil/gi, "лет")
                .replace(/(\d+)\s*oy/gi, (match, p1) => {
                    const n = parseInt(p1, 10);
                    if (n % 10 === 1 && n % 100 !== 11) return `${n} месяц`;
                    if ([2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100)) return `${n} месяца`;
                    return `${n} месяцев`;
                })
                .replace(/oy/gi, "мес.");
        }
        return exp;
    }

    function formatSpecialty(spec) {
        if (!spec) return "";
        if (currentAppLang === "ru") {
            return spec
                .replace(/Bosh shifokor/gi, "Главный врач")
                .replace(/Terapevt/gi, "Терапевт")
                .replace(/Ortodont/gi, "Ортодонт")
                .replace(/Estetik stomatolog/gi, "Эстетический стоматолог")
                .replace(/Jarroh-Implantolog/gi, "Хирург-имплантолог")
                .replace(/Jarroh/gi, "Хирург")
                .replace(/Bolalar stomatologi/gi, "Детский стоматолог")
                .replace(/Hamshira/gi, "Медсестра")
                .replace(/Assistent/gi, "Ассистент");
        }
        return spec;
    }

    function renderServicesTab() {
        const servicesGrid = document.getElementById("servicesGrid");
        if (!servicesGrid) return;

        if (navServicesCount) navServicesCount.textContent = services.length;

        if (services.length === 0) {
            servicesGrid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #94a3b8;">${t("noServices")}</div>`;
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
                            <i class="fa-regular fa-clock"></i> ${t("serviceDurationPrefix")} ${escapeHtml(formatDuration(srv.duration))}
                        </span>
                    </div>
                    <button class="btn-icon delete btn-del-service" title="${t("serviceDeleteTooltip")}" data-id="${srv.id}">
                        <i class="fa-regular fa-trash-can"></i>
                    </button>
                </div>
                <div class="service-card-bottom">
                    <span style="font-size: 13px; color: var(--text-secondary);">${t("servicePricePrefix")}</span>
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
    // YANGI ISHCHI / SHIFOKOR QO'SHISH & BOSHQARISH (O'Z RASMINI YUKLASH BILAN)
    // ==========================================================
    const DEFAULT_DOCTOR_AVATAR = "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80";

    const doctorEditId = document.getElementById("doctorEditId");
    const doctorModalHeading = document.getElementById("doctorModalHeading");
    const btnSaveDoctorText = document.getElementById("btnSaveDoctorText");

    const doctorPhotoFileInput = document.getElementById("doctorPhotoFileInput");
    const btnUploadDoctorPhoto = document.getElementById("btnUploadDoctorPhoto");
    const btnResetDoctorPhoto = document.getElementById("btnResetDoctorPhoto");
    const doctorAvatarPreview = document.getElementById("doctorAvatarPreview");
    const doctorAvatarData = document.getElementById("doctorAvatarData");
    const doctorAvatarSelect = document.getElementById("doctorAvatarSelect");

    // Rasmni avtomatik qirqish va kichraytirish (260x260 kvadrat avatar)
    function resizeImageToDataUrl(file, maxWidth = 260, maxHeight = 260, quality = 0.88) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement("canvas");
                    const width = img.width;
                    const height = img.height;

                    // Kvadrat markaziy qirqish (Centered square crop)
                    const size = Math.min(width, height);
                    const startX = (width - size) / 2;
                    const startY = (height - size) / 2;

                    canvas.width = maxWidth;
                    canvas.height = maxHeight;
                    const ctx = canvas.getContext("2d");
                    ctx.drawImage(img, startX, startY, size, size, 0, 0, maxWidth, maxHeight);
                    resolve(canvas.toDataURL("image/jpeg", quality));
                };
                img.onerror = () => reject(new Error("Image load error"));
                img.src = e.target.result;
            };
            reader.onerror = () => reject(new Error("File read error"));
            reader.readAsDataURL(file);
        });
    }

    // O'z rasmini yuklash tugmasi
    if (btnUploadDoctorPhoto && doctorPhotoFileInput) {
        btnUploadDoctorPhoto.addEventListener("click", () => {
            doctorPhotoFileInput.click();
        });
    }

    // Foydalanuvchi fayl tanlaganda
    if (doctorPhotoFileInput) {
        doctorPhotoFileInput.addEventListener("change", async (e) => {
            const file = e.target.files && e.target.files[0];
            if (!file) return;

            if (!file.type.startsWith("image/")) {
                showToast(currentAppLang === "ru" ? "Пожалуйста, выберите файл изображения!" : "Iltimos, faqat rasm faylini tanlang!", "warning");
                return;
            }

            try {
                const resized = await resizeImageToDataUrl(file, 260, 260, 0.88);
                if (doctorAvatarPreview) doctorAvatarPreview.src = resized;
                if (doctorAvatarData) doctorAvatarData.value = resized;
                if (btnResetDoctorPhoto) btnResetDoctorPhoto.style.display = "inline-flex";
                showToast(t("toastPhotoUploaded"), "success");
            } catch (err) {
                const reader = new FileReader();
                reader.onload = (ev) => {
                    if (doctorAvatarPreview) doctorAvatarPreview.src = ev.target.result;
                    if (doctorAvatarData) doctorAvatarData.value = ev.target.result;
                    if (btnResetDoctorPhoto) btnResetDoctorPhoto.style.display = "inline-flex";
                    showToast(t("toastPhotoUploaded"), "success");
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Tayyor shablon rasmlardan tanlanganda
    if (doctorAvatarSelect) {
        doctorAvatarSelect.addEventListener("change", (e) => {
            const val = e.target.value;
            if (doctorAvatarPreview) doctorAvatarPreview.src = val;
            if (doctorAvatarData) doctorAvatarData.value = val;
            if (doctorPhotoFileInput) doctorPhotoFileInput.value = "";
            if (btnResetDoctorPhoto) btnResetDoctorPhoto.style.display = "none";
        });
    }

    // Yuklangan rasmni tozalash (reset)
    if (btnResetDoctorPhoto) {
        btnResetDoctorPhoto.addEventListener("click", () => {
            const val = (doctorAvatarSelect && doctorAvatarSelect.value) ? doctorAvatarSelect.value : DEFAULT_DOCTOR_AVATAR;
            if (doctorAvatarPreview) doctorAvatarPreview.src = val;
            if (doctorAvatarData) doctorAvatarData.value = val;
            if (doctorPhotoFileInput) doctorPhotoFileInput.value = "";
            btnResetDoctorPhoto.style.display = "none";
        });
    }

    // Modalni ochish (Yangi xodim qo'shish)
    if (btnOpenAddDoctorModal) {
        btnOpenAddDoctorModal.addEventListener("click", () => {
            if (doctorModal) {
                doctorForm.reset();
                if (doctorEditId) doctorEditId.value = "";
                if (doctorModalHeading) doctorModalHeading.textContent = t("modalAddDoctorTitle");
                if (btnSaveDoctorText) btnSaveDoctorText.textContent = t("btnAddDoctorSubmit");
                const initialAvatar = (doctorAvatarSelect && doctorAvatarSelect.value) ? doctorAvatarSelect.value : DEFAULT_DOCTOR_AVATAR;
                if (doctorAvatarPreview) doctorAvatarPreview.src = initialAvatar;
                if (doctorAvatarData) doctorAvatarData.value = initialAvatar;
                if (doctorPhotoFileInput) doctorPhotoFileInput.value = "";
                if (btnResetDoctorPhoto) btnResetDoctorPhoto.style.display = "none";
                doctorModal.classList.remove("d-none");
            }
        });
    }

    // Mavjud shifokorni tahrirlash (rasmini o'zgartirish bilan birga)
    function openEditDoctorModal(id) {
        const doc = doctors.find(d => d.id === id);
        if (!doc || !doctorModal) return;

        doctorForm.reset();
        if (doctorEditId) doctorEditId.value = doc.id;
        if (doctorModalHeading) doctorModalHeading.textContent = t("modalEditDoctorTitle");
        if (btnSaveDoctorText) btnSaveDoctorText.textContent = t("btnSaveDoctorEdit");

        const nameInput = document.getElementById("doctorNameInput");
        const specInput = document.getElementById("doctorSpecialtyInput");
        const expInput = document.getElementById("doctorExpInput");
        const phoneInput = document.getElementById("doctorPhoneInput");

        if (nameInput) nameInput.value = doc.name;
        if (specInput) specInput.value = doc.specialty;
        if (expInput) expInput.value = doc.experience;
        if (phoneInput) phoneInput.value = doc.phone;

        const docAvatar = doc.avatar || DEFAULT_DOCTOR_AVATAR;
        if (doctorAvatarPreview) doctorAvatarPreview.src = docAvatar;
        if (doctorAvatarData) doctorAvatarData.value = docAvatar;
        if (doctorPhotoFileInput) doctorPhotoFileInput.value = "";

        if (doctorAvatarSelect) {
            let matched = false;
            for (let i = 0; i < doctorAvatarSelect.options.length; i++) {
                if (doctorAvatarSelect.options[i].value === docAvatar) {
                    doctorAvatarSelect.selectedIndex = i;
                    matched = true;
                    break;
                }
            }
            if (!matched) {
                if (btnResetDoctorPhoto) btnResetDoctorPhoto.style.display = "inline-flex";
            } else {
                if (btnResetDoctorPhoto) btnResetDoctorPhoto.style.display = "none";
            }
        }

        doctorModal.classList.remove("d-none");
    }

    function closeDoctorModal() {
        if (doctorModal) doctorModal.classList.add("d-none");
    }

    if (btnCloseDoctorModal) btnCloseDoctorModal.addEventListener("click", closeDoctorModal);
    if (btnCancelDoctor) btnCancelDoctor.addEventListener("click", closeDoctorModal);

    // Form topshirilganda (Qo'shish yoki Tahrirlash)
    if (doctorForm) {
        doctorForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const name = document.getElementById("doctorNameInput").value.trim();
            const specialty = document.getElementById("doctorSpecialtyInput").value.trim();
            const experience = document.getElementById("doctorExpInput").value.trim();
            const phone = document.getElementById("doctorPhoneInput").value.trim();
            const avatar = (doctorAvatarData && doctorAvatarData.value) 
                ? doctorAvatarData.value 
                : ((doctorAvatarSelect && doctorAvatarSelect.value) ? doctorAvatarSelect.value : DEFAULT_DOCTOR_AVATAR);

            if (!name) return;

            const editId = doctorEditId ? doctorEditId.value : "";

            if (editId) {
                // Tahrirlash
                const docIndex = doctors.findIndex(d => d.id === editId);
                if (docIndex !== -1) {
                    const oldName = doctors[docIndex].name;
                    doctors[docIndex].name = name;
                    doctors[docIndex].specialty = specialty;
                    doctors[docIndex].experience = experience;
                    doctors[docIndex].phone = phone;
                    doctors[docIndex].avatar = avatar;

                    if (oldName !== name) {
                        patients.forEach(p => {
                            if (p.doctor === oldName) p.doctor = name;
                        });
                        savePatientsToStorage(patients);
                        renderPatientsTable();
                    }

                    showToast(t("toastDoctorUpdated", name), "success");
                }
            } else {
                // Yangi shifokor qo'shish
                const newDoctor = {
                    id: "DOC-" + (doctors.length + 1) + "_" + Date.now().toString().slice(-4),
                    name: name,
                    specialty: specialty,
                    experience: experience,
                    phone: phone,
                    avatar: avatar
                };
                doctors.push(newDoctor);
                showToast(`Yangi xodim ("${name}") muvaffaqiyatli qo'shildi!`, "success");
            }

            saveDoctorsToStorage(doctors);
            populateFormSelects();
            renderDoctorsTab();
            renderMonthlyReports();
            closeDoctorModal();
        });
    }

    function renderDoctorsTab() {
        const doctorsGrid = document.getElementById("doctorsGrid");
        if (!doctorsGrid) return;

        if (navDoctorsCount) navDoctorsCount.textContent = doctors.length;

        if (doctors.length === 0) {
            doctorsGrid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #94a3b8;">${t("doctorEmpty")}</div>`;
            return;
        }

        doctorsGrid.innerHTML = doctors.map(doc => `
            <div class="doctor-card">
                <img src="${doc.avatar || DEFAULT_DOCTOR_AVATAR}" alt="${doc.name}">
                <div class="doctor-card-info" style="flex: 1;">
                    <h4>${escapeHtml(doc.name)}</h4>
                    <p class="doctor-spec">${escapeHtml(formatSpecialty(doc.specialty))}</p>
                    <p class="doctor-exp"><i class="fa-solid fa-award"></i> ${t("doctorExpPrefix")} ${escapeHtml(formatExperience(doc.experience))}</p>
                    <p class="doctor-exp" style="margin-top: 4px;">
                        <a href="tel:${doc.phone}" style="color: var(--primary);"><i class="fa-solid fa-phone"></i> ${escapeHtml(doc.phone)}</a>
                    </p>
                </div>
                <div style="display: flex; gap: 6px; align-items: center;">
                    <button class="btn-icon edit btn-edit-doctor" title="${t("tooltipEdit")}" data-id="${doc.id}">
                        <i class="fa-regular fa-pen-to-square"></i>
                    </button>
                    <button class="btn-icon delete btn-del-doctor" title="${t("doctorDeleteTooltip")}" data-id="${doc.id}">
                        <i class="fa-regular fa-trash-can"></i>
                    </button>
                </div>
            </div>
        `).join("");

        // Ishchini tahrirlash (shu jumladan rasmini o'zgartirish)
        document.querySelectorAll(".btn-edit-doctor").forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                const id = btn.getAttribute("data-id");
                openEditDoctorModal(id);
            };
        });

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
                    renderMonthlyReports();
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
                    showToast(t("toothSearchToast", toothNum), "info");
                }
            };
        });
    }

    function renderToothItem(toothNum) {
        const related = patients.filter(p => p.toothNumber && p.toothNumber.includes(toothNum.toString()));

        let toothState = "healthy";
        let stateTag = t("toothHealthy");

        if (related.length > 0) {
            const hasTreatment = related.some(p => p.status === "Davolanmoqda");
            const hasCompleted = related.some(p => p.status === "Tugatildi");
            const hasCrown = related.some(p => p.serviceName && (p.serviceName.includes("Implant") || p.serviceName.includes("tojburchak")));

            if (hasCrown) {
                toothState = "crown";
                stateTag = t("toothCrown");
            } else if (hasTreatment) {
                toothState = "treatment";
                stateTag = t("toothTreatment");
            } else if (hasCompleted) {
                toothState = "done";
                stateTag = t("toothDone");
            }
        }

        const toothTitle = t("toothTitleFmt", toothNum, stateTag);

        return `
            <div class="tooth-item ${toothState}" data-tooth="${toothNum}" title="${toothTitle}">
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
        const sidebarOverlay = document.getElementById("sidebarOverlay");

        navLinks.forEach(link => {
            link.addEventListener("click", (e) => {
                e.preventDefault();
                const targetTab = link.getAttribute("data-tab");
                switchToTab(targetTab);

                if (window.innerWidth <= 1024 && sidebar) {
                    sidebar.classList.remove("open");
                    if (sidebarOverlay) sidebarOverlay.classList.remove("active");
                }
            });
        });

        if (btnToggleSidebar && sidebar) {
            btnToggleSidebar.addEventListener("click", () => {
                sidebar.classList.toggle("open");
                if (sidebarOverlay) sidebarOverlay.classList.toggle("active");
            });
        }

        if (btnCloseSidebar && sidebar) {
            btnCloseSidebar.addEventListener("click", () => {
                sidebar.classList.remove("open");
                if (sidebarOverlay) sidebarOverlay.classList.remove("active");
            });
        }

        if (sidebarOverlay && sidebar) {
            sidebarOverlay.addEventListener("click", () => {
                sidebar.classList.remove("open");
                sidebarOverlay.classList.remove("active");
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
                dashboard: currentAppLang === "ru" ? "Центр управления стоматологией" : "Stomatologiya Boshqaruv Markazi",
                patients: currentAppLang === "ru" ? "Список пациентов и клиентов" : "Bemorlar va Mijozlar Ro'yxati",
                "tooth-chart": currentAppLang === "ru" ? "Интерактивная карта зубов (Dental Chart)" : "Interaktiv Tishlar Xaritasi (Dental Chart)",
                services: currentAppLang === "ru" ? "Услуги и прейскурант клиники" : "Klinika Xizmat Turlari va Narxnomasi",
                doctors: currentAppLang === "ru" ? "Команда врачей и персонала" : "Ishchilar va Shifokorlar Jamoasi",
                reports: currentAppLang === "ru" ? "Ежемесячный финансовый отчёт" : "Oylik Moliyaviy va Qabullar Hisoboti"
            };
            headerPageTitle.textContent = titles[tabId] || (currentAppLang === "ru" ? "Панель управления" : "Boshqaruv Markazi");
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
            headerCurrentDate.textContent = now.toLocaleDateString(currentAppLang === 'ru' ? 'ru-RU' : 'uz-UZ', options);
        }
        updateDate();
        setInterval(updateDate, 30000);
    }

    // ==========================================================
    // YORDAMCHI FUNKSIYALAR
    // ==========================================================
    function formatCurrency(amount) {
        const num = Number(amount) || 0;
        const suffix = currentAppLang === "ru" ? " сум" : " so'm";
        return num.toLocaleString(currentAppLang === "ru" ? "ru-RU" : "uz-UZ") + suffix;
    }

    function formatDateTime(dtStr) {
        if (!dtStr) return currentAppLang === "ru" ? "Не указано" : "Belgilanmagan";
        return dtStr;
    }

    function getStatusDisplayName(status) {
        if (currentAppLang === "ru") {
            switch (status) {
                case "Davolanmoqda": return "На лечении";
                case "Tugatildi": return "Завершено";
                case "Kutilmoqda": return "Ожидает";
                case "Bekor qilindi": return "Отменено";
                default: return status;
            }
        }
        return status;
    }

    function getPaymentStatusDisplayName(status) {
        if (currentAppLang === "ru") {
            switch (status) {
                case "To'langan": return "Оплачено";
                case "Qisman to'langan": return "Частично";
                case "To'lanmagan": return "Не оплачено";
                default: return status;
            }
        }
        return status;
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

    // Helper: oy nomini chiroyli formatlash (UZ / RU)
    function getMonthDisplayName(monthKey) {
        if (!monthKey || monthKey === "all") return currentAppLang === "ru" ? "Все периоды (Общий)" : "Barcha davrlar (Umumiy)";
        const parts = monthKey.split("-");
        if (parts.length < 2) return monthKey;
        const year = parts[0];
        const monthStr = parts[1];
        const monthsMapUz = {
            "01": "Yanvar", "02": "Fevral", "03": "Mart", "04": "Aprel",
            "05": "May", "06": "Iyun", "07": "Iyul", "08": "Avgust",
            "09": "Sentabr", "10": "Oktabr", "11": "Noyabr", "12": "Dekabr"
        };
        const monthsMapRu = {
            "01": "Январь", "02": "Февраль", "03": "Март", "04": "Апрель",
            "05": "Май", "06": "Июнь", "07": "Июль", "08": "Август",
            "09": "Сентябрь", "10": "Октябрь", "11": "Ноябрь", "12": "Декабрь"
        };
        const mName = (currentAppLang === "ru" ? monthsMapRu[monthStr] : monthsMapUz[monthStr]) || monthStr;
        return currentAppLang === "ru" ? `${mName} ${year} года` : `${year}-yil ${mName}`;
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
            const isCurrent = (m === "2026-09") ? t("reportCurrentMonthSuffix") : "";
            const isSelected = (m === reportSelectedMonth) ? "selected" : "";
            return `<option value="${m}" ${isSelected}>${getMonthDisplayName(m)}${isCurrent}</option>`;
        }).join("");

        optionsHtml += `<option value="all" ${reportSelectedMonth === "all" ? "selected" : ""}>${t("reportAllMonthsOpt")}</option>`;
        reportMonthSelect.innerHTML = optionsHtml;

        // Shifokorlar selectini ham to'ldirish
        const reportDoctorSelect = document.getElementById("reportDoctorSelect");
        if (reportDoctorSelect) {
            const currentDocVal = reportSelectedDoctor;
            let docOptionsHtml = `<option value="all" ${currentDocVal === "all" ? "selected" : ""}>${t("reportAllDoctorsOpt")}</option>`;
            doctors.forEach(doc => {
                const isDocSelected = (doc.name === currentDocVal) ? "selected" : "";
                docOptionsHtml += `<option value="${doc.name}" ${isDocSelected}>${doc.name} (${formatSpecialty(doc.specialty)})</option>`;
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

        if (kpiMonthPatients) kpiMonthPatients.textContent = t("kpiPatientsValFmt", totalPatients);
        if (kpiMonthRevenue) kpiMonthRevenue.textContent = formatCurrency(totalRevenue);
        if (kpiMonthTotal) kpiMonthTotal.textContent = formatCurrency(totalServiceValue);
        if (kpiMonthDebt) kpiMonthDebt.textContent = formatCurrency(totalDebt);
        if (kpiMonthCompleted) kpiMonthCompleted.textContent = t("kpiCompletedValFmt", completedCount);
        if (kpiMonthAvg) kpiMonthAvg.textContent = formatCurrency(avgCheck);

        // Sarlavhalarni yangilash
        const reportMainHeading = document.getElementById("reportMainHeading");
        const monthTitleStr = getMonthDisplayName(reportSelectedMonth);
        const doctorTitleStr = reportSelectedDoctor !== "all" ? ` — ${reportSelectedDoctor}` : "";
        const formattedReportHeading = t("reportMainTitleFmt", monthTitleStr, doctorTitleStr);
        if (reportMainHeading) reportMainHeading.textContent = formattedReportHeading;

        const printReportTitle = document.getElementById("printReportTitle");
        if (printReportTitle) printReportTitle.textContent = formattedReportHeading;

        const doctorTableMonthLabel = document.getElementById("doctorTableMonthLabel");
        if (doctorTableMonthLabel) doctorTableMonthLabel.textContent = monthTitleStr;

        // Dashboard oylik bannerini yangilash (Joriy oy uchun)
        const currentMonthKey = "2026-09";
        const currentMonthPatients = patients.filter(p => getPatientMonthKey(p) === currentMonthKey);
        const currentMonthRev = currentMonthPatients.reduce((sum, p) => sum + (Number(p.paidAmount) || 0), 0);
        const dashMonthBannerTitle = document.getElementById("dashMonthBannerTitle");
        const dashMonthBannerDesc = document.getElementById("dashMonthBannerDesc");

        if (dashMonthBannerTitle) dashMonthBannerTitle.textContent = getMonthDisplayName(currentMonthKey);
        if (dashMonthBannerDesc) {
            dashMonthBannerDesc.innerHTML = t("bannerDesc", currentMonthPatients.length, formatCurrency(currentMonthRev));
        }

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
            tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 24px; color: #94a3b8;">${t("docTableEmpty")}</td></tr>`;
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
                    <td><span style="font-weight: 500; color: #475569;">${escapeHtml(formatSpecialty(doc.specialty))}</span></td>
                    <td>
                        <span style="font-weight: 700; font-size: 14px; color: var(--primary);">
                            <i class="fa-solid fa-user-check" style="font-size: 11px; margin-right: 4px;"></i>${t("docBadgePatientsFmt", count)}
                        </span>
                    </td>
                    <td><strong>${formatCurrency(totalVal)}</strong></td>
                    <td><strong style="color: #16a34a;">${formatCurrency(paidVal)}</strong></td>
                    <td><span style="color: ${debtVal > 0 ? '#dc2626' : '#64748b'}; font-weight: ${debtVal > 0 ? '700' : '500'};">${formatCurrency(debtVal)}</span></td>
                    <td>
                        <div class="rate-wrapper">
                            <div style="display: flex; justify-content: space-between; font-size: 11px;">
                                <span>${t("docColLabel")}</span>
                                <strong>${percentage}%</strong>
                            </div>
                            <div class="rate-bar-bg">
                                <div class="rate-bar-fill" style="width: ${percentage}%;"></div>
                            </div>
                        </div>
                    </td>
                    <td class="text-center">
                        <button class="btn-action-outline btn-filter-doc" data-doc="${escapeHtml(doc.name)}" style="padding: 5px 12px; font-size: 12px;" title="${t("btnFilterDocTitle")}">
                            <i class="fa-solid fa-filter"></i> ${isSelectedDoc ? t("btnFilterDocSelected") : t("btnFilterDoc")}
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
                        ${mKey === "2026-09" ? `<span class="badge-pill-soft" style="margin-left: 6px; font-size: 11px;">${t("histBadgeCurrentMonth")}</span>` : ''}
                    </td>
                    <td><strong>${t("kpiPatientsValFmt", pCount)}</strong></td>
                    <td><span class="pay-badge pay-paid" style="font-size: 11.5px;">${t("histCompletedFmt", completed)}</span></td>
                    <td>${formatCurrency(totalVal)}</td>
                    <td><strong style="color: #16a34a; font-size: 14px;">${formatCurrency(paidVal)}</strong></td>
                    <td><span style="color: ${debtVal > 0 ? '#dc2626' : '#64748b'}; font-weight: 600;">${formatCurrency(debtVal)}</span></td>
                    <td><span style="color: #475569;">${formatCurrency(avg)}</span></td>
                    <td class="text-center">
                        <button class="btn-action-primary btn-select-month" data-month="${mKey}" style="padding: 6px 14px; font-size: 12px;">
                            ${isSelected ? `<i class="fa-solid fa-check"></i> ${t("btnViewingMonthReport")}` : `<i class="fa-regular fa-folder-open"></i> ${t("btnOpenMonthReport")}`}
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
                showToast(t("toastMonthSelected", getMonthDisplayName(targetM)), "info");
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
            grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 24px; color: #94a3b8;">${t("servicesReportEmpty")}</div>`;
            return;
        }

        grid.innerHTML = sortedServices.map(([sName, data]) => `
            <div class="service-report-item">
                <div class="service-report-top">
                    <h4>${escapeHtml(sName)}</h4>
                    <span class="srv-count-pill">${t("serviceReportCountFmt", data.count)}</span>
                </div>
                <div class="service-report-bottom">
                    <span>${t("serviceReportRevenueLabel")}</span>
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
            countInfo.textContent = t("reportListCountFmt", filteredPatients.length);
        }

        if (!tbody) return;

        if (filteredPatients.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="10" style="text-align: center; padding: 30px; color: #94a3b8;">
                        <i class="fa-regular fa-folder-open" style="font-size: 32px; margin-bottom: 8px; display: block; color: #cbd5e1;"></i>
                        ${t("reportPatientsEmpty")}
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
                    <td style="white-space: nowrap;"><i class="fa-regular fa-calendar" style="font-size: 11px; margin-right: 4px; color: #94a3b8;"></i>${p.appointmentDate || p.createdAt || (currentAppLang === 'ru' ? 'Не указано' : 'Noma\'lum')}</td>
                    <td><strong>${escapeHtml(p.fullName)}</strong></td>
                    <td><a href="tel:${p.phone}" style="color: var(--primary);">${escapeHtml(p.phone)}</a></td>
                    <td><span style="font-weight: 500; color: #334155;">${escapeHtml(p.doctor)}</span></td>
                    <td>${escapeHtml(p.serviceName || (currentAppLang === 'ru' ? 'Стоматология' : 'Stomatologiya'))}</td>
                    <td>${formatCurrency(p.totalAmount)}</td>
                    <td><strong style="color: #16a34a;">${formatCurrency(p.paidAmount)}</strong></td>
                    <td><span class="pay-badge ${payClass}">${getPaymentStatusDisplayName(p.paymentStatus || 'To\'langan')}</span></td>
                    <td><span class="status-pill ${statusClass}">${getStatusDisplayName(p.status)}</span></td>
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

        // CSV Header with UTF-8 BOM and semicolon delimiter for Excel
        let csvContent = "\uFEFF";
        csvContent += "sep=;\n";
        csvContent += "T/r;Bemor ID;Qabul Sanasi;Bemor F.I.Sh;Telefon;Mas'ul Shifokor;Xizmat Turi;Tashxis;Umumiy Narx (so'm);To'langan Summa (so'm);Qoldiq Qarz (so'm);To'lov Holati;Muolaja Holati\n";

        filtered.forEach((p, idx) => {
            const total = Number(p.totalAmount) || 0;
            const paid = Number(p.paidAmount) || 0;
            const debt = Math.max(0, total - paid);

            // Telefon raqamini chiroyli formatlash (Excel eksponensial qilib yubormasligi uchun)
            let phoneStr = (p.phone || '').trim();
            const cleanDigits = phoneStr.replace(/\D/g, '');
            if (cleanDigits.length === 12 && cleanDigits.startsWith('998')) {
                phoneStr = `+998 ${cleanDigits.slice(3, 5)} ${cleanDigits.slice(5, 8)} ${cleanDigits.slice(8, 10)} ${cleanDigits.slice(10, 12)}`;
            } else if (!phoneStr.includes(' ') && phoneStr.length > 9) {
                phoneStr = `'${phoneStr}`;
            }

            const row = [
                idx + 1,
                `"${p.id}"`,
                `"${p.appointmentDate || p.createdAt || ''}"`,
                `"${(p.fullName || '').replace(/"/g, '""')}"`,
                `"${phoneStr}"`,
                `"${(p.doctor || '').replace(/"/g, '""')}"`,
                `"${(p.serviceName || '').replace(/"/g, '""')}"`,
                `"${(p.diagnosis || '').replace(/"/g, '""')}"`,
                total,
                paid,
                debt,
                `"${p.paymentStatus || ''}"`,
                `"${p.status || ''}"`
            ];
            csvContent += row.join(";") + "\n";
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
