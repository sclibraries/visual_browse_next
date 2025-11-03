import { useRouter } from 'next/router';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faHeart, faBookBookmark, faChartLine, faUsers } from '@fortawesome/free-solid-svg-icons';
import styles from '../styles/AccountSidebar.module.css';

const AdminSidebar = () => {
  const router = useRouter();

  const menuItems = [
    {
      icon: faHome,
      title: 'Dashboard',
      path: '/account'
    },
    {
      icon: faBookBookmark,
      title: 'Collections',
      path: '/account/collections'
    },
    {
      icon: faHeart,
      title: 'Favorites',
      path: '/account/favorites'
    },
    {
      icon: faChartLine,
      title: 'Analytics',
      path: '/account/analytics'
    },
    {
      icon: faUsers,
      title: 'Following',
      path: '/account/following'
    }
    // {
    //   icon: faHome,
    //   title: 'Admin',
    //   path: '/account/admin'
    // }
  ];

  return (
    <div className={styles.horizontalSidebar}>
      <nav className={styles.horizontalNav}>
        <ul className={styles.horizontalMenuList}>
          {menuItems.map((item, index) => (
            <li key={index} className={`
              ${styles.horizontalMenuItem} 
              ${router.pathname === item.path ? styles.active : ''}
            `}>
              <Link 
                href={item.path}
                className={styles.horizontalMenuLink}
              >
                {item.icon && <FontAwesomeIcon icon={item.icon} className={styles.icon} />}
                {item.title}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default AdminSidebar;
