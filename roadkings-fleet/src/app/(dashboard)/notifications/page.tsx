"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, Inbox, AlertTriangle, CheckCircle, Info } from "lucide-react";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const list = localStorage.getItem("dispatchNotifications");
    if (list) {
      setNotifications(JSON.parse(list));
    } else {
      const initial = [
        { id: "1", title: "New Dispatch Request", message: "Trip request TRP-1025 awaiting QR code generation.", time: "5 min ago", type: "info" },
        { id: "2", title: "Driver Checked-In", message: "Amit Singh successfully verified via QR code.", time: "18 min ago", type: "success" },
        { id: "3", title: "Delay Alert", message: "Vikas Meena reported heavy traffic on Pune highway.", time: "1h ago", type: "warning" },
      ];
      setNotifications(initial);
      localStorage.setItem("dispatchNotifications", JSON.stringify(initial));
    }
  }, []);

  const clearAll = () => {
    setNotifications([]);
    localStorage.setItem("dispatchNotifications", JSON.stringify([]));
  };

  return (
    <>
      <Header title="Notifications" subtitle="System notifications, alerts, and check-in logs for Dispatch" />
      <div className="p-6 space-y-6">
        <Card className="rounded-xl border border-border bg-white shadow-sm ring-0">
          <CardHeader className="pb-4 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
              <Bell className="h-4 w-4 text-orange-500" />
              Recent Notifications ({notifications.length})
            </CardTitle>
            {notifications.length > 0 && (
              <button onClick={clearAll} className="text-xs text-red-500 hover:text-red-600 font-semibold hover:underline">
                Clear All
              </button>
            )}
          </CardHeader>
          <CardContent>
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
                <Inbox className="h-10 w-10 mb-2 stroke-1 text-slate-300" />
                <p className="text-sm font-medium">All caught up!</p>
                <p className="text-xs mt-1">No new notifications or alerts.</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {notifications.map((notif) => {
                  let Icon = Info;
                  let iconColor = "text-blue-500 bg-blue-50 border-blue-200";
                  if (notif.type === "success") {
                    Icon = CheckCircle;
                    iconColor = "text-emerald-500 bg-emerald-50 border-emerald-200";
                  } else if (notif.type === "warning") {
                    Icon = AlertTriangle;
                    iconColor = "text-amber-500 bg-amber-50 border-amber-200";
                  }
                  
                  return (
                    <div key={notif.id} className="py-4 flex gap-4 items-start first:pt-0 last:pb-0">
                      <div className={`p-2 rounded-lg border ${iconColor}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-sm text-foreground">{notif.title}</h4>
                          <span className="text-[10px] text-muted-foreground">{notif.time}</span>
                        </div>
                        <p className="text-xs text-slate-600">{notif.message}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
