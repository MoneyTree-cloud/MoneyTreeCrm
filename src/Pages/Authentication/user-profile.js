import { useState, useEffect } from "react";
import { Card, CardBody, Col, Container, Row, Button, Input, FormGroup, Label, } from "reactstrap";
import { AiFillCamera } from "react-icons/ai";
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
import { formatDate } from "../../helpers/function_helper";
import { FaEdit } from "react-icons/fa";
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
              <Col
                className="text-center mb-3"
                style={{ position: "relative" }}
              >
                <img
                  src={imageSrc}
                  alt=""
                  className="avatar-md rounded-circle img-thumbnail"
                  onClick={toggleModal}
                  style={{
                    cursor: "pointer",
                    width: "100px",
                    height: "100px",
                    objectFit: "contain",
                  }}
                />
                <label htmlFor="file-upload" style={{ cursor: "pointer" }}>
                  <AiFillCamera
                    size={30}
                    style={{
                      position: "absolute",
                      bottom: "1px",
                      right: "45%",
                      backgroundColor: defaultTheme.goldColorLogo,
                      color: "white",
                      borderRadius: "50%",
                      padding: "5px",
                    }}
                  />
                </label>
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
              <p
                className="text-center"
                style={{
                  fontSize: 14,
                  fontWeight: "700",
                  color: defaultTheme.redColor,
                }}
              >
                Note: In case of any discrepancy in your reporting hierarchy, please contact the HR department.
              </p>
              <Row className="mb-2">
                <hr className="dashed-divider" />
                <Col md="12" className="d-flex justify-content-between align-items-center">
                  <h5>Personal Details</h5>
                  <Button
                    color="link"
                    onClick={handleEditClick}
                    disabled={isEditing}
                    style={{ textDecoration: "none" }}
                  >
                    <FaEdit size={22} />
                  </Button>
                </Col>
              </Row>

              {!isEditing ? (
                <Row>
                  {renderField("Phone No", formData.mobileNo)}
                  {renderField("Emergency Phone No", formData.emergencyPhone)}
                  {renderField("Email", formData.personalEmail)}
                  {renderField("Instagram ID", formData.instagramId || '-')}
                  {updateUserData.maritalStatus === 'Married' && renderField("Marriage Anniversary", formatDate(formData.marriageAnniversary))}
                  {updateUserData.maritalStatus === 'Married' && renderField("Spouse's Birthday", formatDate(formData.wifeBirthday))}
                </Row>
              ) : (
                <Row>
                  {renderEditableField("Phone No", "mobileNo", formData.mobileNo)}
                  {renderEditableField("Emergency Phone No", "emergencyPhone", formData.emergencyPhone)}
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

            <p
              className="text-center"
              style={{
                fontSize: 14,
                fontWeight: "700",
                color: defaultTheme.redColor,
              }}
            >
              Note: Please review and update your profile image along with other details before saving the changes.
            </p>
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