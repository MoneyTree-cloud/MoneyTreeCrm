import jsPDF from "jspdf";
import { defaultTheme } from "../../helpers/defaultTheme";
import { generateTimestamp } from "../../helpers/function_helper";

export const generateNoDuesPDF = async (data) => {

    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const marginX = 25;
    const primaryColor = defaultTheme?.primary || "#0d6efd";
    let currentY = 32;

    /* ============== OUTER BORDER ============== */
    doc.setDrawColor(170);
    doc.setLineWidth(0.7);
    doc.rect(8, 8, pageWidth - 16, pageHeight - 16);

    /* ============== INNER BORDER ============== */
    doc.setDrawColor(primaryColor);
    doc.setLineWidth(0.3);
    doc.rect(12, 12, pageWidth - 24, pageHeight - 24);

    /* ============== HEADER ============== */
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(20);
    doc.text("NO DUES CERTIFICATE", pageWidth / 2, currentY, { align: "center" });

    doc.setDrawColor(primaryColor);
    doc.setLineWidth(0.4);
    doc.line(pageWidth / 2 - 55, currentY + 4, pageWidth / 2 + 55, currentY + 4);

    /* ============== ADDRESSING ============== */
    currentY += 20;
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text("To,", marginX, currentY);

    currentY += 6;
    doc.setFont("helvetica", "bold");
    doc.text("The HR Department", marginX, currentY);

    currentY += 5;
    doc.text("Moneytree Realty Services Limited", marginX, currentY);

    /* ============== BODY TEXT ================= */
    currentY += 16;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(50);

    const name = data.name || "________________";

    const bodyText = `
I, ${name} (${data.employeeCode}) . I have received my full & final payment against all my dues. I am signing this No Due Acknowledgement after receiving the funds. After this I will not raise any claim or demand. Any other claim after this will have no reliability or relativity. Moneytree will not be liable to address any such future quarry and not bounded to reply on such claim, whatsoever against the company.
All my handovers for the assets and responsibility to transfer the data has been completed to the concerned person.
`;

    const splitText = doc.splitTextToSize(
        bodyText.trim(),
        pageWidth - marginX * 2
    );

    doc.text(splitText, marginX, currentY, { lineHeightFactor: 1.6 });

    /* ============== DATE / NAME / MOBILE / SIGNATURE ============== */
    currentY += splitText.length * 7 + 18;

    // Date
    doc.setFont("helvetica", "bold");
    doc.text("Date:", marginX, currentY);
    doc.line(marginX + 15, currentY + 1, marginX + 70, currentY + 1);

    // Name + Signature (same line)
    currentY += 14;
    doc.text("Name:", marginX, currentY);
    doc.setFont("helvetica", "normal");
    doc.text(name, marginX + 16, currentY);

    const sigX = pageWidth - marginX - 70;
    doc.setFont("helvetica", "bold");
    doc.text("Signature:", sigX, currentY);
    doc.line(sigX + 25, currentY + 1, sigX + 65, currentY + 1);

    // Mobile No. BELOW Name (left side)
    currentY += 10;
    doc.setFont("helvetica", "bold");
    doc.text("Mobile No:", marginX, currentY);
    doc.setFont("helvetica", "normal");
    doc.text(data.contactNo || "______________", marginX + 22, currentY);

    /* ============== FOOTER ================= */
    doc.setDrawColor(210);
    doc.line(marginX, pageHeight - 25, pageWidth - marginX, pageHeight - 25);

    const now = new Date();
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const day = String(now.getDate()).padStart(2, "0");
    const month = months[now.getMonth()];
    const year = now.getFullYear();
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;

    const formattedTime = `${day}-${month}-${year} ${String(hours).padStart(2, "0")}:${minutes}:${seconds} ${ampm}`;

    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(140);

    doc.text(
        `${data.name || ""} (${data.employeeCode || ""})`,
        marginX,
        pageHeight - 16
    );

    doc.text(
        `Generated on: ${formattedTime}`,
        pageWidth - marginX,
        pageHeight - 16,
        { align: "right" }
    );

    /* ============== SAVE ================= */
    doc.save(
        `No_Dues_${data.employeeCode || "NA"}_${generateTimestamp()}.pdf`
    );
};
