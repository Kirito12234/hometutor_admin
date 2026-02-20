export default function CourseTable({ courses, onOpen, onApprove, onReject, onDelete, loadingId }) {
  const isManageMode = Boolean(onOpen || onApprove || onReject || onDelete);
  const approvalState = (course) => course.approvalStatus || (course.isPublished ? "approved" : "pending");

  return (
    <div className="card overflow-x-auto">
      <h2 className="mb-4 text-lg font-semibold text-slate-900">Courses</h2>
      <table className="w-full min-w-[900px] text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-slate-500">
            <th className="pb-3">Title</th>
            <th className="pb-3">Subject</th>
            <th className="pb-3">Teacher</th>
            <th className="pb-3">Price</th>
            <th className="pb-3">Duration</th>
            <th className="pb-3">Status</th>
            {isManageMode && <th className="pb-3">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {courses.map((course) => (
            <tr key={course._id} className="border-b border-slate-100">
              <td className="py-3 font-medium text-slate-800">{course.title}</td>
              <td className="py-3 text-slate-600">{course.subject}</td>
              <td className="py-3 text-slate-600">{course.teacher?.name || "Unassigned"}</td>
              <td className="py-3 text-slate-600">
                {course.price} INR
              </td>
              <td className="py-3 text-slate-600">{course.durationInWeeks} weeks</td>
              <td className="py-3">
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${
                    approvalState(course) === "approved"
                      ? "bg-emerald-100 text-emerald-700"
                      : approvalState(course) === "rejected"
                        ? "bg-rose-100 text-rose-700"
                        : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {approvalState(course) === "approved"
                    ? "Approved"
                    : approvalState(course) === "rejected"
                      ? "Rejected"
                      : "Pending Admin"}
                </span>
              </td>
              {isManageMode && (
                <td className="py-3">
                  <div className="flex gap-2">
                    {onOpen && (
                      <button
                        className="btn-outline"
                        disabled={loadingId === course._id}
                        onClick={() => onOpen(course)}
                        type="button"
                      >
                        Open
                      </button>
                    )}
                    {onApprove && (
                      <button
                        className="btn-primary"
                        disabled={loadingId === course._id || approvalState(course) === "approved"}
                        onClick={() => onApprove(course)}
                        type="button"
                      >
                        Approve
                      </button>
                    )}
                    {onReject && (
                      <button
                        className="btn-outline"
                        disabled={loadingId === course._id || approvalState(course) === "rejected"}
                        onClick={() => onReject(course)}
                        type="button"
                      >
                        Reject
                      </button>
                    )}
                    {onDelete && (
                      <button
                        className="btn-danger"
                        disabled={loadingId === course._id}
                        onClick={() => onDelete(course._id)}
                        type="button"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {!courses.length && <p className="py-4 text-center text-sm text-slate-500">No courses found.</p>}
    </div>
  );
}
