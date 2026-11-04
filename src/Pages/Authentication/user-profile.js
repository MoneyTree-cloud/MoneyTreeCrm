import { useState, useEffect } from "react";
import { Card, CardBody, Col, Container, Row, Button, Input, FormGroup, Label, } from "reactstrap";
import { AiFillCamera } from "react-icons/ai";
import { FaEdit } from "react-icons/fa";
import moneyTreeLogo from "../../assets/images/profile-user.png";
import { defaultTheme } from "../../helpers/defaultTheme";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { useUserStore } from "../../store/useUserStore";
import { useGet, usePost, usePut } from "../../Hooks/useApi";
import { FIND_USER_BY_ID, PROFILE_DETAILS_UPDATE, PROFILE_UPDATE } from "../../helpers/url_helper";
import { toast } from "react-toastify";
import ScreenLoader from "../../constants/ScreenLoader";
import { imageBaseUrl } from "../../helpers/api_helper";
import PageContent from "../../components/Common/PageContent";
import ImageModal from "../../components/Common/ImageModal";
import { decryptData, encryptAndStore } from "../../components/Common/CryptoUtils";
import { formatDate, Notes, Note } from "../../helpers/function_helper";
import { useNavigate } from "react-router-dom";

const UserProfile = () => {
  const navigate = useNavigate()
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  const [updateUserData, setUpdateUserData] = useState({});
  const [modal, setModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { userId, reporingTo } = user;
  const { data, isLoading: fetchLoading } = useGet(`${FIND_USER_BY_ID}${userId}`, { enabled: Boolean(userId) });
  const toggleModal = () => setModal(!modal);

  const [formData, setFormData] = useState({
    image: null,
    personalEmail: "",
    emergencyPhone: "",
    instagramId: "",
    dob: "",
    mobileNo: "",
    marriageAnniversary: "",
    wifeBirthday: "",
    bloodGroup: "",
    // uanNumber: ""
  });

  useEffect(() => {
    if (data?.data?.status === 1) {
      decryptData(data?.data?.data).then((decryptedData) => {
        if (decryptedData) {
          setUpdateUserData(decryptedData.user);
          const userData = decryptedData?.user;
          setFormData((prevState) => ({
            ...prevState,
            personalEmail: userData?.emailId || "",
            emergencyPhone: userData?.emergencyPhone || "",
            instagramId: userData?.instagramId || "",
            dob: userData?.dateOfBirth,
            mobileNo: userData?.phone || "",
            marriageAnniversary: userData?.marriageAnniversary || "",
            wifeBirthday: userData?.wifeBirthday || "",
            bloodGroup: userData?.bloodGroup,
            // uanNumber: userData?.uanNumber || ""
          }));
        } else {
          setUpdateUserData({});
        }
      });
    }
  }, [data]);

  const { isPending: addLoading, mutate: profileUpdate } = usePut(PROFILE_UPDATE, {
    onSuccess: async (response) => {
      if (response?.data?.status === 1) {
        const data = response.data.data;
        toast.success(response.data.message);
        // Values to store securely
        const token = {
          profileImage: data,
          firstTimeLogin: 'NO',
        };

        // Encrypt and store each key-value pair
        for (const [key, value] of Object.entries(token)) {
          if (value != null) {
            await encryptAndStore(key, value);
          }
        }

        // Update app state
        setUser({
          profileImage: data,
          firstTimeLogin: 'NO',
        });

      } else {
        toast.error(response.data.message);
      }
    }

  });

  const { isPending: updateLoading, mutate: profiledataUpdate } = usePost(PROFILE_DETAILS_UPDATE, {
    onSuccess: (response) => {
      if (response?.data?.status === 1) {
        toast.success(response.data.message);
        setIsEditing(false);
      } else {
        toast.error(response.data.message);
      }
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let params = {
      userId: userId,
      personalEmail: formData.personalEmail,
      phone: formData.mobileNo,
      emergencyNumber: formData.emergencyPhone,
      instagramId: formData.instagramId,
      dateOfBirth: formData.dob,
      wifeBirthDay: formData.wifeBirthday,
      marriageAnniversary: formData.marriageAnniversary,
      bloodGroup: formData.bloodGroup
    };
    profiledataUpdate(params);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const formDataApi = new FormData();
      formDataApi.append("Userid", userId);
      formDataApi.append("Attachment1", file);
      profileUpdate(formDataApi);
      setFormData((prevState) => ({
        ...prevState,
        image: file,
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const imageSrc = formData.image
    ? URL.createObjectURL(formData.image)
    : updateUserData?.fileDetails && updateUserData?.fileDetails !== "null" && typeof updateUserData?.fileDetails !== "object"
      ? imageBaseUrl + updateUserData?.fileDetails
      : moneyTreeLogo;

  const renderField = (label, value) => (
    <Col md="3" className="mb-3">
      <h6 className="mb-1 font-size-12">{label} :</h6>
      <p style={{ color: defaultTheme.goldColorLogo, overflowWrap: "break-word" }}>{value}</p>
    </Col>
  );

  const renderEditableField = (label, name, value, type = "text") => (
    <Col md="3">
      <FormGroup className="mb-3">
        <Label className="mb-1 font-size-12">{label} :</Label>
        <Input
          type={type}
          name={name}
          value={value}
          onChange={handleChange}
          style={{ borderColor: defaultTheme.goldColorLogo }}
        />
      </FormGroup>
    </Col>
  );

  return (
    <PageContent>
      <Breadcrumbs title="Profile" breadcrumbItem="Update Profile" />
      {(fetchLoading || addLoading || updateLoading) && <ScreenLoader />}
      <Container fluid>
        <Card>
          <CardBody>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>

              <button
                onClick={() => navigate(-1)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: defaultTheme.primary,
                  borderRadius: '4px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                ← Back
              </button>
            </div>

            <Row className="">
              <Col className="text-center mb-3">
                {/* WhatsApp-style: camera badge pinned to the photo's bottom-right corner */}
                <div style={{ position: "relative", display: "inline-block", width: 110, height: 110 }}>
                  <img
                    src={imageSrc}
                    alt=""
                    className="rounded-circle img-thumbnail"
                    onClick={toggleModal}
                    style={{
                      cursor: "pointer",
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                    }}
                  />
                  <label
                    htmlFor="file-upload"
                    title="Change photo"
                    style={{
                      position: "absolute",
                      right: 2,
                      bottom: 2,
                      width: 34,
                      height: 34,
                      margin: 0,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: defaultTheme.primary,
                      color: "#fff",
                      border: "3px solid #fff",
                      boxShadow: "0 3px 8px rgba(0, 0, 0, 0.25)",
                      cursor: "pointer",
                    }}
                  >
                    <AiFillCamera size={16} />
                  </label>
                </div>
                <Input
                  id="file-upload"
                  type="file"
                  onChange={handleImageChange}
                  accept="image/*"
                  style={{ display: "none" }}
                />
              </Col>
            </Row>

            <form onSubmit={handleSubmit}>
              <Row>
                {renderField("Name", updateUserData?.name)}
                {renderField("Employee Code", updateUserData?.employeeCode)}
                {renderField("Main Team", updateUserData.mainTeam)}
                {renderField("Sub Team", updateUserData.sTeam)}
                {renderField("Reporting Manager", reporingTo + ' (' + updateUserData.parentId + ')')}
                {renderField("Level", updateUserData?.designationName)}
                {renderField("Designation", updateUserData?.positionMaster?.position)}
                {renderField("Actual DOB", formatDate(formData.dob))}
                {renderField("Blood Group", formData.bloodGroup)}
                {/* {renderField("UAN No.", formData.uanNumber)} */}
              </Row>
              <Notes style={{ margin: "0 0 12px" }}>
                <Note tone="gold">In case of any discrepancy in your reporting hierarchy, please contact the HR department.</Note>
              </Notes>
              <Row className="mb-2">
                <hr className="dashed-divider" />
                <Col md="12" className="d-flex justify-content-between align-items-center">
                  <h5>Personal Details</h5>
                  {/* <Button
                    color="link"
                    onClick={handleEditClick}
                    disabled={isEditing}
                    style={{ textDecoration: "none" }}
                  >
                    <FaEdit size={22} />
                  </Button> */}
                </Col>
              </Row>

              {!isEditing ? (
                <Row>
                  {renderField("Personal Mobile (use for Talk's App login)", formData.mobileNo)}
                  {renderField("Emergency Mobile", formData.emergencyPhone)}
                  {renderField("Email", formData.personalEmail)}
                  {renderField("Instagram ID", formData.instagramId || '-')}
                  {updateUserData.maritalStatus === 'Married' && renderField("Marriage Anniversary", formatDate(formData.marriageAnniversary))}
                  {updateUserData.maritalStatus === 'Married' && renderField("Spouse's Birthday", formatDate(formData.wifeBirthday))}
                </Row>
              ) : (
                <Row>
                  {renderEditableField("Personal Mobile (use for Talk's App login)", "mobileNo", formData.mobileNo)}
                  {renderEditableField("Emergency Mobile", "emergencyPhone", formData.emergencyPhone)}
                  {renderEditableField("Email", "personalEmail", formData.personalEmail)}
                  {renderEditableField("Instagram ID", "instagramId", formData.instagramId)}
                  {/* {renderEditableField("Actual DOB", "dob", formData.dob, "date")}
                  <FormSelect
                    value={bloodGroupOptions.find(option => option.value === formData.bloodGroup)}
                    onChange={handleSelectChange("bloodGroup")}
                  /> */}
                  {updateUserData.maritalStatus === 'Married' && renderEditableField("Marriage Anniversary", "marriageAnniversary", formData.marriageAnniversary, "date")}
                  {updateUserData.maritalStatus === 'Married' && renderEditableField("Spouse's Birthday", "wifeBirthday", formData.wifeBirthday, "date")}
                </Row>
              )}

              {isEditing && (
                <Row className="justify-content-center">
                  <Col md="4">
                    <div className="d-flex align-items-center mb-3">
                      <Button
                        color="primary"
                        type="submit"
                        className="me-2"
                        disabled={updateLoading}
                      >
                        Update
                      </Button>
                      <Button
                        color="secondary"
                        type="button"
                        onClick={() => setIsEditing(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </Col>
                </Row>
              )}
            </form>

            <Notes>
              <Note tone="gold">Please review and update your profile image before saving the changes.</Note>
            </Notes>
            <ImageModal
              isOpen={modal}
              toggle={toggleModal}
              imageSrc={imageSrc}
            />
          </CardBody>
        </Card>
      </Container>
    </PageContent>
  );
};

export default UserProfile;