import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { FileDown, Calendar, FileText, Printer } from "lucide-react";
import { reportService } from "@/services/report.service";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { showErrorToast, showSuccessToast } from "@/lib/toast-utils";
import {
  generateDailyPDF,
  generateDailyExcel,
  generateMonthlyPDF,
  generateMonthlyExcel,
  generateProductsPDF,
  generateProductsExcel,
  generateCategoriesPDF,
  generateCategoriesExcel,
  generateClientsPDF,
  generateClientsExcel,
  generateInventoryPDF,
  generateInventoryExcel,
} from "@/lib/report-generator";

const reports = [
  {
    id: 1,
    name: "Rapport journalier",
    description: "Ventes, entrées et sorties du jour",
    icon: FileText,
    endpoint: 'daily',
    pdfGenerator: generateDailyPDF,
    excelGenerator: generateDailyExcel,
  },
  {
    id: 2,
    name: "Rapport mensuel",
    description: "Synthèse complète du mois",
    icon: FileText,
    endpoint: 'monthly',
    pdfGenerator: generateMonthlyPDF,
    excelGenerator: generateMonthlyExcel,
  },
  {
    id: 3,
    name: "Rapport par produit",
    description: "Mouvements par article",
    icon: FileText,
    endpoint: 'products',
    pdfGenerator: generateProductsPDF,
    excelGenerator: generateProductsExcel,
  },
  {
    id: 4,
    name: "Rapport par catégorie",
    description: "Analyse par famille de produits",
    icon: FileText,
    endpoint: 'categories',
    pdfGenerator: generateCategoriesPDF,
    excelGenerator: generateCategoriesExcel,
  },
  {
    id: 5,
    name: "Rapport clients",
    description: "Historique par client",
    icon: FileText,
    endpoint: 'clients',
    pdfGenerator: generateClientsPDF,
    excelGenerator: generateClientsExcel,
  },
  {
    id: 6,
    name: "Inventaire complet",
    description: "État des stocks actuel",
    icon: FileText,
    endpoint: 'inventory',
    pdfGenerator: generateInventoryPDF,
    excelGenerator: generateInventoryExcel,
  },
];

export default function Reports() {
  const [loading, setLoading] = useState(true);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [stockData, setStockData] = useState<any[]>([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [exportFormat, setExportFormat] = useState<'pdf' | 'excel'>('pdf');

  useEffect(() => {
    loadReports();
  }, [selectedYear]);

  const loadReports = async () => {
    try {
      setLoading(true);
      const [monthly, stock] = await Promise.all([
        reportService.getMonthlyReport(parseInt(selectedYear)),
        reportService.getStockEvolution('week'),
      ]);

      if (monthly.success) {
        setMonthlyData(monthly.data);
      }
      if (stock.success) {
        setStockData(stock.data);
      }
    } catch (error: any) {
      console.error("Erreur chargement rapports:", error);
      // Ne pas bloquer l'affichage si les données ne chargent pas
      setMonthlyData([]);
      setStockData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = async (endpoint: string, pdfGenerator: any, excelGenerator: any) => {
    try {
      let data;
      switch (endpoint) {
        case 'daily':
          data = await reportService.getDailyReport();
          break;
        case 'monthly':
          data = await reportService.getMonthlyReport(parseInt(selectedYear));
          break;
        case 'products':
          data = await reportService.getProductReport();
          break;
        case 'categories':
          data = await reportService.getCategoryReport();
          break;
        case 'clients':
          data = await reportService.getClientReport();
          break;
        case 'inventory':
          data = await reportService.getInventoryReport();
          break;
      }
      
      if (data && data.success) {
        if (exportFormat === 'pdf') {
          pdfGenerator(data);
          showSuccessToast("Succès", "Rapport PDF généré avec succès");
        } else {
          excelGenerator(data);
          showSuccessToast("Succès", "Rapport Excel généré avec succès");
        }
      } else {
        showErrorToast("Erreur", "Aucune donnée disponible pour ce rapport");
      }
    } catch (error: any) {
      console.error("Erreur génération rapport:", error);
      showErrorToast("Erreur", "Impossible de générer le rapport");
    }
  };

  if (loading) {
    return (
      <MainLayout title="Rapports" subtitle="Analysez vos données et exportez vos rapports">
        <LoadingSpinner size="lg" text="Chargement des rapports..." />
      </MainLayout>
    );
  }
  return (
    <MainLayout
      title="Rapports"
      subtitle="Analysez vos données et exportez vos rapports"
    >
      {/* Period Selector */}
      <div className="bg-card rounded-xl border border-border p-4 mb-6 animate-slide-up opacity-0">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex gap-3">
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-32">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Année" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2026">2026</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
              </SelectContent>
            </Select>
            <Select value={exportFormat} onValueChange={(value: 'pdf' | 'excel') => setExportFormat(value)}>
              <SelectTrigger className="w-32">
                <FileDown className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="excel">Excel</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Monthly Revenue Chart */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-card animate-slide-up opacity-0 delay-100">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-foreground">Évolution annuelle</h3>
            <p className="text-sm text-muted-foreground">Ventes vs Achats (GNF)</p>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 88%)" />
                <XAxis
                  dataKey="name"
                  stroke="hsl(220 9% 46%)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="hsl(220 9% 46%)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(0 0% 100%)",
                    border: "1px solid hsl(220 13% 88%)",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number) =>
                    new Intl.NumberFormat("fr-GN").format(value) + " GNF"
                  }
                />
                <Bar dataKey="ventes" fill="hsl(38 92% 50%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="achats" fill="hsl(222 47% 20%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stock Evolution Chart */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-card animate-slide-up opacity-0 delay-200">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-foreground">Évolution du stock</h3>
            <p className="text-sm text-muted-foreground">Ce mois (unités)</p>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stockData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 88%)" />
                <XAxis
                  dataKey="name"
                  stroke="hsl(220 9% 46%)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="hsl(220 9% 46%)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(0 0% 100%)",
                    border: "1px solid hsl(220 13% 88%)",
                    borderRadius: "8px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="stock"
                  stroke="hsl(152 69% 40%)"
                  strokeWidth={3}
                  dot={{ fill: "hsl(152 69% 40%)", strokeWidth: 2, r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Quick Reports */}
      <div className="bg-card rounded-xl border border-border p-6 shadow-card animate-slide-up opacity-0 delay-300">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-foreground">Rapports rapides</h3>
          <p className="text-sm text-muted-foreground">Générez et exportez vos rapports</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reports.map((report) => (
            <div
              key={report.id}
              className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer group"
              onClick={() => handleDownloadReport(report.endpoint, report.pdfGenerator, report.excelGenerator)}
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <report.icon className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">{report.name}</p>
                <p className="text-sm text-muted-foreground">{report.description}</p>
              </div>
              <FileDown className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
