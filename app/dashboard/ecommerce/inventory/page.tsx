'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  Package,
  Search,
  Filter,
  Download,
  Edit,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Package2,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  BarChart3,
  MapPin,
  History,
  Settings,
  DollarSign,
  RotateCcw,
  ArrowRightLeft
} from 'lucide-react';

interface InventoryItem {
  id: string;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  trackQuantity: boolean;
  allowBackorder: boolean;
  lowStockThreshold?: number;
  location: string;
  averageCost?: number;
  lastRestockDate?: string;
  lastRestockQuantity?: number;
  product: {
    id: string;
    name: string;
    sku: string;
    featuredImage?: string;
    type: string;
  };
  variant?: {
    id: string;
    name: string;
    sku: string;
  };
  movements?: Array<{
    id: string;
    type: string;
    quantity: number;
    reason?: string;
    createdAt: string;
  }>;
}

export default function InventoryPage() {
  const { data: session } = useSession();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [showMovements, setShowMovements] = useState(false);

  useEffect(() => {
    fetchInventory();
  }, [currentPage, locationFilter, stockFilter]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...(searchTerm && { search: searchTerm }),
        ...(locationFilter !== 'all' && { location: locationFilter }),
        ...(stockFilter !== 'all' && { stockStatus: stockFilter })
      });

      const response = await fetch(`/api/ecommerce/inventory?${params}`);
      const data = await response.json();

      if (response.ok) {
        setInventory(data.inventory);
        setTotalPages(data.totalPages);
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchInventory();
  };

  const updateInventory = async (id: string, data: any) => {
    try {
      const response = await fetch(`/api/ecommerce/inventory/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        await fetchInventory();
      }
    } catch (error) {
      console.error('Error updating inventory:', error);
    }
  };

  const getStockStatus = (item: InventoryItem) => {
    if (!item.trackQuantity) return 'untracked';
    if (item.availableQuantity <= 0 && !item.allowBackorder) return 'out-of-stock';
    if (item.lowStockThreshold && item.availableQuantity <= item.lowStockThreshold) return 'low-stock';
    return 'in-stock';
  };

  const getStockStatusColor = (status: string) => {
    switch (status) {
      case 'in-stock':
        return 'text-green-600 bg-green-100';
      case 'low-stock':
        return 'text-yellow-600 bg-yellow-100';
      case 'out-of-stock':
        return 'text-red-600 bg-red-100';
      case 'untracked':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatMovementType = (type: string) => {
    const types: Record<string, { label: string; icon: React.ReactElement; color: string }> = {
      PURCHASE: { label: 'Purchase', icon: <ArrowUp className="w-4 h-4" />, color: 'text-green-600' },
      SALE: { label: 'Sale', icon: <ArrowDown className="w-4 h-4" />, color: 'text-red-600' },
      ADJUSTMENT: { label: 'Adjustment', icon: <RefreshCw className="w-4 h-4" />, color: 'text-blue-600' },
      RETURN: { label: 'Return', icon: <RotateCcw className="w-4 h-4" />, color: 'text-orange-600' },
      DAMAGE: { label: 'Damage', icon: <AlertTriangle className="w-4 h-4" />, color: 'text-red-600' },
      TRANSFER: { label: 'Transfer', icon: <ArrowRightLeft className="w-4 h-4" />, color: 'text-purple-600' }
    };
    return types[type] || { label: type, icon: <Package2 className="w-4 h-4" />, color: 'text-gray-600' };
  };

  const totalValue = inventory.reduce((sum, item) => {
    return sum + (item.quantity * (item.averageCost || 0));
  }, 0);

  const lowStockCount = inventory.filter(item => getStockStatus(item) === 'low-stock').length;
  const outOfStockCount = inventory.filter(item => getStockStatus(item) === 'out-of-stock').length;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600 mt-1">Track and manage your product stock levels</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
          <Link
            href="/dashboard/ecommerce/inventory/movements"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <History className="w-4 h-4" />
            Movement History
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">{inventory.length}</p>
            </div>
            <Package className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">
                ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Low Stock</p>
              <p className="text-2xl font-bold text-yellow-600">{lowStockCount}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Out of Stock</p>
              <p className="text-2xl font-bold text-red-600">{outOfStockCount}</p>
            </div>
            <Package2 className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <form onSubmit={handleSearch} className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by product name, SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </form>

          <select
            value={locationFilter}
            onChange={(e) => {
              setLocationFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Locations</option>
            <option value="main">Main Warehouse</option>
            <option value="secondary">Secondary</option>
          </select>

          <select
            value={stockFilter}
            onChange={(e) => {
              setStockFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Stock Status</option>
            <option value="in-stock">In Stock</option>
            <option value="low-stock">Low Stock</option>
            <option value="out-of-stock">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Available
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reserved
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
                    </div>
                  </td>
                </tr>
              ) : inventory.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                    No inventory items found
                  </td>
                </tr>
              ) : (
                inventory.map((item) => {
                  const status = getStockStatus(item);
                  return (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          {item.product.featuredImage ? (
                            <img
                              src={item.product.featuredImage}
                              alt={item.product.name}
                              className="w-10 h-10 object-cover rounded"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                              <Package className="w-5 h-5 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <Link
                              href={`/dashboard/ecommerce/products/${item.product.id}`}
                              className="text-sm font-medium text-gray-900 hover:text-blue-600"
                            >
                              {item.product.name}
                            </Link>
                            {item.variant && (
                              <p className="text-xs text-gray-500">{item.variant.name}</p>
                            )}
                            <p className="text-xs text-gray-400">SKU: {item.variant?.sku || item.product.sku}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <MapPin className="w-4 h-4" />
                          {item.location}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm font-medium text-gray-900">
                          {item.trackQuantity ? item.availableQuantity : '—'}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm text-gray-600">
                          {item.trackQuantity ? item.reservedQuantity : '—'}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm font-medium text-gray-900">
                          {item.trackQuantity ? item.quantity : '∞'}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStockStatusColor(status)}`}>
                          {status === 'in-stock' && 'In Stock'}
                          {status === 'low-stock' && 'Low Stock'}
                          {status === 'out-of-stock' && 'Out of Stock'}
                          {status === 'untracked' && 'Not Tracked'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm text-gray-900">
                          {item.averageCost 
                            ? `$${(item.quantity * item.averageCost).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                            : '—'
                          }
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedItem(item);
                              setShowMovements(true);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <BarChart3 className="w-4 h-4" />
                          </button>
                          <Link
                            href={`/dashboard/ecommerce/inventory/${item.id}/adjust`}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-700">
                Showing {((currentPage - 1) * 20) + 1} to {Math.min(currentPage * 20, inventory.length)} items
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Movement History Modal */}
      {showMovements && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Inventory Movements - {selectedItem.product.name}
              </h2>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {selectedItem.movements && selectedItem.movements.length > 0 ? (
                <div className="space-y-3">
                  {selectedItem.movements.map((movement) => {
                    const { label, icon, color } = formatMovementType(movement.type);
                    return (
                      <div key={movement.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className={`${color} mt-1`}>{icon}</div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-gray-900">{label}</p>
                            <p className={`font-medium ${movement.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {movement.quantity > 0 ? '+' : ''}{movement.quantity}
                            </p>
                          </div>
                          {movement.reason && (
                            <p className="text-sm text-gray-600 mt-1">{movement.reason}</p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(movement.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No movements recorded</p>
              )}
            </div>
            <div className="p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setSelectedItem(null);
                  setShowMovements(false);
                }}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 