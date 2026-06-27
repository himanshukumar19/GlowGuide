import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Edit, ExternalLink, FileText } from "lucide-react";

interface ContentPage {
  id: string;
  name: string;
  path: string;
  lastUpdated: string;
  status: "published" | "draft";
}

const MOCK_CONTENT: ContentPage[] = [
  {
    id: "about",
    name: "About Skincare",
    path: "/about",
    lastUpdated: "2026-06-20",
    status: "published",
  },
  {
    id: "skin-types-overview",
    name: "Skin Types Overview",
    path: "/skin-types",
    lastUpdated: "2026-06-18",
    status: "published",
  },
  {
    id: "skin-type-oily",
    name: "Skin Type Detail — Oily",
    path: "/skin-types/oily",
    lastUpdated: "2026-06-15",
    status: "published",
  },
  {
    id: "skin-type-dry",
    name: "Skin Type Detail — Dry",
    path: "/skin-types/dry",
    lastUpdated: "2026-06-15",
    status: "published",
  },
  {
    id: "skin-type-combination",
    name: "Skin Type Detail — Combination",
    path: "/skin-types/combination",
    lastUpdated: "2026-06-15",
    status: "published",
  },
  {
    id: "skin-type-sensitive",
    name: "Skin Type Detail — Sensitive",
    path: "/skin-types/sensitive",
    lastUpdated: "2026-06-15",
    status: "draft",
  },
  {
    id: "skin-type-normal",
    name: "Skin Type Detail — Normal",
    path: "/skin-types/normal",
    lastUpdated: "2026-06-14",
    status: "published",
  },
  {
    id: "ingredients-glossary",
    name: "Ingredients Glossary",
    path: "/ingredients",
    lastUpdated: "2026-06-22",
    status: "published",
  },
];

const AdminSkinContent = () => {
  const handleEdit = (page: ContentPage) => {
    toast({
      title: "Content Editor",
      description: `Editor for "${page.name}" coming soon.`,
    });
  };

  const handleView = (path: string) => {
    window.open(path, "_blank");
  };

  return (
    <AdminLayout title="Skin Content">
      <div className="grid md:grid-cols-2 gap-4">
        {MOCK_CONTENT.map((page) => (
          <Card key={page.id} className="shadow-card hover:shadow-hover transition-shadow">
            <CardHeader className="flex flex-row items-start justify-between gap-4 pb-2">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary mt-0.5">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base">{page.name}</CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">
                    Last updated: {page.lastUpdated}
                  </p>
                </div>
              </div>
              <Badge
                variant={page.status === "published" ? "default" : "secondary"}
                className={
                  page.status === "published"
                    ? "bg-green-100 text-green-800 border-green-200"
                    : ""
                }
              >
                {page.status.charAt(0).toUpperCase() + page.status.slice(1)}
              </Badge>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleEdit(page)}>
                  <Edit className="h-4 w-4 mr-1.5" />
                  Edit
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleView(page.path)}>
                  <ExternalLink className="h-4 w-4 mr-1.5" />
                  View
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </AdminLayout>
  );
};

export default AdminSkinContent;
