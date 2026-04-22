/* eslint-disable react-refresh/only-export-components */
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout } from '@/shared/ui/layout/app-layout'
import { lazy, Suspense } from 'react'

const OrdersListPage = lazy(() => import('@/pages/orders-list'))
const OrderDetailPage = lazy(() => import('@/pages/order-detail'))
const OrderEditPage = lazy(() => import('@/pages/order-edit'))
const OrderNewPage = lazy(() => import('@/pages/order-new'))

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/orders" replace />,
  },
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        path: 'orders',
        element: (
          <Suspense fallback={<PageLoader />}>
            <OrdersListPage />
          </Suspense>
        ),
      },
      {
        path: 'orders/:id',
        element: (
          <Suspense fallback={<PageLoader />}>
            <OrderDetailPage />
          </Suspense>
        ),
      },
      {
        path: 'orders/:id/edit',
        element: (
          <Suspense fallback={<PageLoader />}>
            <OrderEditPage />
          </Suspense>
        ),
      },
    ],
  },
  {
    // Full-screen draft workspace — outside the sidebar layout
    path: '/orders/new',
    element: (
      <Suspense fallback={<PageLoader />}>
        <OrderNewPage />
      </Suspense>
    ),
  },
])
