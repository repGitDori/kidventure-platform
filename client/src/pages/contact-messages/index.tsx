import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import {
  Mail,
  Eye,
  Search,
  Trash2,
  CheckCircle,
  SortAsc,
  SortDesc,
  Filter,
  RefreshCw,
  Loader2,
  Download,
  ArrowLeft,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDate } from "@/lib/utils";

export default function ContactMessagesPage() {
  const [viewMessage, setViewMessage] = useState<any>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filterStatus, setFilterStatus] = useState<"all" | "read" | "unread">("all");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  // Fetch contact messages
  const { data: messages, isLoading: loadingMessages } = useQuery({
    queryKey: ['/api/contact-messages'],
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/contact-messages/${id}/read`, {
        method: 'PATCH',
      });
    },
    onSuccess: () => {
      toast({
        title: "Message marked as read",
        description: "The message has been marked as read.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/contact-messages'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update message status. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete message mutation
  const deleteMessageMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/contact-messages/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      toast({
        title: "Message deleted",
        description: "The message has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/contact-messages'] });
      setIsViewDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleViewMessage = (message: any) => {
    setViewMessage(message);
    setIsViewDialogOpen(true);
    
    // Mark as read if currently unread
    if (!message.isRead) {
      markAsReadMutation.mutate(message.id);
    }
  };
  
  const handleDeleteMessage = (id: number) => {
    if (confirm("Are you sure you want to delete this message? This action cannot be undone.")) {
      deleteMessageMutation.mutate(id);
    }
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  // Filter and sort messages
  const filteredMessages = messages ? messages.filter((message: any) => {
    // Filter by search term
    const matchesSearch = searchTerm ? 
      message.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      message.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
      message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.message.toLowerCase().includes(searchTerm.toLowerCase()) : 
      true;
      
    // Filter by read/unread status
    const matchesStatus = filterStatus === "all" ? 
      true : 
      filterStatus === "read" ? 
      message.isRead : 
      !message.isRead;
      
    return matchesSearch && matchesStatus;
  }).sort((a: any, b: any) => {
    // Sort by date
    const dateA = new Date(a.createdAt);
    const dateB = new Date(b.createdAt);
    return sortOrder === "asc" ? 
      dateA.getTime() - dateB.getTime() : 
      dateB.getTime() - dateA.getTime();
  }) : [];

  // Message status counts
  const totalMessages = messages ? messages.length : 0;
  const unreadMessages = messages ? messages.filter((message: any) => !message.isRead).length : 0;
  const readMessages = messages ? messages.filter((message: any) => message.isRead).length : 0;

  return (
    <div className="container py-10">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => setLocation("/dashboard")} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Contact Messages</CardTitle>
          <CardDescription>
            View and manage contact form submissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search messages..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full md:w-auto flex gap-2">
              <Select
                value={filterStatus}
                onValueChange={(value: "all" | "read" | "unread") => setFilterStatus(value)}
              >
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Messages</SelectItem>
                  <SelectItem value="read">Read</SelectItem>
                  <SelectItem value="unread">Unread</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" size="icon" onClick={toggleSortOrder}>
                {sortOrder === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
              </Button>
              
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/contact-messages'] })}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {loadingMessages ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[4%]"></TableHead>
                    <TableHead className="w-[20%]">From</TableHead>
                    <TableHead className="w-[20%]">Subject</TableHead>
                    <TableHead className="w-[41%]">Message Preview</TableHead>
                    <TableHead className="w-[10%]">Date</TableHead>
                    <TableHead className="w-[5%]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMessages.length > 0 ? (
                    filteredMessages.map((message: any) => (
                      <TableRow 
                        key={message.id} 
                        className={message.isRead ? "" : "bg-blue-50/50"}
                      >
                        <TableCell>
                          {!message.isRead && (
                            <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{message.name}</div>
                          <div className="text-xs text-gray-500">{message.email}</div>
                        </TableCell>
                        <TableCell>
                          {message.subject}
                        </TableCell>
                        <TableCell>
                          <div className="truncate text-gray-500">
                            {message.message.substring(0, 100)}
                            {message.message.length > 100 ? "..." : ""}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-500">
                            {formatDate(new Date(message.createdAt))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewMessage(message)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6">
                        No messages found. Try adjusting your filters.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
          
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-muted-foreground">
              {filteredMessages.length} messages {filterStatus !== "all" ? `(${filterStatus})` : ""}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* View Message Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Message Details</DialogTitle>
            <DialogDescription>
              View the complete message and contact information
            </DialogDescription>
          </DialogHeader>
          {viewMessage && (
            <div className="mt-4 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">From</h3>
                  <div className="mt-1">
                    <p className="font-medium">{viewMessage.name}</p>
                    <p className="text-sm text-blue-600">{viewMessage.email}</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Date & Status</h3>
                  <div className="mt-1 flex items-center justify-between">
                    <p className="text-sm">
                      {formatDate(new Date(viewMessage.createdAt))}
                    </p>
                    <Badge variant={viewMessage.isRead ? "outline" : "default"}>
                      {viewMessage.isRead ? "Read" : "Unread"}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Subject</h3>
                <p className="mt-1 font-medium">{viewMessage.subject}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Message</h3>
                <div className="mt-1 p-4 border rounded-md bg-gray-50 whitespace-pre-wrap">
                  {viewMessage.message}
                </div>
              </div>
              
              <DialogFooter className="flex justify-between">
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteMessage(viewMessage.id)}
                  disabled={deleteMessageMutation.isPending}
                >
                  {deleteMessageMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Delete Message
                </Button>
                <div className="space-x-2">
                  <Button variant="outline" onClick={() => window.open(`mailto:${viewMessage.email}`)}>
                    Reply via Email
                  </Button>
                  <Button onClick={() => setIsViewDialogOpen(false)}>
                    Close
                  </Button>
                </div>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}