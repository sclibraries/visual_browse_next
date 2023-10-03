import React from 'react';

function UserInfo({ user }) {
  return (
    <div className="user-info">
      <h2>User Information</h2>
      <pre>{JSON.stringify(user, null, 2)}</pre>
    </div>
  );
}

export default UserInfo;
