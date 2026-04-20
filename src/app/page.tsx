import Link from "next/link";
import { 
  LayoutDashboard, 
  Users, 
  Video, 
  Clock, 
  Settings,
  ArrowRight
} from "lucide-react";

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
    <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-6 bg-zinc-50/50">
      <div className="max-w-5xl w-full text-center space-y-12">
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-900">
            Welcome to Organization Panel
          </h1>
          <p className="text-lg text-zinc-500 max-w-2xl mx-auto">
            Manage your organization's experts, bookings, and profile settings from a single dashboard.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          {cards.map((card, index) => (
            <Link 
              key={index} 
              href={card.href}
              className="group relative p-8 bg-white border border-zinc-200 rounded-2xl shadow-sm hover:shadow-xl hover:border-zinc-300 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
            >
              <div className="relative z-10 flex flex-col items-start text-left space-y-4">
                <div className={`p-3 rounded-xl ${card.color} group-hover:scale-110 transition-transform duration-300`}>
                  <card.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-zinc-900 flex items-center">
                    {card.title}
                    <ArrowRight className="ml-2 h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                  </h3>
                  <p className="text-sm text-zinc-500 mt-1 leading-relaxed">
                    {card.description}
                  </p>
                </div>
              </div>
              
              {/* Subtle background aesthetic highlight */}
              <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity duration-300">
                <card.icon className="h-24 w-24 -rotate-12 translate-x-8 -translate-y-4" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
