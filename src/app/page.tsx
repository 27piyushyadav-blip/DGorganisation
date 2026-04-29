
export default function HomePage() {
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
