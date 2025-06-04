'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Package,
  Truck,
  CreditCard,
  User,
  MapPin,
  Calendar,
  Clock,
  ChevronLeft,
  Edit,
  Download,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Mail,
  Phone,
  Copy,
  ExternalLink,
  FileText,
  DollarSign
} from 'lucide-react';

interface OrderDetails {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  customerEmail: string;
  customerPhone?: string;
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  discountAmount: number;
  total: number;
  shippingMethod?: string;
  paymentMethod?: string;
  customerNotes?: string;
  internalNotes?: string;
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  customer?: {
    id: string;
    firstName: string;
    lastName?: string | null;
    email?: string | null;
    phone?: string | null;
  };
  items: Array<{
    id: string;
    productName: string;
    variantName?: string;
    sku: string;
    price: number;
    quantity: number;
    subtotal: number;
    total: number;
    product: {
      id: string;
      featuredImage?: string;
      type: string;
    };
  }>;
  shippingAddress?: {
    firstName: string;
    lastName: string;
    company?: string;
    address1: string;
    address2?: string;
    city: string;
    state?: string;
    country: string;
    postalCode: string;
    phone?: string;
  };
  billingAddress?: {
    firstName: string;
    lastName: string;
    company?: string;
    address1: string;
    address2?: string;
    city: string;
    state?: string;
    country: string;
    postalCode: string;
    sameAsShipping: boolean;
  };
  fulfillments: Array<{
    id: string;
    status: string;
    trackingNumber?: string;
    trackingCompany?: string;
    shippedAt?: string;
    deliveredAt?: string;
  }>;
  refunds: Array<{
    id: string;
    amount: number;
    reason?: string;
    status: string;
    createdAt: string;
  }>;
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PROCESSING: 'bg-blue-100 text-blue-800',
  SHIPPED: 'bg-purple-100 text-purple-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELED: 'bg-red-100 text-red-800',
  REFUNDED: 'bg-gray-100 text-gray-800'
};

const paymentStatusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PROCESSING: 'bg-blue-100 text-blue-800',
  PAID: 'bg-green-100 text-green-800',
  FAILED: 'bg-red-100 text-red-800',
  REFUNDED: 'bg-gray-100 text-gray-800',
  PARTIALLY_REFUNDED: 'bg-orange-100 text-orange-800',
  CANCELED: 'bg-gray-100 text-gray-800'
};

export default function OrderDetailsPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [internalNotes, setInternalNotes] = useState('');

  useEffect(() => {
    fetchOrder();
  }, [params.id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/ecommerce/orders/${params.id}`);
      const data = await response.json();

      if (response.ok) {
        setOrder(data);
        setInternalNotes(data.internalNotes || '');
      } else {
        console.error('Failed to fetch order:', data.error);
      }
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (status: string) => {
    try {
      setUpdating(true);
      const response = await fetch(`/api/ecommerce/orders/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        await fetchOrder();
      }
    } catch (error) {
      console.error('Error updating order:', error);
    } finally {
      setUpdating(false);
    }
  };

  const updateInternalNotes = async () => {
    try {
      const response = await fetch(`/api/ecommerce/orders/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ internalNotes })
      });

      if (response.ok) {
        setShowNotes(false);
        await fetchOrder();
      }
    } catch (error) {
      console.error('Error updating notes:', error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Order not found</p>
          <Link href="/dashboard/ecommerce/orders" className="text-blue-600 hover:text-blue-800">
            Back to orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/ecommerce/orders"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Order #{order.orderNumber}
            </h1>
            <p className="text-gray-600 mt-1">
              Created on {formatDate(order.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => copyToClipboard(order.orderNumber)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Copy className="w-5 h-5" />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            <FileText className="w-4 h-4" />
            Invoice
          </button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Order Status</h3>
            <Package className="w-5 h-5 text-gray-400" />
          </div>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusColors[order.status]}`}>
            {order.status.replace('_', ' ')}
          </span>
          {order.status === 'PENDING' && (
            <div className="mt-4 space-y-2">
              <button
                onClick={() => updateOrderStatus('PROCESSING')}
                disabled={updating}
                className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                Mark as Processing
              </button>
            </div>
          )}
          {order.status === 'PROCESSING' && (
            <div className="mt-4">
              <Link
                href={`/dashboard/ecommerce/orders/${order.id}/fulfill`}
                className="block w-full py-2 bg-purple-600 text-white text-center rounded-lg hover:bg-purple-700 transition-colors"
              >
                Fulfill Order
              </Link>
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Payment Status</h3>
            <CreditCard className="w-5 h-5 text-gray-400" />
          </div>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${paymentStatusColors[order.paymentStatus]}`}>
            {order.paymentStatus.replace('_', ' ')}
          </span>
          {order.paymentMethod && (
            <p className="text-sm text-gray-600 mt-2">
              via {order.paymentMethod.replace('_', ' ')}
            </p>
          )}
          {order.paidAt && (
            <p className="text-xs text-gray-500 mt-1">
              {formatDate(order.paidAt)}
            </p>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Fulfillment</h3>
            <Truck className="w-5 h-5 text-gray-400" />
          </div>
          {order.fulfillments.length > 0 ? (
            <div>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                order.fulfillments[0].status === 'DELIVERED' 
                  ? 'bg-green-100 text-green-800'
                  : order.fulfillments[0].status === 'SHIPPED'
                  ? 'bg-purple-100 text-purple-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {order.fulfillments[0].status}
              </span>
              {order.fulfillments[0].trackingNumber && (
                <p className="text-sm text-gray-600 mt-2">
                  {order.fulfillments[0].trackingCompany}: {order.fulfillments[0].trackingNumber}
                </p>
              )}
            </div>
          ) : (
            <p className="text-gray-500">Not fulfilled</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Order Items</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {order.items.map((item) => (
                <div key={item.id} className="p-6 flex items-center gap-4">
                  {item.product.featuredImage ? (
                    <img
                      src={item.product.featuredImage}
                      alt={item.productName}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Package className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <Link
                          href={`/dashboard/ecommerce/products/${item.product.id}`}
                          className="font-medium text-gray-900 hover:text-blue-600"
                        >
                          {item.productName}
                        </Link>
                        {item.variantName && (
                          <p className="text-sm text-gray-600">{item.variantName}</p>
                        )}
                        <p className="text-sm text-gray-500">SKU: {item.sku}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          {formatCurrency(item.total)}
                        </p>
                        <p className="text-sm text-gray-600">
                          {item.quantity} × {formatCurrency(item.price)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="p-6 bg-gray-50 border-t border-gray-200">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">{formatCurrency(order.subtotal)}</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Discount</span>
                    <span className="text-green-600">-{formatCurrency(order.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-gray-900">{formatCurrency(order.shippingAmount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span className="text-gray-900">{formatCurrency(order.taxAmount)}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span>{formatCurrency(order.total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Information */}
          {order.shippingAddress && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Shipping Information</h2>
              <div className="space-y-3">
                <div>
                  <p className="font-medium text-gray-900">
                    {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                  </p>
                  {order.shippingAddress.company && (
                    <p className="text-gray-600">{order.shippingAddress.company}</p>
                  )}
                </div>
                <div className="text-gray-600">
                  <p>{order.shippingAddress.address1}</p>
                  {order.shippingAddress.address2 && (
                    <p>{order.shippingAddress.address2}</p>
                  )}
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                  </p>
                  <p>{order.shippingAddress.country}</p>
                </div>
                {order.shippingAddress.phone && (
                  <p className="text-gray-600 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {order.shippingAddress.phone}
                  </p>
                )}
                {order.shippingMethod && (
                  <div className="pt-3 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      Shipping Method: {order.shippingMethod}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Billing Information */}
          {order.billingAddress && !order.billingAddress.sameAsShipping && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Billing Information</h2>
              <div className="space-y-3">
                <div>
                  <p className="font-medium text-gray-900">
                    {order.billingAddress.firstName} {order.billingAddress.lastName}
                  </p>
                  {order.billingAddress.company && (
                    <p className="text-gray-600">{order.billingAddress.company}</p>
                  )}
                </div>
                <div className="text-gray-600">
                  <p>{order.billingAddress.address1}</p>
                  {order.billingAddress.address2 && (
                    <p>{order.billingAddress.address2}</p>
                  )}
                  <p>
                    {order.billingAddress.city}, {order.billingAddress.state} {order.billingAddress.postalCode}
                  </p>
                  <p>{order.billingAddress.country}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer</h2>
            <div className="space-y-3">
              {order.customer ? (
                <>
                  <div>
                    <Link
                      href={`/dashboard/contacts/${order.customer.id}`}
                      className="font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      {order.customer.firstName}{order.customer.lastName ? ' ' + order.customer.lastName : ''}
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <a
                      href={`mailto:${order.customer.email}`}
                      className="flex items-center gap-2 hover:text-gray-900"
                    >
                      <Mail className="w-4 h-4" />
                      {order.customer.email}
                    </a>
                    {order.customer.phone && (
                      <a
                        href={`tel:${order.customer.phone}`}
                        className="flex items-center gap-2 hover:text-gray-900"
                      >
                        <Phone className="w-4 h-4" />
                        {order.customer.phone}
                      </a>
                    )}
                  </div>
                </>
              ) : (
                <div className="space-y-2 text-sm text-gray-600">
                  <p className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {order.customerEmail}
                  </p>
                  {order.customerPhone && (
                    <p className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      {order.customerPhone}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Notes</h2>
              <button
                onClick={() => setShowNotes(!showNotes)}
                className="text-blue-600 hover:text-blue-800"
              >
                <Edit className="w-4 h-4" />
              </button>
            </div>
            
            {order.customerNotes && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-1">Customer Notes</p>
                <p className="text-sm text-gray-600">{order.customerNotes}</p>
              </div>
            )}

            {showNotes ? (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Internal Notes</p>
                <textarea
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={updateInternalNotes}
                    className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setShowNotes(false);
                      setInternalNotes(order.internalNotes || '');
                    }}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              order.internalNotes && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Internal Notes</p>
                  <p className="text-sm text-gray-600">{order.internalNotes}</p>
                </div>
              )
            )}
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h2>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-2 h-2 bg-gray-400 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Order created</p>
                  <p className="text-sm text-gray-600">{formatDate(order.createdAt)}</p>
                </div>
              </div>
              {order.paidAt && (
                <div className="flex gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Payment received</p>
                    <p className="text-sm text-gray-600">{formatDate(order.paidAt)}</p>
                  </div>
                </div>
              )}
              {order.shippedAt && (
                <div className="flex gap-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Order shipped</p>
                    <p className="text-sm text-gray-600">{formatDate(order.shippedAt)}</p>
                  </div>
                </div>
              )}
              {order.deliveredAt && (
                <div className="flex gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Order delivered</p>
                    <p className="text-sm text-gray-600">{formatDate(order.deliveredAt)}</p>
                  </div>
                </div>
              )}
              {order.refunds.length > 0 && order.refunds.map((refund) => (
                <div key={refund.id} className="flex gap-3">
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      Refund {refund.status.toLowerCase()} - {formatCurrency(refund.amount)}
                    </p>
                    <p className="text-sm text-gray-600">{formatDate(refund.createdAt)}</p>
                    {refund.reason && (
                      <p className="text-sm text-gray-500 mt-1">{refund.reason}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 