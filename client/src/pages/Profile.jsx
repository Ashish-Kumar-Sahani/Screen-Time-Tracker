import React from 'react';
import ProfileSetting from './components/Settings/ProfileSettings.jsx';
const Profile = () => {
  return (
    <div className='min-h-screen bg-gray-100 dark:bg-gray-950 text-gray-700 dark:text-gray-300 p-6'>
      < ProfileSetting />
    </div>
  );
};

export default Profile;