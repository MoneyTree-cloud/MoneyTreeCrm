import React, { useState } from "react";

function renderMarkdown(text) {
    if (!text) return "";

    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.+?)\*/g, "<em>$1</em>")
        .replace(/`([^`]+)`/g, "<code>$1</code>")
        .replace(/\n/g, "<br/>");
}

export default function AIResponseRenderer({ data }) {
    const [expanded, setExpanded] = useState(false);

    const answer = data?.answer || "";

    // support both data and records
    const rows = Array.isArray(data?.records)
        ? data.records
        : Array.isArray(data?.data)
            ? data.data
            : [];

    const shouldShowTable =
        rows.length > 0 &&
        rows.some((row) => Object.keys(row || {}).length > 0);

    // Single value result (COUNT, SUM, etc.)
    const isSingleValueResult =
        rows.length === 1 &&
        Object.keys(rows[0] || {}).length === 1;

    return (
        <>
            {/* Answer */}
            <div
                dangerouslySetInnerHTML={{
                    __html: renderMarkdown(answer),
                }}
            />

            {/* Single value result */}
            {isSingleValueResult && (
                <div
                    style={{
                        marginTop: "10px",
                        padding: "12px",
                        background: "#F8FAFC",
                        border: "1px solid #E2E8F0",
                        borderRadius: "8px",
                        fontWeight: 600,
                    }}
                >
                    {Object.entries(rows[0]).map(([key, value]) => (
                        <div key={key}>
                            <span style={{ color: "#64748B" }}>
                                {key
                                    .replace(/_/g, " ")
                                    .replace(/\b\w/g, (c) =>
                                        c.toUpperCase()
                                    )}
                                :
                            </span>{" "}
                            <span>{value}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Multi-row table */}
            {shouldShowTable && !isSingleValueResult && (
                <div style={{ marginTop: "12px" }}>
                    <button
                        className="mtw-show-more-btn"
                        onClick={() => setExpanded(!expanded)}
                    >
                        {expanded
                            ? "Show Less"
                            : `Show More (${rows.length} Records)`}
                    </button>

                    {expanded && (
                        <div className="mtw-table-wrapper">
                            <table className="mtw-table">
                                <thead>
                                    <tr>
                                        {Object.keys(rows[0]).map((key) => (
                                            <th key={key}>
                                                {key
                                                    .replace(/_/g, " ")
                                                    .replace(/\b\w/g, (c) =>
                                                        c.toUpperCase()
                                                    )}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>

                                <tbody>
                                    {rows.map((row, index) => (
                                        <tr key={index}>
                                            {Object.keys(rows[0]).map((key) => (
                                                <td key={key}>
                                                    {row[key] ?? "-"}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </>
    );
}