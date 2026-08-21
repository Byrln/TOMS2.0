import type { CurrencyCode, PaymentStatus } from "@toms/domain";

export interface ChargeInput {bookingId:string;amountMinor:number;currency:CurrencyCode;idempotencyKey:string}
export interface ChargeResult {id:string;providerReference:string;status:PaymentStatus;amountMinor:number;currency:CurrencyCode}
export interface PaymentProvider {name:string;charge(input:ChargeInput):Promise<ChargeResult>;refund(paymentId:string,amountMinor:number,idempotencyKey:string):Promise<ChargeResult>}

export function createDemoPaymentProvider():PaymentProvider{
  const charges=new Map<string,ChargeResult>();
  return{
    name:"DEMO",
    async charge(input){
      const existing=charges.get(input.idempotencyKey);if(existing)return existing;
      if(!Number.isSafeInteger(input.amountMinor)||input.amountMinor<0)throw new RangeError("amountMinor must be a non-negative safe integer");
      const result:ChargeResult={id:globalThis.crypto.randomUUID(),providerReference:`demo_${globalThis.crypto.randomUUID()}`,status:"SUCCEEDED",amountMinor:input.amountMinor,currency:input.currency};charges.set(input.idempotencyKey,result);return result;
    },
    async refund(paymentId,amountMinor,idempotencyKey){
      const existing=charges.get(idempotencyKey);if(existing)return existing;
      if(!paymentId||!Number.isSafeInteger(amountMinor)||amountMinor<0)throw new RangeError("Valid payment and amount required");
      const result:ChargeResult={id:globalThis.crypto.randomUUID(),providerReference:`demo_refund_${globalThis.crypto.randomUUID()}`,status:"REFUNDED",amountMinor,currency:"MNT"};charges.set(idempotencyKey,result);return result;
    }
  };
}
