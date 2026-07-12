"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { QRCodeCanvas } from "qrcode.react";
import { Header, StatusBadge } from "@/components/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, Download, Eye, FileSpreadsheet, History, Printer, Search, XCircle } from "lucide-react";
import { useDispatches, useCompleteDispatch, useCancelDispatch } from "@/hooks/useDispatches";

const PAGE_SIZE = 8;

export default function DispatchHistoryPage() {
  const { data: dispatchesData, isLoading } = useDispatches({ limit: 100 });
  const completeDispatch = useCompleteDispatch();
  const cancelDispatch = useCancelDispatch();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [completeRecord, setCompleteRecord] = useState<any | null>(null);

  const filteredHistory = useMemo(() => {
    const history = dispatchesData?.items || [];
    const term = searchTerm.toLowerCase();
    return history.filter((dispatch) => {
      const matchesSearch = [dispatch.tripId, dispatch.driverName, dispatch.vehicleRegistration, dispatch.source, dispatch.destination]
        .some((value) => value?.toLowerCase().includes(term));
      return matchesSearch && (statusFilter === "all" || dispatch.tripStatus === statusFilter);
    });
  }, [dispatchesData?.items, searchTerm, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredHistory.length / PAGE_SIZE));
  const pageItems = filteredHistory.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPage(1);
  };

  const handleFilter = (value: string) => {
    setStatusFilter(value);
    setPage(1);
  };

  const getCanvas = (record: any) =>
    document.getElementById(`history-qr-${record.id}`) as HTMLCanvasElement | null;

  const downloadQR = (record: any) => {
    const canvas = getCanvas(record);
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `dispatch-${record.tripId}-qr.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const printDispatch = (record: any) => {
    const canvas = getCanvas(record);
    const printWindow = window.open("", "_blank", "width=560,height=700");
    if (!canvas || !printWindow) return;
    printWindow.document.write(`
      <html><head><title>Dispatch ${record.tripId}</title></head>
      <body style="font-family:Arial,sans-serif;padding:36px;color:#1e293b">
        <h2 style="color:#f97316">RoadKings Dispatch Pass</h2>
        <p><strong>Dispatch ID:</strong> ${record.tripId}</p>
        <p><strong>Driver:</strong> ${record.driverName}</p>
        <p><strong>Vehicle:</strong> ${record.vehicleRegistration}</p>
        <p><strong>Route:</strong> ${record.source} → ${record.destination}</p>
        <p><strong>Dispatch time:</strong> ${record.dispatchDate} ${record.dispatchTime}</p>
        <img src="${canvas.toDataURL("image/png")}" width="220" height="220" alt="Dispatch QR" />
      </body></html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const handleComplete = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!completeRecord) return;
    const data = new FormData(event.currentTarget);
    await completeDispatch.mutateAsync({
      id: completeRecord.id,
      data: {
        odometer: data.get("odometer") as string,
        fuel: data.get("fuel") as string,
        notes: data.get("notes") as string
      }
    });
    setCompleteRecord(null);
  };

  const handleCancel = async (record: any) => {
    if (!window.confirm(`Cancel dispatch ${record.tripId}? The driver and vehicle will be restored to Available.`)) return;
    await cancelDispatch.mutateAsync(record.id);
  };

  return (
    <>
      <Header title="Dispatch History" subtitle="View, audit, and manage smart dispatch records" />
      <div className="p-6 space-y-6">
        <Card className="rounded-xl border border-border bg-white shadow-sm ring-0">
          <CardHeader className="pb-4 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
              <History className="h-4 w-4 text-orange-500" />
              Dispatch Logs ({filteredHistory.length})
            </CardTitle>
            <div className="flex flex-col sm:flex-row gap-2 w-full xl:w-auto">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input value={searchTerm} onChange={(event) => handleSearch(event.target.value)} placeholder="Search dispatch history..." className="h-9 pl-9 text-sm bg-slate-50" />
              </div>
              <select value={statusFilter} onChange={(event) => handleFilter(event.target.value)} className="h-9 rounded-lg border border-border bg-white px-3 text-xs font-medium outline-none focus:ring-1 focus:ring-primary">
                <option value="all">All statuses</option>
                <option value="on-trip">On trip</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </CardHeader>
          <CardContent>
            {filteredHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                <FileSpreadsheet className="h-10 w-10 mb-2 stroke-1 text-slate-400" />
                <p className="text-sm font-medium">No dispatches found</p>
                <p className="text-xs mt-1">Try resetting the filters or launch a new dispatch.</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1050px] text-left border-collapse">
                    <thead><tr className="border-b border-border text-muted-foreground text-xs font-semibold">
                      <th className="pb-3 pt-1">Dispatch ID</th><th className="pb-3 pt-1">Driver</th><th className="pb-3 pt-1">Vehicle</th><th className="pb-3 pt-1">Source</th><th className="pb-3 pt-1">Destination</th><th className="pb-3 pt-1">Dispatch Time</th><th className="pb-3 pt-1">Status</th><th className="pb-3 pt-1 text-right">Actions</th>
                    </tr></thead>
                    <tbody className="divide-y divide-border">
                      {pageItems.map((record: any) => {
                        const qrPayload = JSON.stringify({ dispatchId: record.tripId, driverId: record.driverId, vehicleReg: record.vehicleRegistration, timestamp: record.createdAt });
                        const active = record.tripStatus === "on-trip";
                        return <tr key={record.id} className="text-sm hover:bg-slate-50/50">
                          <td className="py-3.5 font-semibold text-slate-800">{record.tripId}<QRCodeCanvas id={`history-qr-${record.id}`} value={qrPayload} size={240} className="hidden" /></td>
                          <td className="py-3.5 font-medium">{record.driverName}<span className="block text-xs text-muted-foreground">{record.driverId}</span></td>
                          <td className="py-3.5">{record.vehicleRegistration}</td><td className="py-3.5">{record.source}</td><td className="py-3.5">{record.destination}</td>
                          <td className="py-3.5 text-xs text-muted-foreground">{new Date(record.createdAt).toLocaleDateString()}<br />{new Date(record.createdAt).toLocaleTimeString()}</td>
                          <td className="py-3.5"><StatusBadge variant={record.tripStatus.replace("_", "-") as any} /></td>
                          <td className="py-3.5 text-right whitespace-nowrap space-x-1">
                            <Link href={`/verify-dispatch?id=${record.tripId}`} target="_blank"><Button size="sm" variant="outline" className="h-8 px-2 text-xs"><Eye className="h-3 w-3 mr-1" />View</Button></Link>
                            <Button size="sm" variant="outline" onClick={() => downloadQR(record)} className="h-8 px-2 text-xs"><Download className="h-3 w-3" /></Button>
                            <Button size="sm" variant="outline" onClick={() => printDispatch(record)} className="h-8 px-2 text-xs"><Printer className="h-3 w-3" /></Button>
                            {active && <><Button size="sm" onClick={() => setCompleteRecord(record)} className="h-8 px-2 text-xs bg-emerald-600 hover:bg-emerald-700"><CheckCircle className="h-3 w-3 mr-1" />Complete</Button><Button size="sm" variant="outline" onClick={() => handleCancel(record)} className="h-8 px-2 text-xs text-red-600 hover:text-red-700"><XCircle className="h-3 w-3 mr-1" />Cancel</Button></>}
                          </td>
                        </tr>;
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="flex items-center justify-between pt-4 text-xs text-muted-foreground">
                  <span>Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredHistory.length)} of {filteredHistory.length}</span>
                  <div className="flex gap-2"><Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage((current) => current - 1)}>Previous</Button><span className="self-center font-medium">Page {page} of {totalPages}</span><Button size="sm" variant="outline" disabled={page === totalPages} onClick={() => setPage((current) => current + 1)}>Next</Button></div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {completeRecord && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"><Card className="w-full max-w-md rounded-2xl shadow-2xl"><CardHeader><CardTitle className="text-base">Complete Trip</CardTitle></CardHeader><CardContent><form onSubmit={handleComplete} className="space-y-4"><div className="space-y-1.5"><Label>Final Odometer</Label><Input name="odometer" type="number" min="0" required placeholder="Odometer in km" /></div><div className="space-y-1.5"><Label>Fuel Used</Label><Input name="fuel" type="number" min="0" step="0.01" required placeholder="Litres used" /></div><div className="space-y-1.5"><Label>Notes</Label><Input name="notes" required placeholder="Completion notes" /></div><div className="flex justify-end gap-2 pt-2"><Button type="button" variant="outline" onClick={() => setCompleteRecord(null)}>Cancel</Button><Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">Complete Trip</Button></div></form></CardContent></Card></div>}
    </>
  );
}
