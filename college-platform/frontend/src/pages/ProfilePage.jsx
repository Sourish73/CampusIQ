import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Check, CircleUserRound, Mail, Phone, MapPin, CalendarDays, GraduationCap, Home, School, Brain, Building2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { authAPI } from "../api/axios";

const DEFAULT_PROFILE = {
  name: "",
  address: "",
  marks10: "",
  marks12: "",
  schoolName: "",
  dob: "",
  email: "",
  age: "",
  location: "",
  dropper: "No",
  stream: "PCM",
  mobile: "",
  preferredExam: "JEE Main",
  preferredCollege: "",
};

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState(DEFAULT_PROFILE);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setForm({
      ...DEFAULT_PROFILE,
      ...(user?.profile_data || {}),
      name: user?.name || user?.profile_data?.name || "",
      email: user?.email || user?.profile_data?.email || "",
    });
  }, [user]);

  const update = (key, value) => {
    setSaved(false);
    setError("");
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError("");

    try {
      const payload = {
        ...form,
        name: form.name.trim(),
        email: form.email.trim(),
      };
      const { data } = await authAPI.updateMe(payload);
      if (data.success) {
        updateUser({
          name: data.data.user.name,
          email: data.data.user.email,
          profile_data: data.data.user.profile_data || payload,
        });
        setSaved(true);
      } else {
        setError(data.message || "Could not save profile.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Could not save profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-pink-100/20">
      <section className="border-b border-pink-200/80 bg-gradient-to-br from-pink-100/50 via-pink-200/30 to-rose-300/35 py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between gap-4 mb-5">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-pink-200 text-pink-900 text-xs font-semibold shadow-sm">
              <CircleUserRound size={12} /> Student Profile
            </div>
            <Link to="/" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-semibold text-xs shadow-md transition-all">
              ← Back to Home Page
            </Link>
          </div>
          <h1 className="font-display text-4xl text-[var(--text-primary)] mb-3">
            Build your <span className="gradient-text">admission profile</span>
          </h1>
          <p className="text-[var(--text-secondary)] max-w-2xl">
            Save your basics once and keep them synced to your account for predictions, shortlist planning, and college matching.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <form onSubmit={handleSubmit} className="card p-6 md:p-8 space-y-6 animate-fsu">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Full Name" icon={UserIcon}>
              <input className="input-field" value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Your name" />
            </Field>
            <Field label="Email" icon={Mail}>
              <input className="input-field" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="you@example.com" />
            </Field>
            <Field label="Mobile Number" icon={Phone}>
              <input className="input-field" value={form.mobile} onChange={(e) => update("mobile", e.target.value)} placeholder="10-digit mobile number" />
            </Field>
            <Field label="Date of Birth" icon={CalendarDays}>
              <input className="input-field" type="date" value={form.dob} onChange={(e) => update("dob", e.target.value)} />
            </Field>
            <Field label="Age" icon={CircleUserRound}>
              <input className="input-field" type="number" min="1" value={form.age} onChange={(e) => update("age", e.target.value)} placeholder="Age" />
            </Field>
            <Field label="Location" icon={MapPin}>
              <input className="input-field" value={form.location} onChange={(e) => update("location", e.target.value)} placeholder="City, state" />
            </Field>
            <Field label="School Name" icon={School}>
              <input className="input-field" value={form.schoolName} onChange={(e) => update("schoolName", e.target.value)} placeholder="Your school" />
            </Field>
            <Field label="Address" icon={Home}>
              <input className="input-field" value={form.address} onChange={(e) => update("address", e.target.value)} placeholder="Full address" />
            </Field>
            <Field label="10th Marks" icon={GraduationCap}>
              <input className="input-field" value={form.marks10} onChange={(e) => update("marks10", e.target.value)} placeholder="e.g. 92%" />
            </Field>
            <Field label="12th Marks" icon={GraduationCap}>
              <input className="input-field" value={form.marks12} onChange={(e) => update("marks12", e.target.value)} placeholder="e.g. 89%" />
            </Field>
            <Field label="Dropper" icon={Building2}>
              <select className="input-field appearance-none" value={form.dropper} onChange={(e) => update("dropper", e.target.value)}>
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </Field>
            <Field label="Stream" icon={GraduationCap}>
              <select className="input-field appearance-none" value={form.stream} onChange={(e) => update("stream", e.target.value)}>
                <option value="PCM">PCM</option>
                <option value="PCB">PCB</option>
                <option value="Commerce">Commerce</option>
                <option value="Arts">Arts</option>
              </select>
            </Field>
            <Field label="Preferred Exam" icon={Brain}>
              <select className="input-field appearance-none" value={form.preferredExam} onChange={(e) => update("preferredExam", e.target.value)}>
                <option value="JEE Main">JEE Main</option>
                <option value="JEE Advanced">JEE Advanced</option>
                <option value="NEET">NEET</option>
                <option value="VITEEE">VITEEE</option>
                <option value="MHT CET">MHT CET</option>
                <option value="COMEDK UGET">COMEDK UGET</option>
                <option value="CUET">CUET</option>
              </select>
            </Field>
            <Field label="Preferred College" icon={Building2}>
              <input className="input-field" value={form.preferredCollege} onChange={(e) => update("preferredCollege", e.target.value)} placeholder="Dream college" />
            </Field>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
            <p className="text-sm text-[var(--text-muted)]">
              Saved details are attached to your account, so they stay available on any device where you sign in.
            </p>
            <button type="submit" className="btn-primary" disabled={saving}>
              <Check size={14} /> {saving ? "Saving..." : "Save Profile"}
            </button>
          </div>

          {saved && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              Profile saved to your account.
            </div>
          )}

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

function Field({ label, icon: Icon, children }) {
  return (
    <label className="block">
      <span className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
        <Icon size={13} className="text-brand-700" /> {label}
      </span>
      {children}
    </label>
  );
}

function UserIcon(props) {
  return <CircleUserRound {...props} />;
}
