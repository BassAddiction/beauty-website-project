import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export interface Client {
  username: string;
  email: string;
  last_payment: string;
  total_paid: number;
  payment_count: number;
}

interface ClientsTabProps {
  clients: Client[];
}

export const ClientsTab = ({ clients }: ClientsTabProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Список клиентов</CardTitle>
        <CardDescription>Все пользователи VPN</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Username</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Последний платёж</TableHead>
              <TableHead>Всего оплачено</TableHead>
              <TableHead>Платежей</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.map((client) => (
              <TableRow key={client.username}>
                <TableCell className="font-mono">{client.username}</TableCell>
                <TableCell>{client.email}</TableCell>
                <TableCell>
                  {client.last_payment ? new Date(client.last_payment).toLocaleString('ru-RU') : '—'}
                </TableCell>
                <TableCell>{client.total_paid}₽</TableCell>
                <TableCell>{client.payment_count}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
