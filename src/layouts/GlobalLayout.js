import React, { useEffect } from 'react';
import Header from '../components/Header';
import Records from '../components/Records';
import { Modal } from 'reactstrap';
import { shallow } from 'zustand/shallow'
import { useStore } from '../store/store'
import { useRouter } from 'next/router'
import Breadcrumb from '@/components/Breadcrumb';

export default function GlobalLayout({ children }) {
  const router = useRouter();
  const [recordModal, setRecordModal, setAn, setDbid] = useStore(state => [
    state.recordModal,
    state.setRecordModal,
    state.setAn,
    state.setDbid
  ], shallow)

  useEffect(() => {
    if (router.query.an && router.query.dbid) {
      setAn(router.query.an)
      setDbid(router.query.dbid)
      setRecordModal(true)
    }
    // Function to run when the route changes
    const handleRouteChange = (url) => {
      const newRoute = new URL(url, window.location.origin);
      if (!newRoute.searchParams.has('an') && !newRoute.searchParams.has('dbid')) {
        // Close the modal if the 'record' query parameter is not present
        setRecordModal(false);
      }
    };

    // Listen for route changes
    router.events.on('routeChangeStart', handleRouteChange);

    // Cleanup: remove the listener when the component is unmounted
    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, [router, setRecordModal]);

  const toggleModal = () => setRecordModal(!recordModal);
 
  const modalParams = {
    fullscreen: true,
    scrollable: true,
    centered: true,
   }

  return (
   <div> 
    <Header />
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
