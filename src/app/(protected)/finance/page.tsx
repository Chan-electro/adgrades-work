'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Payment = {
    id: string;
    amount: number;
    type: string;
    transactionId: string | null;
    date: string;
    invoice?: {
        invoiceNumber: string;
    };
};

export default function FinancePage() {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [amount, setAmount] = useState('');
    const [type, setType] = useState('online');
    const [transactionId, setTransactionId] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchPayments();
    }, []);

    async function fetchPayments() {
        try {
            const res = await fetch('/api/finance/payments');
            if (res.ok) {
                const data = await res.json();
                setPayments(data);
            }
        } catch (error) {
            console.error('Failed to fetch payments:', error);
        }
    }

    async function handlePaymentSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/finance/payments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: parseFloat(amount),
                    type,
                    transactionId: type === 'online' ? transactionId : null,
                })
            });

            if (res.ok) {
                alert('Payment recorded successfully!');
                setAmount('');
                setTransactionId('');
                fetchPayments();
            } else {
                alert('Failed to record payment');
            }
        } catch (error) {
            console.error('Payment error:', error);
            alert('Error recording payment');
        } finally {
            setLoading(false);
        }
    }

    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

    return (
        <div className="space-y-6">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Finance Manager</h2>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Revenue Stats */}
                <Card>
                    <CardHeader>
                        <CardTitle>Total Revenue</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold text-green-600">
                            ${totalRevenue.toLocaleString()}
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                            Across {payments.length} transactions
                        </p>
                    </CardContent>
                </Card>

                {/* Manual Payment Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>Record Manual Payment</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handlePaymentSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="amount">Amount ($)</Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="0.00"
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="type">Payment Type</Label>
                                <Select value={type} onValueChange={setType}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="online">Online (Transaction ID)</SelectItem>
                                        <SelectItem value="offline">Offline (Cash/Check)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {type === 'online' && (
                                <div>
                                    <Label htmlFor="transactionId">Transaction ID</Label>
                                    <Input
                                        id="transactionId"
                                        value={transactionId}
                                        onChange={(e) => setTransactionId(e.target.value)}
                                        placeholder="e.g. TXN-123456"
                                        required
                                    />
                                </div>
                            )}

                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? 'Recording...' : 'Record Payment'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Payments */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Payments</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {payments.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">No payments recorded yet.</p>
                        ) : (
                            payments.map((payment) => (
                                <div key={payment.id} className="flex justify-between items-center border-b pb-4 last:border-0 last:pb-0">
                                    <div>
                                        <p className="font-medium">
                                            {payment.invoice ? `Invoice #${payment.invoice.invoiceNumber}` : 'Manual Payment'}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {new Date(payment.date).toLocaleDateString()} • {payment.type.toUpperCase()}
                                            {payment.transactionId && ` • ${payment.transactionId}`}
                                        </p>
                                    </div>
                                    <div className="font-bold text-green-600">
                                        +${payment.amount.toLocaleString()}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
