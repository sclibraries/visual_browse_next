import React, { useState, useEffect } from 'react';
import { Toast, ToastBody, ToastHeader } from 'reactstrap';

const NotificationToast = ({ isOpen, toggle, message, type }) => {
  useEffect(() => {
    if (isOpen) {
      // Automatically close the toast after 5 seconds
      const timer = setTimeout(() => {
        toggle();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isOpen, toggle]);

  return (
    <div aria-live="polite" aria-atomic="true" style={{ position: 'relative', minHeight: '200px' }}>
      <div style={{ position: 'absolute', top: 0, right: 0 }}>
        <Toast isOpen={isOpen} style={{ backgroundColor: type === 'error' ? '#f44336' : '#4caf50', color: 'white' }}>
          <ToastHeader icon="primary" toggle={toggle}>
            {type === 'error' ? 'Error' : 'Success'}
          </ToastHeader>
          <ToastBody>
            {message}
          </ToastBody>
        </Toast>
      </div>
    </div>
  );
};

export default NotificationToast;
