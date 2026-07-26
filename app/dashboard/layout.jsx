import DashboardSidebar from "../../components/dashboard/DashboardSidebar";
import styles from "./layout.module.css";

export const metadata = { title: "Dashboard" };

export default function DashboardLayout({ children }) {
  // .dashRoot aplica el reset de formularios del admin (ver app/globals.css).
  return (
    <div className={`${styles.shell} dashRoot`}>
      <DashboardSidebar />
      <main className={styles.content}>{children}</main>
    </div>
  );
}
