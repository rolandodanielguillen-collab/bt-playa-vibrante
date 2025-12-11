import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useState } from 'react';
import { CheckCircle, XCircle, Clock, Eye } from 'lucide-react';

const statusLabels: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  completed: { label: 'Completado', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  failed: { label: 'Fallido', color: 'bg-red-100 text-red-800', icon: XCircle },
  refunded: { label: 'Reembolsado', color: 'bg-gray-100 text-gray-800', icon: XCircle },
};

export default function Payments() {
  const { isAdmin, user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const { data: payments, isLoading } = useQuery({
    queryKey: ['payments', filterStatus],
    queryFn: async () => {
      let query = supabase
        .from('payments')
        .select(`
          *,
          registrations (
            id,
            teams (name, player1_name, player2_name),
            tournaments (title)
          )
        `)
        .order('created_at', { ascending: false });

      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus as 'pending' | 'completed' | 'failed' | 'refunded');
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const updatePaymentMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { status: 'pending' | 'completed' | 'failed' | 'refunded'; notes?: string; transaction_reference?: string; payment_method?: string } }) => {
      const { error } = await supabase
        .from('payments')
        .update({
          ...data,
          verified_by: user?.id,
          payment_date: data.status === 'completed' ? new Date().toISOString() : null,
        })
        .eq('id', id);
      if (error) throw error;

      // If payment is completed, update registration status
      if (data.status === 'completed' && selectedPayment?.registration_id) {
        await supabase
          .from('registrations')
          .update({ status: 'paid' })
          .eq('id', selectedPayment.registration_id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['registrations'] });
      toast.success('Pago actualizado');
      setSelectedPayment(null);
    },
    onError: (error) => toast.error(error.message),
  });

  const handleVerify = (status: 'pending' | 'completed' | 'failed' | 'refunded') => {
    if (!selectedPayment) return;
    updatePaymentMutation.mutate({
      id: selectedPayment.id,
      data: {
        status,
        notes: selectedPayment.notes,
        transaction_reference: selectedPayment.transaction_reference,
        payment_method: selectedPayment.payment_method,
      },
    });
  };

  const pendingCount = payments?.filter(p => p.status === 'pending').length || 0;
  const completedTotal = payments?.filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + Number(p.amount), 0) || 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Pagos</h2>
          <p className="text-muted-foreground">
            {pendingCount} pendientes · ₲ {completedTotal.toLocaleString()} recaudado
          </p>
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {Object.entries(statusLabels).map(([value, { label }]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Equipo</TableHead>
                <TableHead>Torneo</TableHead>
                <TableHead className="text-right">Monto</TableHead>
                <TableHead>Método</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Estado</TableHead>
                {isAdmin && <TableHead className="text-right">Acciones</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments?.map((payment) => {
                const StatusIcon = statusLabels[payment.status]?.icon || Clock;
                return (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">
                      {payment.registrations?.teams?.name}
                    </TableCell>
                    <TableCell>{payment.registrations?.tournaments?.title}</TableCell>
                    <TableCell className="text-right font-mono">
                      ₲ {Number(payment.amount).toLocaleString()}
                    </TableCell>
                    <TableCell>{payment.payment_method || '-'}</TableCell>
                    <TableCell>
                      {format(new Date(payment.created_at), 'dd/MM/yyyy', { locale: es })}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${statusLabels[payment.status]?.color}`}>
                        <StatusIcon className="h-3 w-3" />
                        {statusLabels[payment.status]?.label || payment.status}
                      </span>
                    </TableCell>
                    {isAdmin && (
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedPayment(payment)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
              {(!payments || payments.length === 0) && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No hay pagos registrados
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!selectedPayment} onOpenChange={() => setSelectedPayment(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verificar Pago</DialogTitle>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Equipo:</span>
                  <p className="font-medium">{selectedPayment.registrations?.teams?.name}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Monto:</span>
                  <p className="font-medium">₲ {Number(selectedPayment.amount).toLocaleString()}</p>
                </div>
              </div>

              <div>
                <Label>Método de Pago</Label>
                <Select
                  value={selectedPayment.payment_method || ''}
                  onValueChange={(value) => setSelectedPayment({ ...selectedPayment, payment_method: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar método" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="transferencia">Transferencia Bancaria</SelectItem>
                    <SelectItem value="efectivo">Efectivo</SelectItem>
                    <SelectItem value="tigo_money">Tigo Money</SelectItem>
                    <SelectItem value="billetera_personal">Billetera Personal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Referencia de Transacción</Label>
                <Input
                  value={selectedPayment.transaction_reference || ''}
                  onChange={(e) => setSelectedPayment({ ...selectedPayment, transaction_reference: e.target.value })}
                  placeholder="Número de comprobante"
                />
              </div>

              <div>
                <Label>Notas</Label>
                <Textarea
                  value={selectedPayment.notes || ''}
                  onChange={(e) => setSelectedPayment({ ...selectedPayment, notes: e.target.value })}
                  rows={2}
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setSelectedPayment(null)}>
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleVerify('failed')}
                  disabled={updatePaymentMutation.isPending}
                >
                  Rechazar
                </Button>
                <Button
                  onClick={() => handleVerify('completed')}
                  disabled={updatePaymentMutation.isPending}
                >
                  Aprobar Pago
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
