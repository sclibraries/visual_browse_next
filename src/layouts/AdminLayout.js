// components/AdminLayout.js
import AdminSidebar from '../components/AccountSidebar';
import { Container } from 'reactstrap';
import styles from '../styles/AdminLayout.module.css';

const AdminLayout = ({ children }) => {
  return (
    <div className={styles.adminLayout}>
      {/* Horizontal sidebar at the top */}
      <AdminSidebar />
      <div className={styles.content}>
        <Container fluid className={styles.container}>
          {children}
        </Container>
      </div>
    </div>
  );
};

export default AdminLayout;