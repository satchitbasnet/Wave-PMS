export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string | null;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          plan: string;
          unit_count: number;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["organizations"]["Row"]> & {
          name: string;
        };
        Update: Partial<Database["public"]["Tables"]["organizations"]["Row"]>;
      };
      users: {
        Row: {
          id: string;
          org_id: string | null;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          role: string;
          phone: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["users"]["Row"]> & {
          id: string;
          email: string;
        };
        Update: Partial<Database["public"]["Tables"]["users"]["Row"]>;
      };
      properties: {
        Row: {
          id: string;
          org_id: string;
          name: string;
          address: string;
          city: string | null;
          state: string | null;
          zip: string | null;
          type: string | null;
          unit_count: number;
          year_built: number | null;
          image_url: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["properties"]["Row"]> & {
          org_id: string;
          name: string;
          address: string;
        };
        Update: Partial<Database["public"]["Tables"]["properties"]["Row"]>;
      };
      units: {
        Row: {
          id: string;
          property_id: string;
          unit_number: string;
          floor: number | null;
          bedrooms: number | null;
          bathrooms: number | null;
          sqft: number | null;
          rent_amount: number | null;
          status: string;
          amenities: string[] | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["units"]["Row"]> & {
          property_id: string;
          unit_number: string;
        };
        Update: Partial<Database["public"]["Tables"]["units"]["Row"]>;
      };
      tenants: {
        Row: {
          id: string;
          user_id: string | null;
          org_id: string;
          full_name: string;
          email: string | null;
          phone: string | null;
          date_of_birth: string | null;
          ssn_last4: string | null;
          emergency_contact: Json | null;
          screening_status: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["tenants"]["Row"]> & {
          org_id: string;
          full_name: string;
        };
        Update: Partial<Database["public"]["Tables"]["tenants"]["Row"]>;
      };
      leases: {
        Row: {
          id: string;
          unit_id: string;
          tenant_id: string;
          start_date: string;
          end_date: string | null;
          monthly_rent: number;
          security_deposit: number | null;
          status: string;
          signed_at: string | null;
          document_url: string | null;
          renewal_offered: boolean;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["leases"]["Row"]> & {
          unit_id: string;
          tenant_id: string;
          start_date: string;
          monthly_rent: number;
        };
        Update: Partial<Database["public"]["Tables"]["leases"]["Row"]>;
      };
      roles: {
        Row: {
          id: string;
          user_id: string;
          org_id: string;
          role: string;
          property_ids: string[] | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["roles"]["Row"]> & {
          user_id: string;
          org_id: string;
          role: string;
        };
        Update: Partial<Database["public"]["Tables"]["roles"]["Row"]>;
      };
    };
  };
}
