import { PropertyDetailView } from "@/components/properties/propertyDetailView";
import { PageHeader } from "@/components/sidebar/page-header";
import { DataTable } from "@/components/table/dataTable";
import { Input } from "@/components/ui/input";
import { TableBody, TableCell, TableRow } from "@/components/ui/table";
import { type PropertyInterface } from "@/types/datenbank";
import axios from "axios";
import { useEffect, useMemo, useState } from "react";

export function Properties() {
  // general state variables
  const [search, setSearch] = useState("");
  const [properties, setProperties] = useState<PropertyInterface[]>([]);

  // sheet state variables
  const [open, setOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedProperty, setselectedProperty] =
    useState<PropertyInterface | null>(null);

  useEffect(() => {
    fetchProperties();
  }, []);

  // fetching properties at the beginning
  const fetchProperties = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/properties/");
      setProperties(response.data);
    } catch (error) {
      console.error("Error fetching users: ", error);
    }
  };

  const fetchUserDetails = async (propertyId: number) => {
    try {
      setLoading(true);
      const property = await axios.get(
        `http://localhost:8000/api/properties/${propertyId}/`
      );
      setselectedProperty(property.data);
      console.log(selectedProperty);
    } catch (error) {
      console.error("Error fetching property details: " + error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = (property: PropertyInterface) => {
    fetchUserDetails(property.id);
    setOpen(true);
  };

  const filteredProperties = useMemo(() => {
    return properties.filter((property) => {
      const matchesSearch =
        `${property.property_label} ${property.address.street} ${property.address.postal_code}`
          .toLowerCase()
          .includes(search.toLowerCase());
      return matchesSearch;
    });
  }, [properties, search]);

  const columns: string[] = ["Objekt", "Adresse", "Einheiten"];
  const breadcrumbs = {
    items: [
      { label: "Datenbank", href: "/datenbank/objekte" },
      { label: "Objekte" },
    ],
  };
  return (
    <div className="w-full">
      {/* Header + Controls logic */}
      <PageHeader {...breadcrumbs} />
      <div className="flex items-center justify-between mb-4 px-5">
        <Input
          placeholder="Objekte suchen"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Table logic */}
      <DataTable columns={columns}>
        <TableBody>
          {filteredProperties.map((item) => (
            <TableRow
              key={item.id}
              className="cursor-pointer border-b hover:bg-gray-50 [&>td]:py-3.5 [&>td]:align-middle"
              onClick={() => handleUserClick(item)}
            >
              <TableCell className="font-medium">
                {item.property_label}
              </TableCell>
              <TableCell className="font-medium">{`${item.address?.house_number} ${item.address?.street}, ${item.address?.postal_code} ${item.address?.city}`}</TableCell>
              <TableCell className="font-medium">
                {item.buildings
                  .map((b) => b.building_apartments.length)
                  .reduce((a, b) => a + b, 0) || 0}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </DataTable>

      {/* Sheet logic */}
      <PropertyDetailView
        loading={loading}
        open={open}
        setOpen={setOpen}
        selectedProperty={selectedProperty}
        setselectedProperty={setselectedProperty}
      />
    </div>
  );
}
