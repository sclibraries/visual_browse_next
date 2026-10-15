import { useEffect } from 'react';
import Header from '../components/Header';
import Records from '../components/Records';
import { Modal } from 'reactstrap';
import { useShallow } from 'zustand/react/shallow'
import { useStore } from '../store/store'
import { useRouter } from 'next/router'
import { ToastContainer } from 'react-toastify';

export default function GlobalLayout({ children }) {
  const router = useRouter();
  const [recordModal, setRecordModal, setAn, setDbid, setRecordImageOverride] = useStore(useShallow(state => [
    state.recordModal,
    state.setRecordModal,
    state.setAn,
    state.setDbid,
    state.setRecordImageOverride,
  ]))

  useEffect(() => {
    if (router.query.an && router.query.dbid) {
      setAn(router.query.an)
      setDbid(router.query.dbid)
      if (typeof router.query.img === 'string') {
        setRecordImageOverride(decodeURIComponent(router.query.img))
      } else {
        setRecordImageOverride('')
      }
      setRecordModal(true)
    }
    // Function to run when the route changes
    const handleRouteChange = (url) => {
      const newRoute = new URL(url, window.location.origin);
      if (!newRoute.searchParams.has('an') && !newRoute.searchParams.has('dbid')) {
        // Close the modal if the 'record' query parameter is not present
        setRecordModal(false);
        setRecordImageOverride('');
      }
    };

    // Listen for route changes
    router.events.on('routeChangeStart', handleRouteChange);

    // Cleanup: remove the listener when the component is unmounted
    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, [router, setAn, setDbid, setRecordImageOverride, setRecordModal]);

  const toggleModal = () => setRecordModal(!recordModal);
 
  const modalParams = {
    fullscreen: true,
    scrollable: true,
    centered: true,
   }

  return (
   <div> 
    <Header />
    <ToastContainer />
    <div>
      <Modal isOpen={recordModal} toggle={toggleModal} {...modalParams}>
        <Records />
      </Modal>
    </div>
    <div className="container main-content" style={{marginTop: "70px"}}>
    {children}
    </div>
  </div>
  );
}
