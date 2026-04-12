import { Building2, CalendarDays, Fingerprint, Layers3, ShieldCheck, TimerReset, Users2 } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import StatCard from "../common/StatCard";

const SECTION_ITEMS = [
  {
    label: "Employee Profile",
    href: "/employee-profile",
    match: ["/employee-profile"],
    icon: ShieldCheck,
  },
  {
    label: "Employee Master",
    href: "/employee-list",
    match: ["/employee-list"],
    icon: Users2,
  },
  {
    label: "Departments",
    href: "/hrm/departments",
    match: ["/hrm/departments"],
    icon: Building2,
  },
  {
    label: "Designations",
    href: "/hrm/designations",
    match: ["/hrm/designations"],
    icon: Layers3,
  },
  {
    label: "Shifts",
    href: "/hrm/shifts",
    match: ["/hrm/shifts"],
    icon: TimerReset,
  },
  {
    label: "Holidays",
    href: "/hrm/holidays",
    match: ["/hrm/holidays"],
    icon: CalendarDays,
  },
  {
    label: "Attendance Devices",
    href: "/hrm/attendance-devices",
    match: ["/hrm/attendance-devices"],
    icon: Fingerprint,
  },
  {
    label: "Enrollments",
    href: "/hrm/attendance-enrollments",
    match: ["/hrm/attendance-enrollments"],
    icon: Fingerprint,
  },
  {
    label: "Raw Logs",
    href: "/hrm/attendance-logs",
    match: ["/hrm/attendance-logs"],
    icon: TimerReset,
  },
  {
    label: "Summaries",
    href: "/hrm/attendance-summaries",
    match: ["/hrm/attendance-summaries"],
    icon: CalendarDays,
  },
  {
    label: "Regularizations",
    href: "/hrm/attendance-regularizations",
    match: ["/hrm/attendance-regularizations"],
    icon: ShieldCheck,
  },
  {
    label: "Leave Types",
    href: "/hrm/leave-types",
    match: ["/hrm/leave-types"],
    icon: CalendarDays,
  },
  {
    label: "Leave Requests",
    href: "/hrm/leave-requests",
    match: ["/hrm/leave-requests"],
    icon: Layers3,
  },
  {
    label: "Payroll Runs",
    href: "/hrm/payroll-runs",
    match: ["/hrm/payroll-runs"],
    icon: TimerReset,
  },
  {
    label: "Payslips",
    href: "/hrm/payslips",
    match: ["/hrm/payslips"],
    icon: Building2,
  },
];

const HrmWorkspace = ({
  eyebrow = "Phase 1",
  title,
  description,
  stats = [],
  children,
}) => {
  const { pathname } = useLocation();

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <div className="relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.14),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(99,102,241,0.12),_transparent_35%)]" />
          <div className="relative px-5 py-6 sm:px-7 sm:py-7">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">
                  <ShieldCheck size={14} />
                  {eyebrow}
                </div>
                <h2 className="mt-4 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                  {title}
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-[15px]">
                  {description}
                </p>
              </div>

              <div className="grid min-w-full grid-cols-1 gap-3 sm:grid-cols-2 xl:min-w-[420px] xl:grid-cols-2">
                {stats.map((stat) => (
                  <StatCard
                    key={stat.name}
                    name={stat.name}
                    value={stat.value}
                    icon={stat.icon}
                    iconBg={stat.iconBg}
                    iconColor={stat.iconColor}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-3 shadow-sm">
        <div className="mb-3 px-2 pt-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
          HRM Sections
        </div>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-13">
          {SECTION_ITEMS.map((item) => {
            const active = item.match.some((matchPath) => pathname.startsWith(matchPath));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                to={item.href}
                className={`group rounded-2xl border px-4 py-3 transition ${
                  active
                    ? "border-indigo-200 bg-indigo-50 text-indigo-700 shadow-sm"
                    : "border-slate-200 bg-slate-50/70 text-slate-600 hover:border-slate-300 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                      active ? "bg-white text-indigo-600" : "bg-white text-slate-500"
                    }`}
                  >
                    <Icon size={18} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold">{item.label}</div>
                    <div className="text-xs text-slate-400 group-hover:text-slate-500">
                      Open section
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {children}
    </div>
  );
};

export default HrmWorkspace;
