"use client";

import Link from "next/link";
import { useRef, useState } from "react";

type MeetingSummary = {
  id: string;
  title: string;
  date: string;
  count: number;
};

export default function ReportTools({
  meetings,
  exportParams,
}: {
  meetings: MeetingSummary[];
  exportParams: string;
}) {
  const [view, setView] = useState<"table" | "chart">("table");
  const [chartType, setChartType] = useState<"line" | "bar" | "pie">("line");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const chartRef = useRef<HTMLElement | null>(null);
  const visibleMeetings = selectedIds.length > 0 ? meetings.filter((meeting) => selectedIds.includes(meeting.id)) : meetings;
  const maxCount = Math.max(1, ...visibleMeetings.map((meeting) => meeting.count));
  const allSelected = meetings.length > 0 && meetings.every((meeting) => selectedIds.includes(meeting.id));
  const selectedExportParams = new URLSearchParams(exportParams);
  selectedExportParams.delete("meeting");
  selectedExportParams.delete("meetings");
  selectedExportParams.set("meetings", selectedIds.join(","));
  const selectedExportUrl = `/api/export/attendance?${selectedExportParams.toString()}`;

  function toggleMeeting(id: string) {
    setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  function toggleAllMeetings() {
    if (allSelected) {
      setSelectedIds([]);
      return;
    }
    setSelectedIds(meetings.map((meeting) => meeting.id));
  }

  function exportChart() {
    const svg = chartRef.current?.querySelector("svg");
    if (!svg) return;

    const source = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `attendance-${chartType}-chart.svg`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex rounded-md border border-gray-200 bg-white p-1" role="group" aria-label="Report view">
          <button type="button" onClick={() => setView("table")} className={`rounded px-3 py-1.5 text-sm font-semibold ${view === "table" ? "bg-maroon-700 text-white" : "text-gray-600"}`}>Table</button>
          <button type="button" onClick={() => setView("chart")} className={`rounded px-3 py-1.5 text-sm font-semibold ${view === "chart" ? "bg-maroon-700 text-white" : "text-gray-600"}`}>Charts</button>
        </div>
        <div className="flex flex-wrap gap-2">
          {view === "chart" && (
            <button type="button" onClick={exportChart} className="btn-secondary !px-4 !py-2 text-sm">Export chart</button>
          )}
          <a href={selectedIds.length > 0 ? selectedExportUrl : `/api/export/attendance?${exportParams}`} className="btn-primary !px-4 !py-2 text-sm">Export CSV</a>
        </div>
      </div>

      {view === "chart" && (
        <section ref={chartRef} className="card mt-6 p-6" aria-label="Attendance chart">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-xl font-bold text-maroon-800">Attendance by meeting</h2>
              <p className="mt-1 text-sm text-gray-500">Present check-ins for the selected filters.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Highest: {maxCount}</span>
              <div className="flex rounded-md border border-gray-200 bg-white p-1" role="group" aria-label="Chart type">
                <button type="button" onClick={() => setChartType("line")} className={`rounded px-2.5 py-1 text-xs font-semibold ${chartType === "line" ? "bg-maroon-700 text-white" : "text-gray-600"}`}>Line</button>
                <button type="button" onClick={() => setChartType("bar")} className={`rounded px-2.5 py-1 text-xs font-semibold ${chartType === "bar" ? "bg-maroon-700 text-white" : "text-gray-600"}`}>Bar</button>
                <button type="button" onClick={() => setChartType("pie")} className={`rounded px-2.5 py-1 text-xs font-semibold ${chartType === "pie" ? "bg-maroon-700 text-white" : "text-gray-600"}`}>Pie</button>
              </div>
            </div>
          </div>

          {visibleMeetings.length > 0 ? (
            chartType === "line" ? <LineChart meetings={visibleMeetings} maxCount={maxCount} /> : chartType === "bar" ? <BarChart meetings={visibleMeetings} maxCount={maxCount} /> : <PieChart meetings={visibleMeetings} />
          ) : <p className="mt-6 text-sm text-gray-500">No attendance data for this range.</p>}
        </section>
      )}

      {view === "table" && (
        <section className="card mt-6 overflow-x-auto">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-4 py-3">
            <div>
              <h2 className="font-semibold text-maroon-800">Choose meetings to export</h2>
              <p className="mt-1 text-xs text-gray-500">Select one or several meetings, or export all filtered meetings above.</p>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={toggleAllMeetings} className="btn-secondary !px-3 !py-1.5 text-xs">
                {allSelected ? "Clear selection" : "Select all"}
              </button>
            </div>
          </div>
          <table className="w-full min-w-[650px] text-left text-sm">
            <thead className="bg-gray-50 text-gray-700"><tr><th className="w-12 px-4 py-3">Select</th><th className="px-4 py-3">Meeting</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Present</th></tr></thead>
            <tbody className="divide-y divide-gray-100">
              {meetings.length > 0 ? meetings.map((meeting) => {
                return (
                  <tr key={meeting.id} className={selectedIds.includes(meeting.id) ? "bg-maroon-50/60" : undefined}>
                    <td className="px-4 py-3"><input type="checkbox" checked={selectedIds.includes(meeting.id)} onChange={() => toggleMeeting(meeting.id)} aria-label={`Select ${meeting.title}`} className="h-4 w-4 rounded border-gray-300 text-maroon-700 focus:ring-maroon-700" /></td>
                    <td className="px-4 py-3 font-medium text-gray-800">{meeting.title}</td>
                    <td className="px-4 py-3 text-gray-600">{meeting.date}</td>
                    <td className="px-4 py-3 text-gray-600">{meeting.count}</td>
                  </tr>
                );
              }) : <tr><td colSpan={4} className="px-4 py-6 text-center text-gray-500">No meetings found.</td></tr>}
            </tbody>
          </table>
        </section>
      )}
    </>
  );
}

function LineChart({ meetings, maxCount }: { meetings: MeetingSummary[]; maxCount: number }) {
  const width = 800;
  const height = 300;
  const padding = 32;
  const points = meetings.map((meeting, index) => {
    const x = meetings.length === 1 ? width / 2 : padding + (index / (meetings.length - 1)) * (width - padding * 2);
    const y = height - padding - (meeting.count / maxCount) * (height - padding * 2);
    return { ...meeting, x, y };
  });
  const path = points.map((point, index) => `${index === 0 ? "M" : "L"}${point.x},${point.y}`).join(" ");

  return (
    <div className="mt-6 overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Line chart of attendance by meeting" className="h-auto min-w-[620px] w-full">
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#d1d5db" />
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#d1d5db" />
        <path d={path} fill="none" stroke="#7f1d1d" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((point) => (
          <g key={point.id}>
            <circle cx={point.x} cy={point.y} r="6" fill="#d4a017" stroke="#7f1d1d" strokeWidth="2" />
            <text x={point.x} y={height - 10} textAnchor="middle" fontSize="11" fill="#4b5563">{point.date}</text>
            <title>{`${point.title}: ${point.count} present`}</title>
          </g>
        ))}
        <text x="8" y={padding + 4} fontSize="12" fill="#6b7280">{maxCount}</text>
        <text x="18" y={height - padding + 4} fontSize="12" fill="#6b7280">0</text>
      </svg>
    </div>
  );
}

function BarChart({ meetings, maxCount }: { meetings: MeetingSummary[]; maxCount: number }) {
  const chartHeight = 240;
  const barWidth = Math.max(42, 640 / Math.max(meetings.length, 1));

  return (
    <div className="mt-6 overflow-x-auto">
      <div className="flex min-w-[620px] items-end gap-4" style={{ height: `${chartHeight}px` }}>
        {meetings.map((meeting) => (
          <div key={meeting.id} className="flex flex-1 flex-col items-center justify-end gap-2">
            <span className="text-xs font-semibold text-maroon-700">{meeting.count}</span>
            <div className="flex w-full items-end justify-center rounded-t-md bg-maroon-700/90 px-1 shadow-sm" style={{ height: `${Math.max(10, (meeting.count / maxCount) * 180)}px`, width: `${barWidth}px` }} title={`${meeting.title}: ${meeting.count} present`} />
            <span className="max-w-[80px] text-center text-[10px] text-gray-500" title={meeting.title}>{meeting.date}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PieChart({ meetings }: { meetings: MeetingSummary[] }) {
  const colors = ["#7f1d1d", "#d4a017", "#0f766e", "#2563eb", "#9333ea", "#c2410c"];
  const total = meetings.reduce((sum, meeting) => sum + meeting.count, 0);
  let offset = 0;
  const slices = meetings.map((meeting, index) => {
    const percentage = total ? (meeting.count / total) * 100 : 0;
    const slice = { ...meeting, percentage, offset, color: colors[index % colors.length] };
    offset += percentage;
    return slice;
  });
  const gradient = slices.map((slice) => `${slice.color} ${slice.offset}% ${slice.offset + slice.percentage}%`).join(", ");

  return (
    <div className="mt-6 grid gap-8 md:grid-cols-[minmax(220px,280px)_1fr] md:items-center">
      <div className="mx-auto h-56 w-56 rounded-full border-8 border-white shadow-inner" style={{ background: `conic-gradient(${gradient})` }} role="img" aria-label="Pie chart of attendance by meeting" />
      <div className="space-y-3">
        {slices.map((slice) => (
          <div key={slice.id} className="flex items-center justify-between gap-4 text-sm">
            <span className="flex min-w-0 items-center gap-2 text-gray-700"><span className="h-3 w-3 flex-shrink-0 rounded-full" style={{ backgroundColor: slice.color }} /> <span className="truncate">{slice.title}</span></span>
            <span className="whitespace-nowrap font-semibold text-maroon-700">{slice.count} ({Math.round(slice.percentage)}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}
