export interface AddressInterface {
  id?: number;
  street: string;
  house_number: string;
  address_line_1?: string;
  address_line_2?: string;
  postal_code: string;
  city: string;
  country: string;
}

export interface BankInformationInterface {
  id: number;
  account_owner_text: string;
  iban: string;
  bank: string;
  bic: string;
}
export interface UnitInterface {
  id: number;
  unit_type: string;
  share: number;
  area: number;
  heating_area: number;
  capacity: number;
}

export interface BuildingInterface {
  id: number;
  property: BuildingInterface;
  building_type: string;
  address: AddressInterface;
  building_label: string;
  total_shares: number;
  building_apartments: UnitInterface[];
}

export interface PropertyInterface {
  id: number;
  property_label: string;
  address: AddressInterface;
  weg_bank?: BankInformationInterface;
  ruecklagen_bank?: BankInformationInterface;
  buildings: BuildingInterface[];
}

export interface UserInterface {
  id: number;
  first_name: string;
  last_name: string;
  role: string;
  address: AddressInterface;
  email: string;
  username: string;
  bank_accounts?: BankInformationInterface[];
  property_owners?: PropertyInterface[];
}
