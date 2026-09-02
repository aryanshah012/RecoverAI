import { api } from "@/lib/api";

export default async function AuditPage() {
  let rows: any[] = [];
  try {
    rows = await api("/api/audit");
  } catch (err) {
    console.error(err);
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-semibold">Audit & Compliance Trail</h1>
          <p className="muted mt-1 text-sm">
            Immutable log of all automated decisions, ML inferences, safety policy evaluations, and human approvals.
          </p>
        </div>
        <span className="badge text-xs bg-zinc-900 border-zinc-700 text-zinc-400">
          {rows.length} Events Logged
        </span>
      </div>

      <div className="card overflow-x-auto">
        {rows.length === 0 ? (
          <div className="py-8 text-center text-zinc-500 text-sm">No audit logs recorded yet.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Event Type</th>
                <th>Case ID</th>
                <th>Action & Safety Message</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="text-xs text-zinc-400 whitespace-nowrap font-mono">
                    {r.created_at ? new Date(r.created_at).toLocaleTimeString() : "—"}
                  </td>
                  <td>
                    <span
                      className={`badge text-[10px] font-mono font-semibold ${
                        r.event_type.includes("completed")
                          ? "bg-emerald-950/60 text-emerald-300 border-emerald-800"
                          : r.event_type.includes("decision")
                          ? "bg-blue-950/60 text-blue-300 border-blue-800"
                          : "bg-zinc-900 text-zinc-300 border-zinc-700"
                      }`}
                    >
                      {r.event_type}
                    </span>
                  </td>
                  <td className="font-mono text-xs text-zinc-300">
                    {r.recovery_case_id ? `#${r.recovery_case_id}` : "—"}
                  </td>
                  <td className="text-xs text-zinc-200 font-medium">{r.message}</td>
                  <td className="text-xs font-mono text-zinc-400 max-w-xs truncate">
                    {r.details ? JSON.stringify(r.details) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
