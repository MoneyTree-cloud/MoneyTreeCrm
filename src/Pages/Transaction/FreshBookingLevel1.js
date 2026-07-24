/* eslint-disable no-mixed-operators */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { Container } from "reactstrap";
import Select from "react-select";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import AppTable from "../../components/Common/Table";
import { useLocation, useNavigate } from "react-router-dom";
import { defaultTheme } from "../../helpers/defaultTheme";
import { formatDate, formatDateForInput, formatDateTime, generateTimestamp, WordWrapCell } from "../../helpers/function_helper";
import { ALL_LOCATION_DROPDOWN, DELETE_FRESH_BOOKING, GET_ALL_FRESH_BOOKING_LEVEL, GET_ALL_FRESH_BOOKING_LEVEL_COUNT, GET_ALL_MAIN_TEAM_DROPDOWN, GET_ALL_SUB_TEAM_DROPDOWN, GET_ALL_USERS_DROPDOWN, GET_DROPDOWN_BUILDER_, GET_PROJECT_BY_BUILDER_, UPDATE_FRESH_BOOKING_ATTACHMENT } from "../../helpers/url_helper";
import ScreenLoader from "../../constants/ScreenLoader";
import ApiClient, { imageBaseUrl } from "../../helpers/api_helper";
import { toast } from "react-toastify";
import { useGet } from "../../Hooks/useApi";
import { useUserStore } from "../../store/useUserStore";
import { MdDelete, MdFilterList, MdClose, MdSearch, MdAdd, MdDownload, MdUploadFile } from "react-icons/md";
import { RiPencilFill } from "react-icons/ri";
import PageContent from "../../components/Common/PageContent";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";
import { decryptData } from "../../components/Common/CryptoUtils";
import * as XLSX from 'xlsx-js-style';
import { stageOptions } from "../../constants/global";
import { FaFilePdf } from "react-icons/fa";
import ImageModal from "../../components/Common/ImageModal";

const LIMIT = 100;

const sortByTypeGroup = [
    { label: "Fresh ID", value: "saleId" },
    { label: "Client Name", value: "clientName" },
    { label: "Unit No.", value: "unitNo" },
];

const initialFormState = {
    fromDate: "",
    toDate: "",
    builder: null,
    project: null,
    mainTeam: null,
    subTeam: null,
    userList: null,
    stage: null,
    branch: null
};

// ── Inject styles ─────────────────────────────────────────────────────────────
if (!document.getElementById("fbl1-styles")) {
    const st = document.createElement("style")
    st.id = "fbl1-styles"
    st.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap');

        .fbl1-root * {box-sizing: border-box; }

        /* ── Filter card ── */
        .fbl1-filter-card {
            background: #fff;
            border: 1px solid #E8ECF2;
            border-radius: 16px;
            padding: 20px 24px 16px;
            margin-bottom: 16px;
            box-shadow: 0 1px 4px rgba(0,0,0,.04);
        }
        .fbl1-filter-title {
            font-size: 11px; font-weight: 700; color: #94A3B8;
            text-transform: uppercase; letter-spacing: .8px;
            display: flex; align-items: center; gap: 6px;
            margin-bottom: 14px;
        }
        .fbl1-filter-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
            gap: 12px;
            align-items: end;
        }
        .fbl1-field-label {
            font-size: 11px; font-weight: 600; color: #64748B;
            margin-bottom: 5px; display: block; letter-spacing: .2px;
        }
        .fbl1-date-input {
            width: 100%; height: 38px; padding: 0 11px;
            border: 1.5px solid #E2E8F0; border-radius: 9px;
            font-size: 13px; color: #0F172A; outline: none;
            transition: border-color .15s, box-shadow .15s;
        }
        .fbl1-date-input:focus { border-color: #005B52; box-shadow: 0 0 0 3px rgba(0,91,82,.08); }

        /* ── Toolbar ── */
        .fbl1-toolbar {
            display: flex; align-items: center; justify-content: space-between;
            padding: 10px 16px; background: #fff;
            border: 1px solid #E8ECF2; border-radius: 14px;
            margin-bottom: 14px;
            box-shadow: 0 1px 4px rgba(0,0,0,.04);
        }
        .fbl1-tool-btn {
            border-radius: 9px;
            border: 1.5px solid #E2E8F0; background: #fff;
            cursor: pointer; display: flex; align-items: center;
            justify-content: center; transition: all .15s; flex-shrink: 0;
            color: #64748B;
        }
        .fbl1-tool-btn:hover { border-color: #005B52; background: #f0fdf9; color: #005B52; }
        .fbl1-tool-btn.add { border-color: #005B52; background: #005B52; color: #fff; }
        .fbl1-tool-btn.add:hover { background: #004a43; }

        /* ── Tabs ── */
        .fbl1-tabs { display: flex; align-items: center; gap: 4px; }
        .fbl1-tab {
            padding: 7px 20px; border-radius: 8px; font-size: 13px; font-weight: 600;
            cursor: pointer; border: 1.5px solid transparent; transition: all .18s;
            display: flex; align-items: center; gap: 6px; white-space: nowrap;
        }
        .fbl1-tab-dot { width: 7px; height: 7px; border-radius: 50%; }
        .fbl1-tab.tab-task       { color: #64748B; border-color: #E2E8F0; background: #F8FAFC; }
        .fbl1-tab.tab-task.active   { color: #1E40AF; border-color: #BFDBFE; background: #EFF6FF; }
        .fbl1-tab.tab-approved       { color: #64748B; border-color: #E2E8F0; background: #F8FAFC; }
        .fbl1-tab.tab-approved.active { color: #166534; border-color: #BBF7D0; background: #F0FDF4; }
        .fbl1-tab.tab-rejected       { color: #64748B; border-color: #E2E8F0; background: #F8FAFC; }
        .fbl1-tab.tab-rejected.active { color: #991B1B; border-color: #FECACA; background: #FEF2F2; }

        /* ── Action buttons ── */
        .fbl1-show-btn {
            height: 36px; padding: 0 20px;
            background: linear-gradient(135deg, #005B52, #007A6E);
            color: #fff; border: none; border-radius: 9px;
            font-size: 13px; font-weight: 700; cursor: pointer;
            transition: opacity .15s; white-space: nowrap;
        }
        .fbl1-show-btn:hover { opacity: .88; }
        .fbl1-clear-btn {
            height: 36px; padding: 0 16px;
            background: #F1F5F9; color: #475569;
            border: none; border-radius: 9px;
            font-size: 13px; font-weight: 600; cursor: pointer;
            transition: background .15s; display: flex; align-items: center; gap: 5px;
        }
        .fbl1-clear-btn:hover { background: #E2E8F0; }

        /* ── Manage + delete cell buttons ── */
        .fbl1-manage-btn {
            width: 28px; height: 28px; border-radius: 7px;
            border: 1.5px solid #E2E8F0; background: #fff;
            cursor: pointer; display: flex; align-items: center; justify-content: center;
            transition: all .15s; color: #C9A84C;
        }
        .fbl1-manage-btn:hover { border-color: #FCD34D; background: #FFFBEB; }
        .fbl1-delete-btn {
            width: 28px; height: 28px; border-radius: 7px;
            border: 1.5px solid #E2E8F0; background: #fff;
            cursor: pointer; display: flex; align-items: center; justify-content: center;
            transition: all .15s; color: #94A3B8;
        }
        .fbl1-delete-btn:hover { border-color: #FECACA; background: #FEF2F2; color: #EF4444; }

        /* react-select override */
        .fbl1-root .css-13cymwt-control,
        .fbl1-root .css-t3ipsp-control {
            border-radius: 9px !important;
            border: 1.5px solid #E2E8F0 !important;
            min-height: 38px !important;
            font-size: 13px !important;
        }
        .fbl1-root .css-t3ipsp-control {
            border-color: #005B52 !important;
            box-shadow: 0 0 0 3px rgba(0,91,82,.08) !important;
        }

        /* ── Responsive ── */

        /* Tablet landscape (≤1024px) */
        @media(max-width:1024px){
            .fbl1-filter-card { padding:16px 18px 14px; }
            .fbl1-filter-grid { grid-template-columns:repeat(auto-fill,minmax(140px,1fr)); gap:10px; }
            .fbl1-toolbar { flex-wrap:wrap; gap:10px; padding:10px 14px; }
            .fbl1-tabs { flex-wrap:wrap; gap:6px; }
        }

        /* Tablet portrait (≤768px) */
        @media(max-width:768px){
            .fbl1-filter-card { padding:14px 16px 12px; border-radius:12px; }
            .fbl1-filter-grid { grid-template-columns:repeat(2,1fr); gap:10px; }
            .fbl1-filter-title { font-size:10px; margin-bottom:10px; }
            .fbl1-field-label { font-size:10px; }
            .fbl1-date-input { height:36px; font-size:12px; }
            .fbl1-toolbar { flex-direction:column; align-items:stretch; gap:10px; border-radius:12px; }
            .fbl1-tabs { justify-content:flex-start; }
            .fbl1-tab { padding:6px 14px; font-size:12px; }
            .fbl1-show-btn { height:34px; font-size:12px; padding:0 16px; }
            .fbl1-clear-btn { height:34px; font-size:12px; padding:0 12px; }
        }

        /* Mobile (≤560px) */
        @media(max-width:560px){
            .fbl1-filter-card { padding:12px 14px 10px; border-radius:10px; margin-bottom:12px; }
            .fbl1-filter-grid { grid-template-columns:1fr; gap:8px; }
            .fbl1-filter-grid > div:last-child { display:flex; gap:8px; }
            .fbl1-filter-grid > div:last-child .fbl1-show-btn { flex:1; }
            .fbl1-filter-grid > div:last-child .fbl1-clear-btn { flex:1; justify-content:center; }
            .fbl1-toolbar { padding:10px 12px; border-radius:10px; gap:8px; }
            .fbl1-tabs { gap:4px; }
            .fbl1-tab { padding:6px 10px; font-size:11px; gap:4px; }
            .fbl1-tab-dot { width:6px; height:6px; }
            .fbl1-tool-btn { width:34px; height:34px; }
            .fbl1-date-input { height:36px; font-size:12px; border-radius:8px; }
        }

        /* Very small (≤380px) */
        @media(max-width:380px){
            .fbl1-filter-card { padding:10px 12px 8px; }
            .fbl1-tab { padding:5px 8px; font-size:10px; }
            .fbl1-show-btn { height:32px; font-size:11px; }
            .fbl1-clear-btn { height:32px; font-size:11px; }
            .fbl1-field-label { font-size:9px; }
        }
    `
    document.head.appendChild(st)
}

const selectStyles = {
    control: (b, st) => ({
        ...b,
        borderRadius: 9, minHeight: 38, fontSize: 13,
        border: `1.5px solid ${st.isFocused ? "#005B52" : "#070707"}`,
        boxShadow: st.isFocused ? "0 0 0 3px rgba(0,91,82,.08)" : "none",
    }),
    option: (b, st) => ({
        ...b, fontSize: 13,
        background: st.isSelected ? "#005B52" : st.isFocused ? "#f0fdf9" : "#fff",
        color: st.isSelected ? "#fff" : "#0F172A",
    }),
    menuPortal: b => ({ ...b, zIndex: 9999 }),
    placeholder: b => ({ ...b, color: "#94A3B8", fontSize: 13 }),
}

export default function FreshBookingLevel1() {
    const navigate = useNavigate();
    const location = useLocation();

    // Read route state once at startup — these are the values passed back from entry page
    const {
        formState: routeFormState,
        page: routePage,
        searchByGroupSelect: routeSearchByGroupSelect,
        searchTerm: routeSearchTerm,
        activeTabName: routeActiveTabName
    } = location.state || {};

    const { userId } = useUserStore((state) => state.user);
    const [page, setPage] = useState(routePage || 1);
    const [formState, setFormState] = useState(initialFormState);
    const [searchByGroupSelect, setselectedSearchGroupSelect] = useState(null);
    const [searchTerm, setSearchTerm] = useState(routeSearchTerm || "");
    const [isPending, setIsPending] = useState(false);
    const [saleEntryData, setSaleEntryData] = useState([]);
    const [accessGranted, setAccessGranted] = useState(null);
    const [activeTab, setActiveTab] = useState(routeActiveTabName || "NO");

    const [uploadModal, setUploadModal] = useState(false)
    const [uploadRow, setUploadRow] = useState(null)
    const [uploading, setUploading] = useState(false)
    const [file, setFile] = useState(null)
    const fileInputRef = useRef(null)
    const [modalOpen, setModalOpen] = useState(false);
    const [currentImage, setCurrentImage] = useState("");

    useEffect(() => {
        if (location.state && Object.keys(location.state).length > 0) {
            // Replace history entry with empty state — refresh will see no state
            navigate(location.pathname, { replace: true, state: null })
        }
    }, []) // empty deps — run once on mount only

    const toggleModal = () => setModalOpen(!modalOpen);

    const { data: builderListRaw } = useGet(GET_DROPDOWN_BUILDER_, { enabled: Boolean(accessGranted) });
    const { data: mainTeamsRaw } = useGet(GET_ALL_MAIN_TEAM_DROPDOWN + '?active=false', { enabled: Boolean(accessGranted) });
    const { data: usersListRaw } = useGet(GET_ALL_USERS_DROPDOWN, { enabled: Boolean(accessGranted) });
    const { data: projectDataRaw } = useGet(`${GET_PROJECT_BY_BUILDER_}${formState?.builder?.value}`, { enabled: Boolean(formState?.builder?.value) });
    const { data: subTeamsRaw } = useGet(`${GET_ALL_SUB_TEAM_DROPDOWN}${formState?.mainTeam?.value}`, { enabled: Boolean(formState?.mainTeam) });
    const { data: locationList } = useGet(ALL_LOCATION_DROPDOWN, { enabled: Boolean(accessGranted) })

    const { data: countData } = useGet(GET_ALL_FRESH_BOOKING_LEVEL_COUNT + 'LEVEL1', { enabled: Boolean(accessGranted) });

    const builderList = useMemo(() => builderListRaw?.data?.data || [], [builderListRaw]);
    const projectData = useMemo(() => projectDataRaw?.data?.data || [], [projectDataRaw]);
    const mainTeams = useMemo(() => mainTeamsRaw?.data?.data || [], [mainTeamsRaw]);
    const subTeams = useMemo(() => subTeamsRaw?.data?.data || [], [subTeamsRaw]);
    const usersList = useMemo(() => usersListRaw?.data?.data || [], [usersListRaw]);

    const handleFormChange = useCallback((field, value) => {
        setFormState((prev) => ({ ...prev, [field]: value }));
    }, []);

    const getSaleDetails = useCallback((url) => {
        setIsPending(true);
        ApiClient.get(url)
            .then(function (response) {
                setIsPending(false);
                if (response?.data?.status === 1) {
                    const encryptedContent = response.data.data;
                    decryptData(encryptedContent).then(setSaleEntryData).catch(() => setSaleEntryData([]));
                } else {
                    setSaleEntryData([])
                    toast.error(response.data.message);
                }
            })
            .catch(function (error) {
                setIsPending(false);
                setSaleEntryData([])
                toast.error(error.message);
            });
    }, []);

    const getBaseApiUrl = useCallback(({ fromDate, toDate, pageNum, term, searchBy, size = LIMIT, builder, project, mainTeam, subTeam, userList, approvalStatus, stage, branch }) => {
        const status = approvalStatus ?? activeTab
        let apiUrl = `${GET_ALL_FRESH_BOOKING_LEVEL}?isActive=YES&freshFormLevel=LEVEL1&isApproved=${status}&fromDateStr=${fromDate}&toDateStr=${toDate}&offset=${pageNum - 1}&limit=${size}`;
        if (searchBy && term) apiUrl += `&key=${searchBy.value}&value=${term}`;
        if (builder) apiUrl += `&builderId=${builder}`;
        if (project) apiUrl += `&projectId=${project}`;
        if (mainTeam) apiUrl += `&mainTeam=${mainTeam}`;
        if (subTeam) apiUrl += `&subTeam=${subTeam}`;
        if (userList) apiUrl += `&key=associateId&value=${userList}`;
        if (stage) apiUrl += `&freshBookingType=${stage}`;
        if (branch) apiUrl += `&branch=${branch}`;
        return apiUrl;
    }, [activeTab]);

    const getFromToDate = useCallback(() => {
        const now = new Date();
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const initialFromDate = "2025-01-01";
        const initialToDate = formatDateForInput(endOfMonth);
        setFormState((prevState) => ({ ...prevState, fromDate: initialFromDate, toDate: initialToDate }));
        if (!routeFormState) {
            const initialUrl = getBaseApiUrl({ fromDate: initialFromDate, toDate: initialToDate, pageNum: 1, term: "", searchBy: null });
            getSaleDetails(initialUrl);
        }
    }, [getBaseApiUrl, getSaleDetails, routeFormState]);

    const handlePaginationData = useCallback((fromDate, toDate, newPage) => {
        const apiUrl = getBaseApiUrl({
            fromDate, toDate, pageNum: newPage,
            term: searchTerm, searchBy: searchByGroupSelect,
            builder: formState.builder?.value, project: formState.project?.value,
            mainTeam: formState.mainTeam?.value, subTeam: formState.subTeam?.value,
            userList: formState.userList?.value, stage: formState.stage?.value, branch: formState?.branch?.label
        });
        getSaleDetails(apiUrl);
    }, [formState.builder, formState.project, formState.mainTeam, formState.subTeam, formState.userList, formState.stage, searchTerm, searchByGroupSelect, getBaseApiUrl, getSaleDetails, formState?.branch]);

    const hitGetFreshBookingApi = useCallback(() => {
        if (!accessGranted || !routeFormState && !routeSearchByGroupSelect && !routeSearchTerm && !routePage) return;
        let newFormState = { fromDate: routeFormState?.fromDate || formState.fromDate, toDate: routeFormState?.toDate || formState.toDate };
        const findSelected = (value, list) => list?.find((item) => item.value === value?.value);
        newFormState.builder = findSelected(routeFormState?.builder, builderList) || null;
        newFormState.project = findSelected(routeFormState?.project, projectData) || null;
        newFormState.mainTeam = findSelected(routeFormState?.mainTeam, mainTeams) || null;
        newFormState.subTeam = findSelected(routeFormState?.subTeam, subTeams) || null;
        newFormState.userList = findSelected(routeFormState?.userList, usersList) || null;
        newFormState.stage = findSelected(routeFormState?.stage, stageOptions) || null;
        newFormState.branch = findSelected(routeFormState?.branch, locationList?.data?.data) || null;
        setFormState(newFormState);
        setSearchTerm(routeSearchTerm || "");
        setPage(routePage || 1);
        const currentSearchByGroupSelect = findSelected(routeSearchByGroupSelect, sortByTypeGroup) || null;
        setselectedSearchGroupSelect(currentSearchByGroupSelect);
        const apiUrl = getBaseApiUrl({
            fromDate: newFormState.fromDate, toDate: newFormState.toDate,
            pageNum: routePage || 1, term: routeSearchTerm, searchBy: currentSearchByGroupSelect,
            mainTeam: newFormState.mainTeam?.value, subTeam: newFormState.subTeam?.value,
            builder: newFormState.builder?.value, project: newFormState.project?.value,
            userList: newFormState.userList?.value, stage: newFormState.stage?.value,
            approvalStatus: routeActiveTabName || activeTab,
            branch: newFormState?.branch?.label,
        });
        getSaleDetails(apiUrl);
    }, [accessGranted, routeFormState, routeSearchByGroupSelect, routeSearchTerm, routePage, builderList, projectData, mainTeams, subTeams, usersList, getBaseApiUrl, getSaleDetails]);

    useEffect(() => {
        const checkAccess = async () => {
            const hasAccess = await CheckUserAccess(userId, 'first-level-fresh-booking');
            setAccessGranted(hasAccess);
            if (hasAccess) getFromToDate();
        };
        checkAccess();
    }, [userId, getFromToDate]);

    const handleUpload = async () => {
        if (!file) { toast.error('Please select a file first'); return }
        const formData = new FormData()
        formData.append('file', file)
        formData.append('freshId', uploadRow?.id)
        setUploading(true)
        try {
            const res = await ApiClient.post(UPDATE_FRESH_BOOKING_ATTACHMENT, formData)
            if (res?.data?.status === 1) {
                toast.success(res.data.message || 'File uploaded successfully')
                handlePaginationData(formState.fromDate, formState.toDate, page);
                setUploadModal(false)
                setFile(null)
            } else {
                toast.error(res?.data?.message || 'Upload failed')
            }
        } catch (e) { toast.error(e.message) }
        finally { setUploading(false) }
    }

    const openUpload = (row) => {
        setUploadRow(row)
        setFile(null)
        setUploadModal(true)
    }

    useEffect(() => {
        if (accessGranted && builderList.length > 0 && mainTeams.length > 0 && usersList.length > 0) {
            const timeoutId = setTimeout(hitGetFreshBookingApi, 0);
            return () => clearTimeout(timeoutId);
        }
    }, [routeSearchByGroupSelect, routeFormState, routeSearchTerm, routePage, accessGranted, builderList, projectData, mainTeams, subTeams, usersList]);

    useEffect(() => {
        setFormState((prev) => {
            let updated = { ...prev };
            let changed = false;
            if (!prev.builder && prev.project !== null) { updated.project = null; changed = true; }
            if (!prev.mainTeam && prev.subTeam !== null) { updated.subTeam = null; changed = true; }
            return changed ? updated : prev;
        });
    }, [formState.builder, formState.mainTeam]);

    const handleSearchByTypeSelectGroup = useCallback((selectedGroup) => { setselectedSearchGroupSelect(selectedGroup); }, []);

    const handleChange = useCallback((e) => {
        const { id, value } = e.target;
        setFormState((prevState) => ({ ...prevState, [id]: value }));
    }, []);

    const handleClearData = useCallback(() => {
        navigate("/first-level-fresh-booking", { replace: true });
        getFromToDate();
        setselectedSearchGroupSelect(null);
        setSearchTerm("");
        setPage(1);
        setActiveTab("NO");
        setFormState((prev) => ({ ...prev, builder: null, project: null, mainTeam: null, subTeam: null, userList: null, stage: null, branch: null }));
        const initialFromDate = "2025-01-01";
        const apiUrl = getBaseApiUrl({ fromDate: initialFromDate, toDate: formState.toDate, pageNum: 1, term: "", searchBy: null, approvalStatus: "NO", stage: null, branch: null });
        getSaleDetails(apiUrl);
    }, [navigate, getFromToDate, formState.toDate, getBaseApiUrl, getSaleDetails]);

    const handleShowData = useCallback((event) => {
        event.preventDefault();
        setPage(1);
        const apiUrl = getBaseApiUrl({
            fromDate: formState.fromDate, toDate: formState.toDate, pageNum: 1,
            term: searchTerm, searchBy: searchByGroupSelect,
            builder: formState?.builder?.value, project: formState?.project?.value,
            mainTeam: formState?.mainTeam?.value, subTeam: formState?.subTeam?.value,
            userList: formState?.userList?.value, stage: formState?.stage?.value, branch: formState?.branch?.label
        });
        getSaleDetails(apiUrl);
    }, [formState.fromDate, formState.toDate, searchTerm, searchByGroupSelect, getBaseApiUrl, getSaleDetails, formState.builder, formState.project, formState.mainTeam, formState.subTeam, formState.userList, formState.stage, formState?.branch]);

    const handlePageChange = useCallback((newPage) => {
        setPage(newPage);
        handlePaginationData(formState.fromDate, formState.toDate, newPage);
    }, [formState.fromDate, formState.toDate, handlePaginationData]);

    const handleAddBooking = useCallback(() => {
        navigate("/first-level-fresh-booking/first-level-entry", { state: { rowData: {} } });
    }, [navigate]);

    const handleDeleteClick = useCallback((row) => {
        if (!window.confirm("Are you sure you want to delete this Booking?")) return;
        setIsPending(true);
        ApiClient.post(`${DELETE_FRESH_BOOKING}${row.id}&status=NO&loginId=${userId}`)
            .then(function (response) {
                setIsPending(false);
                if (response?.data?.status === 1) {
                    toast.success(response.data.message);
                    handlePaginationData(formState.fromDate, formState.toDate, page);
                } else { toast.error(response.data.message); }
            })
            .catch(function (error) { setIsPending(false); toast.error(error.message); });
    }, [formState.fromDate, formState.toDate, page, userId, handlePaginationData]);

    const handleViewFileList = (row) => {
        const fileName = row?.saleFilepath
        if (fileName) {
            const fileExtension = fileName.split(".").pop().toLowerCase();
            const fileUrl = imageBaseUrl + fileName;

            if (fileExtension === "pdf" || fileExtension === "pptx") {
                // Open PDF in a new window
                window.open(fileUrl, "_blank");
            }
            else if (fileExtension === "heic" || fileExtension === "msg") {
                const a = Object.assign(document.createElement("a"), { href: fileUrl, download: fileName })
                document.body.appendChild(a); a.click(); document.body.removeChild(a)
            }
            else {
                // Set the image source and open modal for images
                setCurrentImage(fileUrl);
                toggleModal();
            }
        }
        else {
            toast.error('No File Exists')
        }
    };

    const downloadDataExcel = useCallback(() => {
        setIsPending(true);
        const totalSize = saleEntryData?.totalElements || LIMIT;
        let apiUrl = getBaseApiUrl({
            fromDate: formState.fromDate, toDate: formState.toDate, pageNum: 1,
            term: searchTerm, searchBy: searchByGroupSelect, size: totalSize,
            builder: formState?.builder?.value, project: formState?.project?.value,
            mainTeam: formState?.mainTeam?.value, subTeam: formState?.subTeam?.value,
            userList: formState?.userList?.value, stageOptions: formState?.stage?.value,
            branch: formState?.branch?.label
        });

        ApiClient.get(apiUrl)
            .then(function (response) {
                setIsPending(false);
                if (response.data.status === 1) {
                    const encryptedContent = response?.data?.data;
                    decryptData(encryptedContent).then((decrypted) => {
                        const d_data = decrypted;
                        if (!Array.isArray(d_data?.content) || d_data?.content?.length === 0) {
                            toast.info("No data to export.");
                            return;
                        }

                        const excludedKeys = [
                            'connectBookingStatus', 'connectSuspectId', 'connectSuspectName',
                            'bookingType', 'clientAddress', 'clientPhone', 'clientPhone2', 'sales_approval_status', 'sales_approved_by', 'sales_approved_date',
                            'clientEmail', 'clientDob', 'clientAddharCard', 'builder', 'project', 'disabledBy', 'fileActive',
                            'coApplicantAddress', 'coApplicantPhone', 'coApplicantPhone2', 'furnishedInteriorCharges', 'brokerAdditionalDiscount', 'clientAdditionalDiscount', 'netCostAfterInteriorCharges',
                            'coApplicantEmail', 'coApplicantDob', 'coApplicantAddharCard', 'isActive', 'isRejected', 'rejectedByLevel', 'freshFormLevel', 'levelRejectRemark',
                            'projectunitId', 'bookingStatusId', 'locationId', 'propTypeId', 'movedToLive', 'movedToLiveBy', 'moveToLiveDate',
                            'saleStatusId', 'formStageId', 'loanSelfFundingId', 'kycStatusId', 'createdBy', 'modifiedBy', 'saleFilepath', 'saleAttachmentPath',
                            'paymentPlan', 'schemaIncentiveId', 'incentiveId', 'fileId', 'fileUploadPath', 'isFreshForm', 'isRejected'
                        ];

                        const rows = d_data.content;
                        const headers = Object.keys(rows[0]).filter((k) => !excludedKeys.includes(k));

                        // ── Styles ──────────────────────────────────────────────────
                        const BORDER = {
                            top: { style: 'thin', color: { rgb: 'B7B7B7' } },
                            bottom: { style: 'thin', color: { rgb: 'B7B7B7' } },
                            left: { style: 'thin', color: { rgb: 'B7B7B7' } },
                            right: { style: 'thin', color: { rgb: 'B7B7B7' } },
                        };

                        const TITLE_STYLE = {
                            font: { name: 'Calibri', sz: 16, bold: true, color: { rgb: 'FFFFFF' } },
                            alignment: { horizontal: 'center', vertical: 'center' },
                            fill: { patternType: 'solid', fgColor: { rgb: '005B52' } },
                            border: BORDER,
                        };

                        const META_STYLE = {
                            font: { name: 'Calibri', sz: 10, italic: true, color: { rgb: '475569' } },
                            alignment: { horizontal: 'left', vertical: 'center' },
                            fill: { patternType: 'solid', fgColor: { rgb: 'F8FAFC' } },
                        };

                        const HEADER_STYLE = {
                            font: { name: 'Calibri', sz: 11, bold: true, color: { rgb: 'FFFFFF' } },
                            alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
                            fill: { patternType: 'solid', fgColor: { rgb: '005B52' } },
                            border: BORDER,
                        };

                        const cellStyle = (rowIdx, opts = {}) => ({
                            font: { name: 'Calibri', sz: 10, color: { rgb: '0F172A' }, ...(opts.font || {}) },
                            alignment: { vertical: 'center', wrapText: true, ...(opts.alignment || {}) },
                            fill: opts.fill || {
                                patternType: 'solid',
                                fgColor: { rgb: rowIdx % 2 === 0 ? 'FFFFFF' : 'F8FAFC' },
                            },
                            border: BORDER,
                        });

                        // Pretty header from camelCase / snake_case
                        const prettifyHeader = (key) =>
                            String(key)
                                .replace(/([A-Z])/g, ' $1')
                                .replace(/_/g, ' ')
                                .replace(/\b\w/g, (c) => c.toUpperCase())
                                .trim();

                        // Sample first 5 rows to decide if a column is numeric
                        const isNumericColumn = (key) => {
                            const sample = rows.slice(0, 5).map((r) => r[key]);
                            const numericCount = sample.filter(
                                (v) => v !== null && v !== '' && !isNaN(Number(v))
                            ).length;
                            return numericCount > sample.length / 2;
                        };

                        // Width tuned to longest value (capped at 50)
                        const colWidth = (key) => {
                            const headerLen = prettifyHeader(key).length;
                            const maxValueLen = rows.reduce((max, row) => {
                                const v = row[key];
                                const len = v == null ? 0 : String(v).length;
                                return Math.max(max, len);
                            }, 0);
                            return { wch: Math.min(Math.max(headerLen, maxValueLen) + 2, 50) };
                        };

                        // Build filter summary for meta row
                        const filterSummary = [
                            formState.fromDate && formState.toDate &&
                            `Period: ${formatDate(formState.fromDate)} → ${formatDate(formState.toDate)}`,
                            formState?.builder?.label && `Builder: ${formState.builder.label}`,
                            formState?.project?.label && `Project: ${formState.project.label}`,
                            formState?.mainTeam?.label && `Main Team: ${formState.mainTeam.label}`,
                            formState?.subTeam?.label && `Sub Team: ${formState.subTeam.label}`,
                            formState?.userList?.label && `User: ${formState.userList.label}`,
                            formState?.stage?.label && `Stage: ${formState.stage.label}`,
                            searchTerm && `Search: "${searchTerm}"`,
                        ].filter(Boolean).join('  ·  ');

                        // ── Build sheet ─────────────────────────────────────────────
                        const totalCols = headers.length;
                        const lastColLetter = XLSX.utils.encode_col(totalCols - 1);

                        const ws = {};
                        ws['!ref'] = `A1:${lastColLetter}${3 + rows.length}`;

                        // Row 1: Title
                        ws['A1'] = {
                            v: 'Fresh Booking Details',
                            t: 's',
                            s: TITLE_STYLE,
                        };

                        // Row 2: Meta (generated + record count + filters)
                        const metaText =
                            `Generated: ${new Date().toLocaleString('en-IN')}` +
                            `   ·   Records: ${rows.length}` +
                            (filterSummary ? `   ·   ${filterSummary}` : '');
                        ws['A2'] = { v: metaText, t: 's', s: META_STYLE };

                        // Row 3: Headers
                        headers.forEach((key, ci) => {
                            const addr = XLSX.utils.encode_cell({ c: ci, r: 2 });
                            ws[addr] = { v: prettifyHeader(key), t: 's', s: HEADER_STYLE };
                        });

                        // Pre-compute numeric flag per column
                        const numericFlags = headers.map(isNumericColumn);

                        // Rows 4+: Data
                        rows.forEach((row, ri) => {
                            headers.forEach((key, ci) => {
                                const value = row[key];
                                const addr = XLSX.utils.encode_cell({ c: ci, r: 3 + ri });
                                const isNum =
                                    numericFlags[ci] &&
                                    value !== null &&
                                    value !== '' &&
                                    !isNaN(Number(value));

                                ws[addr] = {
                                    v: isNum ? Number(value) : (value ?? ''),
                                    t: isNum ? 'n' : 's',
                                    s: cellStyle(ri, {
                                        alignment: { horizontal: numericFlags[ci] ? 'right' : 'left' },
                                    }),
                                };
                            });
                        });

                        // Merges: title + meta span all columns
                        ws['!merges'] = [
                            { s: { r: 0, c: 0 }, e: { r: 0, c: totalCols - 1 } },
                            { s: { r: 1, c: 0 }, e: { r: 1, c: totalCols - 1 } },
                        ];

                        // Column widths, row heights, freeze panes
                        ws['!cols'] = headers.map(colWidth);
                        ws['!rows'] = [
                            { hpt: 28 }, // Title
                            { hpt: 22 }, // Meta (taller — filter line can be long)
                            { hpt: 24 }, // Header
                        ];
                        ws['!freeze'] = { xSplit: 0, ySplit: 3 };

                        // Workbook + save
                        const wb = XLSX.utils.book_new();
                        XLSX.utils.book_append_sheet(wb, ws, 'Fresh Booking Details');
                        XLSX.writeFile(wb, `freshBookingLevel1_${generateTimestamp()}.xlsx`);
                    }).catch((error) => {
                        toast.error("Decryption failed: " + error.message);
                    });
                } else {
                    toast.error(response.data.message);
                }
            })
            .catch(function (error) {
                setIsPending(false);
                toast.error("API error: " + error.message);
            });
    }, [
        formState.fromDate, formState.toDate, searchTerm, searchByGroupSelect,
        saleEntryData?.totalElements, getBaseApiUrl,
        formState.builder, formState.project, formState.mainTeam, formState.subTeam,
        formState.userList, formState.stage,
    ]);

    const columns = useMemo(() => ([
        {
            name: <span className="font-weight-bold fs-13">Manage</span>,
            width: "90px",
            cell: (row) => (
                <button
                    title="Manage Booking"
                    onClick={() =>
                        navigate("/first-level-fresh-booking/first-level-entry", {
                            state: { rowData: row, formState, page, searchByGroupSelect, searchTerm, activeTabName: activeTab }
                        })
                    }
                    style={{
                        width: 32, height: 32, padding: 0, border: "1.5px solid #E2E8F0",
                        borderRadius: 7, background: "#fff", cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "#005B52"; e.currentTarget.style.background = "#f0fdf9" }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "#E2E8F0"; e.currentTarget.style.background = "#fff" }}
                >
                    <RiPencilFill size={16} color={defaultTheme.btnEnable} />
                </button>
            ),
        },
        {
            name: <span className="font-weight-bold fs-13">Upload</span>,
            width: "72px",
            cell: (row) => (
                <button
                    title="Upload Document"
                    onClick={() => openUpload(row)}
                    style={{
                        width: 32, height: 32, padding: 0, border: "1.5px solid #E2E8F0",
                        borderRadius: 7, background: "#fff", cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "#005B52"; e.currentTarget.style.background = "#f0fdf9" }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "#E2E8F0"; e.currentTarget.style.background = "#fff" }}
                >
                    <MdUploadFile size={16} color="#005B52" />
                </button>
            ),
        },
        {
            name: <span className="font-weight-bold fs-13">File</span>,
            selector: (row) => row.saleFilepath,
            cell: (row) => (
                <div>
                    {row.saleFilepath ?
                        <FaFilePdf
                            size={20}
                            onClick={() => handleViewFileList(row)}
                            style={{ cursor: "pointer", color: defaultTheme.goldColorLogo }}
                        />
                        : <span style={{ color: "#94A3B8", fontStyle: "italic" }}>No File</span>}
                </div>
            ),
        },
        { name: <span className="font-weight-bold fs-13">Created At</span>, selector: (row) => row.createdDate, sortable: true, cell: (row) => <WordWrapCell>{formatDateTime(row.createdDate)}</WordWrapCell> },
        { name: <span className="font-weight-bold fs-13">Fresh ID</span>, selector: (row) => row.id, sortable: true, cell: (row) => <WordWrapCell>{row.id}</WordWrapCell> },
        { name: <span className="font-weight-bold fs-13">Complete %</span>, selector: (row) => row.bookingCompletePercentage, sortable: true, cell: (row) => <WordWrapCell>{row.bookingCompletePercentage}</WordWrapCell> },
        { name: <span className="font-weight-bold fs-13">Associate Name</span>, selector: (row) => row.associateName, sortable: true, width: '10%', cell: (row) => <WordWrapCell>{row.associateName}</WordWrapCell> },
        { name: <span className="font-weight-bold fs-13">MT/ST</span>, selector: (row) => row.mainTeam, sortable: true, cell: (row) => <WordWrapCell>{row.mainTeam + '/' + row.subTeam}</WordWrapCell> },
        { name: <span className="font-weight-bold fs-13">Prospect Name</span>, selector: (row) => row.prospectName, sortable: true, width: '15%', cell: (row) => <WordWrapCell>{row.prospectName}</WordWrapCell> },
        { name: <span className="font-weight-bold fs-13">Property Type</span>, selector: (row) => row.propTypeName, sortable: true, cell: (row) => <WordWrapCell>{row.propTypeName}</WordWrapCell> },
        { name: <span className="font-weight-bold fs-13">Location</span>, selector: (row) => row.locationName, sortable: true, cell: (row) => <WordWrapCell>{row.locationName}</WordWrapCell> },
        { name: <span className="font-weight-bold fs-13">Builder Name</span>, selector: (row) => row.builderName, sortable: true, cell: (row) => <WordWrapCell>{row.builderName}</WordWrapCell> },
        { name: <span className="font-weight-bold fs-13">Project Name</span>, selector: (row) => row.projectName, sortable: true, cell: (row) => <WordWrapCell>{row.projectName}</WordWrapCell> },
        { name: <span className="font-weight-bold fs-13">Client Name</span>, selector: (row) => row.clientName, sortable: true, cell: (row) => <WordWrapCell>{row.clientName}</WordWrapCell> },
        { name: <span className="font-weight-bold fs-13">Unit No.</span>, selector: (row) => row.projectUnitName, sortable: true, cell: (row) => <WordWrapCell>{row.projectUnitName}</WordWrapCell> },
        { name: <span className="font-weight-bold fs-13">Remarks</span>, selector: (row) => row.remarks, sortable: true, width: '40%', cell: (row) => <WordWrapCell>{row.remarks}</WordWrapCell> },
        {
            name: <span className="font-weight-bold fs-13">Action</span>,
            width: "90px",
            cell: (row) => (
                <button
                    title="Delete Fresh Booking"
                    onClick={() => handleDeleteClick(row)}
                    style={{
                        width: 32, height: 32, padding: 0, border: "1.5px solid #E2E8F0",
                        borderRadius: 7, background: "#fff", cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "#005B52"; e.currentTarget.style.background = "#f0fdf9" }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "#E2E8F0"; e.currentTarget.style.background = "#fff" }}
                >
                    <MdDelete size={16} color={defaultTheme.redColor} />
                </button>
            ),
        },
        { name: <span className="font-weight-bold fs-13">Reject Remarks</span>, selector: (row) => row.levelRejectRemark, sortable: true, width: '40%', cell: (row) => <WordWrapCell>{row.levelRejectRemark}</WordWrapCell> },
    ]), [navigate, formState, page, searchByGroupSelect, searchTerm, handleDeleteClick, activeTab]);

    const handleTabChange = useCallback((status) => {
        setActiveTab(status);
        setPage(1);
        const apiUrl = getBaseApiUrl({
            fromDate: formState.fromDate, toDate: formState.toDate, pageNum: 1,
            term: searchTerm, searchBy: searchByGroupSelect,
            builder: formState?.builder?.value, project: formState?.project?.value,
            mainTeam: formState?.mainTeam?.value, subTeam: formState?.subTeam?.value,
            userList: formState?.userList?.value, approvalStatus: status, branch: formState?.branch?.label
        });
        getSaleDetails(apiUrl);
    }, [formState, searchTerm, searchByGroupSelect, getBaseApiUrl, getSaleDetails]);

    const tabs = [
        { label: "My Task", value: "NO", cls: "tab-task", dot: "#3B82F6", countKey: "pending" },
        { label: "Next Level", value: "YES", cls: "tab-approved", dot: "#22C55E", countKey: "approved" },
        { label: "Rejected", value: "GROUP", cls: "tab-rejected", dot: "#EF4444", countKey: "rejected" }
    ];

    const infoTabs = [
        { label: "EOI", dot: "#F59E0B", countKey: "EOI" },
        { label: "Pending", dot: "#8B5CF6", countKey: "Pending" }
    ];

    if (accessGranted === null) return <ScreenLoader />;
    if (!accessGranted) return <PermissionMissing />;

    return (
        <PageContent>
            {isPending && <ScreenLoader />}
            <div className="fbl1-root">
                <Breadcrumbs title="Transaction" breadcrumbItem="Booking Level 1" />
                <Container fluid={true}>

                    <form onSubmit={handleShowData}>
                        <div className="fbl1-filter-card">
                            <div className="fbl1-filter-title">
                                <MdFilterList size={14} />
                                Filters
                            </div>
                            <div className="fbl1-filter-grid">
                                <div>
                                    <label className="fbl1-field-label">From Date</label>
                                    <input id="fromDate" className="fbl1-date-input form-control" type="date"
                                        value={formState.fromDate} onChange={handleChange} />
                                </div>
                                <div>
                                    <label className="fbl1-field-label">To Date</label>
                                    <input id="toDate" className="fbl1-date-input form-control" type="date"
                                        value={formState.toDate} onChange={handleChange} />
                                </div>
                                <div>
                                    <label className="fbl1-field-label">Search By</label>
                                    <Select menuPortalTarget={document.body} isClearable value={searchByGroupSelect}
                                        onChange={handleSearchByTypeSelectGroup} options={sortByTypeGroup}
                                        styles={selectStyles} placeholder="Select field…" />
                                </div>
                                <div>
                                    <label className="fbl1-field-label">Search</label>
                                    <div style={{ position: "relative" }}>
                                        <MdSearch size={15} color="#94A3B8" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                                        <input className="fbl1-date-input form-control" type="text" placeholder="Type to search…"
                                            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                                            style={{ paddingLeft: 30 }} />
                                    </div>
                                </div>
                                <div>
                                    <label className="fbl1-field-label">Builder</label>
                                    <Select value={formState.builder} onChange={(val) => handleFormChange("builder", val)}
                                        options={builderList} isClearable menuPortalTarget={document.body} styles={selectStyles} placeholder="Select…" />
                                </div>
                                <div>
                                    <label className="fbl1-field-label">Project</label>
                                    <Select value={formState.project} onChange={(val) => handleFormChange("project", val)}
                                        options={projectData} isClearable menuPortalTarget={document.body} styles={selectStyles}
                                        isDisabled={!formState.builder} placeholder="Select…" />
                                </div>
                                <div>
                                    <label className="fbl1-field-label">Main Team</label>
                                    <Select value={formState.mainTeam} onChange={(val) => handleFormChange("mainTeam", val)}
                                        options={mainTeams} isClearable menuPortalTarget={document.body} styles={selectStyles} placeholder="Select…" />
                                </div>
                                <div>
                                    <label className="fbl1-field-label">Sub Team</label>
                                    <Select value={formState.subTeam} onChange={(val) => handleFormChange("subTeam", val)}
                                        options={subTeams} isClearable menuPortalTarget={document.body} styles={selectStyles}
                                        isDisabled={!formState.mainTeam} placeholder="Select…" />
                                </div>
                                <div>
                                    <label className="fbl1-field-label">Associate</label>
                                    <Select value={formState.userList} onChange={(val) => handleFormChange("userList", val)}
                                        options={usersList} isClearable menuPortalTarget={document.body} styles={selectStyles} placeholder="Select…" />
                                </div>

                                <div>
                                    <label className="fbl1-field-label">Stage</label>
                                    <Select value={formState.stage} onChange={(val) => handleFormChange("stage", val)}
                                        options={stageOptions} isClearable menuPortalTarget={document.body} styles={selectStyles} placeholder="Select…" />
                                </div>
                                <div>
                                    <label className="fbl1-field-label">Branch</label>
                                    <Select value={formState.branch} onChange={(val) => handleFormChange("branch", val)}
                                        options={locationList?.data?.data || []} isClearable menuPortalTarget={document.body} styles={selectStyles} placeholder="Select…" />
                                </div>
                                <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
                                    <button type="submit" className="fbl1-show-btn">Show Data</button>
                                    <button type="button" className="fbl1-clear-btn" onClick={handleClearData}>
                                        <MdClose size={14} /> Clear
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>

                    <div className="fbl1-toolbar">
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <button className="fbl1-tool-btn add" onClick={handleAddBooking} title="Add Booking">
                                <MdAdd size={18} />
                            </button>
                            <button className="fbl1-tool-btn" onClick={downloadDataExcel} title="Download Excel">
                                <MdDownload size={18} color="#22C55E" />
                            </button>
                            {/* {saleEntryData?.totalElements > 0 && (
                                <span style={{ fontSize: 12, fontWeight: 700, color: "#64748B", background: "#F1F5F9", borderRadius: 20, padding: "4px 12px", border: "1px solid #E2E8F0" }}>
                                    {saleEntryData.totalElements.toLocaleString()} records
                                </span>
                            )} */}
                            {/* ── Non-clickable info tabs ── */}
                            {infoTabs.map(tab => (
                                <div key={tab.label}
                                    style={{
                                        display: "flex", alignItems: "center", gap: 6,
                                        padding: "7px 14px", borderRadius: 8,
                                        background: "#F8FAFC", border: "1.5px solid #E2E8F0",
                                        fontSize: 12, fontWeight: 700, color: "#64748B",
                                        cursor: "default", userSelect: "none",
                                    }}>
                                    <span style={{
                                        width: 7, height: 7, borderRadius: "50%",
                                        background: tab.dot, flexShrink: 0,
                                    }} />
                                    {tab.label}
                                    <span style={{
                                        background: tab.dot, color: "#fff",
                                        borderRadius: 20, fontSize: 10, fontWeight: 800,
                                        padding: "1px 7px", minWidth: 18,
                                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                                    }}>
                                        {countData?.data?.data?.[tab.countKey] ?? 0}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="fbl1-tabs">
                            {/* ── Clickable tabs ── */}
                            {tabs.map(tab => (
                                <button key={tab.value} type="button"
                                    className={`fbl1-tab ${tab.cls}${activeTab === tab.value ? " active" : ""}`}
                                    onClick={() => handleTabChange(tab.value)}>
                                    <span className="fbl1-tab-dot"
                                        style={{ background: activeTab === tab.value ? tab.dot : "#CBD5E1" }} />
                                    {tab.label}
                                    {countData?.data?.data?.[tab.countKey] !== undefined && (
                                        <span style={{
                                            marginLeft: 5,
                                            background: activeTab === tab.value ? tab.dot : "#E2E8F0",
                                            color: activeTab === tab.value ? "#fff" : "#374151",
                                            borderRadius: 20,
                                            fontSize: 10,
                                            fontWeight: 800,
                                            padding: "1px 7px",
                                            minWidth: 18,
                                            display: "inline-flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}>
                                            {countData.data.data[tab.countKey]}
                                        </span>
                                    )}
                                </button>
                            ))}

                            {/* ── Divider ── */}
                            <div style={{ width: 1, height: 28, background: "#E2E8F0", margin: "0 4px", alignSelf: "center" }} />


                        </div>
                    </div>

                    <AppTable
                        progressPending={isPending}
                        columns={columns}
                        data={saleEntryData?.content}
                        pagination
                        paginationTotalRows={saleEntryData?.totalElements}
                        paginationServer
                        onChangePage={handlePageChange}
                        conditionalRowStyles={[
                            { when: (row) => row.bookingStatusId === 1, style: { color: defaultTheme.redColor } },
                            { when: (row) => row.bookingStatusId === 2, style: { color: defaultTheme.primary } },
                            { when: (row) => row.bookingStatusId === 3, style: { color: defaultTheme.btnEnable } },
                            { when: (row) => row.bookingStatusId === 4, style: { color: defaultTheme.goldColorLogo } },
                        ]}
                    />

                </Container>
            </div>

            {/* ── Upload Document Modal ── */}
            {uploadModal && (
                <div
                    onClick={e => e.target === e.currentTarget && setUploadModal(false)}
                    style={{
                        position: "fixed", inset: 0, zIndex: 9999,
                        background: "rgba(15,23,42,.5)", backdropFilter: "blur(4px)",
                        display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
                    }}
                >
                    <div style={{
                        background: "#fff", borderRadius: 16, width: "100%", maxWidth: 440,
                        overflow: "hidden", boxShadow: "0 24px 60px rgba(0,0,0,.25)",
                        animation: "slideUp .22s cubic-bezier(.16,1,.3,1)",
                    }}>
                        {/* Modal Header */}
                        <div style={{
                            background: "linear-gradient(135deg,#005B52,#007A6E)",
                            padding: "14px 20px", display: "flex", alignItems: "center",
                            justifyContent: "space-between",
                        }}>
                            <div>
                                <div style={{ fontSize: 15, fontWeight: 800, color: "#fff", display: "flex", alignItems: "center", gap: 8 }}>
                                    <MdUploadFile size={18} /> Upload Document
                                </div>
                                <div style={{ fontSize: 11, color: "rgba(255,255,255,.65)", marginTop: 2 }}>
                                    Fresh ID: {uploadRow?.id}
                                </div>
                            </div>
                            <button
                                onClick={() => setUploadModal(false)}
                                style={{
                                    borderRadius: "50%", border: "1.5px solid rgba(255,255,255,.4)",
                                    background: "rgba(255,255,255,.12)", color: "#fff", cursor: "pointer",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                }}
                            >
                                <MdClose size={13} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div style={{ padding: "24px 24px 20px" }}>
                            {/* Drop zone */}
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                style={{
                                    border: `2px dashed ${file ? "#005B52" : "#CBD5E1"}`,
                                    borderRadius: 12, padding: "28px 20px", textAlign: "center",
                                    cursor: "pointer", background: file ? "#f0fdf9" : "#F8FAFC",
                                    transition: "all .2s", marginBottom: 20,
                                }}
                                onDragOver={e => e.preventDefault()}
                                onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) setFile(f) }}
                            >
                                <MdUploadFile size={36} color={file ? "#005B52" : "#94A3B8"} style={{ marginBottom: 8 }} />
                                {file ? (
                                    <>
                                        <div style={{ fontSize: 13, fontWeight: 700, color: "#005B52" }}>{file.name}</div>
                                        <div style={{ fontSize: 11, color: "#64748B", marginTop: 4 }}>
                                            {(file.size / 1024).toFixed(1)} KB · Click to change
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>Click to browse or drag & drop</div>
                                        <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 4 }}>Any file type supported</div>
                                    </>
                                )}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    style={{ display: "none" }}
                                    onChange={e => setFile(e.target.files[0] || null)}
                                />
                            </div>

                            {/* Action buttons */}
                            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                                <button
                                    onClick={() => setUploadModal(false)}
                                    style={{
                                        height: 38, padding: "0 18px", borderRadius: 8, border: "1.5px solid #E2E8F0",
                                        background: "#F8FAFC", color: "#475569", fontSize: 13, fontWeight: 600, cursor: "pointer",
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpload}
                                    disabled={!file || uploading}
                                    style={{
                                        height: 38, padding: "0 22px", borderRadius: 8, border: "none",
                                        background: !file || uploading ? "#94A3B8" : "linear-gradient(135deg,#005B52,#007A6E)",
                                        color: "#fff", fontSize: 13, fontWeight: 700, cursor: !file || uploading ? "not-allowed" : "pointer",
                                        display: "flex", alignItems: "center", gap: 7,
                                    }}
                                >
                                    <MdUploadFile size={14} />
                                    {uploading ? "Uploading…" : "Upload"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <ImageModal
                isOpen={modalOpen}
                toggle={toggleModal}
                imageSrc={currentImage}
            />
        </PageContent>
    );
}