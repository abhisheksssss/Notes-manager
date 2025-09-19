"use client"
import { useParams } from 'next/navigation';
import React from 'react';

const ProfilePage = () => {
  const params = useParams();
  const id = params?.id;

  return (
    <div>
      This is the profile {id}
    </div>
  );
};

export default ProfilePage;
