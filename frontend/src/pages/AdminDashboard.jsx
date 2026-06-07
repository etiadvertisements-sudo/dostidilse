import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { apiClient, fileToBase64 } from "@/lib/api";
import { LOGO_URL } from "@/lib/constants";
import {
  LogOut, Plus, Pencil, Trash2, Calendar, MapPin, Users,
  LayoutGrid, Heart, MessageSquare, Loader2, X, Camera, Wallet, UserCircle2, UserPlus,
} from "lucide-react";

const EMPTY_PROJECT = {
  title: "",
  description: "",
  status: "completed",
  date: new Date().toISOString().slice(0, 10),
  location: "",
  children_helped: "",
  image_base64: "",
};

function ProjectFormModal({ open, onClose, onSubmit, initial }) {
  const [form, setForm] = useState(EMPTY_PROJECT);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setForm({ ...EMPTY_PROJECT, ...(initial || {}) });
  }, [open, initial]);

  if (!open) return null;

  const onImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1_200_000) {
      toast.error("Image must be under 1.2 MB");
      return;
    }
    const dataUrl = await fileToBase64(file);
    setForm({ ...form, image_base64: dataUrl });
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        children_helped: form.children_helped === "" ? null : Number(form.children_helped),
        location: form.location || null,
        image_base64: form.image_base64 || null,
      };
      await onSubmit(payload);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Could not save project");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#2C3E42]/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-[1.75rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-[#EBE7E0] my-8">
        <div className="flex items-center justify-between p-6 border-b border-[#EBE7E0]">
          <h3 className="font-serif text-2xl text-[#2C3E42]">
            {initial?.id ? "Edit project" : "New project"}
          </h3>
          <button onClick={onClose} data-testid="close-project-modal" className="text-[#5C757B] hover:text-[#2C3E42]">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4" data-testid="project-form">
          <div>
            <label className="text-xs tracking-[0.22em] uppercase text-[#5C757B]">Title</label>
            <input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              data-testid="project-title"
              className="mt-2 w-full border border-[#EBE7E0] rounded-full px-5 py-3 outline-none focus:border-[#5A8896] bg-[#FDFBF7]"
            />
          </div>
          <div>
            <label className="text-xs tracking-[0.22em] uppercase text-[#5C757B]">Description</label>
            <textarea
              required
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              data-testid="project-description"
              className="mt-2 w-full border border-[#EBE7E0] rounded-3xl px-5 py-3 outline-none focus:border-[#5A8896] bg-[#FDFBF7] resize-none"
            />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs tracking-[0.22em] uppercase text-[#5C757B]">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                data-testid="project-status"
                className="mt-2 w-full border border-[#EBE7E0] rounded-full px-5 py-3 outline-none focus:border-[#5A8896] bg-[#FDFBF7]"
              >
                <option value="completed">Completed</option>
                <option value="upcoming">Upcoming</option>
              </select>
            </div>
            <div>
              <label className="text-xs tracking-[0.22em] uppercase text-[#5C757B]">Date</label>
              <input
                required
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                data-testid="project-date"
                className="mt-2 w-full border border-[#EBE7E0] rounded-full px-5 py-3 outline-none focus:border-[#5A8896] bg-[#FDFBF7]"
              />
            </div>
            <div>
              <label className="text-xs tracking-[0.22em] uppercase text-[#5C757B]">Location</label>
              <input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                data-testid="project-location"
                placeholder="e.g. Mumbai"
                className="mt-2 w-full border border-[#EBE7E0] rounded-full px-5 py-3 outline-none focus:border-[#5A8896] bg-[#FDFBF7]"
              />
            </div>
            <div>
              <label className="text-xs tracking-[0.22em] uppercase text-[#5C757B]">Children helped</label>
              <input
                type="number"
                min="0"
                value={form.children_helped}
                onChange={(e) => setForm({ ...form, children_helped: e.target.value })}
                data-testid="project-children"
                placeholder="e.g. 25"
                className="mt-2 w-full border border-[#EBE7E0] rounded-full px-5 py-3 outline-none focus:border-[#5A8896] bg-[#FDFBF7]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs tracking-[0.22em] uppercase text-[#5C757B]">Image</label>
            <div className="mt-2 flex items-center gap-4">
              {form.image_base64 ? (
                <img src={form.image_base64} alt="Preview" className="h-20 w-28 rounded-xl object-cover border border-[#EBE7E0]" />
              ) : (
                <div className="h-20 w-28 rounded-xl border-2 border-dashed border-[#EBE7E0] flex items-center justify-center text-[#5C757B]">
                  <Camera size={18} />
                </div>
              )}
              <label className="bg-transparent border border-[#5A8896]/60 text-[#5A8896] hover:bg-[#5A8896] hover:text-white px-5 py-2.5 rounded-full transition text-sm font-medium cursor-pointer">
                {form.image_base64 ? "Change" : "Upload"}
                <input type="file" accept="image/*" className="hidden" onChange={onImage} data-testid="project-image-input" />
              </label>
              {form.image_base64 && (
                <button type="button" onClick={() => setForm({ ...form, image_base64: "" })} className="text-sm text-[#5C757B] hover:text-[#2C3E42]">Remove</button>
              )}
            </div>
            <p className="mt-2 text-xs text-[#5C757B]">JPG/PNG · up to 1.2 MB</p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              data-testid="project-save"
              className="bg-[#5A8896] text-white hover:bg-[#46707C] disabled:opacity-70 px-6 py-3 rounded-full font-medium transition flex items-center gap-2"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : null}
              {initial?.id ? "Save changes" : "Create project"}
            </button>
            <button type="button" onClick={onClose} className="px-6 py-3 rounded-full border border-[#EBE7E0] text-[#5C757B] hover:bg-[#F2EFE9] transition">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ProjectsTab() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, initial: null });

  const load = () => {
    setLoading(true);
    apiClient.get("/projects").then((r) => setProjects(r.data || [])).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const create = async (p) => {
    await apiClient.post("/admin/projects", p);
    toast.success("Project created");
    load();
  };
  const update = async (p) => {
    await apiClient.put(`/admin/projects/${modal.initial.id}`, p);
    toast.success("Project updated");
    load();
  };
  const remove = async (id) => {
    if (!window.confirm("Delete this project? This cannot be undone.")) return;
    await apiClient.delete(`/admin/projects/${id}`);
    toast.success("Project deleted");
    load();
  };

  return (
    <div data-testid="admin-projects-tab">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="font-serif text-3xl text-[#2C3E42]">Projects</h2>
          <p className="text-sm text-[#5C757B] mt-1">Completed work shows on home + projects page. Upcoming shows on projects page.</p>
        </div>
        <button
          onClick={() => setModal({ open: true, initial: null })}
          data-testid="new-project-btn"
          className="bg-[#5A8896] text-white hover:bg-[#46707C] px-5 py-2.5 rounded-full font-medium transition inline-flex items-center gap-2"
        >
          <Plus size={16} /> New project
        </button>
      </div>
      {loading ? (
        <div className="text-center text-[#5C757B] py-10">Loading…</div>
      ) : projects.length === 0 ? (
        <div className="bg-white border border-[#EBE7E0] rounded-[1.5rem] p-10 text-center">
          <p className="text-[#5C757B]">No projects yet. Add the first one to start your story.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {projects.map((p) => (
            <div key={p.id} data-testid={`admin-project-${p.id}`} className="bg-white border border-[#EBE7E0] rounded-2xl p-5 flex gap-4">
              <div className="w-24 h-24 rounded-xl bg-[#F2EFE9] overflow-hidden flex-shrink-0">
                {p.image_base64 ? (
                  <img src={p.image_base64} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#D99F80]/40 font-serif text-sm">DDS</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-xs tracking-[0.18em] uppercase">
                  <span className={`px-2 py-0.5 rounded-full ${
                    p.status === "completed" ? "bg-[#5A8896]/10 text-[#5A8896]" : "bg-[#D99F80]/15 text-[#D99F80]"
                  }`}>{p.status}</span>
                  <span className="text-[#5C757B] flex items-center gap-1"><Calendar size={11} />{p.date}</span>
                </div>
                <h4 className="mt-1 font-serif text-lg text-[#2C3E42] truncate">{p.title}</h4>
                <p className="text-xs text-[#5C757B] line-clamp-2 mt-1">{p.description}</p>
                <div className="flex items-center gap-3 text-xs text-[#5C757B] mt-2">
                  {p.location && <span className="flex items-center gap-1"><MapPin size={11} />{p.location}</span>}
                  {p.children_helped != null && <span className="flex items-center gap-1"><Users size={11} />{p.children_helped}</span>}
                </div>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => setModal({ open: true, initial: p })} data-testid={`edit-project-${p.id}`} className="text-xs flex items-center gap-1 text-[#5A8896] hover:text-[#46707C]"><Pencil size={12} /> Edit</button>
                  <button onClick={() => remove(p.id)} data-testid={`delete-project-${p.id}`} className="text-xs flex items-center gap-1 text-[#C77373] hover:text-[#A05555]"><Trash2 size={12} /> Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <ProjectFormModal
        open={modal.open}
        initial={modal.initial}
        onClose={() => setModal({ open: false, initial: null })}
        onSubmit={modal.initial ? update : create}
      />
    </div>
  );
}

function DonationsTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    apiClient.get("/admin/donations").then((r) => setItems(r.data || [])).finally(() => setLoading(false));
  }, []);
  const formatINR = (n) => new Intl.NumberFormat("en-IN").format(n || 0);

  return (
    <div data-testid="admin-donations-tab">
      <h2 className="font-serif text-3xl text-[#2C3E42]">Donations</h2>
      <p className="text-sm text-[#5C757B] mt-1 mb-6">All contribution records — paid and pending.</p>
      {loading ? (
        <div className="text-center text-[#5C757B] py-10">Loading…</div>
      ) : items.length === 0 ? (
        <div className="bg-white border border-[#EBE7E0] rounded-[1.5rem] p-10 text-center"><p className="text-[#5C757B]">No donations yet.</p></div>
      ) : (
        <div className="bg-white border border-[#EBE7E0] rounded-[1.5rem] overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#F2EFE9]/60 text-[#5C757B] text-xs tracking-[0.18em] uppercase">
              <tr>
                <th className="px-5 py-3 text-left">Photo</th>
                <th className="px-5 py-3 text-left">Donor</th>
                <th className="px-5 py-3 text-left">Amount</th>
                <th className="px-5 py-3 text-left">Status</th>
                <th className="px-5 py-3 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {items.map((d) => (
                <tr key={d.id} data-testid={`donation-row-${d.id}`} className="border-t border-[#EBE7E0]">
                  <td className="px-5 py-3">
                    {d.photo_base64 ? (
                      <img src={d.photo_base64} alt="" className="h-10 w-10 rounded-full object-cover" />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-[#F2EFE9]" />
                    )}
                  </td>
                  <td className="px-5 py-3"><div className="font-medium text-[#2C3E42]">{d.name}</div><div className="text-xs text-[#5C757B]">{d.email}</div></td>
                  <td className="px-5 py-3 font-serif text-lg text-[#2C3E42]">₹{formatINR(d.amount)}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs ${
                      d.status === "paid" ? "bg-[#5A8896]/10 text-[#5A8896]" :
                      d.status === "failed" ? "bg-[#C77373]/15 text-[#C77373]" :
                      "bg-[#D99F80]/15 text-[#D99F80]"
                    }`}>{d.status}</span>
                  </td>
                  <td className="px-5 py-3 text-[#5C757B] text-xs">{new Date(d.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function MessagesTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    apiClient.get("/admin/contact").then((r) => setItems(r.data || [])).finally(() => setLoading(false));
  }, []);

  return (
    <div data-testid="admin-messages-tab">
      <h2 className="font-serif text-3xl text-[#2C3E42]">Messages</h2>
      <p className="text-sm text-[#5C757B] mt-1 mb-6">Contact form submissions from the website.</p>
      {loading ? (
        <div className="text-center text-[#5C757B] py-10">Loading…</div>
      ) : items.length === 0 ? (
        <div className="bg-white border border-[#EBE7E0] rounded-[1.5rem] p-10 text-center"><p className="text-[#5C757B]">No messages yet.</p></div>
      ) : (
        <div className="space-y-4">
          {items.map((m) => (
            <div key={m.id} data-testid={`message-${m.id}`} className="bg-white border border-[#EBE7E0] rounded-2xl p-5">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <div className="font-medium text-[#2C3E42]">{m.name}</div>
                  <a href={`mailto:${m.email}`} className="text-xs text-[#5A8896] hover:underline">{m.email}</a>
                </div>
                <div className="text-xs text-[#5C757B]">{new Date(m.created_at).toLocaleString()}</div>
              </div>
              <p className="mt-3 text-sm text-[#2C3E42] leading-relaxed whitespace-pre-wrap">{m.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const EMPTY_MEMBER = { name: "", role: "", bio: "", photo_base64: "", order: 0 };

function TeamMemberModal({ open, onClose, onSubmit, initial }) {
  const [form, setForm] = useState(EMPTY_MEMBER);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setForm({ ...EMPTY_MEMBER, ...(initial || {}) });
  }, [open, initial]);

  if (!open) return null;

  const onImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1_200_000) {
      toast.error("Photo must be under 1.2 MB");
      return;
    }
    const dataUrl = await fileToBase64(file);
    setForm({ ...form, photo_base64: dataUrl });
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit({
        ...form,
        photo_base64: form.photo_base64 || null,
        order: Number(form.order) || 0,
      });
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Could not save team member");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#2C3E42]/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-[1.75rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-[#EBE7E0] my-8">
        <div className="flex items-center justify-between p-6 border-b border-[#EBE7E0]">
          <h3 className="font-serif text-2xl text-[#2C3E42]">
            {initial?.id ? "Edit team member" : "New team member"}
          </h3>
          <button onClick={onClose} data-testid="close-member-modal" className="text-[#5C757B] hover:text-[#2C3E42]">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4" data-testid="team-form">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs tracking-[0.22em] uppercase text-[#5C757B]">Name</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                data-testid="member-name"
                className="mt-2 w-full border border-[#EBE7E0] rounded-full px-5 py-3 outline-none focus:border-[#5A8896] bg-[#FDFBF7]"
              />
            </div>
            <div>
              <label className="text-xs tracking-[0.22em] uppercase text-[#5C757B]">Role</label>
              <input
                required
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                data-testid="member-role"
                placeholder="e.g. Field Lead, Volunteer Coordinator"
                className="mt-2 w-full border border-[#EBE7E0] rounded-full px-5 py-3 outline-none focus:border-[#5A8896] bg-[#FDFBF7]"
              />
            </div>
          </div>
          <div>
            <label className="text-xs tracking-[0.22em] uppercase text-[#5C757B]">Short bio</label>
            <textarea
              required
              rows={4}
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              data-testid="member-bio"
              placeholder="A sentence or two about this person and what drives them."
              className="mt-2 w-full border border-[#EBE7E0] rounded-3xl px-5 py-3 outline-none focus:border-[#5A8896] bg-[#FDFBF7] resize-none"
            />
          </div>
          <div>
            <label className="text-xs tracking-[0.22em] uppercase text-[#5C757B]">Order (lower shows first)</label>
            <input
              type="number"
              value={form.order}
              onChange={(e) => setForm({ ...form, order: e.target.value })}
              data-testid="member-order"
              className="mt-2 w-full md:w-40 border border-[#EBE7E0] rounded-full px-5 py-3 outline-none focus:border-[#5A8896] bg-[#FDFBF7]"
            />
          </div>
          <div>
            <label className="text-xs tracking-[0.22em] uppercase text-[#5C757B]">Photo</label>
            <div className="mt-2 flex items-center gap-4">
              {form.photo_base64 ? (
                <img src={form.photo_base64} alt="Preview" className="h-24 w-24 rounded-full object-cover border border-[#EBE7E0]" />
              ) : (
                <div className="h-24 w-24 rounded-full border-2 border-dashed border-[#EBE7E0] flex items-center justify-center text-[#5C757B]">
                  <Camera size={20} />
                </div>
              )}
              <label className="bg-transparent border border-[#5A8896]/60 text-[#5A8896] hover:bg-[#5A8896] hover:text-white px-5 py-2.5 rounded-full transition text-sm font-medium cursor-pointer">
                {form.photo_base64 ? "Change" : "Upload"}
                <input type="file" accept="image/*" className="hidden" onChange={onImage} data-testid="member-photo-input" />
              </label>
              {form.photo_base64 && (
                <button type="button" onClick={() => setForm({ ...form, photo_base64: "" })} className="text-sm text-[#5C757B] hover:text-[#2C3E42]">Remove</button>
              )}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              data-testid="member-save"
              className="bg-[#5A8896] text-white hover:bg-[#46707C] disabled:opacity-70 px-6 py-3 rounded-full font-medium transition flex items-center gap-2"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : null}
              {initial?.id ? "Save changes" : "Add member"}
            </button>
            <button type="button" onClick={onClose} className="px-6 py-3 rounded-full border border-[#EBE7E0] text-[#5C757B] hover:bg-[#F2EFE9] transition">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TeamTab() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, initial: null });

  const load = () => {
    setLoading(true);
    apiClient.get("/team").then((r) => setMembers(r.data || [])).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const create = async (p) => {
    await apiClient.post("/admin/team", p);
    toast.success("Team member added");
    load();
  };
  const update = async (p) => {
    await apiClient.put(`/admin/team/${modal.initial.id}`, p);
    toast.success("Team member updated");
    load();
  };
  const remove = async (id) => {
    if (!window.confirm("Remove this team member?")) return;
    await apiClient.delete(`/admin/team/${id}`);
    toast.success("Removed");
    load();
  };

  return (
    <div data-testid="admin-team-tab">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="font-serif text-3xl text-[#2C3E42]">Core Team</h2>
          <p className="text-sm text-[#5C757B] mt-1">People who make this foundation run. Shown in the carousel on home.</p>
        </div>
        <button
          onClick={() => setModal({ open: true, initial: null })}
          data-testid="new-member-btn"
          className="bg-[#5A8896] text-white hover:bg-[#46707C] px-5 py-2.5 rounded-full font-medium transition inline-flex items-center gap-2"
        >
          <Plus size={16} /> Add member
        </button>
      </div>
      {loading ? (
        <div className="text-center text-[#5C757B] py-10">Loading…</div>
      ) : members.length === 0 ? (
        <div className="bg-white border border-[#EBE7E0] rounded-[1.5rem] p-10 text-center">
          <p className="text-[#5C757B]">No team members yet. Add your first one.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((m) => (
            <div key={m.id} data-testid={`admin-member-${m.id}`} className="bg-white border border-[#EBE7E0] rounded-2xl p-5 flex gap-4">
              <div className="w-16 h-16 rounded-full bg-[#F2EFE9] overflow-hidden flex-shrink-0">
                {m.photo_base64 ? (
                  <img src={m.photo_base64} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#D99F80]/40">
                    <UserCircle2 size={24} />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs tracking-[0.18em] uppercase text-[#D99F80]">{m.role}</div>
                <div className="font-serif text-lg text-[#2C3E42] truncate">{m.name}</div>
                <p className="text-xs text-[#5C757B] line-clamp-2 mt-1">{m.bio}</p>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => setModal({ open: true, initial: m })} data-testid={`edit-member-${m.id}`} className="text-xs flex items-center gap-1 text-[#5A8896] hover:text-[#46707C]"><Pencil size={12} /> Edit</button>
                  <button onClick={() => remove(m.id)} data-testid={`delete-member-${m.id}`} className="text-xs flex items-center gap-1 text-[#C77373] hover:text-[#A05555]"><Trash2 size={12} /> Remove</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <TeamMemberModal
        open={modal.open}
        initial={modal.initial}
        onClose={() => setModal({ open: false, initial: null })}
        onSubmit={modal.initial ? update : create}
      />
    </div>
  );
}

function CoordinatorsTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");
  const [busyId, setBusyId] = useState(null);
  const [openId, setOpenId] = useState(null);

  const load = () => {
    setLoading(true);
    const q = filter === "all" ? "" : `?status=${filter}`;
    apiClient.get(`/admin/coordinators${q}`).then((r) => setItems(r.data || [])).finally(() => setLoading(false));
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [filter]);

  const approve = async (id) => {
    setBusyId(id);
    try {
      await apiClient.post(`/admin/coordinators/${id}/approve`);
      toast.success("Approved. Welcome email sent.");
      load();
    } catch (e) {
      toast.error(e.response?.data?.detail || "Could not approve");
    } finally { setBusyId(null); }
  };
  const reject = async (id) => {
    if (!window.confirm("Reject this application? They will not be notified by email.")) return;
    setBusyId(id);
    try {
      await apiClient.post(`/admin/coordinators/${id}/reject`);
      toast.success("Application rejected");
      load();
    } catch (e) {
      toast.error(e.response?.data?.detail || "Could not reject");
    } finally { setBusyId(null); }
  };
  const remove = async (id) => {
    if (!window.confirm("Delete this application permanently?")) return;
    setBusyId(id);
    try {
      await apiClient.delete(`/admin/coordinators/${id}`);
      toast.success("Deleted");
      load();
    } catch (e) {
      toast.error(e.response?.data?.detail || "Could not delete");
    } finally { setBusyId(null); }
  };

  const filters = [
    { key: "pending", label: "Pending" },
    { key: "approved", label: "Approved" },
    { key: "rejected", label: "Rejected" },
    { key: "all", label: "All" },
  ];

  const statusPill = (s) => {
    const map = {
      pending: "bg-[#D99F80]/15 text-[#D99F80]",
      approved: "bg-[#5A8896]/10 text-[#5A8896]",
      rejected: "bg-[#C77373]/15 text-[#C77373]",
    };
    return <span className={`px-2.5 py-0.5 rounded-full text-xs ${map[s] || ""}`}>{s}</span>;
  };

  return (
    <div data-testid="admin-coordinators-tab">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <div>
          <h2 className="font-serif text-3xl text-[#2C3E42]">Coordinator Applications</h2>
          <p className="text-sm text-[#5C757B] mt-1">Approve to send a welcome-to-the-family email. Rejecting is silent.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {filters.map((f) => (
            <button
              key={f.key}
              data-testid={`coord-filter-${f.key}`}
              onClick={() => setFilter(f.key)}
              className={`text-sm px-4 py-2 rounded-full transition ${
                filter === f.key ? "bg-[#5A8896] text-white" : "bg-white border border-[#EBE7E0] text-[#5C757B] hover:border-[#5A8896]/50"
              }`}
            >{f.label}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center text-[#5C757B] py-10">Loading…</div>
      ) : items.length === 0 ? (
        <div className="bg-white border border-[#EBE7E0] rounded-[1.5rem] p-10 text-center">
          <p className="text-[#5C757B]">No applications in this view.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((c) => {
            const isOpen = openId === c.id;
            return (
              <div key={c.id} data-testid={`coord-row-${c.id}`} className="bg-white border border-[#EBE7E0] rounded-2xl p-5">
                <div className="flex gap-4 items-start">
                  <div className="w-14 h-14 rounded-full bg-[#F2EFE9] overflow-hidden flex-shrink-0">
                    {c.photo_base64 ? (
                      <img src={c.photo_base64} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#D99F80]/60"><UserCircle2 size={24} /></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-[#2C3E42]">{c.name}</span>
                      {statusPill(c.status)}
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[#F2EFE9] text-[#5C757B] uppercase tracking-wider">
                        {c.role_preference === "city" ? "City coord." : "State coord."}
                      </span>
                    </div>
                    <div className="text-xs text-[#5C757B] mt-1 flex items-center gap-3 flex-wrap">
                      <span><MapPin size={11} className="inline mr-1" />{c.city}, {c.state}</span>
                      <span>{c.email}</span>
                      <span>{c.phone}</span>
                      <span>{c.monthly_hours}h/month</span>
                      <span>{new Date(c.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap justify-end">
                    {c.status === "pending" && (
                      <>
                        <button onClick={() => approve(c.id)} disabled={busyId === c.id} data-testid={`coord-approve-${c.id}`}
                          className="text-xs bg-[#5A8896] text-white hover:bg-[#46707C] px-4 py-1.5 rounded-full disabled:opacity-60">Approve</button>
                        <button onClick={() => reject(c.id)} disabled={busyId === c.id} data-testid={`coord-reject-${c.id}`}
                          className="text-xs border border-[#EBE7E0] text-[#5C757B] hover:text-[#C77373] hover:border-[#C77373] px-4 py-1.5 rounded-full disabled:opacity-60">Reject</button>
                      </>
                    )}
                    <button onClick={() => setOpenId(isOpen ? null : c.id)} data-testid={`coord-toggle-${c.id}`}
                      className="text-xs border border-[#EBE7E0] text-[#5C757B] hover:text-[#2C3E42] px-4 py-1.5 rounded-full">
                      {isOpen ? "Hide" : "View"}
                    </button>
                    <button onClick={() => remove(c.id)} disabled={busyId === c.id} data-testid={`coord-delete-${c.id}`}
                      className="text-xs flex items-center gap-1 text-[#C77373] hover:text-[#A05555] px-3 py-1.5 disabled:opacity-60"><Trash2 size={12} /></button>
                  </div>
                </div>

                {isOpen && (
                  <div className="mt-5 pt-5 border-t border-[#EBE7E0] grid md:grid-cols-2 gap-5 text-sm">
                    <Detail label="Occupation">{c.occupation || "—"}</Detail>
                    <Detail label="Age">{c.age ?? "—"}</Detail>
                    <Detail label="Profile link">
                      {c.profile_url ? <a href={c.profile_url} target="_blank" rel="noreferrer" className="text-[#5A8896] hover:underline break-all">{c.profile_url}</a> : "—"}
                    </Detail>
                    <Detail label="Heard about us">{c.referral_source || "—"}</Detail>
                    <Detail label="Why they want to join" full>
                      <p className="text-[#2C3E42] leading-relaxed whitespace-pre-wrap">{c.why_join}</p>
                    </Detail>
                    <Detail label="Impact they want to make" full>
                      <p className="text-[#2C3E42] leading-relaxed whitespace-pre-wrap">{c.impact_goal}</p>
                    </Detail>
                    {c.past_experience && (
                      <Detail label="Past experience" full>
                        <p className="text-[#2C3E42] leading-relaxed whitespace-pre-wrap">{c.past_experience}</p>
                      </Detail>
                    )}
                    {c.decided_at && (
                      <Detail label="Decided at">{new Date(c.decided_at).toLocaleString()}</Detail>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Detail({ label, children, full }) {
  return (
    <div className={full ? "md:col-span-2" : ""}>
      <div className="text-[10px] tracking-[0.22em] uppercase text-[#5C757B] mb-1">{label}</div>
      <div className="text-sm text-[#2C3E42]">{children}</div>
    </div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("projects");
  const email = typeof window !== "undefined" ? localStorage.getItem("ddls_admin_email") : null;

  useEffect(() => {
    const token = localStorage.getItem("ddls_admin_token");
    if (!token) {
      navigate("/admin/login");
      return;
    }
    // Verify token
    apiClient.get("/admin/me").catch(() => navigate("/admin/login"));
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem("ddls_admin_token");
    localStorage.removeItem("ddls_admin_email");
    navigate("/admin/login");
  };

  const tabs = [
    { key: "projects", label: "Projects", icon: LayoutGrid },
    { key: "team", label: "Team", icon: UserCircle2 },
    { key: "coordinators", label: "Coordinators", icon: UserPlus },
    { key: "donations", label: "Donations", icon: Wallet },
    { key: "messages", label: "Messages", icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans" data-testid="admin-dashboard">
      <header className="bg-white border-b border-[#EBE7E0]">
        <div className="ddls-container py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={LOGO_URL} alt="Dosti Dil Se" className="h-10 w-10 rounded-full border border-[#EBE7E0]" />
            <div>
              <div className="font-serif text-lg text-[#2C3E42]">Admin</div>
              <div className="text-[10px] tracking-[0.22em] uppercase text-[#5C757B]">{email}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a href="/" className="text-sm text-[#5C757B] hover:text-[#2C3E42] transition">View site</a>
            <button onClick={logout} data-testid="admin-logout" className="flex items-center gap-2 text-sm text-[#5C757B] hover:text-[#2C3E42] border border-[#EBE7E0] px-4 py-2 rounded-full">
              <LogOut size={14} /> Log out
            </button>
          </div>
        </div>
      </header>

      <div className="ddls-container py-10">
        <div className="flex gap-2 mb-8 flex-wrap">
          {tabs.map((t) => {
            const I = t.icon;
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                data-testid={`tab-${t.key}`}
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm transition ${
                  active
                    ? "bg-[#5A8896] text-white shadow-sm"
                    : "bg-white border border-[#EBE7E0] text-[#5C757B] hover:border-[#5A8896]/50"
                }`}
              >
                <I size={14} /> {t.label}
              </button>
            );
          })}
        </div>

        {tab === "projects" && <ProjectsTab />}
        {tab === "team" && <TeamTab />}
        {tab === "coordinators" && <CoordinatorsTab />}
        {tab === "donations" && <DonationsTab />}
        {tab === "messages" && <MessagesTab />}
      </div>
    </div>
  );
}
