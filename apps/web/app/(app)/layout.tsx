import { AppSidebar } from "../components";

export default function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen">
            {/* Sidebar - fixed width */}
            <aside className="w-64 flex-shrink-0 border-r bg-card">
                <AppSidebar />
            </aside>
            {/* Main content - fills remaining space */}
            <main className="flex-1 min-w-0 bg-background">
                {children}
            </main>
        </div>
    );
}
