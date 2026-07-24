export const formatDate = (dateString) => {
  if (dateString === null) {
    return ""; // Return blank if the input is null
  }
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return ""; // Return blank if the input is not a valid date
  }

  const day = String(date.getDate()).padStart(2, "0");
  const month = date.toLocaleString("en-US", { month: "short" });
  const year = date.getFullYear();

  // Return formatted date as "DD-MMM-YYYY"
  return `${day}-${month}-${year}`;
};

export function formatDateTime(input) {
  if (input === null) {
    return ""; // Return blank if the input is null
  }
  const date = new Date(input);
  if (isNaN(date.getTime())) {
    return ""; // Return blank if the input is not a valid date
  }

  const day = String(date.getDate()).padStart(2, "0");
  const month = date.toLocaleString("en-US", { month: "short" });
  const year = date.getFullYear();

  const hours = date.getHours() % 12 || 12; // Convert to 12-hour format
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const ampm = date.getHours() >= 12 ? "pm" : "am";

  return `${day}-${month}-${year} ${hours}:${minutes} ${ampm}`;
}

export const formatDateForDisplay = (date) => {
  const options = { day: "2-digit", month: "short", year: "numeric" };
  return new Date(date).toLocaleDateString("en-GB", options).replace(/ /g, "-");
};

export const formatDateForApi = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day} 00:00:00`;
};

export const formatDateForInput = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export function formatDateTimeWithSeconds(input) {
  if (input === null) {
    return ""; // Return blank if the input is null
  }
  const date = new Date(input);
  if (isNaN(date.getTime())) {
    return ""; // Return blank if the input is not a valid date
  }

  const day = String(date.getDate()).padStart(2, "0");
  const month = date.toLocaleString("en-US", { month: "short" });
  const year = date.getFullYear();

  const hours = date.getHours() % 12 || 12; // 12-hour format
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  const ampm = date.getHours() >= 12 ? "pm" : "am";

  return `${day}-${month}-${year} ${hours}:${minutes}:${seconds} ${ampm}`;
}

export function convertToISODate(dateString) {
  // Create a new Date object from the input string
  const date = new Date(dateString);

  // Check if the date is valid
  if (isNaN(date.getTime())) {
    throw new Error("Invalid date format. Please use 'YYYY-MM-DD'.");
  }

  // Convert the date to ISO format
  return date.toISOString();
}

export function convertTo12HourFormat(time) {
  // Split the time into hours and minutes
  let [hours, minutes] = time.split(":").map(Number);

  // Determine AM or PM
  const period = hours >= 12 ? "PM" : "AM";

  // Convert hours to 12-hour format
  hours = hours % 12 || 12; // Convert 0 to 12 for 12 AM

  // Format minutes to always have two digits
  minutes = String(minutes).padStart(2, "0");

  // Return the formatted time
  return `${hours}:${minutes} ${period}`;
}

export function formatTurnOver(value) {
  if (!value) {
    return 0;
  }

  // Convert the value to Lakh and round to 3 decimal places
  const valueInLakh = value / 10000000;

  // Return the value in Lakh with 3 decimal places
  return valueInLakh.toFixed(3);
}

export function formatTurnOverInCr(value) {
  if (!value) {
    return 0;
  }

  // Convert the value to Lakh and round to 3 decimal places
  const valueInLakh = value / 10000000;

  // Return the value in Lakh with 3 decimal places
  return valueInLakh.toFixed(2);
}

export const getFormattedDateTime = () => {
  const now = new Date();

  // Options for formatting date and time
  const options = {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true, // AM/PM format
  };

  // Format the date and time
  return now.toLocaleString('en-GB', options).replace(',', '');
};

// Function to get the month name from the date string
export function getBookingMonthName(dateString) {
  const date = new Date(dateString);
  const options = { month: 'long' };  // Format option for full month name
  return date.toLocaleDateString('en-US', options);  // Returns the full month name
}

// Function to get the year from the date string
export function getBookingYear(dateString) {
  const date = new Date(dateString);
  return date.getFullYear();  // Returns the year (e.g., 2024)
}

// Example usage
export function timeDifference(startTime, endTime) {
  // Create Date objects for both times (assuming both times are on the same day)
  const start = new Date(`1970-01-01T${startTime}:00Z`); // using a dummy date (1970-01-01)
  const end = new Date(`1970-01-01T${endTime}Z`);

  // Calculate the difference in milliseconds
  let diffInMillis = end - start;

  // If the result is negative, it means endTime is earlier than startTime (crossing midnight)
  if (diffInMillis < 0) {
    diffInMillis += 24 * 60 * 60 * 1000; // Add 24 hours (in milliseconds)
  }

  // Calculate hours and minutes
  const hours = Math.floor(diffInMillis / (1000 * 60 * 60));
  const minutes = Math.floor((diffInMillis % (1000 * 60 * 60)) / (1000 * 60));

  // Return formatted time difference
  return `${hours}:${minutes < 10 ? '0' + minutes : minutes}`;
}

export function getCurrentDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0'); // Adding 1 because months are 0-indexed
  const day = String(today.getDate()).padStart(2, '0'); // Ensures day is always 2 digits

  return `${year}-${month}-${day}`;
}

export const maskEmail = (email) => {
  if (!email) return "";
  const [localPart, domain] = email.split('@');
  const maskedLocalPart = localPart.slice(0, 3) + '*****'; // Mask after the first 3 characters
  return maskedLocalPart + '@' + domain;
};

export function calculateAging(enquiryDate, currentDateTime) {
  if (!enquiryDate && !currentDateTime) {
    return ''
  }
  // Parse the enquiryDate to a Date object
  const enquiryDateTime = new Date(enquiryDate);
  // Calculate the difference in milliseconds
  const timeDifference = new Date(currentDateTime) - enquiryDateTime;

  // Convert the difference into hours and minutes
  const hours = Math.floor(timeDifference / (1000 * 60 * 60)); // Convert milliseconds to hours
  const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60)); // Remaining minutes

  // Return the result in "hours:minutes" format
  return `${hours}:${minutes < 10 ? '0' + minutes : minutes}`;
};

export function calculateAgingDayWise(enquiryDate, currentDateTime) {
  if (!enquiryDate || !currentDateTime) {
    return '';
  }

  const enquiryDateTime = new Date(enquiryDate);
  const currentDate = new Date(currentDateTime);

  const timeDifference = currentDate - enquiryDateTime;

  const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));

  return `${days} day${days !== 1 ? 's' : ''}, ${hours}h ${minutes}m`;
}

export function calculateOnlyAgingDayWise(enquiryDate, currentDateTime) {
  if (!enquiryDate || !currentDateTime) {
    return '';
  }

  const enquiryDateTime = new Date(enquiryDate);
  const currentDate = new Date(currentDateTime);

  const timeDifference = currentDate - enquiryDateTime;

  const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
  return `${days} day${days !== 1 ? 's' : ''}`;
}

export const numericInputOnly = (e) => {
  if (['-', '.', 'e'].includes(e.key)) {
    e.preventDefault();
  }
};

export const roundToTwoDecimals = (value) => {
  return Math.round(value * 100) / 100;
};

export const formatActionType = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Function to apply the common word wrapping style
export const WordWrapCell = ({ children }) => (
  <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
    {children}
  </div>
);

export const generateTimestamp = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const hours = String(today.getHours()).padStart(2, '0');
  const minutes = String(today.getMinutes()).padStart(2, '0');
  const seconds = String(today.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day}_${hours}:${minutes}:${seconds}`;
};

export function formatLabel(input) {
  if (!input) return "";

  // Add space before each capital letter and capitalize the first letter
  const result = input
    .replace(/([A-Z])/g, " $1")   // Insert space before capital letters
    .replace(/^./, str => str.toUpperCase());  // Capitalize the first letter

  return result.trim(); // Remove any leading/trailing spaces
}

export function formatTimeTo12Hour(timeStr) {
  if (!timeStr) return '';
  const [hour, minute] = timeStr?.split(':');
  const h = parseInt(hour);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${minute} ${ampm}`;
}

export const RequiredStar = () => <span className="required-asterisk">*</span>;

export const getFileExtension = (imageSrc) => {
  if (imageSrc.includes("data:image/png")) {
    return ".png";
  } else if (imageSrc.includes("data:image/jpeg") || imageSrc.includes("data:image/jpg")) {
    return ".jpg";
  } else if (imageSrc.includes("data:image/gif")) {
    return ".gif";
  } else if (imageSrc.includes("data:image/bmp")) {
    return ".bmp";
  } else if (imageSrc.includes("data:image/webp")) {
    return ".webp";
  } else if (imageSrc.includes("data:image/svg+xml")) {
    return ".svg";
  } else {
    return ".jpg"; // Default to .jpg if no specific format is detected
  }
};

export const msToHHMMSS = (ms) => {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");

  return `${hours}:${minutes}:${seconds}`;
};

export const HHMMSSToMs = (time) => {
  if (!time) return 0;
  const [h, m, s] = time.split(":").map(Number);
  return ((h * 3600 + m * 60 + s) * 1000);
};

export const HHMMSSToMinutes = (time) => {
  if (!time) return 0;
  const [h, m, s] = time.split(":").map(Number);
  return h * 60 + m + s / 60;
};

export const hourLabel = (hour) => {
  if (hour === 12) return "12 PM";
  if (hour > 12) return `${hour - 12} PM`;
  return `${hour} AM`;
};

export const formatAttDateWithDay = (attDate) => {
  if (!attDate) return "";

  // Normalize spaces: "Jan  2 2026 12:00AM" → "Jan 2 2026 12:00 AM"
  const normalized = attDate
    .replace(/\s+/g, " ")
    .replace("12:00AM", "12:00 AM");

  const date = new Date(normalized);

  if (isNaN(date)) return "—";

  const day = date?.toLocaleDateString("en-US", { weekday: "short" }); // Mon
  const formattedDate = date?.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).replace(/ /g, "-");

  return `${formattedDate} (${day})`;
};

export function getDaysAgo(timestamp) {
  const now = Date.now();
  const diffMs = now - timestamp;
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

export const getFormattedTodayDate = () => {
  const today = new Date();

  const day = String(today.getDate()).padStart(2, "0");
  const month = today.toLocaleString("en-US", { month: "short" });
  const year = today.getFullYear();

  return `${day}-${month}-${year}`;
};

export const numberToWordsIndian = (num) => {
  if (!num || isNaN(num)) return "";

  const a = [
    "", "One", "Two", "Three", "Four", "Five", "Six",
    "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve",
    "Thirteen", "Fourteen", "Fifteen", "Sixteen",
    "Seventeen", "Eighteen", "Nineteen",
  ];

  const b = [
    "", "", "Twenty", "Thirty", "Forty",
    "Fifty", "Sixty", "Seventy", "Eighty", "Ninety",
  ];

  const convert = (n) => {
    if (n < 20) return a[n];
    if (n < 100)
      return b[Math.floor(n / 10)] + (n % 10 ? " " + a[n % 10] : "");
    if (n < 1000)
      return (
        a[Math.floor(n / 100)] +
        " Hundred" +
        (n % 100 ? " " + convert(n % 100) : "")
      );
    return "";
  };

  let result = "";
  const crore = Math.floor(num / 10000000);
  num %= 10000000;
  const lakh = Math.floor(num / 100000);
  num %= 100000;
  const thousand = Math.floor(num / 1000);
  num %= 1000;

  if (crore) result += convert(crore) + " Crore ";
  if (lakh) result += convert(lakh) + " Lakh ";
  if (thousand) result += convert(thousand) + " Thousand ";
  if (num) result += convert(num);

  return result.trim() + " Only";
};

export const getNameOnly = (value = "") => {
  return value.replace(/\s*\(.*?\)\s*/g, "").trim();
};

export function getDateDifference(date1, date2) {
  if (!date1 || !date2 || date1 === "NA") return '-';
  const d1 = new Date(date1);
  const d2 = new Date(date2);

  const diffInMs = Math.abs(d2 - d1);
  const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

  return Math.floor(diffInDays);
}

export const getDaysFromToday = (timestamp) => {
  if (!timestamp) return 0;

  const inputDate = new Date(Number(timestamp));
  const today = new Date();

  // Remove time part (important)
  const inputOnlyDate = new Date(
    inputDate.getFullYear(),
    inputDate.getMonth(),
    inputDate.getDate()
  );

  const todayOnlyDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  const diffTime = todayOnlyDate - inputOnlyDate;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  return diffDays >= 0 ? diffDays : 0;
};

export const getDuration = (start, end) => {
  if (!start || !end) return "-";
  const startTime = new Date(start.replace(" ", "T"));
  const endTime = new Date(end.replace(" ", "T"));

  const diffMs = endTime - startTime;

  if (isNaN(diffMs) || diffMs < 0) return "Invalid time";

  const totalMinutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${hours}h ${minutes}m`;
};


//Change Request 

export const getStatusDate = (row, statusValue) => {
  const histories = row?.dropdownUpdateHistories;
  if (!Array.isArray(histories)) return null;
  const entry = histories.find(
    (h) => String(h.dropdownValue || '').toLowerCase() === String(statusValue).toLowerCase()
  );
  return entry?.updatedDate || null;
};

export const getInProcessDate = (row) => getStatusDate(row, 'in-process');
export const getCompletedDate = (row) => getStatusDate(row, 'live') || getStatusDate(row, 'go-live');

export const daysBetween = (start, end) => {
  if (!start || !end) return null;
  const ms = new Date(end).getTime() - new Date(start).getTime();
  if (isNaN(ms) || ms < 0) return null;
  return ms / (1000 * 60 * 60 * 24);
};

export const formatDuration = (days) => {
  if (days === null || days === undefined) return '—';
  if (days < 1 / 24) return `${Math.round(days * 24 * 60)}m`;
  if (days < 1) return `${(days * 24).toFixed(1)}h`;
  return `${days.toFixed(1)}d`;
};

export const getAgingDaysByDoj = (doj) => {
  if (!doj) return 0;

  const joiningDate = new Date(doj);
  const today = new Date();

  const diffTime = today - joiningDate;
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

// ── Format currency in Indian style ─────────────────────────────────────────
export const formatINR = (val) => {
  const n = Number(val);
  if (isNaN(n)) return '₹0';
  return `₹${n.toLocaleString('en-IN')}`;
};

export const maskValue = (value) => {
  if (value === null || value === undefined) return "";
  return "*".repeat(String(value).length);
};

export const maskLastFour = (value) => {
  if (!value) return "";

  const str = String(value);

  // If length is 4 or less, return as is
  if (str.length <= 4) return str;

  return "*".repeat(str.length - 4) + str.slice(-4);
};
