"use client";
import { useState, useEffect, useRef } from "react";
import { adminApi, type AdminUser, type AdminUserDetail } from "@/lib/api/admin";
import { Pagination } from "../shared/Pagination";
import { motion, AnimatePresence } from "framer-motion";
import { NeonButton } from "@/components/ui/NeonButton";

interface Props {
  adminKey: string;
}

export function UsersTab({ adminKey }: Props) {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<AdminUserDetail | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const loadUsers = async (p: number = 1, q: string = "") => {
    setLoading(true);
    try {
      const result = await adminApi.listUsers(adminKey, {
        page: p,
        limit: 20,
        search: q || undefined,
      });
      setUsers(result.users);
      setPage(result.page);
      setPages(result.pages);
      setTotal(result.total);
    } catch (err) {
      console.error("Failed to load users:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (q: string) => {
    setSearch(q);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      loadUsers(1, q);
    }, 300);
  };

  const handleSelectUser = async (userId: string) => {
    setModalLoading(true);
    try {
      const detail = await adminApi.getUser(adminKey, userId);
      setSelectedUser(detail);
    } catch (err) {
      console.error("Failed to load user detail:", err);
    } finally {
      setModalLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [adminKey]);

  return (
    <div className="space-y-4">
      {/* Search */}
      <input
        type="text"
        placeholder="Search by email or name..."
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
        className="w-full p-3 rounded-lg border"
        style={{
          borderColor: "var(--cyber-border)",
          background: "var(--cyber-bg)",
          color: "var(--text-base)",
        }}
      />

      {/* Users Table */}
      {loading && !users.length ? (
        <div style={{ color: "var(--text-muted)" }}>Loading users...</div>
      ) : users.length === 0 ? (
        <div style={{ color: "var(--text-muted)" }}>No users found</div>
      ) : (
        <div
          className="cyber-card overflow-x-auto"
        >
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--cyber-border)" }}>
                <th className="px-4 py-3 text-left font-black" style={{ color: "var(--text-muted)" }}>Email</th>
                <th className="px-4 py-3 text-left font-black" style={{ color: "var(--text-muted)" }}>Name</th>
                <th className="px-4 py-3 text-left font-black" style={{ color: "var(--text-muted)" }}>Track</th>
                <th className="px-4 py-3 text-right font-black" style={{ color: "var(--text-muted)" }}>Questions</th>
                <th className="px-4 py-3 text-center font-black" style={{ color: "var(--text-muted)" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, i) => {
                const total = user.free_questions_remaining + user.paid_questions_balance + user.earned_questions_balance;
                return (
                  <tr
                    key={user.id}
                    style={{
                      borderBottom: i < users.length - 1 ? "1px solid var(--cyber-border)" : "none",
                    }}
                  >
                    <td className="px-4 py-3 text-xs" style={{ color: "var(--text-base)" }}>
                      {user.email}
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: "var(--text-base)" }}>
                      {user.name}
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: "var(--cyber-cyan)" }}>
                      {user.track === "law_school_track" ? "Law School" : "Undergrad"}
                    </td>
                    <td className="px-4 py-3 text-xs text-right font-mono" style={{ color: "var(--cyber-green)" }}>
                      {total}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleSelectUser(user.id)}
                        className="text-xs font-bold px-2 py-1 rounded border transition-colors"
                        style={{
                          borderColor: "var(--cyber-border)",
                          color: "var(--cyber-cyan)",
                        }}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <Pagination page={page} pages={pages} onPageChange={(p) => { setPage(p); loadUsers(p, search); }} />
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end"
            style={{ background: "rgba(0, 0, 0, 0.5)" }}
            onClick={() => setSelectedUser(null)}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              onClick={(e) => e.stopPropagation()}
              className="w-full sm:w-96 h-full flex flex-col"
              style={{
                background: "var(--cyber-bg)",
                borderLeft: "1px solid var(--cyber-border)",
              }}
            >
              <UserDetailModal
                user={selectedUser}
                adminKey={adminKey}
                onClose={() => setSelectedUser(null)}
                onUpdate={() => loadUsers(page, search)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function UserDetailModal({
  user,
  adminKey,
  onClose,
  onUpdate,
}: {
  user: AdminUserDetail;
  adminKey: string;
  onClose: () => void;
  onUpdate: () => void;
}) {
  const [balanceField, setBalanceField] = useState<"free_questions_remaining" | "paid_questions_balance">("paid_questions_balance");
  const [balanceDelta, setBalanceDelta] = useState(0);
  const [newRole, setNewRole] = useState(user.role);
  const [updating, setUpdating] = useState(false);

  const handleBalanceUpdate = async () => {
    setUpdating(true);
    try {
      await adminApi.updateBalance(adminKey, user.id, balanceField, balanceDelta);
      setBalanceDelta(0);
      onUpdate();
    } catch (err) {
      console.error("Failed to update balance:", err);
    } finally {
      setUpdating(false);
    }
  };

  const handleRoleUpdate = async () => {
    setUpdating(true);
    try {
      await adminApi.updateRole(adminKey, user.id, newRole);
      onUpdate();
    } catch (err) {
      console.error("Failed to update role:", err);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: "var(--cyber-border)" }}>
        <h3 className="font-black text-sm">{user.email}</h3>
        <button onClick={onClose} className="text-xl font-bold">×</button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Profile */}
        <div className="space-y-2">
          <p className="text-xs uppercase font-black" style={{ color: "var(--text-muted)" }}>Profile</p>
          <div className="space-y-1 text-xs">
            <p><span style={{ color: "var(--text-muted)" }}>Name:</span> {user.name}</p>
            <p><span style={{ color: "var(--text-muted)" }}>Role:</span> {user.role}</p>
            <p><span style={{ color: "var(--text-muted)" }}>Track:</span> {user.track}</p>
            <p><span style={{ color: "var(--text-muted)" }}>University:</span> {user.university || "—"}</p>
            <p><span style={{ color: "var(--text-muted)" }}>Joined:</span> {new Date(user.created_at).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Balance */}
        <div className="space-y-2">
          <p className="text-xs uppercase font-black" style={{ color: "var(--text-muted)" }}>Questions</p>
          <div className="space-y-1 text-xs">
            <p><span style={{ color: "var(--text-muted)" }}>Free:</span> <span style={{ color: "var(--cyber-cyan)" }}>{user.free_questions_remaining}</span></p>
            <p><span style={{ color: "var(--text-muted)" }}>Paid:</span> <span style={{ color: "var(--cyber-green)" }}>{user.paid_questions_balance}</span></p>
            <p><span style={{ color: "var(--text-muted)" }}>Earned:</span> <span style={{ color: "var(--cyber-purple)" }}>{user.earned_questions_balance}</span></p>
          </div>
        </div>

        {/* Recent Sessions */}
        {user.recent_sessions.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs uppercase font-black" style={{ color: "var(--text-muted)" }}>Last 10 Sessions</p>
            <div className="space-y-1 text-xs max-h-40 overflow-y-auto">
              {user.recent_sessions.map((s) => (
                <div key={s.id} style={{ color: "var(--text-muted)" }}>
                  {s.subject} • {s.score}% • {new Date(s.created_at).toLocaleDateString()}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="border-t px-4 py-4 space-y-3" style={{ borderColor: "var(--cyber-border)" }}>
        {/* Balance Adjustment */}
        <div className="space-y-2">
          <label className="text-xs font-black">Adjust Balance</label>
          <select
            value={balanceField}
            onChange={(e) => setBalanceField(e.target.value as any)}
            className="w-full p-2 text-xs rounded border"
            style={{ borderColor: "var(--cyber-border)", background: "var(--cyber-bg)", color: "var(--text-base)" }}
          >
            <option value="paid_questions_balance">Paid Questions</option>
            <option value="free_questions_remaining">Free Questions</option>
          </select>
          <div className="flex gap-2">
            <input
              type="number"
              value={balanceDelta}
              onChange={(e) => setBalanceDelta(Number(e.target.value))}
              placeholder="Amount"
              className="flex-1 p-2 text-xs rounded border"
              style={{ borderColor: "var(--cyber-border)", background: "var(--cyber-bg)", color: "var(--text-base)" }}
            />
            <NeonButton
              size="sm"
              variant="green"
              onClick={handleBalanceUpdate}
              disabled={updating || balanceDelta === 0}
            >
              Apply
            </NeonButton>
          </div>
        </div>

        {/* Role Update */}
        <div className="space-y-2">
          <label className="text-xs font-black">Change Role</label>
          <div className="flex gap-2">
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              className="flex-1 p-2 text-xs rounded border"
              style={{ borderColor: "var(--cyber-border)", background: "var(--cyber-bg)", color: "var(--text-base)" }}
            >
              <option value="law_student">Law Student</option>
              <option value="bar_student">Bar Student</option>
              <option value="admin">Admin</option>
            </select>
            <NeonButton
              size="sm"
              variant="purple"
              onClick={handleRoleUpdate}
              disabled={updating || newRole === user.role}
            >
              Update
            </NeonButton>
          </div>
        </div>
      </div>
    </div>
  );
}
