import { Shipment} from "@prisma/client";

export interface CreateShipmentDTO {
    orderId: string;         
    originCity: string;      
    destinationCity: string;
    weight: number;          
    courier: string;
    service: string;
  }
  
  export interface UpdateShipmentDTO {
    id: string;                
    status?: string;           
    trackingNumber?: string;   
    shippedAt?: Date | null; 
    deliveredAt?: Date | null;
  }
  
  export interface GetShippingDTO {
    id: string;       
    orderId: string;          
    originCity: string;        
    destinationCity: string; 
    weight: number;           
    courier: string;          
    service: string;         
    cost: number;              
    etd: string;              
    status: string;            
    trackingNumber: string;    
    shippedAt: Date | null;   
    deliveredAt: Date | null;
  }
  