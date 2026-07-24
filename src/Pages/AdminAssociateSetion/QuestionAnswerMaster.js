import { useEffect, useRef, useState } from "react";
import PageContent from "../../components/Common/PageContent";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { Container, Row, Col, Card, CardBody, Button, Input, Label, Modal, ModalHeader, ModalBody } from "reactstrap";
import Select from "react-select";
import AppTable from "../../components/Common/Table";
import { FaEdit, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { useGet, usePost } from "../../Hooks/useApi";
import { ALL_DESIGNATION_DROPDOWN, ALL_LOCATION_DROPDOWN, CREATE_Q_A, DELETE_Q_A, GET_ALL_Q_A, UPDATE_Q_A, UPLOAD_Q_A_EXCEL } from "../../helpers/url_helper";
import { toast } from "react-toastify";
import ScreenLoader from "../../constants/ScreenLoader";
import { formatDate, formatDateTime, RequiredStar, WordWrapCell } from "../../helpers/function_helper";
import { defaultTheme } from "../../helpers/defaultTheme";
import ApiClient from "../../helpers/api_helper";
import { useUserStore } from "../../store/useUserStore";
import PermissionMissing from "../Utility/PermissonMissing";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import { scrollToTop } from "../../constants/global";

export default function QuestionAnswerMaster() {
  const { user: { userId, empCode, userName } } = useUserStore();

  const [accessGranted, setAccessGranted] = useState(null);
  const [question, setQuestion] = useState("");
  const [branches, setBranches] = useState([]);
  const [levels, setLevels] = useState([]);
  const [questionDate, setQuestionDate] = useState()
  const [options, setOptions] = useState([
    { option: "", true: false },
    { option: "", true: false },
    { option: "", true: false },
    { option: "", true: false }
  ]);
  const [editId, setEditId] = useState(null);
  const [optionModal, setOptionModal] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [isLoad, setIsLoad] = useState(false);
  const [excelFile, setExcelFile] = useState(null);
  const [uploadMode, setUploadMode] = useState("manual");
  const fileInputRef = useRef(null);
  const [fileInputKey, setFileInputKey] = useState(Date.now());

  const { data: allQuestions, refetch: getAllQuestions, isLoading } = useGet(GET_ALL_Q_A, { enabled: !!accessGranted });
  const { data: locationList } = useGet(ALL_LOCATION_DROPDOWN, { enabled: !!accessGranted });
  const { data: designationList } = useGet(ALL_DESIGNATION_DROPDOWN, { enabled: !!accessGranted });

  /* OPTION CHANGE */
  const handleOptionChange = (value, index) => {
    const updated = [...options];
    updated[index].option = value;
    setOptions(updated);
  };

  const handleCorrectAnswer = (index) => {
    const updated = options.map((opt, i) => ({
      ...opt,
      true: i === index
    }));
    setOptions(updated);
  };

  const handleFileChange = (e) => {
    setExcelFile(e.target.files[0]);
  };

  /* RESET FORM */
  const resetForm = () => {
    setQuestion("");
    setBranches([]);
    setLevels([]);

    setOptions([
      { option: "", true: false },
      { option: "", true: false },
      { option: "", true: false },
      { option: "", true: false }
    ]);

    setEditId(null);
  };

  /* CREATE API */
  const { isPending: isPendingCreate, mutate: mutateCreate } = usePost(
    CREATE_Q_A,
    {
      onSuccess: (response) => {

        if (response?.data?.status === 1) {
          toast.success(response.data.message);
          getAllQuestions();
          resetForm();
        } else {
          toast.error(response.data.message);
        }
      },
      onError: (err) => toast.error(err.message)
    }
  );

  /* SUBMIT */
  const handleSubmit = () => {
    if (!question) {
      toast.error("Question is required");
      return;
    }
    if (!questionDate) {
      toast.error("Question Date is required");
      return;
    }
    if (branches.length === 0) {
      toast.error("Branch is required");
      return;
    }
    if (levels.length === 0) {
      toast.error("Level is required");
      return;
    }
    /* OPTION FIELD REQUIRED */

    const emptyOption = options.some(opt => !opt.option || !opt.option.trim());

    if (emptyOption) {
      toast.error("All option fields are required");
      return;
    }

    /* CORRECT ANSWER VALIDATION */

    const correctOptions = options.filter(opt => opt.true === true);

    if (correctOptions.length === 0) {
      toast.error("Please select one correct answer");
      return;
    }

    if (correctOptions.length > 1) {
      toast.error("Only one correct answer can be selected");
      return;
    }
    const cleanedOptions = options.map(opt => ({
      option: opt.option,
      true: opt.true
    }));
    const payload = {
      question,
      options: cleanedOptions,
      isActive: "YES",
      branch: branches.map(b => b.value).join(","),
      level: levels.map(l => l.value).join(","),
      createdBy: userName + ' (' + empCode + ')',
      questionDate: questionDate
    };

    /* UPDATE */
    if (editId) {
      setIsLoad(true);
      ApiClient.put(`${UPDATE_Q_A}/${editId}`, payload)
        .then((response) => {
          setIsLoad(false);
          if (response?.data?.status === 1) {
            toast.success(response.data.message);
            resetForm();
            getAllQuestions();
          } else {
            toast.error(response.data.message);
          }
        })
        .catch((error) => {
          setIsLoad(false);
          toast.error(error.message);
        });
    }
    /* CREATE */
    else {
      mutateCreate(payload);
    }
  };

  /* DELETE */
  const handleDelete = (row) => {
    if (!window.confirm("Are you sure you want to delete this question?"))
      return;
    setIsLoad(true);
    ApiClient.post(`${DELETE_Q_A}/${row.id}`)
      .then((response) => {
        setIsLoad(false);
        if (response?.data?.status === 1) {
          toast.success(response.data.message);
          getAllQuestions();
        } else {
          toast.error(response.data.message);
        }
      })
      .catch((error) => {
        setIsLoad(false);
        toast.error(error.message);
      });
  };

  /* EDIT */
  const handleEdit = (row) => {
    setQuestion(row.question);
    setBranches(
      row.branch.split(",").map(b => ({
        label: b,
        value: b
      }))
    );

    setLevels(
      row.level.split(",").map(l => ({
        label: l,
        value: l
      }))
    );
    setQuestionDate(row.questionDate);
    setOptions(row.options);

    setEditId(row.id);

    scrollToTop()
  };

  /* VIEW OPTIONS */
  const handleViewOptions = (row) => {
    setSelectedOptions(row.options);
    setOptionModal(true);
  };

  /* TABLE COLUMNS */
  const columns = [
    {
      name: <span className="font-weight-bold fs-13">SL No.</span>,
      selector: (_, index) => index + 1,
      width: "6%"
    },
    {
      name: <span className="font-weight-bold fs-13">Question</span>,
      cell: (row) => <WordWrapCell>{row.question}</WordWrapCell>,
      selector: (row) => row.question,
      sortable: true
    },
    {
      name: <span className="font-weight-bold fs-13">Branch</span>,
      cell: (row) => <WordWrapCell>{row.branch}</WordWrapCell>,
      selector: (row) => row.branch,
      sortable: true
    },
    {
      name: <span className="font-weight-bold fs-13">Question Date</span>,
      cell: (row) => <WordWrapCell>{formatDate(row.questionDate)}</WordWrapCell>,
      selector: (row) => row.questionDate,
      sortable: true
    },
    {
      name: <span className="font-weight-bold fs-13">Level</span>,
      cell: (row) => <WordWrapCell>{row.level}</WordWrapCell>,
      selector: (row) => row.level,
      sortable: true
    },
    {
      name: <span className="font-weight-bold fs-13">Answer</span>,
      cell: (row) => (
        <span
          style={{
            color: defaultTheme.goldColorLogo,
            cursor: "pointer",
            textDecoration: "underline"
          }}
          onClick={() => handleViewOptions(row)}
        >
          View Options
        </span>

      )
    },
    {
      name: "Action",
      cell: (row) => (
        <div style={{ display: "flex", gap: "12px" }}>
          <FaEdit
            size={18}
            style={{
              cursor: "pointer",
              color: defaultTheme.goldColorLogo
            }}
            onClick={() => handleEdit(row)}
          />
          <MdDelete
            size={20}
            style={{
              cursor: "pointer",
              color: "red"
            }}
            onClick={() => handleDelete(row)}
          />
        </div>
      )
    },
    {
      name: <span className="font-weight-bold fs-13">Created At</span>,
      cell: (row) => <WordWrapCell>{formatDateTime(row.createdDate)}</WordWrapCell>,
      selector: (row) => row.createdDate,
      sortable: true
    },
    {
      name: <span className="font-weight-bold fs-13">Created By</span>,
      cell: (row) => <WordWrapCell>{row.createdby}</WordWrapCell>,
      selector: (row) => row.createdby,
      sortable: true
    },
  ];

  const handleClearExcel = () => {
    setExcelFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
    setFileInputKey(Date.now());
  }

  const handleExcelUpload = () => {
    if (!excelFile) {
      toast.error("Please select an Excel file");
      return;
    }
    setIsLoad(true);
    const formData = new FormData();
    formData.append("file", excelFile);
    formData.append("createdBy", userName + ' (' + empCode + ')');
    ApiClient.post(`${UPLOAD_Q_A_EXCEL}`, formData)
      .then((response) => {
        setIsLoad(false);
        handleClearExcel()
        if (response?.data?.status === 1) {
          toast.success(response.data.message);
          getAllQuestions();
        } else {
          toast.error(response.data.message);
        }
      })
      .catch((error) => {
        setIsLoad(false);
        toast.error(error.message);
        handleClearExcel()
      });
  };

  useEffect(() => {
    const checkAccess = async () => {
      const hasAccess = await CheckUserAccess(userId, 'Q&A-master');
      setAccessGranted(hasAccess);
    };
    checkAccess();
  }, [userId]);

  if (accessGranted === null) {
    return <ScreenLoader />;
  }

  if (!accessGranted) {
    return <PermissionMissing />
  }

  return (
    <PageContent>
      <Breadcrumbs title="Master" breadcrumbItem="Q & A Master" />
      <Container fluid>
        {(isLoading || isPendingCreate || isLoad) && <ScreenLoader />}
        {/* FORM */}

        <Row className="mb-2">
          <Col md="6">
            <Label className="me-3">
              <Input
                type="radio"
                name="uploadMode"
                value="manual"
                cursor="pointer"
                checked={uploadMode === "manual"}
                onChange={(e) => setUploadMode(e.target.value)}
                className="me-2"
              />
              Manual Entry
            </Label>

            <Label className="ms-3">
              <Input
                type="radio"
                name="uploadMode"
                value="excel"
                cursor="pointer"
                checked={uploadMode === "excel"}
                onChange={(e) => setUploadMode(e.target.value)}
                className="me-2"
              />
              Excel Upload
            </Label>
          </Col>
        </Row>

        <Card className="shadow-sm border-0 mb-4">
          <CardBody>
            {uploadMode === "manual" && (
              <>
                <Row className="mb-3">
                  <Col md="6">
                    <Label>Question <RequiredStar /></Label>
                    <Input
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder="Enter question..."
                      type="text"
                    />
                  </Col>
                  <Col md="2">
                    <Label>Question Date <RequiredStar /></Label>
                    <Input
                      value={questionDate}
                      type="date"
                      onChange={(e) => setQuestionDate(e.target.value)}
                      placeholder="Enter Date..."
                    />
                  </Col>
                  <Col md="2">
                    <Label>Branch <RequiredStar /></Label>
                    <Select
                      options={locationList?.data?.data || []}
                      isMulti
                      value={branches}
                      closeMenuOnSelect={false}
                      onChange={setBranches}
                      menuPortalTarget={document.body}
                      styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                    />
                  </Col>
                  <Col md="2">
                    <Label>Level <RequiredStar /></Label>
                    <Select
                      options={designationList?.data?.data || []}
                      isMulti
                      closeMenuOnSelect={false}
                      value={levels}
                      onChange={setLevels}
                      menuPortalTarget={document.body}
                      styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                    />
                  </Col>
                </Row>

                <h6>Options (Select Correct Answer) <RequiredStar /></h6>
                <div className="options-wrapper">
                  {options.map((opt, index) => (
                    <div
                      key={index}
                      className={`option-row ${opt.true ? "active" : ""}`}
                    >
                      <input
                        type="checkbox"
                        checked={opt.true}
                        onChange={() => handleCorrectAnswer(index)}
                        className="option-check"
                      />
                      <Input
                        value={opt.option}
                        onChange={(e) =>
                          handleOptionChange(e.target.value, index)
                        }
                        placeholder={`Option ${index + 1}`}
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-3 d-flex gap-2">
                  <Button color="primary" onClick={handleSubmit}>
                    {editId ? "Update" : "Save"}
                  </Button>
                  <Button color="secondary" onClick={resetForm}>
                    Reset
                  </Button>
                </div>
              </>
            )}

            {uploadMode === "excel" && (
              <Row className="align-items-end">
                <Col md="6">
                  <Label>Upload Excel <RequiredStar /></Label>
                  <Input
                    type="file"
                    accept=".xlsx,.xls"
                    ref={fileInputRef}
                    key={fileInputKey}
                    onChange={handleFileChange}
                  />
                </Col>

                <Col md="2">
                  <Button
                    color="primary"
                    onClick={handleExcelUpload}
                  >
                    Upload
                  </Button>
                </Col>

              </Row>
            )}

          </CardBody>
        </Card>

        {/* TABLE */}
        <AppTable
          progressPending={isLoading}
          columns={columns}
          data={allQuestions?.data?.data || []}
          pagination
        />

      </Container>

      {/* OPTIONS MODAL */}

      <Modal isOpen={optionModal} toggle={() => setOptionModal(false)} centered>
        <ModalHeader toggle={() => setOptionModal(false)}>
          Options
        </ModalHeader>

        <ModalBody>

          {selectedOptions.map((opt, index) => (

            <div
              key={index}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "10px",
                padding: "8px",
                border: "1px solid #eee",
                borderRadius: "6px"
              }}
            >
              {opt.true
                ? <FaCheckCircle color="green" />
                : <FaTimesCircle color="red" />}

              <span>{opt.option}</span>

            </div>
          ))}
        </ModalBody>
      </Modal>

      {/* STYLE */}
      <style jsx="true">{`

        .options-wrapper{
          display:grid;
          grid-template-columns:1fr 1fr;
          gap:12px;
          margin-top:10px;
        }

        .option-row{
          display:flex;
          align-items:center;
          gap:10px;
          padding:8px 12px;
          border:1px solid #ddd;
          border-radius:6px;
          background:#fff;
        }

        .option-row.active{
          border:2px solid #28a745;
          background:#f6fffa;
        }

        .option-check{
          width:18px;
          height:18px;
          cursor:pointer;
        }

      `}</style>

    </PageContent>
  );
}