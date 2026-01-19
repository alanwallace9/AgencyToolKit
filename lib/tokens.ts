import { randomBytes } from 'crypto';

export function generateAgencyToken(agencyName: string): string {
  const prefix = agencyName.toLowerCase().replace(/[^a-z]/g, '').slice(0, 2) || 'ag';
  const random = randomBytes(8).toString('hex');
  return `${prefix}_${random}`;
}

export function generateCustomerToken(customerName: string): string {
  const prefix = customerName.toLowerCase().replace(/[^a-z]/g, '').slice(0, 2) || 'cu';
  const random = randomBytes(8).toString('hex');
  return `${prefix}_${random}`;
}

export function generateSocialProofWidgetToken(): string {
  const random = randomBytes(8).toString('hex');
  return `sp_${random}`;
}
