import { canApproveTeacher, getFakeReason, isFakeUser } from "@/utils/identityCheck";

export default function TeacherTable({ teachers, onApprove, onBlock, onDelete, loadingId }) {
  return (
    <div className="card overflow-x-auto">
      <h2 className="mb-4 text-lg font-semibold text-slate-900">Teachers</h2>
      <table className="w-full min-w-[800px] text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-slate-500">
            <th className="pb-3">Name</th>
            <th className="pb-3">Email</th>
            <th className="pb-3">Phone</th>
            <th className="pb-3">Subject</th>
            <th className="pb-3">Experience</th>
            <th className="pb-3">Approval</th>
            <th className="pb-3">Status</th>
            <th className="pb-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {teachers.map((teacher) => {
            const fakeTeacher = isFakeUser(teacher);
            const fakeReason = getFakeReason(teacher);
            const canApprove = canApproveTeacher(teacher);

            return (
            <tr key={teacher._id} className="border-b border-slate-100">
              <td className="py-3 font-medium text-slate-800">{teacher.name}</td>
              <td className="py-3 text-slate-600">{teacher.email}</td>
              <td className="py-3 text-slate-600">{teacher.phone}</td>
              <td className="py-3 text-slate-600">{teacher.subject}</td>
              <td className="py-3 text-slate-600">{teacher.experience}</td>
              <td className="py-3">
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${
                    teacher.isApproved
                      ? "bg-emerald-100 text-emerald-700"
                      : fakeTeacher
                        ? "bg-red-100 text-red-700"
                        : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {teacher.isApproved ? "Approved" : fakeTeacher ? "Rejected (Fake)" : "Pending"}
                </span>
              </td>
              <td className="py-3">
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${
                    teacher.isBlocked ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  {teacher.isBlocked ? "Blocked" : "Active"}
                </span>
              </td>
              <td className="py-3">
                <div className="flex gap-2">
                  {!teacher.isApproved && (
                    <button
                      className="btn-primary"
                      disabled={loadingId === teacher._id || !canApprove}
                      onClick={() => onApprove(teacher._id)}
                      title={!canApprove ? `Cannot approve: ${fakeReason}` : "Approve teacher"}
                      type="button"
                    >
                      {fakeTeacher ? "Fake Record" : "Approve"}
                    </button>
                  )}
                  <button
                    className="btn-outline"
                    disabled={loadingId === teacher._id}
                    onClick={() => onBlock(teacher)}
                    type="button"
                  >
                    {teacher.isBlocked ? "Unblock" : "Block"}
                  </button>
                  <button
                    className="btn-danger"
                    disabled={loadingId === teacher._id}
                    onClick={() => onDelete(teacher._id)}
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
      {!teachers.length && <p className="py-4 text-center text-sm text-slate-500">No teachers found.</p>}
    </div>
  );
}

