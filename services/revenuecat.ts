import Purchases, {
  PurchasesOfferings,
  PurchasesPackage,
  CustomerInfo,
} from 'react-native-purchases';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

const ENTITLEMENT_ID = 'pro';

export function initRevenueCat(apiKey: string): void {
  Purchases.configure({ apiKey });
}

export async function getOfferings(): Promise<PurchasesOfferings | null> {
  try {
    return await Purchases.getOfferings();
  } catch {
    return null;
  }
}

export async function purchasePackage(pkg: PurchasesPackage): Promise<boolean> {
  const { customerInfo } = await Purchases.purchasePackage(pkg);
  return checkEntitlement(customerInfo);
}

export async function restorePurchases(): Promise<boolean> {
  const customerInfo = await Purchases.restorePurchases();
  return checkEntitlement(customerInfo);
}

export async function getCustomerInfo(): Promise<CustomerInfo | null> {
  try {
    return await Purchases.getCustomerInfo();
  } catch {
    return null;
  }
}

export function checkEntitlement(info: CustomerInfo): boolean {
  return info.entitlements.active[ENTITLEMENT_ID] !== undefined;
}

export async function syncProStatus(uid: string, isPro: boolean): Promise<void> {
  await updateDoc(doc(db, 'users', uid), { isPro });
}
