import { z } from "zod";

export const providerNameSchema=z.enum(["QPAY","STRIPE","DEMO"]);
export type PaymentProviderName=z.infer<typeof providerNameSchema>;
export interface ProviderCapabilities{currencies:ReadonlyArray<string>;supportsRefunds:boolean;supportsPartialRefunds:boolean;requiresVerification:boolean;hostedCheckout:boolean}
export const paymentProviderCapabilities:Readonly<Record<PaymentProviderName,ProviderCapabilities>>={
  QPAY:{currencies:["MNT"],supportsRefunds:true,supportsPartialRefunds:true,requiresVerification:true,hostedCheckout:false},
  STRIPE:{currencies:["USD","EUR","GBP","JPY","KRW"],supportsRefunds:true,supportsPartialRefunds:true,requiresVerification:true,hostedCheckout:true},
  DEMO:{currencies:["MNT","USD"],supportsRefunds:true,supportsPartialRefunds:false,requiresVerification:false,hostedCheckout:false}
};
export function selectProvider(currency:string,country:string):PaymentProviderName{if(currency==="MNT"&&country==="MN")return"QPAY";return"STRIPE"}

