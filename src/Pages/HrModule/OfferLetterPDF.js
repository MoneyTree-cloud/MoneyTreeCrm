import jsPDF from "jspdf";
import { generateTimestamp, getFormattedTodayDate, numberToWordsIndian } from "../../helpers/function_helper";
import { defaultTheme } from "../../helpers/defaultTheme";
import { FaFileDownload } from "react-icons/fa";

const OfferLetterPDF = ({ data }) => {
  /* ========= LAYOUT CONSTANTS ========= */
  const LETTERHEAD_HEIGHT = 40;
  const TOP_MARGIN = LETTERHEAD_HEIGHT;
  const BOTTOM_MARGIN = 20;
  const LEFT_MARGIN = 20;
  const LINE_HEIGHT = 5.2;

  /* ========= MIXED TEXT PARAGRAPH ========= */
  const writeParagraph = (doc, parts, startY, pageWidth) => {
    const pageHeight = doc.internal.pageSize.getHeight();
    let x = LEFT_MARGIN;
    let y = startY;

    const newLine = () => {
      x = LEFT_MARGIN;
      y += LINE_HEIGHT;
      if (y > pageHeight - BOTTOM_MARGIN) {
        doc.addPage();
        y = TOP_MARGIN;
      }
    };

    parts.forEach((part) => {
      doc.setFont("Times", part.bold ? "Bold" : "Normal");

      part.text.split(" ").forEach((word) => {
        const text = word + " ";
        const width = doc.getTextWidth(text);

        if (x + width > LEFT_MARGIN + pageWidth) {
          newLine();
        }

        doc.text(text, x, y);
        x += width;
      });
    });

    return y + LINE_HEIGHT;
  };

  /* ========= FULL BOLD PARAGRAPH ========= */
  const addBoldParagraph = (doc, text, pageWidth, yRef) => {
    doc.setFont("Times", "Bold");
    const lines = doc.splitTextToSize(text, pageWidth);

    lines.forEach((line) => {
      if (yRef.y > doc.internal.pageSize.getHeight() - BOTTOM_MARGIN) {
        doc.addPage();
        yRef.y = TOP_MARGIN;
      }
      doc.text(line, LEFT_MARGIN, yRef.y);
      yRef.y += LINE_HEIGHT;
    });

    yRef.y += LINE_HEIGHT;
  };

  const generatePDF = () => {
    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth =
      doc.internal.pageSize.getWidth() - LEFT_MARGIN * 2;

    let y = TOP_MARGIN;

    doc.setFont("Times", "Normal");
    doc.setFontSize(11);

    /* ===== DATE ===== */
    doc.text(`Date: ${getFormattedTodayDate()}`, 190, y, { align: "right" });
    y += 12;

    /* ===== GREETING ===== */
    doc.text(`Dear ${data.candidateName},`, LEFT_MARGIN, y);
    y += LINE_HEIGHT * 2;

    /* ===== PARAGRAPH 1 ===== */
    y = writeParagraph(
      doc,
      [
        { text: "We are delighted to offer you employment with ", bold: false },
        { text: "Moneytree Realty Services Limited", bold: true },
        { text: " (“Company”)", bold: true },
        { text: ". You are being offered the full-time position of ", bold: false },
        {
          text:
            data.department === "Sales"
              ? `${data.designation} Portfolio Management - ${data.department}`
              : `${data.designation} - ${data.department} `,
          bold: true,
        },
        { text: " at our office, located at ", bold: false },
        { text: data.location, bold: true },
        { text: ".", bold: false },
      ],
      y,
      pageWidth
    );
    y += LINE_HEIGHT;

    /* ===== DOJ + REPORTING MANAGER (PARTIAL BOLD) ===== */
    y = writeParagraph(
      doc,
      [
        { text: "Your employment with the Company is proposed to commence on ", bold: false },
        { text: data.joiningDate, bold: true },
        { text: " and you will report to ", bold: false },
        { text: data.reportingManager, bold: true },
        {
          text: ", or any other person as may be designated from time to time. You will be on probation for ",
          bold: false,
        },
        {
          text:
            data?.department?.toLowerCase() !== "sales" &&
              data?.payrollType === "Salaried"
              ? "THREE"
              : "SIX",
          bold: true,
        },

        {
          text: " months, after which your employment may be confirmed subject to satisfactory performance.",
          bold: false,
        },

      ],
      y,
      pageWidth
    );
    y += LINE_HEIGHT;

    /* ===== NORMAL PARAGRAPHS ===== */
    const addParagraph = (text) => {
      doc.setFont("Times", "Normal");
      const lines = doc.splitTextToSize(text, pageWidth);

      lines.forEach((line) => {
        if (y > doc.internal.pageSize.getHeight() - BOTTOM_MARGIN) {
          doc.addPage();
          y = TOP_MARGIN;
        }
        doc.text(line, LEFT_MARGIN, y);
        y += LINE_HEIGHT;
      });
      y += LINE_HEIGHT;
    };

    addParagraph(
      `You will be expected to diligently discharge your duties and responsibilities and to comply with the Company’s policies and procedures as amended from time to time. Your employment will also be subject to satisfactory verification of the information provided by you, including references and background checks as the Company may deem necessary.`
    );

    /* ===== SALARY (PARTIAL BOLD) ===== */
    y = writeParagraph(
      doc,
      [
        { text: "Your  CTC will be ", bold: false },
        {
          text: `INR ${data.salary} (${numberToWordsIndian(
            Number(data.salary)
          )}) per annum`,
          bold: true,
        },

        {
          text:
            ", subject to applicable statutory deductions. A detailed compensation structure and benefits will be shared separately.",
          bold: false,
        },
      ],
      y,
      pageWidth
    );
    y += LINE_HEIGHT;

    addParagraph(
      `We are excited at the prospect of you joining our team and contributing to the continued growth of the Company. The detailed terms and conditions of your employment shall be set out in and governed by the Employment Agreement to be executed upon your acceptance of this offer.`
    );

    /* ===== ACCEPTANCE (FULL BOLD) ===== */
    const yRef = { y };
    addBoldParagraph(
      doc,
      `Please give your acceptance over this offer withing 3 days by replying:
"I am aware of terms and conditions of this offer and understood. I do accept the same."`,
      pageWidth,
      yRef
    );
    y = yRef.y;

    addParagraph(
      `In case of any query, you can contact our HR person, who was communicating with you during the joining process.`
    );

    addParagraph(`Once again, congratulations on your selection!`);

    /* ===== SIGNATURE / FOOTER ===== */
    if (y > doc.internal.pageSize.getHeight() - 60) {
      doc.addPage();
      y = TOP_MARGIN;
    }

    // Best regards
    doc.setFont("Times", "Normal");
    doc.text("Best regards,", LEFT_MARGIN, y);
    y += LINE_HEIGHT;

    // Company name
    doc.setFont("Times", "Bold");
    doc.text("For MoneyTree Realty Services Limited", LEFT_MARGIN, y);

    // Space for signature (3–4 lines)
    y += LINE_HEIGHT * 4;

    // Signatory
    doc.text("Authorized Signatory", LEFT_MARGIN, y);
    y += LINE_HEIGHT;

    doc.text("Human Resource Department", LEFT_MARGIN, y);

    doc.save(
      `Offer_Letter_${data.candidateName}_${generateTimestamp()}.pdf`
    );
  };

  return (
    <div style={{ display: "flex", justifyContent: "flex-end" }}>
      <button
        onClick={generatePDF}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          backgroundColor: defaultTheme.btnEnable,
          color: "#fff",
          borderRadius: "6px",
          border: "none",
          fontSize: "14px",
          fontWeight: 500,
          cursor: "pointer",
          marginBottom: "10px",
        }}
      >
        <FaFileDownload size={16} />
        Download Offer Letter
      </button>
    </div>
  );
};

export default OfferLetterPDF;
