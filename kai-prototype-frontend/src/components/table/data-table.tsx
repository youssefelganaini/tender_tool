"use client";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import * as React from "react";

const data = [
  {
    id: 1,
    name: "Alice",
    role: "Engineer",
    status: "Active",
    location: "Munich",
  },
  {
    id: 2,
    name: "Bob",
    role: "Designer",
    status: "Inactive",
    location: "Berlin",
  },
  {
    id: 3,
    name: "Charlie",
    role: "Manager",
    status: "Active",
    location: "Hamburg",
  },
];

export default function SimpleTableWithDetail() {
  const [selected, setSelected] = React.useState<(typeof data)[0] | null>(null);

  return (
    <div className="w-full">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Location</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.name}</TableCell>
              <TableCell>{item.role}</TableCell>
              <TableCell>{item.status}</TableCell>
              <TableCell>
                <Drawer>
                  <DrawerTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelected(item)}
                    >
                      View
                    </Button>
                  </DrawerTrigger>
                  <DrawerContent side="right" className="p-4">
                    <DrawerHeader>
                      <DrawerTitle>{selected?.name}</DrawerTitle>
                    </DrawerHeader>
                    {/* You can put any detail content here later */}
                  </DrawerContent>
                </Drawer>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
