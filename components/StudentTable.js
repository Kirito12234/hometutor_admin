import { canApproveStudent, getFakeReason, isFakeUser, isStudentPendingApproval } from "@/utils/identityCheck";

function getStudentBadge(student) {
  if (student.isBlocked) {
    return { label: "Blocked", className: "bg-red-100 text-red-700" };
  }

  const paid = String(student.paymentStatus || "").toLowerCase() === "paid" || student.isEnrolled;
  if (paid) {
    return { label: "Enrolled", className: "bg-violet-100 text-violet-700" };
  }

  const requested = isStudentPendingApproval(student);
  if (requested) {
    return { label: "Request", className: "bg-amber-100 text-amber-700" };
  }

  return { label: "Active", className: "bg-emerald-100 text-emerald-700" };
}

export default function StudentTable({
  students,
  onBlock,
  onDelete,
  loadingId,
  onManageSession,
  onApprove,
  showSessionAction = true
}) {
  return (
    <div className="card overflow-x-auto">
      <h2 className="mb-4 text-lg font-semibold text-slate-900">Students</h2>
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-slate-500">
            <th className="pb-3">Name</th>
            <th className="pb-3">Email</th>
            <th className="pb-3">Phone</th>
            <th className="pb-3">Status</th>
            <th className="pb-3">Course</th>
            <th className="pb-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => {
            const badge = getStudentBadge(student);
            const enrolledCourse = student.course?.title || student.enrolledCourse?.title || student.subject || "Not assigned";
            const fakeStudent = isFakeUser(student);
            const fakeReason = getFakeReason(student);
            const canApprove = canApproveStudent(student);
            const pendingApproval = isStudentPendingApproval(student);

            return (
              <tr key={student._id} className="border-b border-slate-100">
                <td className="py-3 font-medium text-slate-800">{student.name}</td>
                <td className="py-3 text-slate-600">{student.email}</td>
                <td className="py-3 text-slate-600">{student.phone}</td>
                <td className="py-3">
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${badge.className}`}>{badge.label}</span>
                </td>
                <td className="py-3 text-slate-600">{enrolledCourse}</td>
                <td className="py-3">
                  <div className="flex flex-wrap gap-2">
                    {pendingApproval && onApprove && (
                      <button
                        className="btn-primary"
                        disabled={loadingId === student._id || !canApprove}
                        onClick={() => onApprove(student)}
                        title={!canApprove ? `Cannot approve: ${fakeReason}` : "Approve student"}
                        type="button"
                      >
                        {fakeStudent ? "Fake Record" : "Approve"}
                      </button>
                    )}
                    {showSessionAction && (
                      <button
                        className="btn-outline"
                        disabled={loadingId === student._id}
                        onClick={() => onManageSession(student)}
                        type="button"
                      >
                        Session
                      </button>
                    )}
                    <button
                      className="btn-outline"
                      disabled={loadingId === student._id}
                      onClick={() => onBlock(student)}
                      type="button"
                    >
                      {student.isBlocked ? "Unblock" : "Block"}
                    </button>
                    <button
                      className="btn-danger"
                      disabled={loadingId === student._id}
                      onClick={() => onDelete(student._id)}
                      type="button"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {!students.length && <p className="py-4 text-center text-sm text-slate-500">No students found.</p>}
    </div>
  );
}

