import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Clock3,
  Filter,
  Layers3,
} from 'lucide-react';
import { BlockRequest, BlockStatus, Department, RailwayZoneCode, User } from '../types';
import { DEPARTMENT_CONFIG } from '../data/mockData';

interface GanttChartProps {
  currentUser: User;
  allRequests: BlockRequest[];
  activeZone?: RailwayZoneCode;
  onViewRequestDetail: (request: BlockRequest) => void;
}

type StatusFilter = 'ALL' | BlockStatus | 'OPTIMIZED';

const TIME_LABELS = Array.from({ length: 24 }, (_, index) => `${String(index).padStart(2, '0')}:00`);
const DEPARTMENTS: Array<'ALL' | Department> = ['ALL', 'ENGINEERING', 'ST', 'TRD'];
const STATUS_OPTIONS: Array<{ value: StatusFilter; label: string }> = [
  { value: 'ALL', label: 'All statuses' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'MODIFIED_APPROVED', label: 'Modified approved' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'OPTIMIZED', label: 'AI optimized' },
];

const timeToMinutes = (value: string): number => {
  const [hours, minutes] = (value || '00:00').split(':').map(Number);
  return (hours || 0) * 60 + (minutes || 0);
};

const normalizeSection = (value: string): string => {
  return (value || '').toLowerCase().replace(/section/g, '').replace(/[^a-z0-9]/g, '').trim();
};

const formatHours = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
};

const statusLabel = (status: BlockStatus): string => {
  if (status === 'MODIFIED_APPROVED') return 'Modified approved';
  return status.charAt(0) + status.slice(1).toLowerCase();
};

const statusClasses = (status: BlockStatus): string => {
  switch (status) {
    case 'APPROVED':
      return 'bg-emerald-500 border-emerald-700';
    case 'MODIFIED_APPROVED':
      return 'bg-blue-500 border-blue-700';
    case 'COMPLETED':
      return 'bg-teal-500 border-teal-700';
    case 'REJECTED':
      return 'bg-red-500 border-red-700';
    default:
      return 'bg-amber-400 border-amber-600';
  }
};

const departmentLabel = (department: Department): string => {
  if (department === 'ENGINEERING') return 'Engineering';
  if (department === 'ST') return 'S&T';
  return 'TRD';
};

export const GanttChart: React.FC<GanttChartProps> = ({
  currentUser,
  allRequests,
  activeZone = 'ALL',
  onViewRequestDetail,
}) => {
  const [selectedDepartment, setSelectedDepartment] = useState<'ALL' | Department>('ALL');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>('ALL');
  const [selectedSection, setSelectedSection] = useState('ALL');
  const [selectedPriority, setSelectedPriority] = useState('ALL');

  const scopedRequests = useMemo(() => {
    return allRequests.filter((request) => {
      if (currentUser.role !== 'SECTION_CONTROLLER' && request.department !== currentUser.department) return false;
      if (activeZone !== 'ALL' && request.zoneCode && request.zoneCode !== activeZone) return false;
      return true;
    });
  }, [allRequests, currentUser, activeZone]);

  const dates = useMemo(
    () => Array.from(new Set(scopedRequests.map((request) => request.requestedDate).filter(Boolean))).sort(),
    [scopedRequests]
  );
  const effectiveDate = selectedDate && dates.includes(selectedDate) ? selectedDate : dates[0] || selectedDate;

  const sections = useMemo(
    () => Array.from(new Set(scopedRequests.map((request) => request.section).filter(Boolean))).sort(),
    [scopedRequests]
  );

  const filteredRequests = useMemo(() => {
    return scopedRequests.filter((request) => {
      const matchesDepartment = selectedDepartment === 'ALL' || request.department === selectedDepartment;
      const matchesDate = request.requestedDate === effectiveDate;
      const matchesStatus =
        selectedStatus === 'ALL' ||
        (selectedStatus === 'OPTIMIZED' ? Boolean(request.aiOptimized) : request.status === selectedStatus);
      const matchesSection = selectedSection === 'ALL' || request.section === selectedSection;
      const matchesPriority = selectedPriority === 'ALL' || request.priority === selectedPriority;
      return matchesDepartment && matchesDate && matchesStatus && matchesSection && matchesPriority;
    });
  }, [scopedRequests, selectedDepartment, effectiveDate, selectedStatus, selectedSection, selectedPriority]);

  const conflictIds = useMemo(() => {
    const conflicts = new Set<string>();
    const pendingRequests = filteredRequests.filter((request) => request.status === 'PENDING');

    for (let index = 0; index < pendingRequests.length; index += 1) {
      for (let nextIndex = index + 1; nextIndex < pendingRequests.length; nextIndex += 1) {
        const left = pendingRequests[index];
        const right = pendingRequests[nextIndex];
        const leftSection = normalizeSection(left.section);
        const rightSection = normalizeSection(right.section);
        const sameSection =
          leftSection === rightSection ||
          leftSection.includes(rightSection) ||
          rightSection.includes(leftSection) ||
          (left.stationFrom && right.stationFrom &&
            left.stationFrom.toLowerCase().trim() === right.stationFrom.toLowerCase().trim() &&
            left.stationTo.toLowerCase().trim() === right.stationTo.toLowerCase().trim());
        if (!sameSection) continue;
        const leftStart = timeToMinutes(left.requestedStartTime);
        const rightStart = timeToMinutes(right.requestedStartTime);
        let leftEnd = timeToMinutes(left.requestedEndTime);
        let rightEnd = timeToMinutes(right.requestedEndTime);
        if (leftEnd <= leftStart) leftEnd += 1440;
        if (rightEnd <= rightStart) rightEnd += 1440;
        if (Math.max(leftStart, rightStart) < Math.min(leftEnd, rightEnd)) {
          conflicts.add(left.id);
          conflicts.add(right.id);
        }
      }
    }
    return conflicts;
  }, [filteredRequests]);

  const metrics = useMemo(() => {
    const totalMinutes = filteredRequests.reduce((sum, request) => sum + (request.durationMinutes || 0), 0);
    return {
      total: filteredRequests.length,
      active: filteredRequests.filter((request) => request.status === 'PENDING' || request.status === 'APPROVED' || request.status === 'MODIFIED_APPROVED').length,
      completed: filteredRequests.filter((request) => request.status === 'COMPLETED').length,
      conflicts: Array.from(conflictIds).length,
      totalMinutes,
    };
  }, [filteredRequests, conflictIds]);

  return (
    <section className="mb-6 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden" aria-labelledby="gantt-chart-title">
      <div className="border-b border-slate-200 bg-slate-50/80 px-4 py-4 sm:px-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#000075] text-white">
              <Layers3 className="h-5 w-5 text-amber-300" />
            </div>
            <div className="min-w-0">
              <h2 id="gantt-chart-title" className="text-base font-bold text-slate-900">Gantt Chart</h2>
              <p className="mt-0.5 text-xs text-slate-500">24-hour block schedule from live requisition data</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            <Metric label="Total blocks" value={metrics.total} />
            <Metric label="Active" value={metrics.active} />
            <Metric label="Completed" value={metrics.completed} />
            <Metric label="Conflicts" value={metrics.conflicts} warning={metrics.conflicts > 0} />
            <Metric label="Scheduled time" value={formatHours(metrics.totalMinutes)} wide />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5">
          <label className="text-[11px] font-semibold text-slate-500">
            Department
            <select value={selectedDepartment} onChange={(event) => setSelectedDepartment(event.target.value as 'ALL' | Department)} className="mt-1 w-full rounded border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-700">
              {DEPARTMENTS.map((department) => <option key={department} value={department}>{department === 'ALL' ? 'All departments' : departmentLabel(department)}</option>)}
            </select>
          </label>
          <label className="text-[11px] font-semibold text-slate-500">
            Date
            <select value={effectiveDate} onChange={(event) => setSelectedDate(event.target.value)} className="mt-1 w-full rounded border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-700">
              {dates.length === 0 ? <option value="">No dates available</option> : dates.map((date) => <option key={date} value={date}>{date}</option>)}
            </select>
          </label>
          <label className="text-[11px] font-semibold text-slate-500">
            Status
            <select value={selectedStatus} onChange={(event) => setSelectedStatus(event.target.value as StatusFilter)} className="mt-1 w-full rounded border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-700">
              {STATUS_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
          <label className="text-[11px] font-semibold text-slate-500">
            Section
            <select value={selectedSection} onChange={(event) => setSelectedSection(event.target.value)} className="mt-1 w-full rounded border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-700">
              <option value="ALL">All sections</option>
              {sections.map((section) => <option key={section} value={section}>{section}</option>)}
            </select>
          </label>
          <label className="text-[11px] font-semibold text-slate-500">
            Priority
            <select value={selectedPriority} onChange={(event) => setSelectedPriority(event.target.value)} className="mt-1 w-full rounded border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-700">
              <option value="ALL">All priorities</option>
              <option value="SAFETY_CRITICAL">Safety critical</option>
              <option value="URGENT">Urgent</option>
              <option value="ROUTINE_PLANNED">Routine planned</option>
            </select>
          </label>
        </div>
      </div>

      <div className="p-3 sm:p-5">
        <div className="mb-3 flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
          <span className="inline-flex items-center gap-1 font-semibold"><Filter className="h-3.5 w-3.5" /> Click a bar for details</span>
          <Legend color="bg-amber-400" label="Pending" />
          <Legend color="bg-emerald-500" label="Approved" />
          <Legend color="bg-blue-500" label="Modified" />
          <Legend color="bg-red-500" label="Rejected" />
          <Legend color="bg-teal-500" label="Completed" />
          <span className="inline-flex items-center gap-1"><AlertTriangle className="h-3.5 w-3.5 text-red-600" /> Conflict</span>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <div className="min-w-[1120px]">
            <div className="grid grid-cols-[250px_minmax(870px,1fr)] border-b border-slate-200 bg-slate-50">
              <div className="border-r border-slate-200 px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-slate-500">Block request</div>
              <div className="relative grid" style={{ gridTemplateColumns: 'repeat(24, minmax(0, 1fr))' }}>
                {TIME_LABELS.map((label) => <div key={label} className="border-r border-slate-200 px-1 py-2 text-center font-mono text-[10px] text-slate-500">{label}</div>)}
              </div>
            </div>

            {filteredRequests.length === 0 ? (
              <div className="px-4 py-10 text-center text-sm text-slate-500">No block requests match the selected filters.</div>
            ) : (
              filteredRequests.map((request) => <GanttRow key={request.id} request={request} hasConflict={conflictIds.has(request.id)} onViewRequestDetail={onViewRequestDetail} />)
            )}
          </div>
        </div>
        <p className="mt-2 text-[11px] text-slate-400">Timeline uses the current request window, or the approved/modified window when one exists. AI optimized requests retain their optimized schedule fields.</p>
      </div>
    </section>
  );
};

const Metric: React.FC<{ label: string; value: string | number; warning?: boolean; wide?: boolean }> = ({ label, value, warning, wide }) => (
  <div className={`rounded border px-2 py-1.5 ${warning ? 'border-red-200 bg-red-50' : 'border-slate-200 bg-white'} ${wide ? 'col-span-2 sm:col-span-1' : ''}`}>
    <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</div>
    <div className={`mt-0.5 text-sm font-bold ${warning ? 'text-red-700' : 'text-slate-900'}`}>{value}</div>
  </div>
);

const Legend: React.FC<{ color: string; label: string }> = ({ color, label }) => <span className="inline-flex items-center gap-1"><span className={`h-2.5 w-2.5 rounded-sm ${color}`} />{label}</span>;

const GanttRow: React.FC<{ request: BlockRequest; hasConflict: boolean; onViewRequestDetail: (request: BlockRequest) => void }> = ({ request, hasConflict, onViewRequestDetail }) => {
  const start = request.approvedStartTime || request.requestedStartTime || '00:00';
  const end = request.approvedEndTime || request.requestedEndTime || '01:00';
  const startMinutes = Math.max(0, Math.min(1440, timeToMinutes(start)));
  let endMinutes = timeToMinutes(end);
  if (endMinutes <= startMinutes) endMinutes += 1440;
  endMinutes = Math.min(1440, endMinutes);
  const left = (startMinutes / 1440) * 100;
  const width = Math.max(((endMinutes - startMinutes) / 1440) * 100, 1.5);
  const departmentConfig = DEPARTMENT_CONFIG[request.department];

  return (
    <div className="grid grid-cols-[250px_minmax(870px,1fr)] border-b border-slate-100 last:border-b-0">
      <button type="button" onClick={() => onViewRequestDetail(request)} className="min-w-0 border-r border-slate-200 bg-white px-3 py-2 text-left hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500">
        <div className="flex items-center gap-1.5">
          <span className={`h-2 w-2 shrink-0 rounded-full ${departmentConfig?.badgeBg || 'bg-slate-300'}`} />
          <span className="truncate font-mono text-xs font-bold text-blue-950">{request.id}</span>
          {request.aiOptimized && <span className="shrink-0 rounded bg-indigo-100 px-1 py-0.5 text-[9px] font-bold text-indigo-800">AI</span>}
        </div>
        <div className="mt-1 truncate text-[10px] text-slate-500">{departmentLabel(request.department)} · {request.section}</div>
        <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-500"><Clock3 className="h-3 w-3" />{start} - {end} · {request.durationMinutes || 0}m</div>
      </button>
      <div className="relative bg-white" style={{ backgroundImage: 'linear-gradient(to right, rgba(148,163,184,.18) 1px, transparent 1px)', backgroundSize: `${100 / 24}% 100%` }}>
        <button type="button" onClick={() => onViewRequestDetail(request)} aria-label={`Open ${request.id}`} className={`absolute top-3 h-8 min-w-[24px] rounded border px-2 text-left text-[10px] font-bold text-white shadow-sm transition hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-blue-500 ${statusClasses(request.status)} ${hasConflict ? 'ring-2 ring-red-600 ring-offset-1' : ''}`} style={{ left: `${left}%`, width: `${width}%` }}>
          <span className="block truncate">{statusLabel(request.status)}{request.aiOptimized ? ' · AI' : ''}</span>
        </button>
        {hasConflict && <div className="absolute right-1 top-1 text-red-600" title="Overlapping pending block"><AlertTriangle className="h-3.5 w-3.5" /></div>}
      </div>
    </div>
  );
};
