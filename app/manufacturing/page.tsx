'use client';

import React from 'react';
import AdminLayout from '../common/AdminLayout';
import ManufacturingSpecView from './ManufacturingSpecView';

export default function ManufacturingPage() {
  return (
    <AdminLayout>
      <ManufacturingSpecView />
    </AdminLayout>
  );
}
