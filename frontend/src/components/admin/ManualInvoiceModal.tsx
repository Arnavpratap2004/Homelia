
import { useState } from 'react';
import { X, Plus, Trash2, Loader2 } from 'lucide-react';
import { invoicesApi } from '../../api';

interface ManualInvoiceModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

interface InvoiceItem {
    id: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
}

const ManualInvoiceModal = ({ onClose, onSuccess }: ManualInvoiceModalProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form State
    const [customer, setCustomer] = useState({
        name: '',
        email: '',
        phone: '',
        gstin: '',
        address: { street: '', city: '', state: '', pincode: '' }
    });

    const [items, setItems] = useState<InvoiceItem[]>([
        { id: '1', productName: '', quantity: 1, unitPrice: 0, taxRate: 18 }
    ]);

    // Handle Customer Change
    const handleCustomerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setCustomer(prev => ({
                ...prev,
                [parent]: { ...prev[parent as keyof typeof prev] as any, [child]: value }
            }));
        } else {
            setCustomer(prev => ({ ...prev, [name]: value }));
        }
    };

    // Handle Item Change
    const handleItemChange = (id: string, field: keyof InvoiceItem, value: any) => {
        setItems(prev => prev.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        ));
    };

    // Add/Remove Item
    const addItem = () => {
        setItems(prev => [...prev, {
            id: Date.now().toString(),
            productName: '',
            quantity: 1,
            unitPrice: 0,
            taxRate: 18
        }]);
    };

    const removeItem = (id: string) => {
        if (items.length > 1) {
            setItems(prev => prev.filter(item => item.id !== id));
        }
    };

    // Calculations
    const calculateTotal = () => {
        return items.reduce((acc, item) => {
            const total = item.quantity * item.unitPrice;
            const tax = total * (item.taxRate / 100);
            return acc + total + tax;
        }, 0);
    };

    // Submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const payload = {
                customer: {
                    ...customer,
                    address: customer.address
                },
                items: items.map(item => ({
                    productName: item.productName,
                    quantity: Number(item.quantity),
                    unitPrice: Number(item.unitPrice),
                    taxRate: Number(item.taxRate),
                    // We don't send productId effectively treating them as custom items
                }))
            };

            const response = await invoicesApi.createManual(payload);

            if (response.success) {
                onSuccess();
                onClose();
            } else {
                setError(response.message || 'Failed to generate invoice');
            }
        } catch (err) {
            console.error(err);
            setError('An error occurred. Please check details.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '800px' }}>
                <div className="modal-header">
                    <h2>Create Invoice</h2>
                    <button className="close-btn" onClick={onClose}><X size={20} /></button>
                </div>

                <div className="modal-body">
                    {error && (
                        <div className="auth-error" style={{ marginBottom: '1rem' }}>
                            <span style={{ color: '#ef4444' }}>{error}</span>
                        </div>
                    )}

                    <form id="invoice-form" onSubmit={handleSubmit}>
                        <div className="order-detail-section">
                            <h4>Customer Details</h4>
                            <div className="form-row-responsive">
                                <div className="input-group">
                                    <label className="input-label">Name</label>
                                    <input type="text" className="input" name="name" value={customer.name} onChange={handleCustomerChange} required />
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Phone</label>
                                    <input type="text" className="input" name="phone" value={customer.phone} onChange={handleCustomerChange} required />
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Email</label>
                                    <input type="email" className="input" name="email" value={customer.email} onChange={handleCustomerChange} required />
                                </div>
                                <div className="input-group">
                                    <label className="input-label">GSTIN (Optional)</label>
                                    <input type="text" className="input" name="gstin" value={customer.gstin} onChange={handleCustomerChange} />
                                </div>
                            </div>
                            <div className="input-group" style={{ marginTop: '1rem' }}>
                                <label className="input-label">Address</label>
                                <input type="text" className="input" name="address.street" placeholder="Street Address" value={customer.address.street} onChange={handleCustomerChange} required />
                                <div className="address-grid">
                                    <input type="text" className="input" name="address.city" placeholder="City" value={customer.address.city} onChange={handleCustomerChange} required />
                                    <input type="text" className="input" name="address.state" placeholder="State" value={customer.address.state} onChange={handleCustomerChange} required />
                                    <input type="text" className="input" name="address.pincode" placeholder="Pincode" value={customer.address.pincode} onChange={handleCustomerChange} required />
                                </div>
                            </div>
                        </div>

                        {/* Items */}
                        <div className="order-detail-section">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h4>Items</h4>
                                <button type="button" className="btn btn-sm btn-outline" onClick={addItem}>
                                    <Plus size={16} /> Add Item
                                </button>
                            </div>

                            <table className="order-items-table">
                                <thead>
                                    <tr>
                                        <th>Product</th>
                                        <th>Qty</th>
                                        <th>Price</th>
                                        <th>Tax %</th>
                                        <th>Total</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item) => (
                                        <tr key={item.id}>
                                            <td>
                                                <input
                                                    type="text"
                                                    className="input"
                                                    value={item.productName}
                                                    onChange={(e) => handleItemChange(item.id, 'productName', e.target.value)}
                                                    required
                                                    placeholder="Item name"
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="text"
                                                    className="input"
                                                    style={{ textAlign: 'center' }}
                                                    value={item.quantity || ''}
                                                    onChange={(e) => {
                                                        const val = e.target.value.replace(/^0+/, '') || '0';
                                                        handleItemChange(item.id, 'quantity', parseInt(val) || 0);
                                                    }}
                                                    required
                                                    placeholder="Qty"
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="text"
                                                    className="input"
                                                    style={{ textAlign: 'center' }}
                                                    value={item.unitPrice || ''}
                                                    onChange={(e) => {
                                                        const val = e.target.value.replace(/^0+/, '') || '0';
                                                        handleItemChange(item.id, 'unitPrice', parseFloat(val) || 0);
                                                    }}
                                                    required
                                                    placeholder="Price"
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="text"
                                                    className="input"
                                                    style={{ textAlign: 'center' }}
                                                    value={item.taxRate || ''}
                                                    onChange={(e) => {
                                                        const val = e.target.value.replace(/^0+/, '') || '0';
                                                        handleItemChange(item.id, 'taxRate', parseFloat(val) || 0);
                                                    }}
                                                    required
                                                    placeholder="Tax"
                                                />
                                            </td>
                                            <td style={{ textAlign: 'right', fontWeight: 500 }}>
                                                ₹{((item.quantity * item.unitPrice) * (1 + item.taxRate / 100)).toFixed(2)}
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                <button
                                                    type="button"
                                                    className="icon-btn danger"
                                                    onClick={() => removeItem(item.id)}
                                                    disabled={items.length === 1}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div style={{ textAlign: 'right', marginTop: '1rem', fontSize: '1.1rem', fontWeight: 'bold' }}>
                                Total: ₹{calculateTotal().toFixed(2)}
                            </div>
                        </div>
                    </form>
                </div>

                <div className="modal-footer">
                    <button className="btn btn-outline" onClick={onClose} disabled={isLoading}>Cancel</button>
                    <button className="btn btn-primary" type="submit" form="invoice-form" disabled={isLoading}>
                        {isLoading ? <><Loader2 size={16} className="spin" /> Generating...</> : 'Generate Invoice'}
                    </button>
                </div>
            </div >
        </div >
    );
};

export default ManualInvoiceModal;
