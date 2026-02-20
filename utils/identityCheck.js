const FAKE_KEYWORDS = ["fake", "dummy", "test", "unknown", "temp", "example", "sample"];

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function hasFakeKeyword(value) {
  const normalized = normalize(value);
  return FAKE_KEYWORDS.some((keyword) => normalized.includes(keyword));
}

function hasInvalidPhone(value) {
  const digits = String(value || "").replace(/\D/g, "");
  if (!digits) {
    return true;
  }
  if (digits.length < 8) {
    return true;
  }
  return /^(\d)\1+$/.test(digits);
}

export function getFakeReason(user) {
  if (!user?.name || hasFakeKeyword(user.name)) {
    return "Invalid name";
  }

  const email = normalize(user?.email);
  if (!email || !email.includes("@") || hasFakeKeyword(email)) {
    return "Invalid email";
  }

  if (hasInvalidPhone(user?.phone)) {
    return "Invalid phone";
  }

  return "";
}

export function isFakeUser(user) {
  return Boolean(getFakeReason(user));
}

export function isStudentPendingApproval(student) {
  const status = normalize(student?.status);
  const requestStatus = normalize(student?.requestStatus);
  return requestStatus === "pending" || status === "requested" || student?.isApproved === false;
}

export function canApproveTeacher(teacher) {
  return !teacher?.isApproved && !isFakeUser(teacher);
}

export function canApproveStudent(student) {
  return isStudentPendingApproval(student) && !isFakeUser(student);
}
