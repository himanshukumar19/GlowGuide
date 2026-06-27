import {
  ShoppingBag,
  Users,
  FileBarChart,
  Activity,
  Package,
  Eye,
} from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import AdminStatsCard from "@/components/admin/AdminStatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { products } from "@/data/products";
import { MOCK_HISTORY } from "@/data/analysisHistory";

const recentOrders = [
  { id: "ORD-001", customer: "Jane Doe", items: 3, total: 2499, status: "completed" as const, date: "2026-06-25" },
  { id: "ORD-002", customer: "Alice Vance", items: 1, total: 850, status: "processing" as const, date: "2026-06-26" },
  { id: "ORD-003", customer: "Priya Sharma", items: 5, total: 4599, status: "completed" as const, date: "2026-06-24" },
  { id: "ORD-004", customer: "Rahul Mehta", items: 2, total: 1798, status: "cancelled" as const, date: "2026-06-24" },
  { id: "ORD-005", customer: "Sneha Kapoor", items: 4, total: 3296, status: "processing" as const, date: "2026-06-23" },
];

const statusVariant = {
  completed: "default" as const,
  processing: "secondary" as const,
  cancelled: "destructive" as const,
};

const recentAnalyses = MOCK_HISTORY.slice(-3).reverse();

const AdminDashboard = () => {
  const totalProducts = products.length;
  const totalOrders = 156;
  const totalCustomers = 2843;
  const analysesToday = MOCK_HISTORY.filter((h) =>
    h.date.startsWith(new Date().toISOString().split("T")[0])
  ).length;

  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <AdminStatsCard
            icon={Package}
            label="Total Products"
            value={totalProducts}
            trend={{ direction: "up", percentage: 12 }}
          />
          <AdminStatsCard
            icon={ShoppingBag}
            label="Total Orders"
            value={totalOrders}
            trend={{ direction: "up", percentage: 8 }}
          />
          <AdminStatsCard
            icon={Users}
            label="Total Customers"
            value={totalCustomers}
            trend={{ direction: "up", percentage: 5 }}
          />
          <AdminStatsCard
            icon={Activity}
            label="Analyses Today"
            value={analysesToday || 3}
            trend={{ direction: "up", percentage: 15 }}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileBarChart className="h-4 w-4 text-muted-foreground" />
                Recent Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>{order.customer}</TableCell>
                      <TableCell className="text-right">₹{order.total.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={statusVariant[order.status]}>
                          {order.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Eye className="h-4 w-4 text-muted-foreground" />
                Recent Analyses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Skin Type</TableHead>
                    <TableHead className="text-right">Score</TableHead>
                    <TableHead>Confidence</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentAnalyses.map((analysis) => (
                    <TableRow key={analysis.id}>
                      <TableCell className="font-medium">
                        {new Date(analysis.date).toLocaleDateString("en-IN")}
                      </TableCell>
                      <TableCell className="capitalize">{analysis.skinType}</TableCell>
                      <TableCell className="text-right font-semibold">
                        {analysis.healthScore}
                      </TableCell>
                      <TableCell>{(analysis.confidence * 100).toFixed(0)}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
