import Link from 'next/link';
import { useRouter } from 'next/router';

const Breadcrumb = () => {
  const router = useRouter();
  const { pathname } = router;
  const pathArray = pathname.split('/').filter(x => x);

  return (
    <nav aria-label="breadcrumb">
      <ol className="breadcrumb">
        <li className="breadcrumb-item">
          <Link href="/">Home</Link>
        </li>
        {pathArray.map((path, index) => {
        const breadcrumbPath = `/${pathArray.slice(0, index + 1).join('/')}`;
        const isLast = index === pathArray.length - 1;

        // Customize the breadcrumb text for dynamic routes
        let breadcrumbText = path;
        if (path === '[material]' && router.query.material) {
            breadcrumbText = router.query.material;
        }

        if(path === '[collection_id]' && router.query.collection_id){
            breadcrumbText = router.query.collection_id;
        }
        
        return isLast ? (
            <li key={path} className="breadcrumb-item active" aria-current="page">
            {breadcrumbText}
            </li>
        ) : (
            <li key={path} className="breadcrumb-item">
            <Link href={breadcrumbPath}>{breadcrumbText}</Link>
            </li>
        );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
