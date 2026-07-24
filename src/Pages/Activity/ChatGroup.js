/* eslint-disable react-hooks/exhaustive-deps */
import {
  Row, Col, Card, CardBody, Button, Container, Form, Input,
  Modal, ModalHeader, ModalBody, ModalFooter,
} from "reactstrap";
import Select from "react-select";
import { useGet, usePost } from "../../Hooks/useApi";
import {
  CREATE_GROUP, GET_GROUP_MEMBERS, GET_ALL_GROUP, GET_ALL_USERS_DROPDOWN,
  DELETE_GROUP_MEMBERS, EDIT_GROUP, ADD_GROUP_MEMBERS, CREATE_REMOVE_ADMIN,
} from "../../helpers/url_helper";
import { useUserStore } from "../../store/useUserStore";
import { toast } from "react-toastify";
import { defaultTheme } from "../../helpers/defaultTheme";
import AppTable from "../../components/Common/Table";
import {
  formatDateTime, generateTimestamp, RequiredStar, WordWrapCell,
} from "../../helpers/function_helper";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import ScreenLoader from "../../constants/ScreenLoader";
import { MdDelete } from "react-icons/md";
import { FaUserShield, FaUser, FaFileExcel } from "react-icons/fa";
import ApiClient, { imageBaseUrl } from "../../helpers/api_helper";
import ImageModal from "../../components/Common/ImageModal";
import * as XLSX from "xlsx";
import "../CSS/styles.css";
import PageContent from "../../components/Common/PageContent";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";

// ── Inject styles once ───────────────────────────────────────────────────────
if (!document.getElementById("chat-group-styles")) {
  const s = document.createElement("style");
  s.id = "chat-group-styles";
  s.textContent = `
        .modal-backdrop.show { backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); background: rgba(15,23,42,.55); opacity:1 !important; }

        /* Admin-row checkbox panel (Create form) */
        .cg-admin-row { display:flex; align-items:center; gap:10px; padding:8px 12px; border:1px solid #E2E8F0; border-radius:8px; margin-bottom:6px; background:#fff; }
        .cg-admin-row:hover { background:#F8FAFC; }
        .cg-admin-check { width:16px; height:16px; cursor:pointer; accent-color:${defaultTheme.primary}; }
        .cg-admin-name { flex:1; font-size:13px; color:#0F172A; font-weight:500; }

        /* Pill toggle */
        .cg-pill-toggle { display:inline-flex; background:#F1F5F9; border-radius:999px; padding:3px; border:1px solid #E2E8F0; }
        .cg-pill-btn { border:none; background:transparent; padding:6px 18px; font-size:12px; font-weight:700; border-radius:999px; cursor:pointer; color:#000000; transition:all .15s; }
        .cg-pill-btn.active { background:${defaultTheme.primary}; color:#fff; }

        /* ── Members modal ── */
        .cg-members-modal .modal-dialog { max-width: 640px; }
        .cg-members-modal .modal-content { border-radius: 14px; overflow: hidden; border: none; }
        .cg-members-modal .modal-body { padding: 0; background: #F8FAFC; }

        .cg-members-header {
            background: linear-gradient(135deg, ${defaultTheme.primary}, #007A6E);
            padding: 16px 22px;
            color: #fff;
            display:flex; align-items:center; justify-content:space-between;
        }
        .cg-members-header-title { font-size: 15px; font-weight: 700; display:flex; align-items:center; gap:9px; }
        .cg-members-header-excel {
            background: rgba(255,255,255,.18); border: 1px solid rgba(255,255,255,.3);
            padding: 6px 12px; border-radius: 8px;
            color: #fff; font-size: 11.5px; font-weight: 600;
            display: inline-flex; align-items: center; gap: 6px;
            cursor: pointer; transition: background .15s;
        }
        .cg-members-header-excel:hover { background: rgba(255,255,255,.28); }

        .cg-members-scroll {
            max-height: 60vh;
            overflow-y: auto;
            padding: 16px 20px;
        }
        .cg-members-scroll::-webkit-scrollbar { width: 6px; }
        .cg-members-scroll::-webkit-scrollbar-track { background: transparent; }
        .cg-members-scroll::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 3px; }

        .cg-section-title {
            font-size: 11px; font-weight: 800; color: #64748B;
            text-transform: uppercase; letter-spacing: .6px;
            margin: 4px 0 10px;
            display:flex; align-items:center; gap:7px;
        }
        .cg-section-title:not(:first-child) { margin-top: 18px; }
        .cg-section-count {
            background: #fff; color: #475569;
            border: 1px solid #E2E8F0;
            font-size: 10px; font-weight: 700;
            padding: 2px 8px; border-radius: 10px;
            letter-spacing: 0;
        }

        .cg-member {
            display:flex; align-items:center; gap:12px;
            padding: 10px 12px;
            border: 1px solid #E2E8F0;
            border-radius: 10px;
            background: #fff;
            margin-bottom: 8px;
            transition: border-color .15s, background .15s;
        }
        .cg-member:hover { border-color: ${defaultTheme.primary}33; background: #FAFBFC; }
        .cg-member.past { opacity: .65; background: #F8FAFC; }

        .cg-member-avatar {
            width: 38px; height: 38px;
            border-radius: 50%;
            object-fit: cover;
            border: 2px solid ${defaultTheme.goldColorLogo};
            padding: 1.5px;
            background: #fff;
            cursor: pointer;
            flex-shrink: 0;
        }
        .cg-member-info { flex: 1; min-width: 0; }
        .cg-member-name {
            font-size: 13.5px; font-weight: 600; color: #0F172A;
            display:flex; align-items:center; gap:8px;
        }
        .cg-member-name-text {
            white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
            min-width: 0;
        }
        .cg-member-meta {
            font-size: 11px; color: #64748B;
            margin-top: 2px;
        }
        .cg-admin-tag {
            font-size: 9.5px; font-weight: 800; padding: 2px 7px;
            border-radius: 10px;
            background: ${defaultTheme.goldColorLogo}1F;
            color: ${defaultTheme.goldColorLogo};
            text-transform: uppercase; letter-spacing: .4px;
            flex-shrink: 0;
        }

        .cg-member-actions { display:flex; align-items:center; gap:6px; flex-shrink:0; }
        .cg-action-btn {
            display: inline-flex; align-items: center; justify-content: center;
            border-radius: 8px;
            border: 1px solid transparent;
            cursor: pointer;
            transition: all .15s;
            background: transparent;
        }
        .cg-action-btn.admin-on {
            background: ${defaultTheme.goldColorLogo}1A;
            color: ${defaultTheme.goldColorLogo};
            border-color: ${defaultTheme.goldColorLogo}33;
        }
        .cg-action-btn.admin-off {
            background: #F1F5F9;
            color: #64748B;
            border-color: #E2E8F0;
        }
        .cg-action-btn.admin-on:hover, .cg-action-btn.admin-off:hover {
            transform: translateY(-1px);
            box-shadow: 0 2px 6px rgba(15,23,42,.08);
        }
        .cg-action-btn.danger {
            background: #FEF2F2; color: #DC2626; border-color: #FECACA;
        }
        .cg-action-btn.danger:hover {
            background: #FEE2E2; border-color: #FCA5A5;
        }

        .cg-empty {
            text-align: center;
            font-size: 12px;
            color: #94A3B8;
            padding: 18px 0;
            background: #fff;
            border: 1px dashed #E2E8F0;
            border-radius: 10px;
        }
    `;
  document.head.appendChild(s);
}

const profileStyle = {
  width: "35px",
  height: "35px",
  objectFit: "contain",
  cursor: "pointer",
  borderRadius: "50%",
  border: "2px solid",
  borderColor: defaultTheme.goldColorLogo,
  padding: "2px",
};

// ── User row with admin checkbox (Create form) ───────────────────────────────
const UserAdminRow = ({ user, isAdmin, onToggleAdmin }) => (
  <div className="cg-admin-row">
    <input
      type="checkbox"
      className="cg-admin-check"
      checked={isAdmin}
      onChange={(e) => onToggleAdmin(user.value, e.target.checked)}
    />
    <span className="cg-admin-name">{user.label}</span>
    {isAdmin && <span className="cg-admin-tag">Admin</span>}
  </div>
);

// ── Member row in View Members modal ─────────────────────────────────────────
const MemberRow = ({ member, onViewFile, onDelete, onToggleAdmin, canManage }) => {
  const isAdmin = (member.role || "").toLowerCase() === "admin";
  const avatarSrc = member.attachment
    ? imageBaseUrl + member.attachment
    : imageBaseUrl + "mTree.png";

  return (
    <div className={`cg-member ${canManage ? "" : "past"}`}>
      <img
        src={avatarSrc}
        alt={member.memberName}
        className="cg-member-avatar"
        onClick={() => member.attachment && onViewFile(member.attachment)}
      />

      <div className="cg-member-info">
        <div className="cg-member-name">
          <span className="cg-member-name-text">{member.memberName}</span>
          {isAdmin && <span className="cg-admin-tag">Admin</span>}
        </div>
        <div className="cg-member-meta">
          {member.empCode}
          {member.mainTeam && ` · ${member.mainTeam}`}
          {member.branch && ` · ${member.branch}`}
        </div>
      </div>

      {canManage && (
        <div className="cg-member-actions">
          <button
            className={`cg-action-btn ${isAdmin ? "admin-on" : "admin-off"}`}
            title={isAdmin ? "Remove admin rights" : "Make admin"}
            onClick={() => onToggleAdmin(member.userId, isAdmin)}
          >
            {isAdmin ? <FaUserShield size={14} /> : <FaUser size={13} />}
          </button>
          <button
            className="cg-action-btn danger"
            title="Remove member"
            onClick={() => onDelete(member.userId)}
          >
            <MdDelete size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

const ChatGroup = () => {
  const [accessGranted, setAccessGranted] = useState(null);
  const fileInputRef = useRef(null);
  const userId = useUserStore((state) => state.user.userId);

  const { data: userList } = useGet(GET_ALL_USERS_DROPDOWN, { enabled: !!accessGranted });
  const { data: groupList, isLoading, refetch: getAllData } = useGet(
    `${GET_ALL_GROUP}`,
    { enabled: !!accessGranted }
  );

  // ── Create-group form state ──────────────────────────────────────────────
  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [adminUserIds, setAdminUserIds] = useState([]);
  const [onlyAdminCanPost, setOnlyAdminCanPost] = useState(false);
  const [file, setFile] = useState(null);

  // ── Edit / View / Add-Member modal state ─────────────────────────────────
  const [groupId, setGroupId] = useState("");
  const [updateGroupName, setUpdateGroupName] = useState("");
  const [editOnlyAdminCanPost, setEditOnlyAdminCanPost] = useState(false);
  const [groupModalOpen, setGroupModalOpen] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [modalGroupName, setModalGroupName] = useState("");

  const [memberAddModalOpen, setMemberAddModalOpen] = useState(false);
  const [selectedModalUsers, setSelectedModalUsers] = useState([]);
  const [updateMembers, setUpdateMembers] = useState(false);

  const [fileModalOpen, setFileModalOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState("");

  const [isLoadingDelete, setIsLoadingDelete] = useState(false);
  const [isLoadingRole, setIsLoadingRole] = useState(false);
  const [memberSearch, setMemberSearch] = useState("");
  // ── Members API ──────────────────────────────────────────────────────────
  const { data: membersList, isLoading: membersLoading, refetch: getGroups, } = useGet(`${GET_GROUP_MEMBERS}${selectedGroupId}`, {
    enabled: Boolean(selectedGroupId),
  });

  const { activeMembers, pastMembers } = useMemo(() => {
    const list = membersList?.data?.data || [];
    return {
      activeMembers: list.filter(
        (m) => m.active === true && m.userStatus !== "NO"
      ),
      pastMembers: list.filter((m) => (m.active !== true || m.userStatus === "NO")),
    };
  }, [membersList]);

  // ── Reset everything ─────────────────────────────────────────────────────
  const resetValues = useCallback(() => {
    setGroupName("");
    setSelectedUsers([]);
    setAdminUserIds([]);
    setOnlyAdminCanPost(false);
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";

    setUpdateGroupName("");
    setEditOnlyAdminCanPost(false);
    setGroupId("");
    setGroupModalOpen(false);

    setSelectedGroupId("");
    setModalOpen(false);

    setMemberAddModalOpen(false);
    setSelectedModalUsers([]);
    setUpdateMembers(false);

    getAllData();
  }, [getAllData]);

  // ── Create group ─────────────────────────────────────────────────────────
  const { isPending: addLoading, mutate } = usePost(CREATE_GROUP, {
    onSuccess: (response) => {
      if (response?.data?.status === 1) {
        resetValues();
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message);
      }
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!groupName) return toast.error("Please input group name");
    if (selectedUsers.length < 1) return toast.error("Please select users");
    if (!file) return toast.error("Please select group image");

    const usersPayload = selectedUsers.map((uid) => ({
      userId: uid,
      admin: adminUserIds.includes(uid),
    }));

    const formData = new FormData();
    formData.append("groupName", groupName);
    formData.append("users", JSON.stringify(usersPayload));
    formData.append("memberId", userId);
    formData.append("file", file);
    formData.append("onlyAdminCanPost", onlyAdminCanPost);
    mutate(formData);
  };

  // ── Edit group ───────────────────────────────────────────────────────────
  const { isPending: editLoading, mutate: mutateEdit } = usePost(EDIT_GROUP, {
    onSuccess: (response) => {
      if (response?.data?.status === 1) {
        resetValues();
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message);
      }
    },
    onError: (err) => toast.error(err.message),
  });

  const handleEditGroup = (data) => {
    setGroupId(data.groupId);
    setUpdateGroupName(data.groupName);
    setEditOnlyAdminCanPost(Boolean(data.onlyAdminCanPost));
    setFile(null);
    setGroupModalOpen(true);
  };

  const handleSaveEdit = () => {
    if (!updateGroupName) return toast.error("Please enter group name");

    const formData = new FormData();
    formData.append("groupName", updateGroupName);
    formData.append("groupId", groupId);
    formData.append("onlyAdminCanPost", editOnlyAdminCanPost);
    if (file) formData.append("groupImage", file);
    mutateEdit(formData);
  };

  // ── Add members to existing group ────────────────────────────────────────
  const { isPending: AddMembersLoading, mutate: mutateAddMember } = usePost(
    `${ADD_GROUP_MEMBERS}${groupId}&${selectedModalUsers
      .map((u) => `users=${encodeURIComponent(u)}`)
      .join("&")}`,
    {
      onSuccess: (response) => {
        if (response?.data?.status === 1) {
          toast.success(response.data.message);
          resetValues();
        } else {
          toast.error(response.data.message);
        }
      },
      onError: (err) => toast.error(err.message),
    }
  );

  const handleAddGroupMembers = () => {
    if (selectedModalUsers.length < 1) return toast.error("Please select members to add");
    setUpdateMembers(true);
  };

  useEffect(() => {
    if (selectedModalUsers.length > 0 && updateMembers) mutateAddMember();
  }, [updateMembers, mutateAddMember]);

  const handleAddMemberModal = (row) => {
    setSelectedModalUsers([]);
    setGroupId(row.groupId);
    setMemberAddModalOpen((prev) => !prev);
  };

  // ── Remove member — pass the user's userId (NOT the membership row id) ──
  const handleDeleteClick = (memberUserId) => {
    if (!window.confirm("Are you sure you want to remove this member?")) return;
    setIsLoadingDelete(true);
    ApiClient.post(`${DELETE_GROUP_MEMBERS}${selectedGroupId}&memberId=${memberUserId}`)
      .then((response) => {
        setIsLoadingDelete(false);
        if (response?.data?.status === 1) {
          toast.success(response.data.message);
          getGroups();
        } else {
          toast.error(response.data.message);
        }
      })
      .catch((err) => {
        setIsLoadingDelete(false);
        toast.error(err.message);
      });
  };

  // ── Toggle admin role — also pass userId (NOT memberId) ─────────────────
  const handleToggleMemberRole = (memberUserId, currentlyAdmin) => {
    const msg = currentlyAdmin
      ? "Remove admin rights from this member?"
      : "Make this member an admin?";
    if (!window.confirm(msg)) return;

    setIsLoadingRole(true);
    ApiClient.post(`${CREATE_REMOVE_ADMIN}?groupId=${selectedGroupId}&memberId=${memberUserId}`)
      .then((response) => {
        setIsLoadingRole(false);
        if (response?.data?.status === 1) {
          toast.success(response.data.message);
          getGroups();
        } else {
          toast.error(response.data.message);
        }
      })
      .catch((err) => {
        setIsLoadingRole(false);
        toast.error(err.message);
      });
  };

  // ── View / file modals ───────────────────────────────────────────────────
  const handleViewMembers = (gId, gName) => {
    setSelectedGroupId(gId);
    setModalGroupName(gName);
    setModalOpen(true);
  };

  const toggleModal = () => setModalOpen((p) => !p);

  const toggleImageModal = () => setFileModalOpen((p) => !p);
  const handleViewFile = (filePath) => {
    if (!filePath) return toast.error("No file attached");
    setCurrentImage(imageBaseUrl + filePath);
    setFileModalOpen(true);
  };

  // ── User-select handlers ─────────────────────────────────────────────────
  const handleSelectChange = (opts) => {
    const ids = opts ? opts.map((o) => o.value) : [];
    setSelectedUsers(ids);
    setAdminUserIds((prev) => prev.filter((id) => ids.includes(id)));
  };

  const handleModalSelectChange = (opts) => {
    setSelectedModalUsers(opts ? opts.map((o) => o.value) : []);
  };

  const toggleAdminFlag = (uid, makeAdmin) => {
    setAdminUserIds((prev) =>
      makeAdmin ? [...prev, uid] : prev.filter((id) => id !== uid)
    );
  };

  const selectedUserObjects = useMemo(() => {
    const list = Array.isArray(userList?.data?.data) ? userList.data.data : [];
    return list.filter((u) => selectedUsers.includes(u.value));
  }, [userList, selectedUsers]);

  // ── Table columns ────────────────────────────────────────────────────────
  const columns = useMemo(() => [
    {
      name: <span className="font-weight-bold fs-13">SL No.</span>,
      selector: (_, i) => i + 1,
      width: "8%",
    },
    {
      name: <span className="font-weight-bold fs-13">Group Image</span>,
      cell: (row) =>
        row.groupImage ? (
          <img
            src={imageBaseUrl + row.groupImage}
            alt="Profile"
            style={profileStyle}
            onClick={() => handleViewFile(row.groupImage)}
          />
        ) : null,
    },
    {
      name: <span className="font-weight-bold fs-13">Group Name</span>,
      selector: (row) => row.groupName,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.groupName}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Post Rule</span>,
      cell: (row) => (
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            padding: "3px 9px",
            borderRadius: 12,
            background: row.onlyAdminCanPost ? `${defaultTheme.goldColorLogo}22` : "#E2E8F0",
            color: row.onlyAdminCanPost ? defaultTheme.goldColorLogo : "#475569",
            textTransform: "uppercase",
            letterSpacing: ".3px",
          }}
        >
          {row.onlyAdminCanPost ? "Admins Only" : "All Members"}
        </span>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Date</span>,
      selector: (row) => formatDateTime(row.createdDate),
      sortable: true,
      cell: (row) => <WordWrapCell>{formatDateTime(row.createdDate)}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">View Members</span>,
      cell: (row) => (
        <i
          className="fas fa-eye"
          style={{ cursor: "pointer", color: defaultTheme.primary }}
          onClick={() => handleViewMembers(row.groupId, row.groupName)}
        />
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Manage</span>,
      cell: (row) => (
        <i
          className="ri-pencil-fill align-bottom"
          onClick={() => handleEditGroup(row)}
          style={{ cursor: "pointer", color: defaultTheme.goldColorLogo }}
        />
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Add Members</span>,
      cell: (row) => (
        <i
          className="fas fa-plus"
          style={{
            color: defaultTheme.primary,
            cursor: "pointer",
            fontSize: 13,
          }}
          onClick={() => handleAddMemberModal(row)}
        />
      ),
    },
  ], []);

  // ── Excel export ─────────────────────────────────────────────────────────
  const downloadGroupMembersExcel = () => {
    const data = membersList?.data?.data;
    if (!Array.isArray(data) || data.length === 0) return;

    const headers = ["SL No.", "Member Name", "Emp Code", "Main Team", "Sub Team", "Role", "Active"];
    const formattedData = data.map((item, i) => [
      i + 1,
      item.memberName,
      item.empCode,
      item.mainTeam,
      item.subTeam,
      item.role,
      item.active ? "YES" : "NO",
    ]);

    const ws = XLSX.utils.aoa_to_sheet([headers, ...formattedData]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Group Members");
    XLSX.writeFile(wb, `${modalGroupName}_groupMembers_${generateTimestamp()}.xlsx`);
  };

  const filteredActiveMembers = activeMembers.filter((member) =>
    member?.memberName
      ?.toLowerCase()
      .includes(memberSearch.toLowerCase())
  );

  const filteredPastMembers = pastMembers.filter((member) =>
    member?.memberName
      ?.toLowerCase()
      .includes(memberSearch.toLowerCase())
  );

  // ── Access check ─────────────────────────────────────────────────────────
  useEffect(() => {
    const checkAccess = async () => {
      const hasAccess = await CheckUserAccess(userId, "chat-group");
      setAccessGranted(hasAccess);
    };
    checkAccess();
  }, [userId]);

  if (accessGranted === null) return <ScreenLoader />;
  if (!accessGranted) return <PermissionMissing />;

  const anyLoading =
    addLoading || isLoading || membersLoading || editLoading ||
    AddMembersLoading || isLoadingDelete || isLoadingRole;

  return (
    <PageContent>
      <Container fluid>
        <Breadcrumbs title="Chat Group" breadcrumbItem="Add-Show" />
        {anyLoading && <ScreenLoader />}

        {/* ══ Create Group Form ════════════════════════════════════════ */}
        <Card>
          <CardBody>
            <Form className="needs-validation" onSubmit={handleSubmit}>
              <Row>
                <Col md="3">
                  <h6 className="font-size-11">Name <RequiredStar /></h6>
                  <Input
                    placeholder="Type here..."
                    type="text"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                  />
                </Col>
                <Col md="3">
                  <h6 className="font-size-11">Select User <RequiredStar /></h6>
                  <Select
                    menuPortalTarget={document.body}
                    styles={{ menuPortal: (b) => ({ ...b, zIndex: 9999 }) }}
                    options={Array.isArray(userList?.data?.data) ? userList.data.data : []}
                    isMulti
                    closeMenuOnSelect={false}
                    value={selectedUserObjects}
                    onChange={handleSelectChange}
                  />
                </Col>
                <Col md="3">
                  <h6 className="font-size-11">Group Image <RequiredStar /></h6>
                  <input
                    type="file"
                    className="form-control"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={(e) => setFile(e.target.files[0])}
                  />
                </Col>

                <Col md="3">
                  <h6 className="font-size-11">Who Can Send Messages <RequiredStar /></h6>
                  <div className="cg-pill-toggle">
                    <button
                      type="button"
                      className={`cg-pill-btn ${!onlyAdminCanPost ? "active" : ""}`}
                      onClick={() => setOnlyAdminCanPost(false)}
                    >
                      All Members
                    </button>
                    <button
                      type="button"
                      className={`cg-pill-btn ${onlyAdminCanPost ? "active" : ""}`}
                      onClick={() => setOnlyAdminCanPost(true)}
                    >
                      Admins Only
                    </button>
                  </div>
                </Col>
              </Row>

              {/* ── Per-user admin selection ──────────────────── */}
              {selectedUserObjects.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <h6 className="font-size-11" style={{ marginBottom: 6 }}>
                    Mark Admins <span style={{ color: "#94A3B8", fontWeight: 500 }}>
                      (check users who should be group admins)
                    </span>
                  </h6>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                      gap: 8,
                    }}
                  >
                    {selectedUserObjects.map((u) => (
                      <UserAdminRow
                        key={u.value}
                        user={u}
                        isAdmin={adminUserIds.includes(u.value)}
                        onToggleAdmin={toggleAdminFlag}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div style={{ marginTop: 16 }}>
                <Button type="submit" color="primary" className="me-2">Submit</Button>
                <Button type="reset" color="secondary" onClick={resetValues}>Cancel</Button>
              </div>
            </Form>
          </CardBody>
        </Card>

        {/* ══ Groups Table ═════════════════════════════════════════════ */}
        {Array.isArray(groupList?.data?.data) && groupList.data.data.length > 0 && (
          <AppTable
            progressPending={isLoading}
            columns={columns}
            data={groupList.data.data}
            pagination
          />
        )}

        {/* ══ View Members Modal ═══════════════════════════════════════ */}
        <Modal
          isOpen={modalOpen}
          toggle={toggleModal}
          centered
          backdrop="static"
          keyboard={false}
          className="cg-members-modal"
        >
          <ModalBody>
            {/* Custom header (replaces ModalHeader to control styling fully) */}
            <div className="cg-members-header">
              <div className="cg-members-header-title">
                <span>Group Members</span>
                <span style={{ opacity: .85, fontWeight: 500 }}>· {modalGroupName}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <button
                  className="cg-members-header-excel"
                  onClick={downloadGroupMembersExcel}
                  title="Download Excel"
                >
                  <FaFileExcel size={12} />
                  Excel
                </button>
                <button
                  onClick={toggleModal}
                  style={{
                    background: "transparent", border: "none", color: "#fff",
                    fontSize: 22, lineHeight: 1, cursor: "pointer", padding: 0,
                    opacity: .9,
                  }}
                  aria-label="Close"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Search */}
            <div
              style={{
                padding: "12px 16px",
                borderBottom: "1px solid #E2E8F0",
                background: "#fff",
              }}
            >
              <input
                type="text"
                className="form-control"
                placeholder="Search member by name..."
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
              />
            </div>

            {/* Scrollable body */}
            <div className="cg-members-scroll">
              {/* Active */}
              <div className="cg-section-title">
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: defaultTheme.primary }} />
                Active Members
                <span className="cg-section-count">{filteredActiveMembers.length}</span>
              </div>
              {filteredActiveMembers.length > 0 ? (
                filteredActiveMembers.map((m) => (
                  <MemberRow
                    key={m.memberId}
                    member={m}
                    onViewFile={handleViewFile}
                    onDelete={handleDeleteClick}
                    onToggleAdmin={handleToggleMemberRole}
                    canManage
                  />
                ))
              ) : (
                <div className="cg-empty">No active members</div>
              )}

              {/* Past */}
              <div className="cg-section-title">
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#94A3B8" }} />
                Past Members
                <span className="cg-section-count">{filteredPastMembers.length}</span>
              </div>
              {filteredPastMembers.length > 0 ? (
                filteredPastMembers.map((m) => (
                  <MemberRow
                    key={m.memberId}
                    member={m}
                    onViewFile={handleViewFile}
                    onDelete={handleDeleteClick}
                    onToggleAdmin={handleToggleMemberRole}
                    canManage={false}
                  />
                ))
              ) : (
                <div className="cg-empty">No past members</div>
              )}
            </div>
          </ModalBody>

          <ModalFooter style={{ background: "#fff", borderTop: "1px solid #E2E8F0" }}>
            <Button
              onClick={toggleModal}
              style={{ backgroundColor: defaultTheme.goldColorLogo, border: "none" }}
            >
              Close
            </Button>
          </ModalFooter>
        </Modal>

        {/* ══ Edit Group Modal ═════════════════════════════════════════ */}
        <Modal
          isOpen={groupModalOpen}
          toggle={() => setGroupModalOpen(false)}
          backdrop="static"
          keyboard={false}
        >
          <ModalHeader toggle={() => setGroupModalOpen(false)}>Edit Group</ModalHeader>
          <ModalBody>
            <h6 className="font-size-11">Group Name <RequiredStar /></h6>
            <input
              type="text"
              className="form-control"
              value={updateGroupName}
              onChange={(e) => setUpdateGroupName(e.target.value)}
              placeholder="Group Name"
            />

            <h6 className="font-size-11 mt-3">Group Image (Optional)</h6>
            <input
              type="file"
              className="form-control"
              accept="image/*"
              onChange={(e) => setFile(e.target.files[0])}
            />

            <h6 className="font-size-11 mt-3">Who Can Send Messages</h6>
            <div className="cg-pill-toggle">
              <button
                type="button"
                className={`cg-pill-btn ${!editOnlyAdminCanPost ? "active" : ""}`}
                onClick={() => setEditOnlyAdminCanPost(false)}
              >
                All Members
              </button>
              <button
                type="button"
                className={`cg-pill-btn ${editOnlyAdminCanPost ? "active" : ""}`}
                onClick={() => setEditOnlyAdminCanPost(true)}
              >
                Admins Only
              </button>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              color="primary"
              onClick={handleSaveEdit}
              style={{ backgroundColor: defaultTheme.primary }}
            >
              Save
            </Button>
            <Button
              color="secondary"
              style={{ backgroundColor: defaultTheme.goldColorLogo }}
              onClick={() => setGroupModalOpen(false)}
            >
              Cancel
            </Button>
          </ModalFooter>
        </Modal>

        {/* ══ Add Members Modal ════════════════════════════════════════ */}
        <Modal
          isOpen={memberAddModalOpen}
          toggle={() => setMemberAddModalOpen(false)}
          backdrop="static"
          keyboard={false}
        >
          <ModalHeader toggle={() => setMemberAddModalOpen(false)}>Add Members</ModalHeader>
          <ModalBody>
            <h6 className="font-size-11">Select User <RequiredStar /></h6>
            <Select
              menuPortalTarget={document.body}
              styles={{ menuPortal: (b) => ({ ...b, zIndex: 9999 }) }}
              options={Array.isArray(userList?.data?.data) ? userList.data.data : []}
              isMulti
              closeMenuOnSelect={false}
              value={
                Array.isArray(userList?.data?.data)
                  ? userList.data.data.filter((u) => selectedModalUsers.includes(u.value))
                  : []
              }
              onChange={handleModalSelectChange}
            />
            <p style={{ fontSize: 11, color: "#64748B", marginTop: 8, marginBottom: 0 }}>
              Note: Admins can be assigned individually from the View Members screen after adding.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button
              color="primary"
              onClick={handleAddGroupMembers}
              style={{ backgroundColor: defaultTheme.primary }}
            >
              Add
            </Button>
            <Button
              color="secondary"
              style={{ backgroundColor: defaultTheme.goldColorLogo }}
              onClick={() => setMemberAddModalOpen(false)}
            >
              Cancel
            </Button>
          </ModalFooter>
        </Modal>
      </Container>

      <ImageModal
        isOpen={fileModalOpen}
        toggle={toggleImageModal}
        imageSrc={currentImage}
      />
    </PageContent>
  );
};

export default ChatGroup;