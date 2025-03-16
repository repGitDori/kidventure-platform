import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building2 } from "lucide-react";
import type { BranchSelectorOption } from "@/lib/types";

interface BranchSelectorProps {
  onBranchChange: (branchId: number) => void;
  initialBranchId?: number;
}

export default function BranchSelector({ onBranchChange, initialBranchId }: BranchSelectorProps) {
  const [selectedBranchId, setSelectedBranchId] = useState<string>(
    initialBranchId ? initialBranchId.toString() : ""
  );
  
  const { data: branches, isLoading } = useQuery<BranchSelectorOption[]>({
    queryKey: ['/api/branches'],
  });
  
  useEffect(() => {
    if (branches && branches.length > 0 && !selectedBranchId) {
      setSelectedBranchId(branches[0].id.toString());
      onBranchChange(branches[0].id);
    }
  }, [branches, selectedBranchId, onBranchChange]);
  
  const handleBranchChange = (value: string) => {
    setSelectedBranchId(value);
    onBranchChange(Number(value));
  };
  
  return (
    <div className="flex items-center space-x-2">
      <Building2 className="h-5 w-5 text-gray-500" />
      <Select
        value={selectedBranchId}
        onValueChange={handleBranchChange}
        disabled={isLoading || !branches || branches.length === 0}
      >
        <SelectTrigger className="w-full md:w-[200px]">
          <SelectValue placeholder="Select branch" />
        </SelectTrigger>
        <SelectContent>
          {branches?.map((branch) => (
            <SelectItem key={branch.id} value={branch.id.toString()}>
              {branch.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
