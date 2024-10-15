"use client";

import _ from "lodash";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";
import { api } from "~/trpc/react";

export type AdminSidebarProps = {
  selectedName: string;
  onNameSelect: (name: string) => void;
  onClose: () => void;
};

export function AdminSidebar({
  selectedName,
  onNameSelect,
  onClose,
}: AdminSidebarProps) {
  const { data: videos, isLoading } = api.videos.listAll.useQuery();
  const names = _.uniq(videos?.data.flatMap((video) => video.tags ?? []));

  return (
    <Sheet open={true} onOpenChange={onClose}>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>Admin Panel</SheetTitle>
        </SheetHeader>
        <div className="py-4">
          <Select
            value={selectedName}
            onValueChange={(name) => onNameSelect(name)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a person..." />
            </SelectTrigger>
            <SelectContent>
              {isLoading ? (
                <SelectItem value="">Loading...</SelectItem>
              ) : (
                names.map((name) => (
                  <SelectItem key={_.uniqueId()} value={name}>
                    {name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
        <SheetClose asChild>
          <button className="mt-4 rounded-md bg-gray-200 px-4 py-2">
            Close
          </button>
        </SheetClose>
      </SheetContent>
    </Sheet>
  );
}
