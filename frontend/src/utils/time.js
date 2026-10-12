// =============================================
// TIME HELPERS
//
// Shared timestamp + relative time logic used by
// the notification bell and the admin dashboard.
//
// A reliable "x minutes ago" label needs a real
// point in time. Some records do not carry one:
// exams only stored a plain "YYYY-MM-DD" creation
// date (which JavaScript reads as midnight UTC),
// and students had no timestamp at all. To keep
// those older records accurate we also recover the
// creation time from the MongoDB ObjectId, whose
// first 4 bytes are the creation time in seconds
// since the Unix epoch. New records use the real
// Mongoose timestamps instead.
// =============================================

// Returns a Date built from a MongoDB ObjectId string,
// or null when the id is missing / not an ObjectId.
export function objectIdToDate(id) {

    if (typeof id !== "string" || id.length < 8) {
        return null;
    }

    const seconds = parseInt(id.substring(0, 8), 16);

    if (Number.isNaN(seconds)) {
        return null;
    }

    return new Date(seconds * 1000);

}


// Parses any date-like value into a Date, or null when it
// cannot be understood.
function toDate(value) {

    if (!value) {
        return null;
    }

    const date =
        value instanceof Date ? value : new Date(value);

    return Number.isNaN(date.getTime()) ? null : date;

}


// Finds the most trustworthy timestamp for a record.
//
// `preferred` lists event fields (such as a result's
// "submittedAt") that should win over the creation time.
// Otherwise the record's real createdAt is used, falling
// back to the ObjectId creation time for older records so
// they stay accurate without a database migration.
export function getRecordTime(record, preferred = []) {

    if (!record) {
        return null;
    }

    for (const field of preferred) {

        const date = toDate(record[field]);

        if (date) {
            return date;
        }

    }

    return (
        toDate(record.createdAt) ||
        objectIdToDate(record._id) ||
        null
    );

}


// Human friendly "time ago" label for a Date, ISO string or
// null. Returns "" when no usable time is available.
export function formatRelativeTime(value) {

    const date = toDate(value);

    if (!date) {
        return "";
    }

    const difference = Date.now() - date.getTime();

    // Covers "just happened" and tiny clock skew so a
    // brand new record never reads like a future event.
    if (difference < 60000) {
        return "Just now";
    }

    const minutes = Math.floor(difference / (1000 * 60));

    if (minutes < 60) {
        return `${minutes}m ago`;
    }

    const hours = Math.floor(minutes / 60);

    if (hours < 24) {
        return `${hours}h ago`;
    }

    const days = Math.floor(hours / 24);

    if (days < 7) {
        return `${days}d ago`;
    }

    return date.toLocaleDateString();

}
