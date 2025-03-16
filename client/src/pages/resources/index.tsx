import { useContext, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { UserContext } from "@/App";
import { Role } from "@shared/schema";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  BookOpen, 
  Plus, 
  Search, 
  Loader2,
  Bookmark,
  Filter
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { useLocation } from "wouter";

export default function ResourcesPage() {
  const { user, isLoading: userLoading } = useContext(UserContext);
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // Redirect to login if not authenticated
  if (!userLoading && !user) {
    setLocation("/login");
    return null;
  }
  
  // Fetch resources
  const { data: resources, isLoading } = useQuery({
    queryKey: ['/api/resources', selectedCategory ? { category: selectedCategory } : {}],
  });
  
  // Categories for filtering
  const categories = [
    "All", "Science", "Art", "Math", "Language", "Music", "Nutrition", "Physical"
  ];
  
  // Filter resources based on search query
  const filteredResources = resources 
    ? resources.filter((resource: any) => 
        resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];
  
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex flex-col md:flex-row justify-between md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Educational Resources</h1>
              <p className="text-gray-600">
                Browse our library of educational materials for children
              </p>
            </div>
            {(user?.role === Role.ADMIN || user?.role === Role.STAFF) && (
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                <span>Create Resource</span>
              </Button>
            )}
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                className="pl-10"
                placeholder="Search resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex gap-1 items-center"
              >
                <Filter className="h-4 w-4" />
                <span>Categories</span>
              </Button>
              
              {categories.map(category => (
                <Badge 
                  key={category} 
                  variant={selectedCategory === (category === "All" ? null : category) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setSelectedCategory(category === "All" ? null : category)}
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredResources.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.map((resource: any) => (
                <Card key={resource.id} className="overflow-hidden">
                  <div className="h-2 bg-primary"></div>
                  <CardHeader className="pb-2">
                    <Badge className="w-fit mb-2">{resource.category}</Badge>
                    <CardTitle className="line-clamp-2">{resource.title}</CardTitle>
                    <CardDescription>
                      Ages {resource.ageMin}-{resource.ageMax}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 line-clamp-3 mb-2">
                      {resource.description}
                    </p>
                    <div className="flex items-center text-xs text-gray-500">
                      <Bookmark className="h-3 w-3 mr-1" />
                      <span>Added {formatDate(new Date(resource.createdAt))}</span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">
                      View Resource
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">No Resources Found</h3>
                <p className="text-gray-500 mb-4">
                  {searchQuery 
                    ? `No resources match your search for "${searchQuery}"`
                    : selectedCategory
                    ? `No resources found in the "${selectedCategory}" category`
                    : "There are no resources available yet"
                  }
                </p>
                {(user?.role === Role.ADMIN || user?.role === Role.STAFF) && (
                  <Button>Create First Resource</Button>
                )}
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}
