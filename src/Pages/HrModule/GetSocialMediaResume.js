import { useEffect, useState } from "react";
import { Container } from "reactstrap";
import { defaultTheme } from "../../helpers/defaultTheme";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import AppTable from "../../components/Common/Table";
import { useGet } from "../../Hooks/useApi";
import { GET_CV_FILE_BY_ID, } from "../../helpers/url_helper";
import ScreenLoader from "../../constants/ScreenLoader";
import { hrImageBaseUrl } from "../../helpers/api_helper";
import { formatDateTime, WordWrapCell } from "../../helpers/function_helper";
import PageContent from "../../components/Common/PageContent";
import { useUserStore } from "../../store/useUserStore";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";
import { FaFilePdf } from "react-icons/fa";

const GetSocialMediaResume = () => {
    const { userId, empCode } = useUserStore((state) => state.user);
    const [accessGranted, setAccessGranted] = useState(true);

    const { data: imagesData, isLoading: isLoadingImages } = useGet(`${GET_CV_FILE_BY_ID}?offset=0&limit=10000&hrCode=${empCode}`, { enabled: !!accessGranted });

    const columns = [
        {
            name: <span className="font-weight-bold fs-13">SL No.</span>,
            selector: (_, index) => index + 1,
            width: "8%",
        },
        {
            name: <span className="font-weight-bold fs-13">Assigned Date & Time</span>,
            selector: (row) => row?.assignedDate,
            sortable: true,
            cell: (row) => <WordWrapCell>{formatDateTime(row?.assignedDate)}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Assigned By</span>,
            selector: (row) => row.assignedByName,
            sortable: true,
            cell: (row) => <WordWrapCell>{row?.assignedByName}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">File</span>,
            sortable: false,
            cell: (row) => <FaFilePdf
                size={20}
                onClick={() => handleViewFile(row?.resumePath)}
                style={{ cursor: "pointer", color: defaultTheme.goldColorLogo }}
            />
        },
    ];

    const handleViewFile = (fileName) => {
        window.open(hrImageBaseUrl + fileName, "_blank");
    };

    useEffect(() => {
        const checkAccess = async () => {
            const hasAccess = await CheckUserAccess(userId, 'get-social-media-cv');
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
            <Container fluid={true}>
                {(isLoadingImages) && <ScreenLoader />}

                <Breadcrumbs title="Get CV" breadcrumbItem="Social Media Data" />

                <AppTable
                    columns={columns}
                    data={
                        Array.isArray(imagesData?.data?.data?.content)
                            ? imagesData?.data?.data?.content
                            : []
                    }
                    pagination
                    paginationServer
                    paginationTotalRows={imagesData?.data?.data?.totalElements}
                />
            </Container>
        </PageContent>
    );
};

export default GetSocialMediaResume;
