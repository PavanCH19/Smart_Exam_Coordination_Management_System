import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useState } from "react";
import NavBar from "../components/NavBar";
import Icon from "../components/ui/Icon";
import portalLayouts from "../utils/portalLayouts";

const PortalLayout = ({ title }) => {
    const { user, isAuthenticated } = useSelector((state) => state.auth || {});
    const location = useLocation();
    const navigate = useNavigate();

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false);

    const role = user?.role?.toUpperCase();
    const groups = portalLayouts[role] || [];

    // Find the active item's label, for the breadcrumb strip above content.
    const activeLabel = groups
        .flatMap((group) => group.items)
        .find((item) => item.to === location.pathname)?.label;

    if (!isAuthenticated) {
        navigate("/login");
        return null;
    }

    return (
        <div className="min-h-screen bg-paper">
            <NavBar />

            <div className="mx-auto flex max-w-[1400px] items-start gap-6 px-4 py-6 sm:px-6 lg:px-8">
                {/* Mobile menu toggle */}
                <button
                    type="button"
                    onClick={() => setSidebarOpen((open) => !open)}
                    className="fixed bottom-5 right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-ink-900 text-paper shadow-card lg:hidden"
                    aria-label="Toggle navigation menu"
                >
                    <span className="text-lg">{sidebarOpen ? "✕" : "☰"}</span>
                </button>

                {/* Sidebar */}
                <aside
                    className={`fixed inset-y-0 left-0 z-30 flex w-72 shrink-0 flex-col overflow-y-auto border-r border-ink-100 bg-white px-3 py-5 transition-all duration-200 lg:sticky lg:top-20 lg:z-0 lg:h-[calc(100vh-6rem)] lg:translate-x-0 lg:rounded-2xl lg:border lg:shadow-card ${
                        sidebarOpen ? "translate-x-0" : "-translate-x-full"
                    } ${collapsed ? "lg:w-[4.5rem]" : "lg:w-64"}`}
                >
                    <div className={`mb-3 flex items-center px-2 ${collapsed ? "justify-center" : "justify-between"}`}>
                        {!collapsed && (
                            <p className="text-xs font-semibold uppercase tracking-wider text-ink-400">
                                {title}
                            </p>
                        )}
                        <button
                            type="button"
                            onClick={() => setCollapsed((c) => !c)}
                            className="hidden h-7 w-7 shrink-0 items-center justify-center rounded-md text-ink-400 transition hover:bg-ink-100 hover:text-ink-700 lg:flex"
                            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                        >
                            <Icon name={collapsed ? "chevronRight" : "chevronLeft"} className="h-4 w-4" />
                        </button>
                    </div>

                    <nav className="flex-1 space-y-5">
                        {groups.map((group) => (
                            <div key={group.section}>
                                {!collapsed && (
                                    <p className="px-2.5 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-ink-300">
                                        {group.section}
                                    </p>
                                )}
                                <div className="space-y-0.5">
                                    {group.items.map((item) => {
                                        const active = location.pathname === item.to;
                                        return (
                                            <Link
                                                key={item.to}
                                                to={item.to}
                                                onClick={() => setSidebarOpen(false)}
                                                title={collapsed ? item.label : undefined}
                                                className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition ${
                                                    collapsed ? "justify-center" : ""
                                                } ${
                                                    active
                                                        ? "bg-ink-900 text-paper"
                                                        : "text-ink-600 hover:bg-ink-50 hover:text-ink-900"
                                                }`}
                                            >
                                                <Icon
                                                    name={item.icon}
                                                    className={`h-[18px] w-[18px] shrink-0 ${
                                                        active ? "text-brass-300" : "text-ink-400"
                                                    }`}
                                                />
                                                {!collapsed && <span className="truncate">{item.label}</span>}
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </nav>
                </aside>

                {/* Backdrop for mobile sidebar */}
                {sidebarOpen && (
                    <button
                        type="button"
                        aria-label="Close navigation menu"
                        onClick={() => setSidebarOpen(false)}
                        className="fixed inset-0 z-20 bg-ink-950/40 lg:hidden"
                    />
                )}

                {/* Main content */}
                <main className="min-w-0 flex-1">
                    {activeLabel && (
                        <p className="mb-4 flex items-center gap-1.5 text-xs font-medium text-ink-400">
                            <span>{title}</span>
                            <span className="text-ink-300">/</span>
                            <span className="text-ink-600">{activeLabel}</span>
                        </p>
                    )}
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default PortalLayout;
