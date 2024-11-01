"use client";

import _ from "lodash";

import { Button } from "~/components/ui/button";
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
  const names = _.uniq(videos?.flatMap((video) => video.tags ?? []));

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
          <Button variant="secondary" className="mt-4">
            Close
          </Button>
        </SheetClose>
      </SheetContent>
    </Sheet>
  );
}
