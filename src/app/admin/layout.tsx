import Link from 'next/link';
import styles from './admin.module.css';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <h1 className={styles.title}>Batterella Admin</h1>
        <nav className={styles.nav}>
          <Link href="/admin" className={styles.navLink}>
            Dashboard
          </Link>
          <Link href="/admin/orders" className={styles.navLink}>
            Orders
          </Link>
          <Link href="/admin/walk-in" className={styles.navLink}>
            Walk-in Order
          </Link>
          <Link href="/" className={styles.homeLink}>
            ← Home
          </Link>
        </nav>
      </header>
      <main className={styles.main}>
        {children}
      </main>
    </div>
  );
}
