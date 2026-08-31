'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  AdminOrder,
  OrderStatus,
  getStoredOrders,
  getOrderById,
  updateOrderStatusInStore,
  addOrderNoteInStore,
  FulfillmentInfo,
} from '@/lib/orderStore';
import toast from 'react-hot-toast';

interface OrderContextType {
  orders: AdminOrder[];
  refreshOrders: () => void;
  getOrder: (id: string) => AdminOrder | null;
  updateStatus: (
    orderId: string,
    newStatus: OrderStatus,
    note?: string,
    tracking?: Partial<FulfillmentInfo>
  ) => boolean;
  addNote: (orderId: string, text: string, isCustomerVisible?: boolean) => boolean;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [mounted, setMounted] = useState(false);

  const refreshOrders = () => {
    const list = getStoredOrders();
    setOrders(list);
  };

  useEffect(() => {
    setMounted(true);
    refreshOrders();
  }, []);

  const getOrder = (id: string): AdminOrder | null => {
    return getOrderById(id);
  };

  const updateStatus = (
    orderId: string,
    newStatus: OrderStatus,
    note?: string,
    tracking?: Partial<FulfillmentInfo>
  ): boolean => {
    const res = updateOrderStatusInStore(orderId, newStatus, note, tracking);
    if (res) {
      refreshOrders();
      toast.success(`Order ${res.id} status updated to ${newStatus}`);
      return true;
    } else {
      toast.error(`Order not found or update failed`);
      return false;
    }
  };

  const addNote = (orderId: string, text: string, isCustomerVisible: boolean = false): boolean => {
    const res = addOrderNoteInStore(orderId, text, isCustomerVisible);
    if (res) {
      refreshOrders();
      toast.success('Note added successfully');
      return true;
    }
    return false;
  };

  return (
    <OrderContext.Provider
      value={{
        orders: mounted ? orders : getStoredOrders(),
        refreshOrders,
        getOrder,
        updateStatus,
        addNote,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const ctx = useContext(OrderContext);
  if (!ctx) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return ctx;
}
