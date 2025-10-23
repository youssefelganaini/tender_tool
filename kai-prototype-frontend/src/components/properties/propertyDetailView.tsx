import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { type PropertyInterface } from "@/types/datenbank";
import {
  Table,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

interface PropertyDetailViewProps {
  loading: boolean;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedProperty: PropertyInterface | null;
  setselectedProperty: React.Dispatch<
    React.SetStateAction<PropertyInterface | null>
  >;
}

const buildingColumns = ["Gebäude-Bezeichnung", "Gebäude-Typ", "Anteil"];
const unitsColumns = [
  "Einheiten-Nr.",
  "Gebäude",
  "Einheitstyp",
  "Anteil",
  "Fläche",
  "Heizfläche",
  "Kapazität",
];

export function PropertyDetailView(props: PropertyDetailViewProps) {
  const { loading, open, setOpen, selectedProperty, setselectedProperty } =
    props;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent
        side="right"
        className="!w-[50vw] !max-w-[50vw] overflow-y-auto p-6"
        style={{ width: "50vw", maxWidth: "50vw" }}
      >
        <SheetHeader>
          <SheetTitle className="text-2xl font-semibold">
            Objekt bearbeiten
          </SheetTitle>
          <SheetDescription className="text-base text-muted-foreground">
            Objekt bearbeiten. Bei Änderung speichern.
          </SheetDescription>
        </SheetHeader>
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground">Loading...</div>
          </div>
        ) : selectedProperty ? (
          <div className="space-y-8">
            {/* Basic Information */}
            {selectedProperty.address && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Adresse</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid grid-cols-1 gap-1">
                      <Label htmlFor="street">Street</Label>
                      <Input
                        id="street"
                        value={selectedProperty.address.street}
                        //   onChange={(e) =>
                        //     updateedi(
                        //       "street",
                        //       e.target.value,
                        //       "address"
                        //     )
                        //   }
                      />
                    </div>
                    <div className="grid grid-cols-1 gap-1">
                      <Label htmlFor="house_number">House Number</Label>
                      <Input
                        id="house_number"
                        value={selectedProperty.address.house_number}
                        //   onChange={(e) =>
                        //     updateEditedUser(
                        //       "house_number",
                        //       e.target.value,
                        //       "address"
                        //     )
                        //   }
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-1">
                    <Label htmlFor="address_line_1">Address Line 1</Label>
                    <Input
                      id="address_line_1"
                      value={selectedProperty.address.address_line_1 || ""}
                      // onChange={(e) =>
                      //   updateEditedUser(
                      //     "address_line_1",
                      //     e.target.value,
                      //     "address"
                      //   )
                      // }
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-1">
                    <Label htmlFor="address_line_2">Address Line 2</Label>
                    <Input
                      id="address_line_2"
                      value={selectedProperty.address.address_line_2 || ""}
                      // onChange={(e) =>
                      //   updateEditedUser(
                      //     "address_line_2",
                      //     e.target.value,
                      //     "address"
                      //   )
                      // }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid grid-cols-1 gap-1">
                      <Label htmlFor="postal_code">Postal Code</Label>
                      <Input
                        id="postal_code"
                        value={selectedProperty.address.postal_code}
                        //   onChange={(e) =>
                        //     updateEditedUser(
                        //       "postal_code",
                        //       e.target.value,
                        //       "address"
                        //     )
                        //   }
                      />
                    </div>
                    <div className="grid grid-cols-1 gap-1">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={selectedProperty.address.city}
                        //   onChange={(e) =>
                        //     updateEditedUser("city", e.target.value, "address")
                        //   }
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-1">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={selectedProperty.address.country}
                      // onChange={(e) =>
                      //   updateEditedUser("country", e.target.value, "address")
                      // }
                    />
                  </div>
                </CardContent>
              </Card>
            )}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Zugewiesene Bankkonten
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                {selectedProperty.weg_bank && (
                  <div className="space-y-4 border rounded-xl p-4 shadow-sm">
                    <h3 className="text-md font-semibold text-gray-800">
                      WEG Bankkonto
                    </h3>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">
                        Bank
                      </Label>
                      <Input
                        value={selectedProperty.weg_bank.bank}
                        placeholder="Name der Bank"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">
                        IBAN
                      </Label>
                      <Input
                        value={selectedProperty.weg_bank.iban}
                        placeholder="DE00 0000 0000 0000 0000 00"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">
                        BIC
                      </Label>
                      <Input
                        value={selectedProperty.weg_bank.bic}
                        placeholder="BANKDEFFXXX"
                        className="mt-1"
                      />
                    </div>
                  </div>
                )}

                {selectedProperty.ruecklagen_bank && (
                  <div className="space-y-4 border rounded-xl p-4 shadow-sm">
                    <h3 className="text-md font-semibold text-gray-800">
                      Rücklagenkonto
                    </h3>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">
                        Bank
                      </Label>
                      <Input
                        value={selectedProperty.ruecklagen_bank.bank}
                        placeholder="Name der Bank"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">
                        IBAN
                      </Label>
                      <Input
                        value={selectedProperty.ruecklagen_bank.iban}
                        placeholder="DE00 0000 0000 0000 0000 00"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">
                        BIC
                      </Label>
                      <Input
                        value={selectedProperty.ruecklagen_bank.bic}
                        placeholder="BANKDEFFXXX"
                        className="mt-1"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="">
                <CardTitle className="text-lg">Gebäude</CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                {selectedProperty.buildings && (
                  <div className="overflow-x-auto border rounded-lg">
                    <Table>
                      <TableHeader className="bg-gray-200">
                        <TableRow>
                          {buildingColumns.map((item) => (
                            <TableHead className="font-medium">
                              {item}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      {selectedProperty.buildings.map((building) => (
                        <TableRow key={building.id}>
                          <TableCell>{building.building_label}</TableCell>
                          <TableCell>{building.building_type}</TableCell>
                          <TableCell>{building.total_shares}</TableCell>
                        </TableRow>
                      ))}
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="">
                <CardTitle className="text-lg">Einheiten</CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                {selectedProperty.buildings && (
                  <div className="overflow-x-auto border rounded-lg">
                    <Table>
                      <TableHeader className="bg-gray-200">
                        <TableRow>
                          {unitsColumns.map((item) => (
                            <TableHead className="font-medium">
                              {item}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      {selectedProperty.buildings.flatMap((building) =>
                        building.building_apartments.map((unit) => (
                          <TableRow key={unit.id}>
                            <TableCell>{unit.id}</TableCell>
                            <TableCell>{building.building_label}</TableCell>
                            <TableCell>{unit.unit_type}</TableCell>
                            <TableCell>{unit.share}</TableCell>
                            <TableCell>{unit.area}</TableCell>
                            <TableCell>{unit.heating_area}</TableCell>
                            <TableCell>{unit.capacity}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground">No user selected</div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
