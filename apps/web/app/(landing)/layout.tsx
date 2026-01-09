import { Navbar } from "@/components/landing/Navbar";

export default function LandingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="dark:bg-[#111828] bg-white">
            <Navbar />
            {children}
        </div>
    );
}
