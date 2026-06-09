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
          status: string;
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
          late_fee_amount: number | null;
          grace_period_days: number;
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
      payments: {
        Row: {
          id: string;
          lease_id: string | null;
          tenant_id: string;
          unit_id: string | null;
          amount: number;
          type: string;
          status: string;
          due_date: string | null;
          paid_at: string | null;
          stripe_payment_intent_id: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["payments"]["Row"]> & {
          tenant_id: string;
          amount: number;
          type: string;
        };
        Update: Partial<Database["public"]["Tables"]["payments"]["Row"]>;
      };
      vendors: {
        Row: {
          id: string;
          org_id: string;
          name: string;
          contact_name: string | null;
          email: string | null;
          phone: string | null;
          categories: string[] | null;
          rating: number | null;
          notes: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["vendors"]["Row"]> & {
          org_id: string;
          name: string;
        };
        Update: Partial<Database["public"]["Tables"]["vendors"]["Row"]>;
      };
      work_orders: {
        Row: {
          id: string;
          property_id: string;
          unit_id: string | null;
          tenant_id: string | null;
          vendor_id: string | null;
          title: string;
          description: string | null;
          category: string;
          priority: string;
          status: string;
          photos: string[] | null;
          cost: number | null;
          completed_at: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["work_orders"]["Row"]> & {
          property_id: string;
          title: string;
        };
        Update: Partial<Database["public"]["Tables"]["work_orders"]["Row"]>;
      };
      inspection_templates: {
        Row: {
          id: string;
          org_id: string;
          name: string;
          type: string;
          sections: Json;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["inspection_templates"]["Row"]> & {
          org_id: string;
          name: string;
          type: string;
        };
        Update: Partial<Database["public"]["Tables"]["inspection_templates"]["Row"]>;
      };
      inspections: {
        Row: {
          id: string;
          unit_id: string;
          lease_id: string | null;
          inspector_id: string | null;
          type: string;
          status: string;
          template_id: string | null;
          checklist_data: Json | null;
          pdf_url: string | null;
          scheduled_date: string | null;
          completed_at: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["inspections"]["Row"]> & {
          unit_id: string;
          type: string;
        };
        Update: Partial<Database["public"]["Tables"]["inspections"]["Row"]>;
      };
      applicants: {
        Row: {
          id: string;
          org_id: string;
          unit_id: string | null;
          full_name: string;
          email: string;
          phone: string | null;
          monthly_income: number | null;
          employer: string | null;
          move_in_date: string | null;
          occupants: number | null;
          pets: boolean;
          consent_to_screen: boolean;
          status: string;
          notes: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["applicants"]["Row"]> & {
          org_id: string;
          full_name: string;
          email: string;
        };
        Update: Partial<Database["public"]["Tables"]["applicants"]["Row"]>;
      };
      tenant_notes: {
        Row: {
          id: string;
          tenant_id: string;
          user_id: string | null;
          body: string;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["tenant_notes"]["Row"]> & {
          tenant_id: string;
          body: string;
        };
        Update: Partial<Database["public"]["Tables"]["tenant_notes"]["Row"]>;
      };
    };
  };
}
