
export default function HomePage() {
  const cards = [
    {
      title: "Dashboard",
      description: "View overview and analytics",
      href: "/dashboard",
      icon: LayoutDashboard,
      color: "bg-blue-500/10 text-blue-600",
    },
    {
      title: "Expert Management",
      description: "Manage experts and approval requests",
      href: "/experts",
      icon: Users,
      color: "bg-purple-500/10 text-purple-600",
    },
    {
      title: "Bookings",
      description: "View and manage all bookings",
      href: "/bookings",
      icon: Video,
      color: "bg-emerald-500/10 text-emerald-600",
    },
    {
      title: "Sessions",
      description: "Monitor active and scheduled sessions",
      href: "/sessions",
      icon: Clock,
      color: "bg-amber-500/10 text-amber-600",
    },
    {
      title: "Profile",
      description: "Update organization information",
      href: "/profile",
      icon: Settings,
      color: "bg-zinc-500/10 text-zinc-600",
    },
  ];

  return (
    <div className="flex items-center justify-center h-full bg-[var(--card-bg-light)]">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to Organization Panel</h1>
        <p className="text-muted-foreground mb-8">
          Navigate through the sidebar to manage your organization
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
          <div className="p-6 border rounded-lg bg-[var(--card-bg)]">
            <h3 className="font-semibold mb-2">Dashboard</h3>
            <p className="text-sm text-muted-foreground">View overview and analytics</p>
          </div>
          <div className="p-6 border rounded-lg bg-[var(--card-bg)]">
            <h3 className="font-semibold mb-2">Expert Management</h3>
            <p className="text-sm text-muted-foreground">Manage experts and approval requests</p>
          </div>
          <div className="p-6 border rounded-lg bg-[var(--card-bg)]">
            <h3 className="font-semibold mb-2">Bookings</h3>
            <p className="text-sm text-muted-foreground">View and manage all bookings</p>
          </div>
          <div className="p-6 border rounded-lg bg-[var(--card-bg)]">
            <h3 className="font-semibold mb-2">Sessions</h3>
            <p className="text-sm text-muted-foreground">Monitor active and scheduled sessions</p>
          </div>
          <div className="p-6 border rounded-lg bg-[var(--card-bg)]">
            <h3 className="font-semibold mb-2">Profile</h3>
            <p className="text-sm text-muted-foreground">Update organization information</p>
          </div>
        </div>
      </div>
    </div>
  );
}
