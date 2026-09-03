import AdminLayout from "@/components/admin/AdminLayout";

export const metadata = {
    title: "bbay - Admin Panel",
    description: "bbay Admin Dashboard & Moderation",
};

export default function RootAdminLayout({ children }) {
    return (
        <AdminLayout>
            {children}
        </AdminLayout>
    );
}
