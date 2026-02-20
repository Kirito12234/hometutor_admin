export default function PaymentTable({ payments, toAbsoluteUrl, onApprove, onReject, loadingId }) {
  return (
    <div className="card overflow-x-auto">
      <h2 className="mb-4 text-lg font-semibold text-slate-900">Payments</h2>
      <table className="w-full min-w-[960px] text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-slate-500">
            <th className="pb-3">Student</th>
            <th className="pb-3">Course</th>
            <th className="pb-3">Amount</th>
            <th className="pb-3">Status</th>
            <th className="pb-3">Provider</th>
            <th className="pb-3">Transaction ID</th>
            <th className="pb-3">Student Screenshot</th>
            <th className="pb-3">Date</th>
            <th className="pb-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((payment) => (
            <tr key={payment._id} className="border-b border-slate-100">
              <td className="py-3 text-slate-700">
                <p className="font-medium text-slate-800">{payment.student?.name || "N/A"}</p>
                <p className="text-xs text-slate-500">{payment.student?.email || "No email"}</p>
              </td>
              <td className="py-3 text-slate-600">{payment.course?.title || "N/A"}</td>
              <td className="py-3 text-slate-600">
                {payment.amount} {payment.currency}
              </td>
              <td className="py-3">
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${
                    payment.status === "paid"
                      ? "bg-emerald-100 text-emerald-700"
                      : payment.status === "pending"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-red-100 text-red-700"
                  }`}
                >
                  {payment.status}
                </span>
              </td>
              <td className="py-3 text-slate-600">{payment.provider || "N/A"}</td>
              <td className="py-3 text-slate-600">{payment.transactionId || "N/A"}</td>
              <td className="py-3 text-slate-600">
                {payment.screenshotUrl ? (
                  <a
                    className="text-brand-600 underline"
                    href={toAbsoluteUrl ? toAbsoluteUrl(payment.screenshotUrl) : payment.screenshotUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    Open
                  </a>
                ) : (
                  "N/A"
                )}
              </td>
              <td className="py-3 text-slate-600">{new Date(payment.createdAt).toLocaleDateString()}</td>
              <td className="py-3">
                <div className="flex gap-2">
                  <button
                    className="btn-primary"
                    disabled={loadingId === payment._id || String(payment.status || "").toLowerCase() === "approved" || String(payment.status || "").toLowerCase() === "paid"}
                    onClick={() => onApprove && onApprove(payment)}
                    type="button"
                  >
                    Approve
                  </button>
                  <button
                    className="btn-outline"
                    disabled={loadingId === payment._id || String(payment.status || "").toLowerCase() === "rejected"}
                    onClick={() => onReject && onReject(payment)}
                    type="button"
                  >
                    Reject
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!payments.length && <p className="py-4 text-center text-sm text-slate-500">No payments found.</p>}
    </div>
  );
}

